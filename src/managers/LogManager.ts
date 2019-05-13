import { Manager } from './Manager';
import { firebaseManager, ECollectionName } from './FirebaseManager';
import { logStore } from '../stores/logStore';
import { ICourse } from '../common/course';
import { VARIABLES } from '../common/variables';

export enum ELogEvent {
  CourseCreated = 'Course_Created',
  CourseUpdated = 'Course_Updated',
  CourseFinished = 'Course_Finished',
  CourseDeleted = 'Course_Deleted',
  MedicationTake = 'Medication_Take',
  MedicationTakeUndo = 'Medication_Take_Undo',
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
    this.getEvents();
    return Promise.resolve();
  }

  getLastEntry(): ILogEvent | undefined {
    const { events } = logStore.state;
    const eventsArray = Array.from(events.values());
    return eventsArray[eventsArray.length - 1];
  }

  async getEvents() {
    if (logStore.state.loadingEvents) {
      return;
    }

    let lastEntry = this.getLastEntry();

    console.log(logStore.state.lastLoadedDate, lastEntry && lastEntry.date);

    if (lastEntry && logStore.state.lastLoadedDate === lastEntry.date) {
      return;
    }

    logStore.setState({
      loadingEvents: true,
    });

    let lastLoadedDate = Infinity;

    if (lastEntry && lastEntry.date) {
      lastLoadedDate = lastEntry.date;
    }

    const snapshot = await firebaseManager
      .getCollection([ECollectionName.Log])
      .orderBy('date', 'desc')
      .startAt(lastLoadedDate)
      .limit(VARIABLES.LOG_EVENTS_PER_PAGE)
      .get();

    snapshot.docs.forEach(doc => {
      const event: ILogEvent = {
        id: doc.id,
        ...doc.data(),
      } as ILogEvent;

      if (doc.id) {
        logStore.state.events.set(doc.id, event);
      }
    });

    lastEntry = this.getLastEntry();

    logStore.setState({
      loadingEvents: false,
      lastLoadedDate,
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
