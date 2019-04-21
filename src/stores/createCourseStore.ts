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
};

export const createCourseStore = new Store<CreateCourseStoreState>(initialState, {
  live: true,
});
