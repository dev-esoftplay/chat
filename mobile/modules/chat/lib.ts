import React from 'react'
import { LibUtils, esp, ChatFirebase } from 'esoftplay';
import { Alert } from 'react-native';


export default class m {
  user: any = undefined
  group_id: string = "0"
  db: ChatFirebase

  constructor() {
    this.user = LibUtils.getReduxState("user_class")
    const chat_prefix = esp.config('chat', 'prefix')
    this.db = new ChatFirebase(chat_prefix + 'chat')
    this.group_id = esp.config('group_id') || '0'
    this.historyGet = this.historyGet.bind(this);
    this.historyNew = this.historyNew.bind(this);
    this.chatAll = this.chatAll.bind(this);
    this.chatListenAdd = this.chatListenAdd.bind(this);
    this.chatListenChange = this.chatListenChange.bind(this);
    this.chatListenOnline = this.chatListenOnline.bind(this);
    this.chatCheckOpen = this.chatCheckOpen.bind(this);
    this.chatSend = this.chatSend.bind(this);
    this.chatSendNew = this.chatSendNew.bind(this);
    this.chatSetOnline = this.chatSetOnline.bind(this);
    this.chatSetOpen = this.chatSetOpen.bind(this);
    this.chatUpdate = this.chatUpdate.bind(this);
    this.getChatId = this.getChatId.bind(this);
    this.getRef = this.getRef.bind(this);
  }

  getRef(): firebase.database.Reference {
    return this.db.getMainRef()
  }

  historyNew(chat_id: string, chat_to: string): void {
    if (!this.user) return
    let me = {
      chat_id: chat_id,
      user_id: chat_to
    }
    let notMe = {
      chat_id: chat_id,
      user_id: this.user.id
    }
    this.db.push(["history", this.user.id, this.group_id], me)
    this.db.push(["history", chat_to, this.group_id], notMe)
  }

  historyGet(callback: (data: any) => void): void {
    if (!this.user) return
    let counterStart = 0
    let counterEnd = 0
    this.db.getAll(["history", this.user.id, this.group_id], snapshoot => {
      if (!snapshoot) {
        callback(undefined)
        return
      }
      let histories: any = []
      Object.keys(snapshoot).forEach((key) => {
        counterStart++
        let item = snapshoot[key]
        this.getRef().child('chat').child(item.chat_id).child('conversation').limitToLast(1).once('value', s => {
          const opposite_id = item.user_id
          if (s && s.val()) {
            const snapshoot: any = Object.values(s.val())[0]
            item['user_id'] = snapshoot.user_id
            item['chat_to'] = opposite_id
            item['msg'] = snapshoot.msg
            item['time'] = snapshoot.time
            item['read'] = snapshoot.read
            this.db.getAll(["users", opposite_id], snapshoot => {
              if (snapshoot) {
                histories.push({ ...item, ...snapshoot })
              }
              counterEnd++
              if (counterEnd == counterStart) {
                function compare(a: any, b: any) {
                  if (a.time < b.time) return 1
                  if (a.time > b.time) return -1
                  return 0;
                }
                callback(histories.sort(compare))
              }
            })
          }
        })
      })
    })
  }

