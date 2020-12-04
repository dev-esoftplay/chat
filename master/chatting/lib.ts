import React from 'react'
import { LibUtils, esp, ChattingFirebase } from 'esoftplay';
import { Alert } from 'react-native';


export default class m {
  user: any = undefined
  group_id: string = "0"
  db: ChattingFirebase
  perPage: number = 10

  constructor() {
    this.user = LibUtils.getReduxState("user_class")
    this.db = new ChattingFirebase(esp.config('chat_prefix') + 'chat')
    this.group_id = esp.config('group_id') || '4'
    this.historyNew = this.historyNew.bind(this);
    // this.chatAll = this.chatAll.bind(this);
    this.chatListenAdd = this.chatListenAdd.bind(this);
    this.chatListenChange = this.chatListenChange.bind(this);
    this.chatSend = this.chatSend.bind(this);
    this.chatSendNew = this.chatSendNew.bind(this);
    this.chatUpdate = this.chatUpdate.bind(this);
    this.getChatId = this.getChatId.bind(this);
    this.ref = this.ref.bind(this);
  }

  ref(): firebase.database.Reference {
    return this.db.getMainRef()
  }

  historyNew(chat_id: string, chat_to: string): void {
    if (!this.user) return
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let me = {
      chat_id: chat_id,
      time: _time,
      user_id: chat_to
    }
    let notMe = {
      chat_id: chat_id,
      time: _time,
      user_id: this.user?.id
    }
    this.ref().child('history').child(this.user?.id).child(this.group_id).push(me)
    this.ref().child('history').child(chat_to).child(this.group_id).push(notMe)
  }

  chatSendNew(chat_to: string, message: string, attach: any, withHistory?: boolean, callback?: (message: any, chat_id: string) => void): void {
    if (!this.user) return
    if (this.user?.id == chat_to) {
      Alert.alert('Oops..!', 'Mohon Maaf, anda tidak dapat mengirim pesan dengan akun anda sendiri')
      return
    }
    const chat_id = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: chat_id,
      user_id: this.user?.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }
    let messageRef = this.ref().child('chat').child(chat_id)
    const push = messageRef.child("conversation").push()
    msg.key = push.key
    push.set(msg)
    /* me */
    messageRef.child('member').child(this.user?.id).set(member)
    /* notMe */
    messageRef.child('member').child(chat_to).set(member)
    if (callback) callback(msg, chat_id)
    if (withHistory) this.historyNew(chat_id, chat_to)
  }

  chatSend(chat_id: string, chat_to: string, message: string, attach: any, callback: (message: any) => void): void {
    if (!this.user) return
    const _time = (new Date().getTime() / 1000).toFixed(0)
    let msg: any = {
      msg: message,
      read: '0',
      time: _time,
      user_id: this.user?.id,
    }
    if (attach) {
      msg['attach'] = attach
    }
    /* buat chat member default */
    let member = {
      is_typing: false,
      draf: ''
    }
    let messageRef = this.ref().child('chat').child(chat_id)
    /* simpan pesan */
    const push = messageRef.child("conversation").push()
    msg.key = push.key
    push.set(msg)
    /* set members */
    messageRef.child('member').child(this.user?.id).set(member)
    messageRef.child('member').child(String(chat_to)).set(member)
    const historyUserUpdate = this.ref().child('history').child(this.user?.id).child(this.group_id)
    historyUserUpdate.orderByChild("chat_id").equalTo(chat_id).once('value', snapshoot => {
      try {
        historyUserUpdate.child(String(Object.keys(snapshoot.val())[0])).child('time').set(_time)
      } catch (error) {

      }
    })
    const historyOppositeUpdate = this.ref().child('history').child(chat_to).child(this.group_id)
    historyOppositeUpdate.orderByChild("chat_id").equalTo(chat_id).once('value', snapshoot => {
      try {
        historyOppositeUpdate.child(String(Object.keys(snapshoot.val())[0])).child('time').set(_time)
      } catch (error) {

      }
    })
    if (callback) {
      callback(msg)
    }
  }

  chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    if (!this.user) return
    let msgRef = this.ref().child('chat').child(chat_id).child("conversation").orderByKey()
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
          if (item.user_id != this.user?.id && item.read == 0) {
            this.ref().child('chat').child('conversation').child(key).child('read').set(1)
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

  chatGetAll(chat_id: string, lastKey: string, callback: (allmsg: any) => void): void {
    if (!this.user) return
    let chatRef = this.ref().child('chat').child(chat_id).child('conversation')
    if (lastKey) {
      chatRef.orderByKey().endAt(lastKey).limitToLast(this.perPage).once('value', snapshoot => {
        callback(snapshoot.val())
      })
    } else {
      chatRef.orderByKey().limitToLast(this.perPage).once('value', snapshoot => {
        callback(snapshoot.val())
      })
    }
  }

  chatListenAdd(chat_id: string, lastKey: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    const chatAddRef = this.ref().child('chat').child(chat_id).child('conversation')
    chatAddRef.orderByKey().startAt(lastKey).on('child_added', snapshot => {
      callback(snapshot.val())
    })
    return () => chatAddRef.off('child_added')
  }

  chatListenChange(chat_id: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    const chatAddRef = this.ref().child('chat').child(chat_id).child('conversation')
    chatAddRef.on('child_changed', (val) => {
      callback(val.val())
    })
    return () => chatAddRef.off('child_changed')
  }

  chatUpdate(key: string, chat_id: string, value: any): void {
    if (!key) return
    if (!this.user) return
    this.ref().child('chat').child(chat_id).child('conversation').child(key).set(value)
  }

  listenUser(user_id: string, callback: (user: any) => void): () => void {
    const userRef = this.ref().child('users').child(user_id)
    userRef.on('value', snapshoot => {
      callback(snapshoot.val())
    })
    return () => userRef.off('value')
  }

  setUser(username?: string, image?: string): void {
    if (!this.user) return
    this.ref().child('users').child(this.user?.id).child('username').set(LibUtils.ucwords(username || this.user.name))
    this.ref().child('users').child(this.user?.id).child('image').set(image || this.user.image)
  }

  getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    if (!this.user) return
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      this.ref().child('history').child(id).child(group_id || this.group_id).once('value', snapshoot => {
        if (snapshoot.val()) {
          let s: any[] = Object.values(snapshoot.val()).filter((s: any) => s.user_id == opposite_id)
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
    check(this.user?.id, chat_to, chat_id => {
      if (chat_id) {
        callback(chat_id)
      } else {
        /* check opposite node */
        check(chat_to, this.user?.id, chat_id => {
          callback(chat_id)
        })
      }
    })
  }
}