// useLibs
// noPage

import { collection, doc, FirebaseFirestoreTypes, getDocs, getFirestore, limit, query, serverTimestamp, where, writeBatch } from "@react-native-firebase/firestore"
import { LibUtils } from "esoftplay/cache/lib/utils/import"
import { UserClass } from "esoftplay/cache/user/class/import"
import { UserData } from "esoftplay/cache/user/data/import"
import esp from "esoftplay/esp"
import FastStorage from "esoftplay/mmkv"
import { Alert } from "react-native"


export interface ChattingLibReturn {
  chatSendNew: (chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void) => void,
  chatSend: (chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void) => void,
  chatAll: (chat_id: string, callback: (messages: any[]) => void, lastIndex?: string) => void,
  chatGet: (chat_id: string, key: string, callback: (chat: any) => void) => void,
  chatDelete: (chat_id: string, key: string) => void,
  historyDelete: (chat_id: string, deleted_user_id: string, callback?: () => void) => void,
  chatGetAll: (chat_id: string, callback: (allmsg: any, end?: boolean) => void, page?: number, limit?: number) => void,
  // chatListenChange: (chat_id: string, callback: (removedChild: any) => void) => void,
  chatUpdate: (key: string, chat_id: string, value: any) => void,
  listenUser: (user_id: string, callback: (user: any) => void) => void,
  setUser: (username?: string, image?: string, deleted?: boolean, forceUpdate?: boolean) => void,
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
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    if (user?.id == chat_to) {
      Alert.alert(esp.lang("chatting/lib", "alert_title"), esp.lang("chatting/lib", "alert_msg"))
      return
    }
    const chat_id = (new Date().getTime() / 1000).toFixed(0) + "-" + makeid(4)
    const time = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: time,
      timestamp: serverTimestamp(),
      user_id: user?.id,
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

    /* me */
    esp.mod("firestore/index")().addCollection(app, [...pathChat, chat_id, 'member'], memberMe, () => { }, console.warn)
    /* notMe */
    esp.mod("firestore/index")().addCollection(app, [...pathChat, chat_id, 'member'], memberNotMe, () => { }, console.warn)

