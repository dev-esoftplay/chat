// noPage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { esp, _global } from 'esoftplay';
import { initializeApp } from 'firebase/app';
import { initializeAuth, signInAnonymously } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { Database, DatabaseReference, getDatabase, ref } from 'firebase/database';

export default class m {
  main: Database
  mainRef: string;
  constructor(ref: string) {
    if (esp.config().hasOwnProperty('firebase')) {
    } else {
      throw "ERROR : firebase not found in config.json"
    }
    this.mainRef = ref;
    this.getMainRef = this.getMainRef.bind(this);
    this.main = getDatabase(_global.firebaseapp)
    this.refTo = this.refTo.bind(this);
  }

  static signInAnonymously(): void {
    if (esp.config().hasOwnProperty('firebase')) {
      if (esp.config('firebase').hasOwnProperty('apiKey')) {
        if (!_global.firebaseapp) {
          _global.firebaseapp = initializeApp(esp.config('firebase'));
          const appAuth = initializeAuth(_global.firebaseapp, { persistence: getReactNativePersistence(AsyncStorage) })
          signInAnonymously(appAuth);
        }
      }
    }
  }

  refTo(uriRef: (number | string)[]): DatabaseReference {
    return ref(this.main, this.getMainRef() + uriRef.join('/'))
  }

  getMainRef(): string {
    return (this.mainRef + '/')
  }
}