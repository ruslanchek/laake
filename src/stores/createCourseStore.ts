import { Store } from 'react-stores';
import { IPill, PILLS } from '../common/pills';
import { EPeriodType } from '../common/periods';
import { ETimesPer } from '../common/times';
import { ITake } from '../common/take';

export enum ECourseEditMode {
  Create,
  Edit,
  View,
}

interface CreateCourseStoreState {
  courseEditMode: ECourseEditMode;
  currentCourseId: string | null;
  currentPill: IPill;
  title: string;
  description: string;
  periodType: EPeriodType;
  period: number;
  times: number;
  timesPer: ETimesPer;
  takes: ITake[];
  notificationsEnabled: boolean;
  takenPercent: number;
  timesToTake: number;
  timesTaken: number;
  timesTotal: number;
}

const initialState: CreateCourseStoreState = {
  courseEditMode: ECourseEditMode.Create,
  currentCourseId: null,
  currentPill: PILLS[0],
  title: '',
  description: '',
  periodType: EPeriodType.Days,
  period: 1,
  times: 1,
  timesPer: ETimesPer.Day,
  takes: [],
  notificationsEnabled: false,
  takenPercent: 0,
  timesToTake: 0,
  timesTaken: 0,
  timesTotal: 0,
};

export const createCourseStore = new Store<CreateCourseStoreState>(initialState, {
  live: true,
});
