import { Manager } from './Manager';
import firebase from 'react-native-firebase';
import { CollectionReference } from 'react-native-firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAEmeWyzu_nxrVtLClP6LAfVF35H4vXbQk',
  authDomain: 'laake-cab74.firebaseapp.com',
  databaseURL: 'https://laake-cab74.firebaseio.com/',
  storageBucket: 'laake-cab74.appspot.com',
  projectId: 'laake-cab74',
};

const USERS_REF = 'users';

export enum ECollectionName {
  Courses = 'courses',
  TakeTimes = 'takeTimes',
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

    console.log(uploadTask);

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

  private async initAuth() {
    const data = await firebase.auth().signInAnonymously();

    if (data && data.user && data.user.uid) {
      this.uid = data.user.uid;
    }
  }

  private get userRef(): string {
    return `${USERS_REF}/${this.uid}/`;
  }
}

export const firebaseManager = new FirebaseManager();
