import { Manager } from './Manager';
import { firebaseManager, ECollectionName } from './FirebaseManager';
import { logStore } from '../stores/logStore';
import { ICourse } from '../common/course';

export enum ELogEvent {
  CourseCreated = 'CourseCreated',
  CourseUpdated = 'CourseUpdated',
  CourseFinished = 'CourseFinished',
  CourseDeleted = 'CourseDeleted',
  MedicationTake = 'MedicationTake',
  MedicationTakeUndo = 'MedicationTakeUndo',
}

export interface ILogEvent {
  id: string;
  event: ELogEvent;
  courseName: string;
  date: number;
}

class LogManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    this.subscribeToEvents();
    return Promise.resolve();
  }

  subscribeToEvents() {
    logStore.setState({
      loadingEvents: true,
    });

    firebaseManager.getCollection([ECollectionName.Log]).onSnapshot(snapshot => {
      logStore.state.events.clear();

      snapshot.docs.forEach(doc => {
        const event: ILogEvent = {
          id: doc.id,
          ...doc.data(),
        } as ILogEvent;

        if (doc.id) {
          logStore.state.events.set(doc.id, event);
        }
      });

      logStore.setState({
        loadingEvents: false,
      });
    });
  }

  async logEvent(event: ELogEvent, courseName: string) {
    try {
      await firebaseManager.getCollection([ECollectionName.Log]).add({
        event,
        courseName,
        date: Date.now(),
      });
    } catch (e) {
      console.log(e);

      firebaseManager.logError(629341, e);
    }
  }
}

export const logManager = new LogManager();
