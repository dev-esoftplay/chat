import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { createRequire } from "module";
import fetch from 'node-fetch';
const require = createRequire(import.meta.url);


const config =
// {
//   apiKey: "AIzaSyChqxbhmf7Qk_CagMc6v_bPeegXcLNkUqE",
//   authDomain: "esoftplay-log.firebaseapp.com",
//   databaseURL: "https://esoftplay-log-default-rtdb.firebaseio.com",
//   projectId: "esoftplay-log",
//   storageBucket: "esoftplay-log.appspot.com",
//   messagingSenderId: "844016531377",
//   appId: "1:844016531377:web:892688387299a7b0d3af90"
// }
{
  "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
  "authDomain": "bigbang-online.firebaseapp.com",
  "databaseURL": "https://bigbang-online.firebaseio.com/",
  "storageBucket": "gs://bigbang-online.appspot.com/",
  "projectId": "bigbang-online"
}

const init = initializeApp(config, "firestore")
const db = getFirestore(init)
const Firestore = {
  add: {
    doc(path, value, cb, err) {
      if (path.length % 2 > 0) {
        console.warn("path untuk akses Doc data tidak boleh berhenti di Collection [Firestore.add.doc]")
        return
      }
      const colRef = doc(db, ...path)
      setDoc(colRef, value).then((snap) => {
        cb()
      }).catch(err)
    },
    collection(path, value, cb, err) {
      if (path.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc [Firestore.add.collection]")
        return
      }
      //@ts-ignore
      const colRef = collection(db, ...path)
      addDoc(colRef, value).then((snap) => {
        cb({ id: snap?.id })
      }).catch(err)
    }
  },
};

const dataUser = require("./output/users.json")
const dataChat = require("./output/chat.json");
const dataHistory = require("./output/history.json");

const historyPath = ["BBO", "chat", "history"]
const chatPath = ["BBO", "chat", "chat"]
const userPath = ["BBO", "chat", "users"]

function ucwords(str) {
  return str?.replace?.(/\w\S*/g, function (txt) {
    return txt?.charAt?.(0)?.toUpperCase?.() + txt?.substr?.(1)?.toLowerCase?.();
  });
}


function sendMessage() {
  fetch("https://api.telegram.org/bot964126173:AAEk8HoVJw_d-7dH3rhoLzJ88oVIDkI6IxI/sendMessage?chat_id=355199743&text=[looping_done]").then((r) => {
    process.exit()
  }).catch((e) => {
    process.exit()
  })
}

function importHistory() {
  const history = dataHistory

  function loopChild(user_id, lasIndex) {
    const data = Object.values(history[user_id]["4"])

    function loops(index) {
      if (index != data.length) {
        // insert to firestore
        const cData = data[index]
        const lst = Object.keys?.(dataChat?.[cData?.chat_id]?.conversation || {})
        Firestore.add.collection([...historyPath], {
          chat_id: cData?.chat_id || '',
          chat_to: cData?.user_id || '',
          last_message: dataChat?.[cData?.chat_id]?.conversation?.[lst[lst.length - 1]]?.msg || '',
          read: "1",
          sender_id: user_id,
          time: cData?.time || '',
          user_id: user_id,
          group_id: "4"
        }, () => {
          setTimeout(() => {
            console.log("user_id : " + user_id, 'index ke : ', index, "\n");
            loops(index + 1)
          }, 3);
        })
      } else {
        console.log("[done insert child]");
        loopUserId(lasIndex + 1)
      }
    }
    loops(0)
  };

  function loopUserId(index) {
    const dt = Object.keys(history)
    const i = dt[index]
    if (index != dt.length) {
      setTimeout(() => {
        loopChild(i, index)
      }, 2);
    } else {
      console.log("[DONE INSERT ALL]");
      process.exit()
      // sendMessage()
    }
  };

  loopUserId(0);
}
function importChatConversation() {
  const chat = dataChat;
  const dt = Object.keys(chat)

  function loopi(chat_id, lastIndex) {
    const item = chat[chat_id]
    const conversation = Object.keys(item?.conversation || {})

    function loogc(index) {
      if (index != conversation.length) {
        setTimeout(() => {
          const conversationObj = Object.values(item.conversation)[index]
          let val = {
            key: conversation[index],
            msg: conversationObj?.msg || '',
            read: conversationObj?.read || '0',
            time: conversationObj?.time || '',
            user_id: conversationObj?.user_id || '',
          }

          if (conversationObj?.attach) {
            val['attach'] = conversationObj?.attach || ''
          }

          Firestore.add.doc([...chatPath, chat_id, "conversation", conversation[index]], val, () => {
            console.log("[done insert]", chat_id, conversation[index]);
            loogc(index + 1)
          })
        }, 2);
      } else {
        loop(lastIndex + 1)
      }
    }

    loogc(0)
  }

  function loop(index) {
    if (index != dt.length) {
      const chat_id = dt[index]
      setTimeout(() => {
        loopi(chat_id, index)
      }, 2);
    } else {
      console.log("[DONE INSERT ALL]");
      process.exit()

      // sendMessage()
    }
  }

  loop(0)
}
function importChatMember() {
  const chat = dataChat
  const dt = Object.keys(chat)

  function loopi(chat_id, lastIndex) {
    const item = chat[chat_id]
    const member = Object.keys(item?.member || {})

    function loogc(index) {
      if (index != member.length) {
        setTimeout(() => {
          const memberObj = Object.values(item.member)[index]
          let val = {
            "user_id": member[index],
            "draf": memberObj?.draf || '',
            "is_typing": false
          }

          if (memberObj?.is_open) {
            val['is_open'] = memberObj?.is_open || ''
          }

          Firestore.add.collection([...chatPath, chat_id, "member"], val, () => {
            console.log("[done insert]", chat_id, member[index]);
            loogc(index + 1)
          })
        }, 2);
      } else {
        loop(lastIndex + 1)
      }
    }

    loogc(0)
  }

  function loop(index) {
    if (index != dt.length) {
      const chat_id = dt[index]
      setTimeout(() => {
        loopi(chat_id, index)
      }, 2);
    } else {
      console.log("[DONE INSERT ALL]");
      process.exit()

      // sendMessage()
    }
  }

  loop(0)
}
function importUser() {
  const users = dataUser;
  const dt = Object.keys(users)

  function loop(index) {
    const i = dt[index]
    if (index != dt.length) {
      const newIdx = index + 1

      Firestore.add.collection([...userPath], {
        user_id: i,
        username: ucwords(users?.[i]?.username) || "",
        image: users?.[i]?.image || "",
        deleted: '0'
      }, () => {
        console.log("[done] : user_id " + i);
        setTimeout(() => {
          loop(newIdx)
        }, 1);
      })

    } else {
      console.log("[DONE INSERT ALL]");
      process.exit()
    }
  }
  loop(0);
}
function insertNotif() {
  const notif = require("./notif.json")
  const data = notif.records.slice(0, 10)

  function loop(index) {
    if (index != data.length) {
      const newIdx = index + 1
      Firestore.add.collection(['BBT', 'notification', 'list'], data[index], () => {
        console.log("[done] : " + data[index]?.created);
        setTimeout(() => {
          loop(newIdx)
        }, 1);
      })
    } else {
      console.log("[DONE INSERT ALL]");
      process.exit()
    }
  }
  loop(0);
}
insertNotif()
// importChatConversation()
// importChatMember()
// importHistory()
// importUser()