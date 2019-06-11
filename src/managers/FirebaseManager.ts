import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';
import { ICourse } from '../common/course';
import { courseManager } from './CourseManager';
import { CommonService } from '../services/CommonService';
import { addDays, differenceInDays } from 'date-fns';
import { ITake } from '../common/take';
import { localeManager } from './LocaleManager';
import { commonStore } from '../stores/commonStore';

const USERS_REF = 'users';

interface IUploadResult {
  error: string | null;
  uri: string | null;
}

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
  Log = 'log',
  Images = 'images',
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

  public async uploadFile(
    filename: string,
    file: string,
    onProgress: (progress: number) => void,
    getCancelHandler: (cancelHandler: () => void) => void,
  ): Promise<IUploadResult> {
    return new Promise<IUploadResult>((resolve, reject) => {
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.userRef}pills/${filename}`).putFile(file, {
        contentType: 'image/jpeg',
      });

      getCancelHandler(() => {
        uploadTask.cancel();
      });

      uploadTask.on(
        'state_changed' as any,
        snapshot => {
          let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

          if (progress > 100) {
            progress = 100;
          }

          onProgress(progress);
        },
        error => {
          resolve({
            error: error.message,
            uri: null,
          });
        },
        snapshot => {
          snapshot.ref
            .getDownloadURL()
            .then(async downloadURL => {
              await this.getCollection([ECollectionName.Images]).add({
                downloadURL,
                date: Date.now(),
              });

              resolve({
                error: null,
                uri: downloadURL,
              });
            })
            .catch(error => {
              resolve({
                error: error.message,
                uri: null,
              });
            });
        },
      );
    });
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

  public createNotification(inotification: ILocalNotification | null) {
    if (!inotification) {
      return;
    }

    const notification = new firebase.notifications.Notification()
      .setNotificationId(inotification.id)
      .setTitle(inotification.title)
      .setBody(inotification.message)
      .setSound('default');

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

  private generateNotification(
    course: ICourse,
    take: ITake,
    dayIndex: number,
    index: number,
  ): ILocalNotification | null {
    if (!course.id) {
      return null;
    }

    const id = this.createNotificationId(course.id, dayIndex, take.index);
    const date = addDays(new Date(), index);

    date.setHours(take.hours);
    date.setMinutes(take.minutes);

    console.log('id', id, 'date', date);

    return {
      id,
      date,
      title: localeManager.t('NOTIFICATIONS.TAKE_TIME.TITLE', {
        time: date.toLocaleTimeString(commonStore.state.currentLocale),
      }),
      message: localeManager.t('NOTIFICATIONS.TAKE_TIME.MESSAGE', {
        courseName: course.title,
      }),
    };
  }

  private generateNotificationsForCourse(course: ICourse): Array<ILocalNotification | null> {
    const notifications: Array<ILocalNotification | null> = [];
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    const days = courseManager.getCourseDaysLength(startDate, endDate);
    const startDayIndex = courseManager.getDayIndex(startDate);

    console.log('startDate', startDate, 'endDate', endDate, 'days', days);

    CommonService.times(days, i => {
      const dayIndex = startDayIndex + i;
      course.takes.forEach(take => {
        notifications.push(this.generateNotification(course, take, dayIndex, i));
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
    const startDayIndex = courseManager.getDayIndex(startDate);

    CommonService.times(days, i => {
      const dayIndex = startDayIndex + i;
      course.takes.forEach(take => {
        this.cancelNotificationByTake(course.id, take.index, dayIndex);
      });
    });
  }

  public cancelNotificationByTake(courseId: string, takeIndex: number, dayIndex: number) {
    console.log(this.createNotificationId(courseId, dayIndex, takeIndex));

    firebase
      .notifications()
      .cancelNotification(this.createNotificationId(courseId, dayIndex, takeIndex));
  }

  public createNotificationByTake(course: ICourse, take: ITake, dayIndex: number, index: number) {
    console.log(index);

    const notification = this.generateNotification(course, take, dayIndex, index);

    this.createNotification(notification);
  }

  public logError(code: number, error: any) {
    console.log(code, error);
  }
}

export const firebaseManager = new FirebaseManager();
