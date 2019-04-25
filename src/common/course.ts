import { EPeriodType } from './periods';
import { ETimesPer } from './times';
import { ITake } from './take';

export interface ICourse {
  id: string;
  title: string;
  pillId: number;
  periodType: EPeriodType;
  period: number;
  times: number;
  timesPer: ETimesPer;
  takes: ITake[];
  startDate: number;
  endDate: number;
  notificationsEnabled: boolean;
}

export interface ICourseStatistics {
  takenPercent: number;
  timesToTake: number;
  timesTaken: number;
  timesTotal: number;
}
