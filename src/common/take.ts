import { CommonService } from '../services/CommonService';
import { VARIABLES } from './variables';

export interface ITake {
  index: number;
  hours: number;
  minutes: number;
  term: ETakeTerm;
  dosage: number;
  dosagePart: string;
  dosageUnits: ETakeDosageUnit;
}

export interface ITakeTime {
  id?: string;
  courseId: string;
  takeIndex: number;
  dayIndex: number;
  isTaken: boolean;
}

export enum ETakeDosageUnit {
  Pieces,
  Pills,
  Tablets,
  Grams,
  MilliGrams,
  MilliLiters,
  Ounces,
}

export enum ETakeTerm {
  NotSet,
  BeforeMeal,
  AfterMeal,
  BeforeBed,
  AfterBed,
}

export const takeDosageUnitNames = new Map<ETakeDosageUnit, string>();

takeDosageUnitNames.set(ETakeDosageUnit.Pieces, 'TAKE.DOSAGE_UNITS.PIECES');
takeDosageUnitNames.set(ETakeDosageUnit.Pills, 'TAKE.DOSAGE_UNITS.PILLS');
takeDosageUnitNames.set(ETakeDosageUnit.Tablets, 'TAKE.DOSAGE_UNITS.TABLETS');
takeDosageUnitNames.set(ETakeDosageUnit.Grams, 'TAKE.DOSAGE_UNITS.GRAMS');
takeDosageUnitNames.set(ETakeDosageUnit.MilliGrams, 'TAKE.DOSAGE_UNITS.MILLI_GRAMS');
takeDosageUnitNames.set(ETakeDosageUnit.MilliLiters, 'TAKE.DOSAGE_UNITS.MILLI_LITERS');
takeDosageUnitNames.set(ETakeDosageUnit.Ounces, 'TAKE.DOSAGE_UNITS.OUNCES');

export const takeTermNames = new Map<ETakeTerm, string>();

takeTermNames.set(ETakeTerm.NotSet, VARIABLES.NULL_VALUE_SYMBOL);
takeTermNames.set(ETakeTerm.BeforeMeal, 'TAKE.TERM.BEFORE_MEAL');
takeTermNames.set(ETakeTerm.AfterMeal, 'TAKE.TERM.AFTER_MEAL');
takeTermNames.set(ETakeTerm.AfterBed, 'TAKE.TERM.AFTER_BED');
takeTermNames.set(ETakeTerm.BeforeBed, 'TAKE.TERM.BEFORE_BED');

export const TAKE_DOSAGE_LIST: number[] = CommonService.times(1001, i => {
  return i;
});

export const TAKE_DOSAGE_PART_LIST: string[] = [
  VARIABLES.NULL_VALUE_SYMBOL,
  '¼',
  '⅓',
  '½',
  '⅔',
  '¾',
];
