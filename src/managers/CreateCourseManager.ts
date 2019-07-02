import { Manager } from './Manager';
import { IPill, PILLS, PILLS_MAP } from '../common/pills';
import { createCourseStore, ECourseEditMode } from '../stores/createCourseStore';
import { EPeriodType } from '../common/periods';
import {
  ETakeDosageUnit,
  ETakeTerm,
  ITake,
  takeDosageUnitNames,
  takeTermNames,
} from '../common/take';
import { CommonService } from '../services/CommonService';
import { ETimesPer } from '../common/times';
import { VARIABLES } from '../common/variables';
import { localeManager } from './LocaleManager';
import { courseStore } from '../stores/courseStore';
import { IFormError } from '../common/form';
import { courseManager } from './CourseManager';
import { startOfDay } from 'date-fns';

class CreateCourseManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    this.setDefaults();
    return Promise.resolve();
  }

  public setEditingCourseData(courseId: string, courseEditMode: ECourseEditMode) {
    const course = courseStore.state.courses.get(courseId);

    if (course) {
      createCourseStore.setState({
        uploadedImage: course.uploadedImage,
        courseEditMode,
        currentCourseId: course.id,
        currentPill: PILLS_MAP.get(course.pillId),
        title: course.title,
        periodType: course.periodType,
        period: course.period,
        times: course.times,
        timesPer: course.timesPer,
        takes: course.takes,
        startDate: course.startDate,
        endDate: course.endDate,
        notificationsEnabled: course.notificationsEnabled,
        takenPercent: course.takenPercent,
        timesTaken: course.timesTaken,
        timesToTake: course.timesToTake,
        timesTotal: course.timesTotal,
        unitsTotal: course.unitsTotal,
        unitsTaken: course.unitsTaken,
        unitsToTake: course.unitsToTake,
      });
    }
  }

  public async setDefaults() {
    const startDate = startOfDay(new Date());
    const endDate = courseManager.getCourseEndDate(startDate);

    createCourseStore.setState({
      uploadedImage: null,
      courseEditMode: ECourseEditMode.Create,
      currentCourseId: null,
      currentPill: PILLS[0],
      title: '',
      periodType: EPeriodType.Days,
      period: 7,
      times: 3,
      timesPer: ETimesPer.Day,
      takes: [],
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      notificationsEnabled: true,
      takenPercent: 0,
      timesTaken: 0,
      timesToTake: 0,
      timesTotal: 0,
      unitsTotal: 0,
      unitsTaken: 0,
      unitsToTake: 0,
    });

    this.generateDefaultTakeEntities();
    await courseManager.recalculateCourseStatistics(null);
  }

  public checkCourseAvailability(): boolean {
    const { title, currentCourseId } = createCourseStore.state;
    const { courses } = courseStore.state;

    if (currentCourseId) {
      return !Boolean(
        Array.from(courses.values()).find(
          course => course.title === title && course.id !== currentCourseId,
        ),
      );
    } else {
      return !Boolean(Array.from(courses.values()).find(course => course.title === title));
    }
  }

  public checkFormValidity(): IFormError | null {
    const title = createCourseStore.state.title.trim();

    if (!title) {
      return {
        title: 'NOTIFICATIONS.NAME_EMPTY.TITLE',
        message: 'NOTIFICATIONS.NAME_EMPTY.MESSAGE',
      };
    } else if (title && !this.checkCourseAvailability()) {
      return {
        title: 'NOTIFICATIONS.COURSE_ALREADY_EXISTS.TITLE',
        message: 'NOTIFICATIONS.COURSE_ALREADY_EXISTS.MESSAGE',
      };
    }

    return null;
  }

  public generateDefaultTakeEntities(): void {
    const { times } = createCourseStore.state;
    const nextTimeSpan = Math.round(VARIABLES.START_NEW_COURSE_ACTIVE_DAY_HOURS / times);
    const takes = CommonService.times<ITake>(times, index => {
      const hours = VARIABLES.START_NEW_COURSE_FROM_TIME_DEFAULT_VALUE + index * nextTimeSpan;

      return {
        index,
        hours,
        minutes: 0,
        term: ETakeTerm.BeforeMeal,
        dosage: 1,
        dosagePart: 0,
        dosageUnits: ETakeDosageUnit.Pieces,
      };
    });

    createCourseStore.setState({
      takes,
    });
  }

  public generateTakeStrings(take: ITake, locale: string): string[] {
    const takeItems: string[] = [];
    const time = new Date();

    time.setHours(take.hours);
    time.setMinutes(take.minutes);

    takeItems.push(localeManager.formatDate(time, 'HH:mm'));

    takeItems.push(
      `${CommonService.formatDosageParts(take.dosage, take.dosagePart, locale)} ${localeManager.t(
        takeDosageUnitNames.get(take.dosageUnits) || '',
        {
          count: take.dosage,
        },
      )}`,
    );

    if (take.term !== ETakeTerm.NotSet) {
      takeItems.push(localeManager.t(takeTermNames.get(take.term) || ''));
    }

    return takeItems;
  }
}

export const createCourseManager = new CreateCourseManager();
