// noPage

import { esp } from "esoftplay"
import { LibUtils } from "esoftplay/cache/lib/utils/import"
import { UserClass } from "esoftplay/cache/user/class/import"
import { Alert } from "react-native"
import Firestore, { DataId } from "./firestore"

// const user = { id: '1', name: 'mukhlis', image: 'https://api.bbo.co.id/images/modules/user/avatar/1372010478.jpg' }
// const group_id = "4"
const user = UserClass?.state?.()?.get()
const group_id = esp.config('group_id') || '4'

const pathChat = ['bbo', 'chat', 'chat']
const pathHistory = ['bbo', 'chat', 'history']
const pathUsers = ['bbo', 'chat', 'users']

const ChattingLib = {
  chatSendNew(chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void): void {
    if (!user) return
    if (user?.id == chat_to) {
      Alert.alert('Oops..!', 'Mohon Maaf, anda tidak dapat mengirim pesan dengan akun anda sendiri')
      return
    }
    const chat_id = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: chat_id,
      user_id: user?.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }

    Firestore.add.collection([...pathChat, chat_id, 'conversation'], msg, () => { })
    /* me */
    Firestore.add.doc([...pathChat, chat_id, 'member', user?.id], member, () => { })
    /* notMe */
    Firestore.add.doc([...pathChat, chat_id, 'member', chat_to], member, () => { })

    if (callback) callback(msg, chat_id)
    if (withHistory) ChattingLib.historyNew(chat_id, chat_to)
  },
  historyNew(chat_id: string, chat_to: string): void {
    if (!user) return
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let me = {
      chat_id: chat_id,
      time: _time,
      user_id: chat_to
    }
    let notMe = {
      chat_id: chat_id,
      time: _time,
      user_id: user?.id
    }
    Firestore.add.collection([...pathHistory, user?.id, group_id], me, () => { })
    Firestore.add.collection([...pathHistory, chat_to, group_id], notMe, () => { })
  },
  chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {
    if (!user) return
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: _time,
      user_id: user?.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }
    /* simpan pesan */
    Firestore.add.collection([...pathChat, chat_id, 'conversation'], msg, () => { })

    /* set members */
    Firestore.add.doc([...pathChat, chat_id, 'member', user?.id], member, () => { })
    Firestore.add.doc([...pathChat, chat_id, 'member', chat_to], member, () => { })

    Firestore.get.collectionWhere([...pathHistory, user.id, group_id], [['chat_id', '==', chat_id]], (data) => {
      const currentHistory = data
      const currentKeyHistory = currentHistory[0].id
      Firestore.update.doc([...pathHistory, user.id, group_id, currentKeyHistory], "time", _time, () => { })
      Firestore.get.collection([...pathHistory, chat_to, group_id], (dt) => {
        if (dt) {
          for (let key in dt) {
            if (dt[key].data.chat_id == chat_id) {
              Firestore.update.doc([...pathHistory, chat_to, group_id, key], "time", _time, () => { })
              break;
            }
          }
        }
      })
    })

    if (callback) {
      callback(msg)
    }
  },
  chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
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
  },
  chatGet(chat_id: string, key: string, callback: (chat: any) => void): void {
    if (user) return
    Firestore.get.doc([...pathChat, chat_id, 'conversation', key], [], (dt: DataId) => {
      if (dt) {
        callback({ ...dt, key: dt.id });
      } else {
        callback(null)
      }
    })
  },
  chatDelete(chat_id: string, key: string): void {
    if (!user) return
    Firestore.delete.doc([...pathChat, chat_id, 'conversation', key], () => { })
  },
  chatGetAll(chat_id: string, lastKey: string, callback: (allmsg: any) => void): void {
  },
  chatListenRemove(chat_id: string, callback: (removedChild: any) => void) {
    if (!user) return
    Firestore.listen.collection([...pathChat, chat_id, 'conversation'], (dt) => {
      callback({ ...dt, key: dt.id });
    })
  },
  chatListenAdd(chat_id: string, lastKey: string, callback: (message_item: any) => void) {
    ChattingLib.chatListenRemove(chat_id, callback)
  },
  chatListenChange(chat_id: string, callback: (message_item: any) => void) {
    ChattingLib.chatListenRemove(chat_id, callback)
  },
  chatUpdate(key: string, chat_id: string, value: any): void {
    if (!key) return
    if (!user) return
    Firestore.add.doc([...pathChat, chat_id, 'conversation', key], value, () => { })
  },
  listenUser(user_id: string, callback: (user: any) => void) {
    if (!user) return
    Firestore.listen.doc([...pathUsers, user_id], (dt) => {
      if (dt) {
        callback(dt)
      } else {
        callback(null)
      }
    })
  },
  setUser(username?: string, image?: string, deleted?: boolean): void {
    if (!user) return
    Firestore.add.collection([...pathUsers, user.id], {
      username: LibUtils.ucwords(username || user.name),
      image: image || user.image,
      deleted: deleted ? '1' : '0'
    }, (dt) => { })
  },
  getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    if (!user) return
    let chattochecks: string[] = [];
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      chattochecks.push(id + '+' + opposite_id)
      Firestore.get.collection([...pathHistory, id, group_id || group_id], (dt) => {
        if (dt) {
          let s: any[] = dt.filter((s: any) => s.data.user_id == opposite_id)
          if (s.length > 0) {
            callback(s[0].chat_id)
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
}

export default ChattingLib