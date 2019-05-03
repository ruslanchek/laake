import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';
import { ICourse } from '../common/course';
import { courseManager } from './CourseManager';
import { CommonService } from '../services/CommonService';
import { addDays, differenceInDays } from 'date-fns';

const USERS_REF = 'users';

interface ILocalNotification {
  id: string;
  date: Date;
  title: string;
  message: string;
}

export enum ECollectionName {
  Courses = 'courses',
  TakeTimes = 'takeTimes',
  NotificationTokens = 'notificationTokens',
}

class FirebaseManager extends Manager {
  private uid: string = '';

  public reset(): void {}

  public async init(): Promise<any> {
    await this.initAuth();
  }

  public async initMessaging(): Promise<boolean> {
    let enabled = await firebase.messaging().hasPermission();

    if (enabled) {
      return true;
    } else {
      await firebase.messaging().requestPermission();
      enabled = await firebase.messaging().hasPermission();
    }

    return enabled;
  }

  public getCollection(connectionPath: ECollectionName[] | string[]): CollectionReference {
    const ref = `${this.userRef}${connectionPath.join('/')}`;
    return firebase.firestore().collection(ref);
  }

  public async uploadFile(filename: string, file: string) {
    const storageRef = firebase.storage().ref();
    const uploadTask = await storageRef.child(`${this.userRef}pills/${filename}`).putFile(file, {
      contentType: 'image/jpeg',
    });

    if (uploadTask.state === 'success') {
      return {
        error: null,
        uri: uploadTask.downloadURL,
      };
    } else {
      return {
        error: null,
        uri: '',
      };
    }
  }

  private async updateFCMToken() {
    const token = await firebase.messaging().getToken();

    if (token) {
      await this.getCollection([ECollectionName.NotificationTokens]).add({
        token,
        timezoneOffset: new Date().getTimezoneOffset(),
        date: Date.now(),
      });
    }
  }

  private async initAuth() {
    const data = await firebase.auth().signInAnonymously();

    if (data && data.user && data.user.uid) {
      this.uid = data.user.uid;
      await this.updateFCMToken();
    }
  }

  private get userRef(): string {
    return `${USERS_REF}/${this.uid}/`;
  }

  public createNotification(id: string, title: string, body: string, date: Date) {
    const notification = new firebase.notifications.Notification()
      .setNotificationId(id)
      .setTitle(title)
      .setBody(body);

    firebase.notifications().scheduleNotification(notification, {
      fireDate: date.getTime(),
    });
  }

  public removeNotificationBy(id: string) {}

  public createNotificationId(courseId: string, dayIndex: number, takeIndex: number): string {
    return `${courseId}-${dayIndex}-${takeIndex}`;
  }

  public generateNotificationsForCourse(course: ICourse): ILocalNotification[] {
    const notifications: ILocalNotification[] = [];
    const days =
      courseManager.getCourseDaysLength(new Date(course.startDate), new Date(course.endDate)) + 1;
    const diffDaysFromStart = differenceInDays(new Date(), course.startDate);

    CommonService.times(days, dayIndex => {
      if (diffDaysFromStart >= dayIndex) {
        course.takes.forEach(take => {
          const id = this.createNotificationId(course.id, dayIndex, take.index);
          const date = addDays(new Date(), dayIndex);

          date.setHours(take.hours);
          date.setMinutes(take.minutes);

          notifications.push({
            id,
            date,
            title: `Its take time`,
            message: `Don't forget to have your ${course.title}`,
          });
        });
      }
    });

    return notifications;
  }

  public cancelNotificationsForCourse(course: ICourse) {
    const notificationIds: string[] = [];
    const days =
      courseManager.getCourseDaysLength(new Date(course.startDate), new Date(course.endDate)) + 1;

    CommonService.times(days, dayIndex => {
      course.takes.forEach(take => {
        const notificationId = this.createNotificationId(course.id, dayIndex, take.index);
        notificationIds.push(notificationId);
      });
    });
  }
}

export const firebaseManager = new FirebaseManager();
