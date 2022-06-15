// noPage

import { ChattingFirebase, esp, LibUtils, UserClass } from 'esoftplay';
import { DatabaseReference, endAt, equalTo, get, limitToLast, onChildAdded, onChildChanged, onChildRemoved, onValue, orderByChild, orderByKey, push, query, remove, set, startAt } from 'firebase/database';
import { Alert } from 'react-native';

export default class m {
  user: any = undefined
  group_id: string = "0"
  db: ChattingFirebase
  perPage: number = 20

  constructor() {
    this.user = UserClass.state().get()
    this.db = new ChattingFirebase(esp.config('chat_prefix') + 'chat')
    this.group_id = esp.config('group_id') || '4'
    this.chatAll = this.chatAll.bind(this)
    this.chatDelete = this.chatDelete.bind(this)
    this.chatGet = this.chatGet.bind(this)
    this.chatGetAll = this.chatGetAll.bind(this)
    this.chatListenAdd = this.chatListenAdd.bind(this);
    this.chatListenChange = this.chatListenChange.bind(this);
    this.chatListenRemove = this.chatListenRemove.bind(this);
    this.chatSend = this.chatSend.bind(this);
    this.chatSendNew = this.chatSendNew.bind(this);
    this.chatUpdate = this.chatUpdate.bind(this);
    this.getChatId = this.getChatId.bind(this);
    this.historyNew = this.historyNew.bind(this);
    this.listenUser = this.listenUser.bind(this)
    this.ref = this.ref.bind(this);
    this.setUser = this.setUser.bind(this)
  }

  ref(...path: string[]): DatabaseReference {
    return this.db.refTo(path);
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
    push(this.ref("history", this.user?.id, this.group_id), me)
    push(this.ref("history", chat_to, this.group_id), notMe)
    // this.ref().child('history').child(this.user?.id).child(this.group_id).push(me)
    // this.ref().child('history').child(chat_to).child(this.group_id).push(notMe)
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
    // let messageRef = this.ref().child('chat').child(chat_id)
    // const _push = messageRef.child("conversation").push()
    const __push = push(this.ref('chat', chat_id, 'conversation'))
    msg.key = __push.key
    set(this.ref('chat', chat_id, 'conversation', msg.key), msg);
    // _push.set(msg)
    /* me */
    // messageRef.child('member').child(this.user?.id).set(member)
    set(this.ref('chat', chat_id, 'member', this.user?.id), member);
    /* notMe */
    // messageRef.child('member').child(chat_to).set(member)
    set(this.ref('chat', chat_id, 'member', chat_to), member);
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
    /* simpan pesan */
    // let messageRef = this.ref().child('chat').child(chat_id)
    // const _push = messageRef.child("conversation").push()
    // msg.key = _push.key
    // _push.set(msg)
    const __push = push(this.ref('chat', chat_id, 'conversation'));
    msg.key = __push.key;
    set(this.ref('chat', chat_id, 'conversation', msg.key), msg);

    /* set members */
    set(this.ref('chat', chat_id, 'member', this.user?.id), member);
    set(this.ref('chat', chat_id, 'member', chat_to), member);

    get(query(this.ref('history', this.user?.id, this.group_id), orderByChild('chat_id'), equalTo(chat_id))).then((snapshot) => {
      if (snapshot.exists()) {
        const currentHistory = snapshot.val()
        const currentKeyHistory = Object.keys(currentHistory)[0]
        set(this.ref('history', this.user?.id, this.group_id, currentKeyHistory, 'time'), _time)
      }
      get(this.ref('history', chat_to, this.group_id)).then((snapshot) => {
        if (snapshot.exists()) {
          for (let key in snapshot.val()) {
            if (snapshot.val()[key].chat_id == chat_id) {
              set(this.ref('history', chat_to, this.group_id, key, 'time'), _time)
              break;
            }
          }
        }
      })
    })

    // messageRef.child('member').child(this.user?.id).set(member)
    // messageRef.child('member').child(String(chat_to)).set(member)
    // const historyUserUpdate = this.ref().child('history').child(this.user?.id).child(this.group_id)
    // historyUserUpdate.orderByChild("chat_id").equalTo(chat_id).once('value', snapshoot => {
    //   try {
    //     historyUserUpdate.child(String(Object.keys(snapshoot.val())[0])).child('time').set(_time)
    //   } catch (error) {

    //   }
    // })
    if (callback) {
      callback(msg)
    }
  }