  chatSendNew(chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void): void {
    if (!this.user) return
    if (this.user.id == chat_to) {
      Alert.alert('Oops..!', 'Mohon Maaf, anda tidak dapat mengirim pesan dengan akun anda sendiri')
      return
    }
    const chat_id = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: chat_id,
      user_id: this.user.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }
    let messageRef = this.getRef().child('chat').child(chat_id)
    const push = messageRef.child("conversation").push()
    msg.key = push.key
    push.set(msg)
    /* me */
    messageRef.child('member').child(this.user.id).set(member)
    /* notMe */
    messageRef.child('member').child(chat_to).set(member)
    if (callback) callback(msg, chat_id)
    if (withHistory) this.historyNew(chat_id, chat_to)
  }

  chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {
    if (!this.user) return
    let msg: any = {
      msg: message,
      read: '0',
      time: (new Date().getTime() / 1000).toFixed(0),
      user_id: this.user.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }
    let messageRef = this.getRef().child('chat').child(chat_id)
    /* simpan pesan */
    const push = messageRef.child("conversation").push()
    msg.key = push.key
    push.set(msg)
    /* set members */
    messageRef.child('member').child(this.user.id).set(member)
    messageRef.child('member').child(String(chat_to)).set(member)
    if (callback) {
      callback(msg)
    }
  }

  chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    if (!this.user) return
    let msgRef = this.getRef().child('chat').child(chat_id).child("conversation").orderByKey()
    if (lastIndex) {
      msgRef = msgRef.endAt(lastIndex)
    }
    msgRef = msgRef.limitToLast(100)
    msgRef.once('value', sn => {
      const snapshoot = sn.val()
      let a: any[] = []
      if (snapshoot) {
        Object.keys(snapshoot).map(key => {
          let item = snapshoot[key];
          a.push(item);
          if (item.user_id != this.user.id && item.read == 0) {
            this.db.set(['chat', 'conversation', key, 'read'], 1)
          }
        });
        if (lastIndex) {
          a.splice(a.length - 1, 1)
        }
        callback([...a].reverse())
      } else {
        callback(a)
      }
    })
  }

  chatListenAdd(chat_id: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    return this.db.listenChildAdd(["chat", chat_id, "conversation"], callback)
  }

  chatListenChange(chat_id: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    return this.db.listenChildChanged(["chat", chat_id, "conversation"], callback)
  }

  chatUpdate(key: string, chat_id: string, value: any): void {
    if (!key) return
    if (!this.user) return
    this.db.set(["chat", chat_id, "conversation", key], value)
  }

  chatSetOpen(chat_id: string): void {
    if (!this.user) return
    const timeStamp = (new Date().getTime() / 1000).toFixed(0)
    this.db.set(["chat", chat_id, "member", this.user.id, "is_open"], timeStamp)
  }

  chatCheckOpen(chat_id: string, chat_to: string, callback: (is_open: 0 | 1) => void): void {
    esp.log(chat_id, chat_to);
    if (!this.user) return
    this.db.getAll(["chat", chat_id, "member", chat_to, "is_open"], snapshoot => {
      if (snapshoot) {
        const timeStamp = (new Date().getTime() / 1000).toFixed(0)
        const lastOpen = snapshoot
        callback(Number(timeStamp) - Number(lastOpen) < 6 ? 1 : 0)
      } else {
        callback(0)
      }
    })
  }

  chatSetOnline(): void {
    if (!this.user) return
    const timeStamp = (new Date().getTime() / 1000).toFixed(0)
    this.db.set(["users", this.user.id, "online"], Number(timeStamp))
  }

  chatListenOnline(chat_to: string, callback: (user: any) => void): () => void {
    if (!this.user) return () => { }
    return this.db.listenAll(["users", chat_to], snapshoot => {
      if (snapshoot) {
        const timeStamp = (new Date().getTime() / 1000).toFixed(0)
        if (Number(timeStamp) - snapshoot.online < 6) {
          snapshoot.online = 1
        }
        callback(snapshoot)
      }
    })
  }

  setUser(username?: string, image?: string): void {
    if (!this.user) return
    this.db.set(["users", this.user.id, "username"], LibUtils.ucwords(username || this.user.name))
    this.db.set(["users", this.user.id, "image"], image || this.user.image)
  }

  getChatId(chat_to: string, callback: (chat_id: string) => void): void {
    if (!this.user) return
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      this.db.getAll(["history", id, this.group_id], snapshoot => {
        if (snapshoot) {
          let s: any[] = Object.values(snapshoot).filter((s: any) => s.user_id == opposite_id)
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
    check(this.user.id, chat_to, chat_id => {
      if (chat_id) {
        callback(chat_id)
      } else {
        /* check opposite node */
        check(chat_to, this.user.id, chat_id => {
          callback(chat_id)
        })
      }
    })
  }
}