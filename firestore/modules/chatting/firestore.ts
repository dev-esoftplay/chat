
// noPage

import _global from 'esoftplay/_global';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, FieldPath, getDoc, getDocs, initializeFirestore, onSnapshot, query, setDoc, updateDoc, where, WhereFilterOp } from 'firebase/firestore';

export interface DataId {
  id: string,
  data: any
}

export type id = string

const Firestore = {
  init() {
    _global.firebaseApp = initializeApp({
      apiKey: "AIzaSyChqxbhmf7Qk_CagMc6v_bPeegXcLNkUqE",
      authDomain: "esoftplay-log.firebaseapp.com",
      databaseURL: "https://esoftplay-log-default-rtdb.firebaseio.com",
      projectId: "esoftplay-log",
      storageBucket: "esoftplay-log.appspot.com",
      messagingSenderId: "844016531377",
      appId: "1:844016531377:web:892688387299a7b0d3af90"
    })
    // _global.firebaseApp = initializeApp({
    //   "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
    //   "authDomain": "bigbang-online.firebaseapp.com",
    //   "databaseURL": "https://bigbang-online.firebaseio.com/",
    //   "storageBucket": "gs://bigbang-online.appspot.com/",
    //   "projectId": "bigbang-online"
    // })
  },
  db() {
    if (!_global.firebaseFirestore)
      // _global.firebaseFirestore = getFirestore(_global.firebaseApp)
      _global.firebaseFirestore = initializeFirestore(_global.firebaseApp, {
        experimentalForceLongPolling: true
      })
    return _global.firebaseFirestore
  },
  add: {
    doc(path: string[], value: any, cb: () => void, err?: (error: any) => void) {
      if (path.length % 2 > 0) {
        console.warn("path untuk akses Doc data tidak boleh berhenti di Collection")
        return
      }
      const colRef = doc(Firestore.db(), ...path)
      setDoc(colRef, value).then((snap) => {
        cb()
      }).catch(err)
    },
    collection(path: string[], value: any, cb: (dt: any) => void, err?: (error: any) => void) {
      if (path.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc")
        return
      }
      //@ts-ignore
      const colRef = collection(Firestore.db(), ...path)
      addDoc(colRef, value).then((snap) => {
        cb({ id: snap?.id })
      }).catch(err)
    }
  },
  delete: {
    doc(path: string[], cb: () => void, err?: (error: any) => void) {
      const colRef = doc(Firestore.db(), ...path)
      deleteDoc(colRef).then((snap) => {
        cb()
      }).catch(err)
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
    collection(path: string[], cb: (dt: any) => void, err?: (error: any) => void): () => void {
      // @ts-ignore
      const colRef = collection(Firestore.db(), ...path)
      let datas: any[] = []
      const unsub = onSnapshot(colRef, (snap) => {
        datas = []
        snap.docs.forEach((doc) => {
          datas.push({ data: doc.data(), id: doc.id })
        })
        cb(datas)
      }, err)
      return () => unsub()
    },
    doc(path: string[], cb: (dt: any) => void, err?: (error: any) => void): () => void {
      // @ts-ignore
      const colRef = doc(Firestore.db(), ...path)
      const unsub = onSnapshot(colRef, (snap) => {
        cb(snap.data())
      }, err)
      return () => unsub()
    }
  },
  update: {
    collection() {

    },
    doc(path: string[], value: string, cb: () => void, err?: (error: any) => void) {
      let nPath = [path[0], path[1]]
      let par = path.filter((t, i) => i != 0 && i != 1)

      const colRef = doc(Firestore.db(), ...nPath)
      updateDoc(colRef, {
        [`${par.join(".")}`]: value
      }).then((e) => {
        cb()
      }).catch(err)
    }
  },
  query() {

  },
  paginate() {

  }
}

export default Firestore