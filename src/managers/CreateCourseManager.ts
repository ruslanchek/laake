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

class CreateCourseManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    this.setDefaults();
    return Promise.resolve();
  }

  public setEditingCourseData(courseId: string) {
    const course = courseStore.state.courses.get(courseId);

    if (course) {
      createCourseStore.setState({
        courseEditMode: ECourseEditMode.Edit,
        currentCourseId: course.id,
        currentPill: PILLS_MAP.get(course.pillId),
        title: course.title,
        periodType: course.periodType,
        period: course.period,
        times: course.times,
        timesPer: course.timesPer,
        takes: course.takes,
      });
    }
  }

  public setDefaults() {
    createCourseStore.setState({
      courseEditMode: ECourseEditMode.Create,
      currentCourseId: null,
      title: '',
      description: '',
      currentPill: PILLS[0],
      period: 7,
      periodType: EPeriodType.Days,
      times: 3,
      timesPer: ETimesPer.Day,
    });

    this.generateDefaultTakeEntities();
  }

  public selectCurrentPill(currentPill: IPill) {
    createCourseStore.setState({
      currentPill,
    });
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
        title: 'ERRORS.NAME_EMPTY.TITLE',
        message: 'ERRORS.NAME_EMPTY.MESSAGE',
      };
    } else if (title && !this.checkCourseAvailability()) {
      return {
        title: 'ERRORS.COURSE_ALREADY_EXISTS.TITLE',
        message: 'ERRORS.COURSE_ALREADY_EXISTS.MESSAGE',
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
        dosagePart: VARIABLES.NULL_VALUE_SYMBOL,
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

    takeItems.push(
      time.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    );

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
