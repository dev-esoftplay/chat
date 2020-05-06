
import React from 'react'
import firebase from 'firebase';
import { esp } from 'esoftplay';

export default class m {

  main: firebase.database.Reference
  constructor(ref: string) {
    if (esp.config().hasOwnProperty('firebase')) {
      ref = this.uriRefFix(ref)
    } else {
      throw "ERROR : firebase not found in config.json"
    }
    this.main = firebase.database().ref(ref)
    this.getMainRef = this.getMainRef.bind(this);
    this.uriRefFix = this.uriRefFix.bind(this);
    this.signInAnonymously = this.signInAnonymously.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getChildAdd = this.getChildAdd.bind(this);
    this.getChildChanged = this.getChildChanged.bind(this);
    this.getChildMoved = this.getChildMoved.bind(this);
    this.getChildRemoved = this.getChildRemoved.bind(this);
    this.listenAll = this.listenAll.bind(this);
    this.listenChildAdd = this.listenChildAdd.bind(this);
    this.listenChildChanged = this.listenChildChanged.bind(this);
    this.listenChildMoved = this.listenChildMoved.bind(this);
    this.listenChildRemoved = this.listenChildRemoved.bind(this);
    this.set = this.set.bind(this);
    this.push = this.push.bind(this);
    this.refTo = this.refTo.bind(this);
  }

  uriRefFix(uriRef: string): string {
    let out = uriRef
    if (uriRef.lastIndexOf('/') != uriRef.length - 1) {
      out += '/'
    }
    return out
  }

  signInAnonymously(): void {
    if (esp.config().hasOwnProperty('firebase')) {
      try {
        firebase.initializeApp(esp.config('firebase'));
        firebase.auth().signInAnonymously();
      } catch (error) { }
    }
  }

  refTo(uriRef: string): firebase.database.Reference {
    uriRef = this.uriRefFix(uriRef)
    return this.main.child(uriRef)
  }

  getMainRef(): firebase.database.Reference {
    return this.main
  }

  set(uriRef: string, value: any): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).set(value)
  }

  push(uriRef: string, value: any): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).push().set(value)
  }

  getAll(uriRef: string, callback: (snapshoot: any) => void): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).once('value', (s) => {
      s && s.val() && s.key ? callback(s.val()) : callback(null)
    })
  }

  getChildAdd(uriRef: string, callback: (snapshoot: any) => void): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).once('child_added', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
  }

  getChildChanged(uriRef: string, callback: (snapshoot: any) => void): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).once('child_changed', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
  }

  getChildRemoved(uriRef: string, callback: (snapshoot: any) => void): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).once('child_removed', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
  }

  getChildMoved(uriRef: string, callback: (snapshoot: any) => void): void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).once('child_moved', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
  }

  listenAll(uriRef: string, callback: (snapshoot: any) => void): () => void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).on('value', (s) => {
      s && s.val() && s.key ? callback(s.val()) : callback(null)
    })
    return () => this.main.child(uriRef).off('value')
  }

  listenChildAdd(uriRef: string, callback: (snapshoot: any) => void): () => void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).on('child_added', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
    return () => this.main.child(uriRef).off('child_added')
  }

  listenChildChanged(uriRef: string, callback: (snapshoot: any) => void): () => void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).on('child_changed', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
    return () => this.main.child(uriRef).off('child_changed')
  }

  listenChildRemoved(uriRef: string, callback: (snapshoot: any) => void): () => void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).on('child_removed', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
    return () => this.main.child(uriRef).off('child_removed')
  }

  listenChildMoved(uriRef: string, callback: (snapshoot: any) => void): () => void {
    uriRef = this.uriRefFix(uriRef)
    this.main.child(uriRef).on('child_moved', (s) => {
      s && s.val() && s.key ? callback({ key: s.key, ...s.val() }) : callback(null)
    })
    return () => this.main.child(uriRef).off('child_moved')
  }
}