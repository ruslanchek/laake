export enum ETimesPer {
  Day,
  Week,
}

export const timesPerNames = new Map<ETimesPer, string>();

timesPerNames.set(ETimesPer.Day, 'TIMES_PER.DAY');
timesPerNames.set(ETimesPer.Week, 'TIMES_PER.WEEK');
