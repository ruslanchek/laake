export enum EPeriodType {
  Days,
  Weeks,
  Months,
}

export const periodTypeNames = new Map<EPeriodType, string>();

periodTypeNames.set(EPeriodType.Days, 'PERIODS.DAYS');
periodTypeNames.set(EPeriodType.Weeks, 'PERIODS.WEEKS');
periodTypeNames.set(EPeriodType.Months, 'PERIODS.MONTHS');
