import firebase from 'react-native-firebase';
import { Manager } from './Manager';
import { courseStore, createTakeTimeIndex } from '../stores/courseStore';
import { createCourseStore, ECourseEditMode } from '../stores/createCourseStore';
import { ICourse, ICourseStatistics, ICourseImage } from '../common/course';
import { ECollectionName, firebaseManager } from './FirebaseManager';
import {
  isToday,
  isTomorrow,
  differenceInCalendarDays,
  isYesterday,
  addDays,
  differenceInDays,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { EPeriodType } from '../common/periods';
import { commonStore } from '../stores/commonStore';
import { ITake, ITakeTime } from '../common/take';
import { createCourseManager } from './CreateCourseManager';
import { NotificationsHandler, ENotificationType } from '../components/common/Notifications';
import { localeManager } from './LocaleManager';
import { logManager, ELogEvent } from './LogManager';

class CourseManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    this.subscribeToCourses();
    this.subscribeToTakeTimes();

    return Promise.resolve();
  }

  private subscribeToCourses() {
    courseStore.setState({
      loadingCourses: true,
    });

    courseStore.state.courses.clear();

    firebaseManager.getCollection([ECollectionName.Courses]).onSnapshot(snapshot => {
      snapshot.docs.forEach(doc => {
        const course: ICourse = {
          id: doc.id,
          ...doc.data(),
        } as ICourse;

        if (doc.id) {
          courseStore.state.courses.set(doc.id, course);

          if (
            createCourseStore.state.currentCourseId === doc.id &&
            createCourseStore.state.courseEditMode === ECourseEditMode.View
          ) {
            createCourseManager.setEditingCourseData(doc.id, ECourseEditMode.View);
          }
        }
      });

      courseStore.setState({
        loadingCourses: false,
        coursesUpdateTime: Date.now(),
      });
    });
  }

  private subscribeToTakeTimes() {
    courseStore.setState({
      loadingTakeTimes: true,
    });

    firebaseManager.getCollection([ECollectionName.TakeTimes]).onSnapshot(snapshot => {
      courseStore.state.takeTimes.clear();

      snapshot.docs.forEach(doc => {
        const takeTime: ITakeTime = {
          id: doc.id,
          ...doc.data(),
        } as ITakeTime;

        if (doc.id) {
          courseStore.state.takeTimes.set(doc.id, takeTime);
        }
      });

      courseStore.setState({
        loadingTakeTimes: false,
        takeTimesUpdateTime: Date.now(),
      });
    });
  }

  public setToday(newDate: Date) {
    if (!isSameDay(newDate, commonStore.state.today)) {
      commonStore.setState({
        today: startOfDay(newDate),
      });

      this.subscribeToCourses();
    }
  }

  public async getCourseImages() {
    try {
      const snapshot = await firebaseManager.getCollection([ECollectionName.Images]).get();

      snapshot.docs.forEach(doc => {
        if (doc.id) {
          const event: ICourseImage = ({
            id: doc.id,
            ...doc.data(),
          } as unknown) as ICourseImage;
          courseStore.state.courseImages.set(doc.id, event);
        }
      });
    } catch (e) {
      firebaseManager.logError(432901, e);
    }
  }

  public async deleteCourse(courseId: string | null) {
    if (courseId) {
      const course = courseStore.state.courses.get(courseId);

      if (course) {
        firebaseManager.cancelNotificationsForCourse(course);

        const batch = firebase.firestore().batch();
        const docs = await firebaseManager
          .getCollection([ECollectionName.TakeTimes])
          .where('courseId', '==', courseId)
          .get();

        docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        await firebaseManager
          .getCollection([ECollectionName.Courses])
          .doc(courseId)
          .delete();

        this.subscribeToCourses();

        logManager.logEvent(ELogEvent.CourseDeleted, course.title);

        NotificationsHandler.alertWithType(
          ENotificationType.Info,
          localeManager.t('NOTIFICATIONS.COURSE_DELETED.TITLE'),
          localeManager.t('NOTIFICATIONS.COURSE_DELETED.MESSAGE'),
        );
      }
    }
  }

  public async recalculateCourseStatistics(courseId: string | null) {
    if (courseId) {
      const courseDoc = await firebaseManager
        .getCollection([ECollectionName.Courses])
        .doc(courseId)
        .get();

      const course: ICourse = courseDoc.data() as ICourse;

      if (courseDoc && course && course.startDate) {
        const courseStatistics = await this.getCourseStatistics(
          courseId,
          new Date(course.endDate),
          new Date(course.startDate),
          course.takes,
        );

        await firebaseManager
          .getCollection([ECollectionName.Courses])
          .doc(courseId)
          .update({
            ...courseStatistics,
          });

        if (courseStatistics.takenPercent >= 100) {
          logManager.logEvent(ELogEvent.CourseFinished, course.title);
        }
      }
    } else {
      const courseStatistics = await this.getCourseStatistics(
        createCourseStore.state.currentCourseId,
        new Date(createCourseStore.state.endDate),
        new Date(createCourseStore.state.startDate),
        createCourseStore.state.takes,
      );

      createCourseStore.setState({
        ...courseStatistics,
      });
    }
  }

  public async updateCourse() {
    const {
      currentCourseId,
      title,
      currentPill,
      periodType,
      period,
      times,
      timesPer,
      takes,
      uploadedImage,
    } = createCourseStore.state;

    if (currentCourseId) {
      const courseDoc = await firebaseManager
        .getCollection([ECollectionName.Courses])
        .doc(currentCourseId)
        .get();

      const course: ICourse = courseDoc.data() as ICourse;

      if (courseDoc && course && course.startDate) {
        const endDate = this.getCourseEndDate(new Date(course.startDate));

        await firebaseManager
          .getCollection([ECollectionName.Courses])
          .doc(currentCourseId)
          .update({
            uploadedImage,
            title,
            pillId: currentPill.id,
            periodType: periodType,
            period,
            times,
            timesPer,
            endDate: endDate.getTime(),
            takes: takes.map(take => {
              return { ...take };
            }),
          });

        const courseEndDayIndex = this.getDayIndex(endDate);

        // Remove irrelevant takeTimes
        const batch = firebase.firestore().batch();
        const unnecessaryTakeTimesDocs = await firebaseManager
          .getCollection([ECollectionName.TakeTimes])
          .where('dayIndex', '>=', courseEndDayIndex)
          .get();

        unnecessaryTakeTimesDocs.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        logManager.logEvent(ELogEvent.CourseUpdated, title);

        await batch.commit();
        await this.recalculateCourseStatistics(currentCourseId);
        await this.subscribeToTakeTimes();

        firebaseManager.cancelNotificationsForCourse({ ...course, ...{ id: currentCourseId } });

        if (course.notificationsEnabled) {
          firebaseManager.createNotificationsForCourse({ ...course, ...{ id: currentCourseId } });
        }
      }
    }
  }

  public getCourseEndDate(startDate: Date): Date {
    let days = 0;

    switch (createCourseStore.state.periodType) {
      case EPeriodType.Days: {
        days = createCourseStore.state.period;
        break;
      }

      case EPeriodType.Weeks: {
        days = createCourseStore.state.period * 7;
        break;
      }

      case EPeriodType.Months:
      default: {
        days = createCourseStore.state.period * 30;
        break;
      }
    }

    return endOfDay(addDays(startDate, days - 1));
  }

  public async createCourse() {
    const startDate = startOfDay(new Date());
    const endDate = this.getCourseEndDate(startDate);
    const { state } = createCourseStore;
    const takes = state.takes.map(take => {
      return { ...take };
    });

    if (state.notificationsEnabled) {
      const isMessagingAllowedByUser = await firebaseManager.initMessaging();

      if (!isMessagingAllowedByUser) {
        state.notificationsEnabled = false;
        createCourseStore.setState({
          notificationsEnabled: state.notificationsEnabled,
        });
      }
    }

    const title = state.title.trim();
    const courseStatistics = await this.getCourseStatistics(null, endDate, startDate, takes);
    const course: Partial<ICourse> = {
      uploadedImage: state.uploadedImage,
      title,
      period: state.period,
      periodType: state.periodType,
      pillId: state.currentPill.id,
      times: state.times,
      timesPer: state.timesPer,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      takes,
      notificationsEnabled: state.notificationsEnabled,
      ...courseStatistics,
    };

    const creatingResult = await firebaseManager
      .getCollection([ECollectionName.Courses])
      .add(course);

    logManager.logEvent(ELogEvent.CourseCreated, title);

    if (course.notificationsEnabled && creatingResult) {
      const createdCourseDocument = await creatingResult.get();
      const createdCourse: ICourse = {
        id: createdCourseDocument.id,
        ...createdCourseDocument.data(),
      } as ICourse;

      firebaseManager.createNotificationsForCourse(createdCourse);
    }

    this.setToday(new Date());
  }

  public getDayIndex(time: Date): number {
    return differenceInDays(time, new Date(0));
  }

  public async updateNotificationsEnabled() {
    let isEnabled = !createCourseStore.state.notificationsEnabled;

    if (isEnabled) {
      const isMessagingAllowedByUser = await firebaseManager.initMessaging();

      if (!isMessagingAllowedByUser) {
        isEnabled = false;
      }
    }

    if (createCourseStore.state.currentCourseId) {
      await firebaseManager
        .getCollection([ECollectionName.Courses])
        .doc(createCourseStore.state.currentCourseId)
        .update({
          notificationsEnabled: isEnabled,
        });

      createCourseManager.setEditingCourseData(
        createCourseStore.state.currentCourseId,
        createCourseStore.state.courseEditMode,
      );

      const course = courseStore.state.courses.get(createCourseStore.state.currentCourseId);

      if (isEnabled) {
        setTimeout(() => {
          NotificationsHandler.alertWithType(
            ENotificationType.Info,
            localeManager.t('NOTIFICATIONS.NOTIFICATIONS_ENABLED.TITLE'),
            localeManager.t('NOTIFICATIONS.NOTIFICATIONS_ENABLED.MESSAGE'),
          );

          if (course) {
            firebaseManager.cancelNotificationsForCourse(course);
            firebaseManager.createNotificationsForCourse(course);
          }
        }, 200);
      } else {
        if (course) {
          firebaseManager.cancelNotificationsForCourse(course);
        }
      }
    } else {
      createCourseStore.setState({
        notificationsEnabled: isEnabled,
      });
    }
  }

  public isCourseValidForDate(course: ICourse, date: Date): boolean {
    const { startDate, endDate } = course;
    const validStartDate = isSameDay(startDate, date) || isBefore(startDate, date);
    const validEndDate = isAfter(endDate, date);

    return validStartDate && validEndDate;
  }

  public getCourseDaysLength(startDate: Date, endDate: Date): number {
    return differenceInDays(endDate, startDate) + 1;
  }

  public async getCourseStatistics(
    courseId: string | null,
    endDate: Date,
    startDate: Date,
    takes: ITake[],
  ): Promise<ICourseStatistics> {
    const days = this.getCourseDaysLength(startDate, endDate);
    const timesTotal = days * takes.length;

    let timesTaken = 0;
    let unitsTotal = 0;
    let unitsTaken = 0;

    takes.forEach(take => {
      unitsTotal += take.dosage + take.dosagePart;
    });

    unitsTotal = unitsTotal * days;

    if (courseId !== null) {
      const timesTakenDocs = await firebaseManager
        .getCollection([ECollectionName.TakeTimes])
        .where('courseId', '==', courseId)
        .where('isTaken', '==', true)
        .get();

      timesTaken = timesTakenDocs.docs.length;

      timesTakenDocs.docs.forEach(takeTimeDoc => {
        const takeTime: ITakeTime = takeTimeDoc.data() as ITakeTime;

        if (takeTime && takeTime.dosage) {
          unitsTaken += takeTime.dosage;
        }
      });
    }

    const unitsToTake = unitsTotal - unitsTaken;
    const timesToTake = timesTotal - timesTaken;
    let takenPercent = Math.round(timesTaken / (timesTotal / 100));

    if (takenPercent > 100) {
      takenPercent = 0;
    }

    return {
      takenPercent,
      timesTaken,
      timesToTake,
      timesTotal,
      unitsTotal,
      unitsTaken,
      unitsToTake,
    };
  }

  public async updateTakeTime(course: ICourse, take: ITake, takeTime: ITakeTime) {
    try {
      const dayIndex = this.getDayIndex(commonStore.state.today);
      const takeTimeId = createTakeTimeIndex(course.id, take.index, dayIndex);
      let isTaken: boolean | null = null;

      if (takeTime && takeTime.id) {
        isTaken = !takeTime.isTaken;

        await firebaseManager
          .getCollection([ECollectionName.TakeTimes])
          .doc(takeTimeId)
          .update({
            isTaken,
            dosage: take.dosage + take.dosagePart,
          });

        if (isTaken) {
          logManager.logEvent(ELogEvent.MedicationTake, course.title);
        } else {
          logManager.logEvent(ELogEvent.MedicationTakeUndo, course.title);
        }
      } else {
        isTaken = true;

        const doc = await firebaseManager
          .getCollection([ECollectionName.TakeTimes])
          .doc(takeTimeId)
          .get();

        if (!doc.exists) {
          await firebaseManager
            .getCollection([ECollectionName.TakeTimes])
            .doc(takeTimeId)
            .set({
              courseId: course.id,
              takeIndex: take.index,
              dayIndex,
              isTaken,
              dosage: take.dosage + take.dosagePart,
            });

          logManager.logEvent(ELogEvent.MedicationTake, course.title);
        }
      }

      if (course.notificationsEnabled && isTaken !== null) {
        const notificationDayIndex = differenceInDays(commonStore.state.today, new Date(0));
        const notificationIndex = differenceInDays(commonStore.state.today, course.startDate);

        if (isTaken) {
          firebaseManager.cancelNotificationByTake(course.id, take.index, notificationDayIndex);
        } else {
          firebaseManager.createNotificationByTake(
            course,
            take,
            notificationDayIndex,
            notificationIndex,
          );
        }
      }

      this.recalculateCourseStatistics(course.id);
    } catch (e) {
      firebaseManager.logError(238047, e);
    }
  }

  public daysDifference(date: Date): { word: string; difference: number } {
    const now = new Date();
    const differenceRaw = differenceInCalendarDays(now, date);
    const difference = differenceRaw >= 0 ? differenceRaw : -differenceRaw;
    let word = '';

    if (isToday(date)) {
      word = 'DATE_DISTANCE.TODAY';
    } else if (isTomorrow(date)) {
      word = 'DATE_DISTANCE.TOMORROW';
    } else if (isYesterday(date)) {
      word = 'DATE_DISTANCE.YESTERDAY';
    } else if (differenceRaw < 0) {
      word = 'DATE_DISTANCE.DAYS_POST';
    } else {
      word = 'DATE_DISTANCE.DAYS_PAST';
    }

    return { word, difference };
  }

  public getTakeNumber(takeIndex: number): string {
    switch (takeIndex) {
      case 0: {
        return 'TAKE.NUMBERS.FIRST';
      }
      case 1: {
        return 'TAKE.NUMBERS.SECOND';
      }
      case 2: {
        return 'TAKE.NUMBERS.THIRD';
      }
      case 3: {
        return 'TAKE.NUMBERS.FOURTH';
      }
      case 4: {
        return 'TAKE.NUMBERS.FIFTH';
      }
      case 5: {
        return 'TAKE.NUMBERS.SIXTH';
      }
      case 6: {
        return 'TAKE.NUMBERS.SEVENTH';
      }
      case 7: {
        return 'TAKE.NUMBERS.EIGHTH';
      }
      case 8: {
        return 'TAKE.NUMBERS.NINETH';
      }
      case 9: {
        return 'TAKE.NUMBERS.TENTH';
      }
      default: {
        return 'TAKE.HEADER';
      }
    }
  }
}

export const courseManager = new CourseManager();
