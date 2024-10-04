// remove user dupclicate by user_id


const { initializeApp } = require("firebase/app")
const { initializeAuth } = require("firebase/auth")
const { getFirestore, getDocs, query, collection, where, updateDoc, doc, orderBy, deleteDoc } = require("firebase/firestore")

const config = {
  "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
  "authDomain": "bigbang-online.firebaseapp.com",
  "databaseURL": "https://bigbang-online.firebaseio.com/",
  "storageBucket": "gs://bigbang-online.appspot.com/",
  "projectId": "bigbang-online"
}

const firebaseapp = initializeApp(config)
const auth = initializeAuth(firebaseapp)
const db = getFirestore(firebaseapp)

function getUsers(user_id) {
  const colRef = collection(db, "BBT", "chat", "users")
  const fRef = query(colRef, where("user_id", "==", String(user_id)))

  getDocs(fRef).then((snap) => {
    snap.docs.forEach((val, i) => {
      if (i === 0) {
        if (snap.docs.length == 1) {
          console.log("data not duplicated, only one record found!");
        }
      } else {
        deleteUser(val.id)
      }
    })
  }).catch(console.log)
}

function deleteUser(id) {
  const colRef = doc(db, "BBT", "chat", "users", String(id))
  deleteDoc(colRef).then((snap) => {
    console.log(id, " Deleted");
  }).catch(console.log)
}

getUsers(26677)