  chatAll(chat_id: string, callback: (messages: any[]) => void, lastIndex?: string): void {
    if (!this.user) return
    // let msgRef = this.ref().child('chat').child(chat_id).child("conversation").orderByKey()
    let _query = query(this.ref('chat', chat_id, 'conversation'), orderByKey(), limitToLast(100))
    if (lastIndex) {
      _query = query(this.ref('chat', chat_id, 'conversation'), orderByKey(), endAt(lastIndex), limitToLast(100))
    }
    get(_query).then((sn) => {
      if (sn.exists()) {
        const snapshoot = sn.val();
        let a: any[] = []
        if (snapshoot) {
          Object.keys(snapshoot).map(key => {
            let item = snapshoot[key];
            a.unshift(item)
            if (String(item.user_id) != String(this.user?.id) && String(item.read) == '0') {
              set(this.ref('chat', chat_id, 'conversation', key, 'read'), '1');
            }
          });
          if (lastIndex) {
            a.splice(a.length - 1, 1)
          }
          callback(a)
        } else {
          callback(a)
        }
      }
    })
  }

  chatGet(chat_id: string, key: string, callback: (chat: any) => void): void {
    if (!this.user) return
    get(this.ref('chat', chat_id, 'conversation', key)).then((sn) => {
      if (sn.exists()) {
        callback({ ...sn.val(), key: sn.key });
      } else {
        callback(null)
      }
    })
  }


  chatDelete(chat_id: string, key: string): void {
    if (!this.user) return
    remove(this.ref('chat', chat_id, 'conversation', key))
  }

  chatGetAll(chat_id: string, lastKey: string, callback: (allmsg: any) => void): void {
    if (!this.user) return
    // let chatRef = this.ref().child('chat').child(chat_id).child('conversation')
    let _query = query(this.ref('chat', chat_id, 'conversation'), orderByKey(), limitToLast(this.perPage))
    if (lastKey) {
      _query = query(this.ref('chat', chat_id, 'conversation'), orderByKey(), endAt(lastKey), limitToLast(this.perPage))
      // chatRef.orderByKey().endAt(lastKey).limitToLast(this.perPage).once('value', snapshoot => {
      //   callback(snapshoot.val())
      // })
    }
    get(_query).then((sn) => {
      if (sn.exists()) {
        const snapshoot = sn.val();
        let a: any = {}
        Object.keys(snapshoot).map(key => {
          let item = snapshoot[key];
          item.key = key
          a[key] = item
        })
        callback(a);
      } else {
        callback(null)
      }
    })
  }

  chatListenRemove(chat_id: string, callback: (removedChild: any) => void): () => void {
    if (!this.user) return () => { }
    const onChildRemove = onChildRemoved(this.ref('chat', chat_id, 'conversation'), (sn) => {
      if (sn.exists()) {
        callback({ ...sn.val(), key: sn.key });
      }
    })
    return () => onChildRemove()
  }

  chatListenAdd(chat_id: string, lastKey: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    const onChildAdd = onChildAdded(query(this.ref('chat', chat_id, 'conversation'), orderByKey(), startAt(lastKey)), (sn) => {
      if (sn.exists()) {
        callback({ ...sn.val(), key: sn.key });
      }
    })
    // const chatAddRef = this.ref().child('chat').child(chat_id).child('conversation')
    // chatAddRef.orderByKey().startAt(lastKey).on('child_added', snapshot => {
    //   callback(snapshot.val())
    // })
    return () => onChildAdd()
  }

  chatListenChange(chat_id: string, callback: (message_item: any) => void): () => void {
    if (!this.user) return () => { }
    const onChildChange = onChildChanged(this.ref('chat', chat_id, 'conversation'), (sn) => {
      if (sn.exists()) {
        callback({ ...sn.val(), key: sn.key });
      }
    })
    // const chatAddRef = this.ref().child('chat').child(chat_id).child('conversation')
    // chatAddRef.on('child_changed', (val) => {
    //   callback(val.val())
    // })
    return () => onChildChange()
  }

  chatUpdate(key: string, chat_id: string, value: any): void {
    if (!key) return
    if (!this.user) return
    set(this.ref('chat', chat_id, 'conversation', key), value)
  }

  listenUser(user_id: string, callback: (user: any) => void): () => void {
    if (!this.user) return () => { }
    const onListenUser = onValue(this.ref('users', user_id), (sn) => {
      if (sn.exists()) {
        callback(sn.val())
      } else {
        callback(null)
      }
    })
    return () => onListenUser()
  }

  setUser(username?: string, image?: string, deleted?: boolean): void {
    if (!this.user) return
    set(this.ref('users', this.user.id), {
      username: LibUtils.ucwords(username || this.user.name),
      image: image || this.user.image,
      deleted: deleted ? '1' : '0'
    })
  }

  getChatId(chat_to: string, group_id: string, callback: (chat_id: string) => void): void {
    if (!this.user) return
    let chattochecks = [];
    const check = (id: string, opposite_id: string, callback: (chat_id: string) => void) => {
      chattochecks.push(id + '+' + opposite_id)
      get((this.ref('history', id, group_id || this.group_id))).then((sn) => {
        if (sn.exists()) {
          if (sn.val()) {
            let s: any[] = Object.values(sn.val()).filter((s: any) => s.user_id == opposite_id)
            if (s.length > 0) {
              callback(s[0].chat_id)
            } else {
              callback("")
            }
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