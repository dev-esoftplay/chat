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
    // this.getAll = this.getAll.bind(this);
    // this.getChildAdd = this.getChildAdd.bind(this);
    // this.getChildChanged = this.getChildChanged.bind(this);
    // this.getChildMoved = this.getChildMoved.bind(this);
    // this.getChildRemoved = this.getChildRemoved.bind(this);
    // this.listenAll = this.listenAll.bind(this);
    // this.listenChildAdd = this.listenChildAdd.bind(this);
    // this.listenChildChanged = this.listenChildChanged.bind(this);
    // this.listenChildMoved = this.listenChildMoved.bind(this);
    // this.listenChildRemoved = this.listenChildRemoved.bind(this);
    // this.set = this.set.bind(this);
    // this.push = this.push.bind(this);
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

  // set(uriRef: (number | string)[], value: any): void {
  //   this.main.child(uriRef.join("/")).set(value)
  // }

  // push(uriRef: (number | string)[], value: any): void {
  //   this.main.child(uriRef.join("/")).push().set(value)
  // }

  // getAll(uriRef: (number | string)[], callback: (snapshoot: any) => void): void {
  //   esp.log(uriRef)
  //   this.main.child(uriRef.join("/")).once('value', (s) => {
  //     s && s.val() && s.key ? callback(s.val()) : callback(null)
  //   })
  // }

  // getChildAdd(uriRef: (number | string)[], callback: (snapshoot: any) => void): void {
  //   this.main.child(uriRef.join("/")).once('child_added', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  // }

  // getChildChanged(uriRef: (number | string)[], callback: (snapshoot: any) => void): void {
  //   this.main.child(uriRef.join("/")).once('child_changed', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  // }

  // getChildRemoved(uriRef: (number | string)[], callback: (snapshoot: any) => void): void {
  //   this.main.child(uriRef.join("/")).once('child_removed', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  // }

  // getChildMoved(uriRef: (number | string)[], callback: (snapshoot: any) => void): void {
  //   this.main.child(uriRef.join("/")).once('child_moved', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  // }

  // listenAll(uriRef: (number | string)[], callback: (snapshoot: any) => void): () => void {
  //   this.main.child(uriRef.join("/")).on('value', (s) => {
  //     s && s.val() && s.key ? callback(s.val()) : callback(null)
  //   })
  //   return () => this.main.child(uriRef.join("/")).off('value')
  // }

  // listenChildAdd(uriRef: (number | string)[], callback: (snapshoot: any) => void): () => void {
  //   this.main.child(uriRef.join("/")).on('child_added', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  //   return () => this.main.child(uriRef.join("/")).off('child_added')
  // }

  // listenChildChanged(uriRef: (number | string)[], callback: (snapshoot: any) => void): () => void {
  //   this.main.child(uriRef.join("/")).on('child_changed', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  //   return () => this.main.child(uriRef.join("/")).off('child_changed')
  // }

  // listenChildRemoved(uriRef: (number | string)[], callback: (snapshoot: any) => void): () => void {
  //   this.main.child(uriRef.join("/")).on('child_removed', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  //   return () => this.main.child(uriRef.join("/")).off('child_removed')
  // }

  // listenChildMoved(uriRef: (number | string)[], callback: (snapshoot: any) => void): () => void {
  //   this.main.child(uriRef.join("/")).on('child_moved', (s) => {
  //     s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
  //   })
  //   return () => this.main.child(uriRef.join("/")).off('child_moved')
  // }
}