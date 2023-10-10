// useLibs
// noPage

import useFirestore, { DataId, updateValue, userData } from "esoftplay-firestore"
import { LibUtils } from "esoftplay/cache/lib/utils/import"
import { UserClass } from "esoftplay/cache/user/class/import"
import esp from "esoftplay/esp"
import { doc, serverTimestamp, writeBatch } from "firebase/firestore"
import { Alert } from "react-native"


export interface ChattingLibReturn {
  chatSendNew: (chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void) => void,
  chatSend: (chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void) => void,
  chatAll: (chat_id: string, callback: (messages: any[]) => void, lastIndex?: string) => void,
  chatGet: (chat_id: string, key: string, callback: (chat: any) => void) => void,
  chatDelete: (chat_id: string, key: string) => void,
  chatGetAll: (chat_id: string, callback: (allmsg: any, end?: boolean) => void, page?: number, limit?: number) => void,
  chatListenChange: (chat_id: string, callback: (removedChild: any) => void) => void,
  chatUpdate: (key: string, chat_id: string, value: any) => void,
  listenUser: (user_id: string, callback: (user: any) => void) => void,
  setUser: (username?: string, image?: string, deleted?: boolean) => void,
  getChatId: (chat_to: string, group_id: string, callback: (chat_id: string) => void) => void,
  makeId: (length: number) => void,
  pathChat: any,
  pathHistory: any,
  pathUsers: any,
}

