import { initializeApp } from 'firebase/app';
import { collection, doc, endAt, getDocs, getFirestore, limit, orderBy, query, startAt, where, writeBatch } from 'firebase/firestore';

const config =
{
  "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
  "authDomain": "bigbang-online.firebaseapp.com",
  "databaseURL": "https://bigbang-online.firebaseio.com/",
  "storageBucket": "gs://bigbang-online.appspot.com/",
  "projectId": "bigbang-online"
}

function castPathToString(path) {
  const strings = path?.map?.(x => String(x)) || []
  return strings
}

function conditionIsNotValid(where) {
  return where[2] == undefined || where[0] == undefined
}

const init = initializeApp(config, "firestore")
const db = getFirestore(init)

const Firestore = {
  get: {
    collectionIds(path, condition, cb, err) {
      const fixedPath = castPathToString(path)
      if (fixedPath.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc [Firestore.get.collectionIds]")
        return
      }
      //@ts-ignore
      const colRef = collection(db, ...fixedPath)
      let conditionsArray = []
      if (condition.length > 0) {
        condition.forEach((c) => {
          if (conditionIsNotValid(c)) {
            console.warn("condition tidak boleh undefined", fixedPath)
          } else {
            //@ts-ignore
            conditionsArray.push(where(...c))
          }
        })
      }
      //@ts-ignore
      const fRef = conditionsArray.length > 0 ? query(colRef, ...conditionsArray) : colRef
      let datas = []
      getDocs(fRef).then((snap) => {
        snap.docs.forEach((doc) => {
          datas.push(doc.id)
        })
        cb(datas)
      }).catch(err)
    }
  },
  delete: {
    batchDoc(rootPath, docIds, callback, error) {
      const fixedPath = castPathToString(rootPath)
      if (fixedPath.length % 2 == 0) {
        console.warn("path untuk akses deleteBatch cukup berhenti di Collection [Firestore.delete.batchDoc]")
        return
      }
      const batch = writeBatch(db);
      docIds.forEach((id) => {
        const laRef = doc(db, ...fixedPath, id);
        batch.delete(laRef);
      })
      batch.commit().then((result) => {
        callback && callback(result)
      }).catch((er) => {
        error && error(er)
      })
    },
  },
}

function deleteChat() {
  // const path = ["BBO", "chat", "chat", "1720632813-PBev", "conversation"]
  // Firestore.get.collectionIds(path, [["user_id", "not-in", ["646358", "445017"]]], (snap) => { //uci - warim
  //   const dt = snap
  //   console.log(dt.length, dt)
  //   Firestore.delete.batchDoc(path, dt, () => {
  //     console.log("deleted")
  //   }, (e) => {
  //     console.log("error", e)
  //   })
  // })
}

function getNotifPayment() {
  const path = ["bbo_payment"]
  const colRef = collection(db, ...path)
  const fRef = query(colRef, orderBy("pay_no", "asc"), startAt(String(126122514183280)), endAt(String(126122514183280) + "\uf8ff"))
  let datas
  getDocs(fRef).then((snap) => {
    snap.docs.forEach((doc) => {
      datas.push(doc.id)
    })
    console.log(datas)
  }).catch(console.warn)
}

async function deletePaymentDocuments(collectionName, endDate, batchSize = 100) {
  const collectionRef = collection(db, collectionName)
  const q = query(collectionRef, where("created", "<=", endDate), orderBy("created", "desc"), limit(batchSize))

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No more documents to delete.");
    return;
  }

  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted ${snapshot.size} documents.`);

  if (snapshot.size === batchSize) {
    await deletePaymentDocuments(collectionName, endDate, batchSize);
  }
}

const collectionName = "bbo_payment"
const endDate = "2024-12-04 00:00:00"

deletePaymentDocuments(collectionName, endDate)
  .then(() => console.log("All documents deleted successfully."))
  .catch((error) => console.error("Error deleting documents: ", error));