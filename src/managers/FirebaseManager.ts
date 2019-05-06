import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';
import { ICourse } from '../common/course';
import { courseManager } from './CourseManager';
import { CommonService } from '../services/CommonService';
import { addDays, differenceInDays } from 'date-fns';
import { ITake } from '../common/take';

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
    this.removeAllDeliveredNotifications();
    this.setBadgeNumber(0);
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

  public setBadgeNumber(number: number) {
    firebase.notifications().setBadge(number);
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
      this.updateFCMToken();
    }
  }

  private get userRef(): string {
    return `${USERS_REF}/${this.uid}/`;
  }

  public createNotification(inotification: ILocalNotification) {
    const notification = new firebase.notifications.Notification()
      .setNotificationId(inotification.id)
      .setTitle(inotification.title)
      .setBody(inotification.message);

    firebase.notifications().scheduleNotification(notification, {
      fireDate: inotification.date.getTime(),
    });
  }

  public createNotificationId(courseId: string, dayIndex: number, takeIndex: number): string {
    return `${courseId}-${dayIndex}-${takeIndex}`;
  }

  public removeAllDeliveredNotifications() {
    firebase.notifications().removeAllDeliveredNotifications();
  }

  private generateNotification(course: ICourse, take: ITake, dayIndex: number): ILocalNotification {
    const id = this.createNotificationId(course.id, dayIndex, take.index);
    const date = addDays(new Date(), dayIndex);

    date.setHours(take.hours);
    date.setMinutes(take.minutes);

    return {
      id,
      date,
      title: `It's take time`,
      message: `Don't forget to have your ${course.title}`,
    };
  }

  private generateNotificationsForCourse(course: ICourse): ILocalNotification[] {
    const notifications: ILocalNotification[] = [];
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const days = courseManager.getCourseDaysLength(startDate, endDate);
    const startDayIndex = courseManager.getDayIndex(startDate) + 1;

    CommonService.times(days, i => {
      const dayIndex = startDayIndex + i;
      course.takes.forEach(take => {
        notifications.push(this.generateNotification(course, take, i));
      });
    });

    return notifications;
  }

  public createNotificationsForCourse(course: ICourse) {
    const notifications = this.generateNotificationsForCourse(course);

    notifications.forEach(notification => {
      this.createNotification(notification);
    });
  }

  public cancelNotificationsForCourse(course: ICourse) {
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const days = courseManager.getCourseDaysLength(startDate, endDate);
    const startDayIndex = courseManager.getDayIndex(startDate) + 1;

    CommonService.times(days, i => {
      const dayIndex = startDayIndex + i;
      course.takes.forEach(take => {
        this.cancelNotificationByTake(course.id, take.index, dayIndex);
      });
    });
  }

  public cancelNotificationByTake(courseId: string, takeIndex: number, dayIndex: number) {
    firebase
      .notifications()
      .cancelNotification(this.createNotificationId(courseId, dayIndex, takeIndex));
  }

  public createNotificationByTake(course: ICourse, take: ITake, dayIndex: number) {
    const notification = this.generateNotification(course, take, dayIndex);

    this.createNotification(notification);
  }

  public logError(code: number, error: any) {
    console.error(code, error);
  }
}

export const firebaseManager = new FirebaseManager();