export default function m(): ChattingLibReturn {
  const group_id = esp.config('group_id') || '4'
  const perPage = 20

  const rootPath: string = esp?.appjson?.()?.expo?.name
  const pathChat = [rootPath, 'chat', 'chat']
  const pathHistory = [rootPath, 'chat', 'history']
  const pathUsers = [rootPath, 'chat', 'users']

  const { db, app } = useFirestore().init()

  function makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

  function chatSendNew(chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void): void {
    const firestoreUser = userData.get()[app.name]
    const user = UserClass.state().get()

    if (!user) return
    if (!firestoreUser) return

    if (user?.id == chat_to) {
      Alert.alert(esp.lang("chatting/lib", "alert_title"), esp.lang("chatting/lib", "alert_msg"))
      return
    }
    const chat_id = (new Date().getTime() / 1000).toFixed(0) + "-" + makeid(4)
    const time = (new Date().getTime() / 1000).toFixed(0)

    getUID(chat_to, (uid) => {
      let msg: any = {
        msg: message,
        read: '0',
        time: time,
        timestamp: serverTimestamp(),
        user_id: user?.id,
        uid: firestoreUser?.uid,
        uidto: uid
      }
      if (attach) {
        msg['attach'] = attach
      }
      /* buat chat member default */
      let memberMe = {
        user_id: user?.id,
        is_typing: false,
        draf: ''
      }
      let memberNotMe = {
        user_id: chat_to,
        is_typing: false,
        draf: ''
      }

      //create path to chat_id
      useFirestore().addDocument(db, [...pathChat, chat_id], {}, () => {
        /* me */
        useFirestore().addCollection(db, [...pathChat, chat_id, 'member'], memberMe, () => { })
        /* notMe */
        useFirestore().addCollection(db, [...pathChat, chat_id, 'member'], memberNotMe, () => { })

        useFirestore().addCollection(db, [...pathChat, chat_id, 'conversation'], msg, (dt) => {
          msg['key'] = dt?.id
          if (callback) callback(msg, chat_id)
          if (withHistory) historyNew(chat_id, chat_to, message)
        })
      }, esp.log)

    })
  }
  function historyNew(chat_id: string, chat_to: string, last_message: string): void {
    const user = UserClass.state().get()
    const firestoreUser = userData.get()[app.name]

    if (!user) return
    if (!firestoreUser) return

    getUID(chat_to, (uid) => {
      const _time = (new Date().getTime() / 1000).toFixed(0)
      let me = {
        chat_id: chat_id,
        time: _time,
        chat_to: chat_to,
        last_message,
        read: "0",
        sender_id: user?.id,
        group_id: String(group_id),
        user_id: user?.id,
        uid: firestoreUser?.uid,
        uidto: uid
      }
      let notMe = {
        chat_id: chat_id,
        time: _time,
        chat_to: user?.id,
        last_message,
        read: "0",
        sender_id: user?.id,
        group_id: String(group_id),
        user_id: chat_to,
        uid: uid,
        uidto: firestoreUser.uid
      }

      let historyMe: any = {}
      const historyNotMe = {
        chat_to_username: user?.name,
        chat_to_image: user?.image
      }

      useFirestore().getCollectionWhere(db, [...pathUsers], [["user_id", "==", chat_to]], (arr) => {
        if (arr.length > 0) {
          historyMe["chat_to_username"] = arr?.[0]?.data?.username
          historyMe["chat_to_image"] = arr?.[0]?.data?.image
        }
        useFirestore().addCollection(db, [...pathHistory], { ...me, ...historyMe }, () => { })
        useFirestore().addCollection(db, [...pathHistory], { ...notMe, ...historyNotMe }, () => { })
      })
    })

  }
  function chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {

    const user = UserClass.state().get()
    const firestoreUser = userData.get()[app.name]

    if (!user) return
    if (!firestoreUser) return

    getUID(chat_to, (uid) => {
      const _time = (new Date().getTime() / 1000).toFixed(0)
      let msg: any = {
        msg: message,
        read: '0',
        time: _time,
        timestamp: serverTimestamp(),
        user_id: user?.id,
        uid: firestoreUser?.uid,
        uidto: uid
      }
      if (attach) {
        msg['attach'] = attach
      }
      /* buat chat member default */
      let member = {
        is_typing: false,
        draf: '',
        user_id: user?.id
      }
      let notMe = {
        is_typing: false,
        draf: '',
        user_id: chat_to
      }
      /* simpan pesan */
      useFirestore().addCollection(db, [...pathChat, chat_id, 'conversation'], msg, (dt) => {
        msg['key'] = dt?.id
        if (callback) {
          callback(msg)
        }
      })

      /* set members */
      useFirestore().getCollectionIds(db, [...pathChat, chat_id, 'member'], [["user_id", '==', user?.id]], (arr) => {
        useFirestore().addDocument(db, [...pathChat, chat_id, 'member', arr[0]], member, () => { })
      })

      if (!chat_to) return
      useFirestore().getCollectionIds(db, [...pathChat, chat_id, 'member'], [["user_id", '==', chat_to]], (arr) => {
        useFirestore().addDocument(db, [...pathChat, chat_id, 'member', arr[0]], notMe, () => { })
      })

      if (!chat_id) return
      useFirestore().getCollectionWhere(db, [...pathHistory], [['chat_id', '==', chat_id]], (datas) => {
        if (datas.length > 0) {
          datas.forEach((val) => {
            useFirestore().updateDocument(db, [...pathHistory, val.id], [
              { key: "uid", value: val?.data?.user_id == user?.id ? firestoreUser?.uid : uid },
              { key: "uidto", value: val?.data?.user_id == user?.id ? uid : firestoreUser?.uid },
            ], () => { })
          })
        }
      })
      useFirestore().getCollectionIds(db, [...pathHistory], [['chat_id', '==', chat_id]], (keys) => {
        updateBatch(keys, pathHistory, [
          { key: "time", value: _time },
          { key: "last_message", value: message },
          { key: "read", value: "0" },
          { key: "sender_id", value: user?.id },
        ])
      })
    })
  }

  function getUID(user_id: string, cb: (uid: string) => void): void {
    useFirestore().getCollectionWhereOrderBy(db, [...pathUsers], [["user_id", "==", String(user_id)]], [["uid", "desc"]], (dt) => {
      if (dt.length > 0) {
        cb(dt?.[0]?.data?.uid)
      }
    })
  }

  function chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    const user = UserClass.state().get()

    if (!user) return
    useFirestore().getCollectionWhereOrderBy(db, [...pathChat, chat_id, 'conversation'], [], [], (arr) => {
      if (arr) {
        const snapshoot: any = arr;
        let a: any = {}
        snapshoot.map((key: any) => {
          let item = snapshoot[key];
          item.key = key
          a[key] = item
        })
        callback(a);
      } else {
        //@ts-ignore
        callback(null)
      }
    })
  }
  function chatGet(chat_id: string, key: string, callback: (chat: any) => void): void {
    const user = UserClass.state().get()

    if (!user) return
    useFirestore().getDocument(db, [...pathChat, chat_id, 'conversation', key], [], (dt: DataId) => {
      if (dt) {
        callback({ key: dt.id, ...dt.data });
      } else {
        callback(null)
      }
    })
  }
  function chatDelete(chat_id: string, key: string): void {
    const user = UserClass.state().get()

    if (!user) return
    useFirestore().deleteDocument(db, [...pathChat, chat_id, 'conversation', key], () => { }, (e) => esp.log("DELETE USER", e))
  }
  function chatGetAll(chat_id: string, callback: (allmsg: any, end?: boolean) => void, isStartPage?: number, limit?: number): void {
    const user = UserClass.state().get()
    if (!user) return
    useFirestore().paginate(db, isStartPage == 1 ? true : false, [...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], limit || perPage, (dt, endR) => {
      if (dt) {
        callback(dt, endR);
      } else {
        callback(null)
      }
    })
  }
  function chatListenChange(chat_id: string, callback: (removedChild: any) => void) {
    const user = UserClass.state().get()

    if (!user) return
    useFirestore().listenCollection(db, [...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], (dt) => {
      callback(dt);
    })
  }
  function chatUpdate(key: string, chat_id: string, value: updateValue[]): void {
    const user = UserClass.state().get()
    if (!key) return
    if (!user) return
    useFirestore().updateDocument(db, [...pathChat, chat_id, 'conversation', key], value, () => { })
  }
  function listenUser(user_id: string, callback: (user: any) => void) {
    const user = UserClass.state().get()

    if (!user) return
    useFirestore().listenDocument(db, [...pathUsers, user_id], (dt) => {
      if (dt) {
        callback(dt)
      } else {
        callback(null)
      }
    })
  }

  async function deleteDuplicatedUser(key: any[]) {
    const batch = writeBatch(db);
    key.forEach((id, index) => {
      if (index !== 0) {
        const laRef = doc(db, ...pathUsers, id);
        batch.delete(laRef);
      }
    })
    await batch.commit();
  }

  async function updateBatch(key: any[], rootPath: string[], data: any[]) {
    if (key.length > 0) {
      const batch = writeBatch(db);
      const value = data.map((x) => {
        return { [x.key]: x.value }
      })
      const newValue = Object.assign({}, ...value)

      key.forEach((id) => {
        const laRef = doc(db, ...rootPath, id);
        batch.update(laRef, newValue);
      })
      await batch.commit()
    }
  }

  function setUser(username?: string, image?: string, deleted?: boolean) {
    const instance = useFirestore().init()
    const firestoreUser = userData.get()[instance.app.name]
    const user = UserClass.state().get()

    if (!user) return
    if (!firestoreUser) return
    useFirestore().addDocument(instance.db, [...pathUsers, firestoreUser?.uid], {
      uid: firestoreUser?.uid,
      user_id: user?.id,
      username: LibUtils.ucwords(username || user?.name),
      image: image || user?.image,
      deleted: deleted ? "1" : "0"
    }, () => {

    }, (er) => esp.log("ERROR [SETUSER] : ", er))

  }
  function getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    const user = UserClass.state().get()

    if (!user) return
    let chattochecks: string[] = [];
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      if (!opposite_id) return
      if (!group_id) return
      chattochecks.push(id + '+' + opposite_id)
      useFirestore().getCollectionWhere(db, [...pathHistory], [["user_id", "==", user?.id], ["chat_to", "==", opposite_id], ["group_id", "==", group_id]], (dt) => {
        if (dt) {
          let s: any[] = dt
          if (s.length > 0) {
            callback(s[0]?.data?.chat_id)
          } else {
            callback("")
          }
        } else {
          callback("")
        }
      })
    }
    /* check my node */
    check(user?.id, chat_to, chat_id => {
      if (chat_id) {
        callback(chat_id)
      } else {
        /* check opposite node */
        check(chat_to, user?.id, chat_id => {
          callback(chat_id)
        })
      }
    })
  }


  return {
    pathChat: pathChat,
    pathUsers: pathUsers,
    pathHistory: pathHistory,
    chatSendNew: chatSendNew,
    chatSend: chatSend,
    chatAll: chatAll,
    chatGet: chatGet,
    chatDelete: chatDelete,
    chatGetAll: chatGetAll,
    chatListenChange: chatListenChange,
    chatUpdate: chatUpdate,
    listenUser: listenUser,
    setUser: setUser,
    getChatId: getChatId,
    makeId: makeid
  }

}