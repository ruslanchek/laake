import firebase from 'react-native-firebase';
import { Manager } from './Manager';
import { courseStore, createTakeTimeIndex } from '../stores/courseStore';
import { createCourseStore } from '../stores/createCourseStore';
import { ICourse, ICourseStatistics } from '../common/course';
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
        const course = doc.data() as ICourse;

        if (doc.id) {
          courseStore.state.courses.set(doc.id, {
            id: doc.id,
            ...(course as ICourse),
          });
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
        const takeTime = doc.data() as ITakeTime;

        if (doc.id) {
          courseStore.state.takeTimes.set(doc.id, {
            id: doc.id,
            ...(takeTime as ITakeTime),
          });
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
        today: newDate,
      });

      this.subscribeToCourses();
    }
  }

  public async deleteCourse(courseId: string | null) {
    if (courseId) {
      const course = courseStore.state.courses.get(courseId);

      if (course) {
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

        NotificationsHandler.alertWithType(
          ENotificationType.Info,
          localeManager.t('NOTIFICATIONS.COURSE_DELETED.TITLE'),
          localeManager.t('NOTIFICATIONS.COURSE_DELETED.MESSAGE'),
        );
      }
    }
  }

  private async recalculateCourseStatistics(courseId: string) {
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
          takenPercent: courseStatistics.takenPercent,
          timesTaken: courseStatistics.timesTaken,
          timesToTake: courseStatistics.timesToTake,
          timesTotal: courseStatistics.timesTotal,
          unitsTotal: courseStatistics.unitsTotal,
          unitsTaken: courseStatistics.unitsTaken,
          unitsToTake: courseStatistics.unitsToTake,
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
          console.log(doc.data());
        });

        await batch.commit();
        await this.recalculateCourseStatistics(currentCourseId);
        await this.subscribeToTakeTimes();
      }
    }
  }

  private getCourseEndDate(startDate: Date): Date {
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
    const takes = createCourseStore.state.takes.map(take => {
      return { ...take };
    });
    const courseStatistics = await this.getCourseStatistics(null, endDate, startDate, takes);
    const course: Partial<ICourse> = {
      title: createCourseStore.state.title.trim(),
      period: createCourseStore.state.period,
      periodType: createCourseStore.state.periodType,
      pillId: createCourseStore.state.currentPill.id,
      times: createCourseStore.state.times,
      timesPer: createCourseStore.state.timesPer,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      takes,
      takenPercent: courseStatistics.takenPercent,
      timesTaken: courseStatistics.timesTaken,
      timesToTake: courseStatistics.timesToTake,
      timesTotal: courseStatistics.timesTotal,
    };

    await firebaseManager.getCollection([ECollectionName.Courses]).add(course);
  }

  public getDayIndex(time: Date): number {
    return differenceInDays(time, new Date(0));
  }

  public async updateNotificationsEnabled() {
    let isEnabled = !createCourseStore.state.notificationsEnabled;
    const isMessagingAllowedByUser = await firebaseManager.initMessaging();

    if (!isMessagingAllowedByUser) {
      isEnabled = false;
    }

    if (createCourseStore.state.currentCourseId) {
      await firebaseManager
        .getCollection([ECollectionName.Courses])
        .doc(createCourseStore.state.currentCourseId)
        .update({
          notificationsEnabled: isEnabled,
        });

      createCourseManager.setEditingCourseData(createCourseStore.state.currentCourseId);

      if (isEnabled) {
        setTimeout(() => {
          NotificationsHandler.alertWithType(
            ENotificationType.Info,
            localeManager.t('NOTIFICATIONS.NOTIFICATIONS_ENABLED.TITLE'),
            localeManager.t('NOTIFICATIONS.NOTIFICATIONS_ENABLED.MESSAGE'),
          );
        }, 200);
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

  public async getCourseStatistics(
    courseId: string | null,
    endDate: Date,
    startDate: Date,
    takes: ITake[],
  ): Promise<ICourseStatistics> {
    const days = differenceInDays(endDate, startDate) + 1;
    const timesTotal = days * takes.length;
    let timesTaken = 0;
    let unitsTotal = 0;
    let unitsTaken = 0;

    takes.forEach(take => {
      unitsTotal += take.dosage + take.dosagePart;
    });

    unitsTotal = unitsTotal * timesTotal;

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

      if (takeTime && takeTime.id) {
        await firebaseManager
          .getCollection([ECollectionName.TakeTimes])
          .doc(takeTimeId)
          .update({
            isTaken: !takeTime.isTaken,
            dosage: take.dosage + take.dosagePart,
          });
      } else {
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
              isTaken: true,
              dosage: take.dosage + take.dosagePart,
            });
        }
      }

      await this.recalculateCourseStatistics(course.id);
    } catch (e) {
      console.log(e);
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