    esp.mod("firestore/index")().addCollection(app, [...pathChat, chat_id, 'conversation'], msg, (data) => {
      msg['key'] = data?.id
      if (callback) callback(msg, chat_id)
      if (withHistory) historyNew(chat_id, chat_to, message)
    }, console.warn)

  }
  function historyNew(chat_id: string, chat_to: string, last_message: string, createHistory: "me" | "not-me" | "all" = "all"): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let me = {
      chat_id: chat_id,
      time: _time,
      chat_to: chat_to,
      last_message,
      read: "0",
      sender_id: user?.id,
      group_id,
      user_id: user?.id
    }
    let notMe = {
      chat_id: chat_id,
      time: _time,
      chat_to: user?.id,
      last_message,
      read: "0",
      sender_id: user?.id,
      group_id,
      user_id: chat_to
    }

    let historyMe: any = {}
    const historyNotMe = {
      chat_to_username: user?.name,
      chat_to_image: user?.image
    }

    esp.mod("firestore/index")().getCollectionWhere(app, [...pathUsers], [["user_id", "==", chat_to]], (arr) => {
      if (arr.length > 0) {
        historyMe["chat_to_username"] = arr?.[0]?.data?.username
        historyMe["chat_to_image"] = arr?.[0]?.data?.image
      }

      switch (createHistory) {
        case "all":
          esp.mod("firestore/index")().addCollection(app, [...pathHistory], { ...me, ...historyMe }, () => { });
          esp.mod("firestore/index")().addCollection(app, [...pathHistory], { ...notMe, ...historyNotMe }, () => { });
          break;
        case "me":
          esp.mod("firestore/index")().addCollection(app, [...pathHistory], { ...me, ...historyMe }, () => { });
          break;
        case "not-me":
          esp.mod("firestore/index")().addCollection(app, [...pathHistory], { ...notMe, ...historyNotMe }, () => { });
          break;
      }

    })

  }
  function chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return

    const _time = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: _time,
      timestamp: serverTimestamp(),
      user_id: user?.id,
    }
    if (attach) {
      msg['attach'] = attach
    }

    /* simpan pesan */
    esp.mod("firestore/index")().addCollection(app, [...pathChat, chat_id, 'conversation'], msg, (data) => {
      msg['key'] = data?.id
      if (callback) {
        callback(msg)
      }

      if (!chat_id) return
      esp.mod("firestore/index")().getCollectionWhere(app, [...pathHistory], [['chat_id', '==', chat_id]], (datas) => {
        if (datas.length > 0) {
          //data isinya {data} id
          const keys = datas.map((x: any) => x.id)
          const firstData = { ...datas[0].data, id: datas[0].data.id }

          esp.mod("firestore/index")().updateBatchDocument(app, [...pathHistory], keys,
            [
              { key: "time", value: _time },
              { key: "last_message", value: message },
              { key: "read", value: "0" },
              { key: "sender_id", value: user?.id },
            ]
          )

          if (datas?.length == 1) {
            const isMe = firstData?.user_id == UserClass?.state?.()?.get?.()?.id
            if (isMe) historyNew(chat_id, chat_to, message, "not-me")
            else historyNew(chat_id, chat_to, message, "me")
          }

        } else {
          historyNew(chat_id, chat_to, message)
        }
      }, console.warn)

    }, console.warn)
  }

  function chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    esp.mod("firestore/index")().getCollectionWhereOrderBy(app, [...pathChat, chat_id, 'conversation'], [], [], (arr) => {
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
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    esp.mod("firestore/index")().getDocument(app, [...pathChat, chat_id, 'conversation', key], (dt) => {
      if (dt) {
        callback({ key: dt.id, ...dt.data });
      } else {
        callback(null)
      }
    })
  }
  function chatDelete(chat_id: string, key: string): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()
    const persistKey = 'chatting_chat_message02' + chat_id

    if (!user) return
    esp.mod("firestore/index")().deleteDocument(app, [...pathChat, chat_id, 'conversation', key], () => {
      const storedValue: any = FastStorage.getItemSync(persistKey);
      const data = JSON.parse(storedValue)
      const index = data.findIndex((x: any) => x?.key == key)
      if (index > -1) {
        const newData = esp.mod("lib/object").splice(data, index, 1)()
        FastStorage.setItem(persistKey, JSON.stringify(newData));
      }
    })
  }
  function historyDelete(chat_id: string, deleted_user_id: string, callback?: () => void) {
    const user = UserClass?.state?.()?.get?.()
    const firestore = esp.mod("firestore/index")()
    const app: any = firestore.instance()

    if (!user) return
    firestore.getCollectionIds(app, [...pathHistory], [["chat_id", "==", chat_id], ["user_id", "==", deleted_user_id]], [], (ids) => {
      if (ids.length > 0) {
        const path = [...pathChat, chat_id, "conversation"]
        //deleting collection history
        esp.mod("firestore/index")().deleteDocument(app, [...pathHistory, ids[0]], () => {
          //deleting cache
          deleteCacheData(ids[0])
          // delete cache chat history
          const persistKey = 'chatting_chat_message02' + chat_id
          FastStorage.removeItem(persistKey)

          firestore.getCollectionLimit(app, path, [], [["time", "desc"]], 1, (data: any) => {
            if (data?.length > 0) {
              const id = data?.[0]?.id
              const lastBlocked: any[] = data?.[0]?.data?.hidden_history_user_ids
              let values: any = []
              if (lastBlocked) {
                if (lastBlocked.includes(deleted_user_id)) {
                  values = lastBlocked?.filter?.(x => x != deleted_user_id)
                } else {
                  values = lastBlocked
                }
              }
              const updatedValue = [...values, deleted_user_id]
              firestore.updateDocument(app, [...path, id], [{
                //@ts-ignore
                key: "hidden_history_user_ids", value: updatedValue
              }], () => {
              })
            }
          })
        })
      }
    })
  }

  const deleteCacheData = (deletedKey: string) => {
    const oldHistory = esp.modProp("chatting/history").state().get()
    const updatedHistory = oldHistory.filter((x: any) => x.id != deletedKey)
    esp.modProp("chatting/history").state().set(updatedHistory)
  }

  function chatGetAll(chat_id: string, callback: (allmsg: any, end?: boolean) => void, isStartPage?: number, limit?: number): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    esp.mod("firestore/index")().paginate(app, isStartPage == 1 ? true : false, [...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], limit || perPage, (dt, endR) => {
      if (dt) {
        callback(dt, endR);
      } else {
        callback(null)
      }
    })
  }
  // function chatListenChange(chat_id: string, callback: (removedChild: any) => void) {
  //   const user = UserClass?.state?.()?.get?.()
  //   const app: any = esp.mod("firestore/index")().instance()

  //   if (!user) return
  //   esp.mod("firestore/index")().listenCollection(app, [...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], (dt) => {
  //     callback(dt);
  //   })
  // }
  function chatUpdate(key: string, chat_id: string, values: { key: string, value: any }[]): void {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()
    if (!key) return
    if (!user) return
    esp.mod("firestore/index")().updateDocument(app, [...pathChat, chat_id, 'conversation', key], values, () => { })
  }
  function listenUser(user_id: string, callback: (user: any) => void) {
    const user = UserClass?.state?.()?.get?.()
    const app: any = esp.mod("firestore/index")().instance()

    if (!user) return
    esp.mod("firestore/index")().listenDocument(app, [...pathUsers, user_id], (dt) => {
      if (dt) {
        callback(dt)
      } else {
        callback(null)
      }
    })
  }

  async function updateBatch(db: any, key: any[], rootPath: string[], data: any[]) {
    if (key.length > 0) {
      const batch = writeBatch(db);
      const value = data.map((x) => {
        return { [x.key]: x.value }
      })
      const newValue = Object.assign({}, ...value)

      key.forEach((id) => {
        const laRef = doc(db, ...rootPath, id);
        //@ts-ignore
        batch.update(laRef, newValue);
      })
      await batch.commit()
    }
  }

  function setUser(username?: string, image?: string, deleted?: boolean, forceUpdate?: boolean): void {
    const app: any = esp.mod("firestore/index")().instance()
    const firestoreUser = esp.mod("firestore/index")().getUserData(app.name)
    const user = UserClass.state().get()

    if (!user) return
    if (!firestoreUser?.uid) return

    const now = Date.now()
    const lastUpdateKey = `last_user_update_${user?.id}`
    const lastUpdateTime = parseInt(FastStorage.getItemSync(lastUpdateKey) || '0')
    UserData.register(lastUpdateKey)

    if (!forceUpdate && now - lastUpdateTime < 3600000) {
      return
    }
    FastStorage.setItem(lastUpdateKey, String(now))

    esp.mod("firestore/index")().getCollectionIds(app, [...pathUsers], [["user_id", "==", String(user?.id)]], [], (arr) => {
      if (arr.length > 0) {
        esp.mod("firestore/index")().deleteBatchDocument(app, [...pathUsers], arr, (re) => {
          addUser()
        })
      } else {
        addUser()
      }
    })

    function addUser() {
      esp.mod("firestore/index")().addDocument(app, [...pathUsers, firestoreUser?.uid], {
        uid: firestoreUser?.uid,
        user_id: user?.id || '0',
        username: LibUtils.ucwords(username || user?.name),
        image: image || user?.image,
        deleted: deleted ? "1" : "0"
      }, () => {
        updateHistoryUser()
      })
    }

    function updateHistoryUser() {
      esp.mod("firestore/index")().getCollectionIds(app, [...pathHistory], [["chat_to", "==", String(user?.id)]], [], (ids) => {
        if (ids.length > 0) {
          esp.mod("firestore/index")().updateBatchDocument(app, [...pathHistory], ids,
            [
              { key: "chat_to_username", value: LibUtils.ucwords(username || user?.name) },
              { key: "chat_to_image", value: image || user?.image }
            ]
          )
        }
      })
    }

  }
  function getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    let chattochecks: string[] = [];
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      if (!opposite_id) return
      if (!group_id) return
      chattochecks.push(id + '+' + opposite_id)
      const fixedPath = esp.mod("firestore/index")().castPathToString([...pathHistory])
      if (fixedPath.split("/").length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc [Firestore.get.collection]")
        return
      }

      const db = getFirestore()
      let queryRef: FirebaseFirestoreTypes.Query = collection(db, fixedPath)
      queryRef = query(queryRef, where("user_id", "==", user?.id), where("chat_to", "==", opposite_id), where("group_id", "==", group_id), limit(1));

      let chat_id: string = ""
      getDocs(queryRef).then((snap) => {
        if (snap.docs.length > 0) {
          chat_id = snap.docs?.[0]?.data?.()?.chat_id || ""
        }
        callback(chat_id)
      }).catch(() => {
        callback(chat_id)
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
    historyDelete: historyDelete,
    chatGetAll: chatGetAll,
    // chatListenChange: chatListenChange,
    chatUpdate: chatUpdate,
    listenUser: listenUser,
    setUser: setUser,
    getChatId: getChatId,
    makeId: makeid
  }

}