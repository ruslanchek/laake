import { Store } from 'react-stores';
import { ICourse } from '../common/course';
import { ITakeTime } from '../common/take';

interface CourseStoreState {
  courses: Map<string, ICourse>;
  takeTimes: Map<string, ITakeTime>;
  loadingCourses: boolean;
  loadingTakeTimes: boolean;
  takeTimesUpdateTime: number;
  coursesUpdateTime: number;
}

export function createTakeTimeIndex(
  courseId: string,
  takeIndex: number,
  takenTime: number,
): string {
  return `${courseId}_${takeIndex}_${takenTime}`;
}

const initialState: CourseStoreState = {
  courses: new Map<string, ICourse>(),
  takeTimes: new Map<string, ITakeTime>(),
  loadingCourses: false,
  loadingTakeTimes: false,
  takeTimesUpdateTime: 0,
  coursesUpdateTime: 0,
};

export const courseStore = new Store<CourseStoreState>(initialState);
