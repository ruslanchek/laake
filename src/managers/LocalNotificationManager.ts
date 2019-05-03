import { Manager } from './Manager';
import PushNotification from 'react-native-push-notification';
import { PushNotificationIOS } from 'react-native';
import { ICourse } from '../common/course';
import { createCourseManager } from './CreateCourseManager';
import { courseManager } from './CourseManager';
import { CommonService } from '../services/CommonService';
import { ITake } from '../common/take';

PushNotification.configure({
  onRegister: (token: any) => {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote or local notification is opened or received
  onNotification: (notification: any) => {
    // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: false,
});

class LocalNotificationManager extends Manager {
  public reset(): void {}

  public async init(): Promise<any> {
    PushNotification.localNotificationSchedule({
      title: 'xxxx',
      message: 'My Notification Message',
      vibrate: true,
      playSound: true,
      soundName: 'default',
      date: new Date(Date.now() + 60 * 1000), // in 30 secs
    });

    return Promise.resolve();
  }

  public createNotificationId(courseId: string, dayIndex: number, takeIndex: number): string {
    return `${courseId}-${dayIndex}-${takeIndex}`;
  }

  public generateNotificationsForCourse(course: ICourse) {
    const notifications = [];
    const days =
      courseManager.getCourseDaysLength(new Date(course.startDate), new Date(course.endDate)) + 1;

    CommonService.times(days, dayIndex => {
      course.takes.forEach(take => {
        const notificationId = this.createNotificationId(course.id, dayIndex, take.index);
        notifications.push(notificationId);
      });
    });
  }

  public cancelNotificationsForCourse(course: ICourse) {}
}

export const localNotificationManager = new LocalNotificationManager();
