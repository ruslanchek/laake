import firebase from 'react-native-firebase';
import { Manager } from './Manager';
import { courseStore, createTakeTimeIndex } from '../stores/courseStore';
import { createCourseStore } from '../stores/createCourseStore';
import { ICourse } from '../common/course';
import { ECollectionName, firebaseManager } from './FirebaseManager';
import {
  isToday,
  isTomorrow,
  differenceInCalendarDays,
  isYesterday,
  addDays,
  startOfToday,
  differenceInDays,
  isSameDay,
} from 'date-fns';
import { EPeriodType } from '../common/periods';
import { commonStore } from '../stores/commonStore';
import { ITake, ITakeTime } from '../common/take';
import { createCourseManager } from './CreateCourseManager';

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
          .where('courseId', '==', course.id)
          .get();

        docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        await firebaseManager
          .getCollection([ECollectionName.Courses])
          .doc(course.id)
          .delete();

        this.subscribeToCourses();
      }
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
          takes: takes.map(take => {
            return { ...take };
          }),
        });
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

    return addDays(startDate, days);
  }

  public async createCourse() {
    const startDate = startOfToday();
    const endDate = this.getCourseEndDate(startDate);

    const course: Partial<ICourse> = {
      title: createCourseStore.state.title.trim(),
      period: createCourseStore.state.period,
      periodType: createCourseStore.state.periodType,
      pillId: createCourseStore.state.currentPill.id,
      times: createCourseStore.state.times,
      timesPer: createCourseStore.state.timesPer,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      takes: createCourseStore.state.takes.map(take => {
        return { ...take };
      }),
    };

    await firebaseManager.getCollection([ECollectionName.Courses]).add(course);
  }

  public getDayIndex(time: Date): number {
    return differenceInDays(time, new Date(0));
  }

  public async updateNotificationsEnabled() {
    const isEnabled = !createCourseStore.state.notificationsEnabled;

    if (createCourseStore.state.currentCourseId) {
      await firebaseManager
        .getCollection([ECollectionName.Courses])
        .doc(createCourseStore.state.currentCourseId)
        .update({
          notificationsEnabled: isEnabled,
        });

      createCourseManager.setEditingCourseData(createCourseStore.state.currentCourseId);
    } else {
      createCourseStore.setState({
        notificationsEnabled: isEnabled,
      });
    }
  }

  public async updateTakeTime(course: ICourse, take: ITake, takeTime: ITakeTime) {
    const dayIndex = this.getDayIndex(commonStore.state.today);
    const takeTimeId = createTakeTimeIndex(course.id, take.index, dayIndex);

    if (takeTime && takeTime.id) {
      await firebaseManager
        .getCollection([ECollectionName.TakeTimes])
        .doc(takeTimeId)
        .update({
          isTaken: !takeTime.isTaken,
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
          });
      }
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
