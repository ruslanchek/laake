import { EPeriodType } from './periods';
import { ETimesPer } from './times';
import { ITake } from './take';
import { ImageURISource } from 'react-native';

export interface ICourse {
  id: string;
  uploadedImage: string | null;
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
  takenPercent: number;
  timesToTake: number;
  timesTaken: number;
  timesTotal: number;
  unitsTotal: number;
  unitsTaken: number;
  unitsToTake: number;
}

export interface ICourseStatistics {
  takenPercent: number;
  timesToTake: number;
  timesTaken: number;
  timesTotal: number;
  unitsTotal: number;
  unitsTaken: number;
  unitsToTake: number;
}
