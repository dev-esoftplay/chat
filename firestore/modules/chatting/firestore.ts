
// noPage

import _global from 'esoftplay/_global';
import { initializeApp } from 'firebase/app';
import { collection, doc, FieldPath, getDoc, getDocs, getFirestore, query, where, WhereFilterOp } from 'firebase/firestore/lite';

export interface DataId {
  id: string,
  data: any
}

export type id = string

const Firestore = {
  init() {
    _global.firebaseApp = initializeApp({
      "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
      "authDomain": "bigbang-online.firebaseapp.com",
      "databaseURL": "https://bigbang-online.firebaseio.com/",
      "storageBucket": "gs://bigbang-online.appspot.com/",
      "projectId": "bigbang-online"
    })
  },
  db() {
    if (!_global.firebaseFirestore)
      _global.firebaseFirestore = getFirestore(_global.firebaseApp)
    return _global.firebaseFirestore
  },
  add: {
    doc() {

    },
    collection() {

    }
  },
  delete:{
    doc(){
      
    }
  },
  get: {
    doc(path: string[], condition: [fieldPath?: string | FieldPath, opStr?: WhereFilterOp, value?: unknown], cb: (arr: DataId) => void, err?: (error: any) => void) {
      if (path.length % 2 > 0) {
        console.warn("path untuk akses Doc data tidak boleh berhenti di Collection")
        return
      }
      //@ts-ignore
      const colRef = doc(Firestore.db(), ...path)
      //@ts-ignore
      const fRef = (!condition || condition.length < 3) ? colRef : query(colRef, where(...condition))
      getDoc(fRef).then((snap) => {
        cb({ data: snap.data(), id: snap.id })
      }).catch(err)
    },
    collection(path: string[], condition: [fieldPath?: string | FieldPath, opStr?: WhereFilterOp, value?: unknown], cb: (arr: DataId[]) => void, err?: (error: any) => void) {
      if (path.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc")
        return
      }
      //@ts-ignore
      const colRef = collection(Firestore.db(), ...path)
      //@ts-ignore
      const fRef = (!condition || condition.length < 3) ? colRef : query(colRef, where(...condition))
      let datas: any[] = []
      getDocs(fRef).then((snap) => {
        snap.docs.forEach((doc) => {
          datas.push({ data: doc.data(), id: doc.id })
        })
        cb(datas)
      }).catch(err)
    },
    collectionIds(path: string[], condition: [fieldPath?: string | FieldPath, opStr?: WhereFilterOp, value?: unknown], cb: (arr: id[]) => void, err?: (error: any) => void) {
      if (path.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc")
        return
      }
      //@ts-ignore
      const colRef = collection(Firestore.db(), ...path)
      //@ts-ignore
      const fRef = (!condition || condition.length < 3) ? colRef : query(colRef, where(...condition))
      let datas: any[] = []
      getDocs(fRef).then((snap) => {
        snap.docs.forEach((doc) => {
          datas.push(doc.id)
        })
        cb(datas)
      }).catch(err)
    }
  },
  listen: {
    collection() {

    },
    doc() {

    }
  },
  update: {
    collection() {

    },
    doc() {

    }
  },
  query() {

  },
  paginate() {

  }
}

export default Firestore