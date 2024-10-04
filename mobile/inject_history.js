//inject history with chat_to_username and chat_to_image


const { initializeApp } = require("firebase/app")
const { initializeAuth } = require("firebase/auth")
const { getFirestore, getDocs, query, collection, where, updateDoc, doc } = require("firebase/firestore")

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


function getHistory() {
  const colRef = collection(db, "BBT", "chat", "history_new")
  const fRef = query(colRef)

  getDocs(fRef).then((snap) => {
    snap.docs.forEach((val) => {
      getUser(val.data().chat_to, val.id);
    })
  }).catch(console.log)
}

function getUser(chatTo, historyId) {
  const colRef = collection(db, "BBT", "chat", "users")
  const fRef = query(colRef, where("user_id", "==", String(chatTo)))

  getDocs(fRef).then((snap) => {
    updateHistory(historyId, snap.docs[0].data())
  }).catch(console.log)
}

function updateHistory(historyId, data) {
  const colRef = doc(db, "BBT", "chat", "history_new", String(historyId))
  const fRef = query(colRef)

  updateDoc(fRef, { chat_to_username: data?.username, chat_to_image: data?.image }).then(() => {
    console.log("EDITED ", historyId, data?.username)
  }).catch(console.log)
}

getHistory()