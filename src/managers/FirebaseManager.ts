import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';
import { ICourse } from '../common/course';
import { courseManager } from './CourseManager';
import { CommonService } from '../services/CommonService';
import { addDays } from 'date-fns';
import { ITake } from '../common/take';
import { localeManager } from './LocaleManager';
import { commonStore } from '../stores/commonStore';
import { Platform } from 'react-native';

const USERS_REF = 'users';
const ADS_THRESHOLD_MAX_NUMBER = 10;
const INTERSTITIAL_ID_IOS = 'ca-app-pub-7561063360856843/6686338527';
const INTERSTITIAL_ID_ANDROID = 'ca-app-pub-7561063360856843/6728185648';

interface IUploadResult {
  error: string | null;
  uri: string | null;
}

interface ISettings<T> {
  name: string;
  value: T;
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
  Settings = 'settings',
  Debug = 'debug',
}

class FirebaseManager extends Manager {
  private uid: string = '';
  private adsThresholdNumber: number = 0;

  public reset(): void {}

  public async init(): Promise<any> {
    await this.initAuth();
    await this.checkPro();
    this.removeAllDeliveredNotifications();
    // this.setBadgeNumber(0);
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
    firebase
      .notifications()
      .cancelNotification(this.createNotificationId(courseId, dayIndex, takeIndex));
  }

  public createNotificationByTake(course: ICourse, take: ITake, dayIndex: number, index: number) {
    const notification = this.generateNotification(course, take, dayIndex, index);

    this.createNotification(notification);
  }

  public logError(code: number, error: any) {
    // firebase.crashlytics().log('Test Message!');
    // firebase.crashlytics().recordError(37, 'Test Error');

    console.log(code, error);
  }

  private async checkPro() {
    const result = await this.getCollection([ECollectionName.Settings])
      .where('name', '==', 'isPro')
      .limit(1)
      .get();

    let isPro = false;

    if (!result.docs || result.docs.length === 0) {
      isPro = false;
      await this.setPro(false);
    } else {
      if (result.docs[0].data) {
        const settingsParam: ISettings<boolean> = result.docs[0].data() as any;

        if (settingsParam.name && settingsParam.value) {
          isPro = true;
        } else {
          isPro = false;
        }
      } else {
        isPro = false;
      }
    }

    commonStore.setState({
      isPro,
    });
  }

  public async setPro(isPro: boolean) {
    await this.getCollection([ECollectionName.Settings])
      .doc('isPro')
      .set({
        name: 'isPro',
        value: isPro,
      });

    commonStore.setState({
      isPro,
    });
  }

  get interstitialId() {
    if (Platform.OS === 'ios') {
      return INTERSTITIAL_ID_IOS;
    } else {
      return INTERSTITIAL_ID_ANDROID;
    }
  }

  public loadAds() {
    if (commonStore.state.isPro) {
      return;
    }

    this.adsThresholdNumber++;

    if (this.adsThresholdNumber === ADS_THRESHOLD_MAX_NUMBER) {
      try {
        const advert = (firebase as any).admob().interstitial(this.interstitialId);
        const AdRequest = (firebase as any).admob.AdRequest;
        const request = new AdRequest();

        // request.addTestDevice('b87df65e35e51250e04288aed511b8f8');

        advert.loadAd(request.build());

        advert.on('onAdLoaded', () => {
          if (advert.isLoaded()) {
            advert.show();
          }
        });
      } catch (e) {
        this.logError(393202, e);
      }

      this.adsThresholdNumber = 0;
    }
  }
}

export const firebaseManager = new FirebaseManager();
