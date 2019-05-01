import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';

const USERS_REF = 'users';

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
    const hasPermission = await firebase.messaging().hasPermission();

    if (hasPermission) {
      const token = await firebase.messaging().getToken();

      if (token) {
        await this.getCollection([ECollectionName.NotificationTokens]).add({
          token,
          timezoneOffset: new Date().getTimezoneOffset(),
          date: Date.now(),
        });
      }
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
}

export const firebaseManager = new FirebaseManager();
