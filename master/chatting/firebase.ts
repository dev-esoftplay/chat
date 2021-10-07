// noPage

import firebase from 'firebase';
import { esp } from 'esoftplay';

export default class m {

  main: firebase.database.Reference
  constructor(ref: string) {
    if (esp.config().hasOwnProperty('firebase')) {
    } else {
      throw "ERROR : firebase not found in config.json"
    }    
    this.main = firebase.database().ref(ref)
    this.getMainRef = this.getMainRef.bind(this);
    this.signInAnonymously = this.signInAnonymously.bind(this);
    this.refTo = this.refTo.bind(this);
  }

  signInAnonymously(): void {
    if (esp.config().hasOwnProperty('firebase')) {
      try {
        firebase.initializeApp(esp.config('firebase'));
        firebase.auth().signInAnonymously();
      } catch (error) { }
    }
  }

  refTo(uriRef: (number | string)[]): firebase.database.Reference {
    return this.main.child(uriRef.join("/"))
  }

  getMainRef(): firebase.database.Reference {
    return this.main
  }

}