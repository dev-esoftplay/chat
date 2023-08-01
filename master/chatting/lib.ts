// useLibs
// noPage

import { esp } from "esoftplay"
import Firestore, { DataId, updateValue } from "esoftplay-firestore"
import { LibUtils } from "esoftplay/cache/lib/utils/import"
import { UserClass } from "esoftplay/cache/user/class/import"
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
    Firestore.add.collection([...pathChat, chat_id, 'member'], memberMe, () => { })
    /* notMe */
    Firestore.add.collection([...pathChat, chat_id, 'member'], memberNotMe, () => { })

    Firestore.add.collection([...pathChat, chat_id, 'conversation'], msg, (dt) => {
      msg['key'] = dt?.id
      if (callback) callback(msg, chat_id)
      if (withHistory) historyNew(chat_id, chat_to, message)
    })

  }
  function historyNew(chat_id: string, chat_to: string, last_message: string): void {
    const user = UserClass?.state?.()?.get?.()

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

    Firestore.get.collectionWhere([...pathUsers], [["user_id", "==", chat_to]], (arr) => {
      if (arr.length > 0) {
        historyMe["chat_to_username"] = arr?.[0]?.data?.username
        historyMe["chat_to_image"] = arr?.[0]?.data?.image
      }
      Firestore.add.collection([...pathHistory], { ...me, ...historyMe }, () => { })
      Firestore.add.collection([...pathHistory], { ...notMe, ...historyNotMe }, () => { })
    })

  }
  function chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {

    const user = UserClass?.state?.()?.get?.()

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
    Firestore.add.collection([...pathChat, chat_id, 'conversation'], msg, (dt) => {
      msg['key'] = dt?.id
      if (callback) {
        callback(msg)
      }
    })

    /* set members */
    Firestore.get.collectionIds([...pathChat, chat_id, 'member'], [["user_id", '==', user?.id]], (arr) => {
      Firestore.add.doc([...pathChat, chat_id, 'member', arr[0]], member, () => { })
    })

    if (!chat_to) return
    Firestore.get.collectionIds([...pathChat, chat_id, 'member'], [["user_id", '==', chat_to]], (arr) => {
      Firestore.add.doc([...pathChat, chat_id, 'member', arr[0]], notMe, () => { })
    })

    if (!chat_id) return
    Firestore.get.collectionIds([...pathHistory], [['chat_id', '==', chat_id]], (keys) => {
      updateBatch(keys, pathHistory, [
        { key: "time", value: _time },
        { key: "last_message", value: message },
        { key: "read", value: "0" },
        { key: "sender_id", value: user?.id },
      ])
    })
  }

  function chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    Firestore.get.collectionWhereOrderBy([...pathChat, chat_id, 'conversation'], [], [], (arr) => {
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

    if (!user) return
    Firestore.get.doc([...pathChat, chat_id, 'conversation', key], [], (dt: DataId) => {
      if (dt) {
        callback({ key: dt.id, ...dt.data });
      } else {
        callback(null)
      }
    })
  }
  function chatDelete(chat_id: string, key: string): void {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    Firestore.delete.doc([...pathChat, chat_id, 'conversation', key], () => { })
  }
  function chatGetAll(chat_id: string, callback: (allmsg: any, end?: boolean) => void, isStartPage?: number, limit?: number): void {
    const user = UserClass?.state?.()?.get?.()
    if (!user) return
    Firestore.paginate(isStartPage == 1 ? true : false, [...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], limit || perPage, (dt, endR) => {
      if (dt) {
        callback(dt, endR);
      } else {
        callback(null)
      }
    })
  }
  function chatListenChange(chat_id: string, callback: (removedChild: any) => void) {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    Firestore.listen.collection([...pathChat, chat_id, 'conversation'], [], [["time", "desc"]], (dt) => {
      callback(dt);
    })
  }
  function chatUpdate(key: string, chat_id: string, value: updateValue[]): void {
    const user = UserClass?.state?.()?.get?.()
    if (!key) return
    if (!user) return
    Firestore.update.doc([...pathChat, chat_id, 'conversation', key], value, () => { })
  }
  function listenUser(user_id: string, callback: (user: any) => void) {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    Firestore.listen.doc([...pathUsers, user_id], (dt) => {
      if (dt) {
        callback(dt)
      } else {
        callback(null)
      }
    })
  }

  async function deleteDuplicatedUser(key: any[]) {
    const batch = writeBatch(Firestore.db());
    key.forEach((id, index) => {
      if (index !== 0) {
        const laRef = doc(Firestore.db(), ...pathUsers, id);
        batch.delete(laRef);
      }
    })
    await batch.commit();
  }

  async function updateBatch(key: any[], rootPath: string[], data: any[]) {
    if (key.length > 0) {
      const batch = writeBatch(Firestore.db());
      const value = data.map((x) => {
        return { [x.key]: x.value }
      })
      const newValue = Object.assign({}, ...value)

      key.forEach((id) => {
        const laRef = doc(Firestore.db(), ...rootPath, id);
        batch.update(laRef, newValue);
      })
      await batch.commit()
    }
  }

  function setUser(username?: string, image?: string, deleted?: boolean): void {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    Firestore.get.collectionWhere([...pathUsers], [["user_id", "==", user?.id]], (data) => {
      if (data?.length > 0) {
        // update username & image user
        Firestore.update.doc([...pathUsers, data?.[0]?.id], [
          { key: "username", value: LibUtils.ucwords(username || user?.name) },
          { key: "image", value: image || user?.image },
        ], () => {
          if (data?.length > 1) {
            const keys = data.map((t) => t.id)
            deleteDuplicatedUser(keys)
          }
        })

        if (data?.[0]?.data?.username != user?.name || data?.[0]?.data?.image != user?.image) {
          //update username & image history
          Firestore.get.collectionIds([...pathHistory], [["chat_to", "==", user?.id]], (keys) => {
            updateBatch(keys, pathHistory, [
              { key: "chat_to_username", value: LibUtils.ucwords(username || user?.name) },
              { key: "chat_to_image", value: image || user?.image },
            ])
          })
        }
      } else {
        //insert to user
        Firestore.add.collection([...pathUsers], {
          user_id: user?.id,
          username: LibUtils.ucwords(username || user?.name),
          image: image || user?.image,
          deleted: deleted ? '1' : '0'
        }, () => { })
      }
    })
  }
  function getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    const user = UserClass?.state?.()?.get?.()

    if (!user) return
    let chattochecks: string[] = [];
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      if (!opposite_id) return
      if (!group_id) return
      chattochecks.push(id + '+' + opposite_id)
      Firestore.get.collectionWhere([...pathHistory], [["user_id", "==", user?.id], ["chat_to", "==", opposite_id], ["group_id", "==", group_id]], (dt) => {
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