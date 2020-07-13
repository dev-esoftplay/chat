// useLibs

import React, { useEffect, useMemo } from 'react';
import { ChatLib, useSafeState, LibObject, ChatOnline_listener, ChatOpen_listener, LibCurl, LibNavigation, esp } from 'esoftplay';
import AsyncStorage from '@react-native-community/async-storage';
import { InteractionManager } from 'react-native';
import { useSelector } from 'react-redux';

export interface ChattingItem {
  msg: string,
  read: string,
  time: string,
  user_id: string,
  attach?: ChattingItemAttach
}

export interface ChattingItemAttach {
  description?: string,
  image?: string,
  module?: string,
  url?: string,
  title?: string,
  data?: any,
  buttons?: ChattingItemAttachButtons
}

export interface ChattingItemAttachButtons {
  [user_id: string]: ChattingItemAttachButton[]
}

export interface ChattingItemAttachButton {
  type?: string,
  text: string,
  module?: string,
  data?: any,
  url: string,
  enabled: string
}


export interface ChatChatProps {
  chat_to: string,
  group_id: string,
  chat_id: string
}

function getCache(chat_id: string, callback: (cache: any) => void) {
  AsyncStorage.getItem('chat_cache_' + chat_id, (error, result) => {
    if (result)
      callback(JSON.parse(result))
    else
      callback(null)
  })
}

function setCache(chat_id: string, cache: any) {
  AsyncStorage.setItem('chat_cache_' + chat_id, JSON.stringify(cache))
}

export interface ChatChatReturnUser {
  username: string,
  image: string,
  online: string
}

export interface ChatChatReturn {
  chat_id: string,
  send: (message: string, attach?: any, callback?: (chat_id: string, message: string) => void) => void,
  chat_to_user_data: ChatChatReturnUser,
  chat_to_online_status: string,
  loadPrevious: (firstKey: string) => void,
  firstKey: string,
  chat_list: ChattingItem[],
  hasPrevious: boolean,
  error: string,
  loading: boolean
}


export default function m(props: ChatChatProps): ChatChatReturn {
  const user = useSelector((state: any) => state.user_class)
  const chatLib = useMemo(() => new ChatLib(), [])
  const [chat_id, setChat_id] = useSafeState(props.chat_id)
  const { chat_to } = props
  const group_id = props?.group_id || esp.config('group_id')
  const [hasNext, setHasNext] = useSafeState(true)
  const [data, setData] = useSafeState<any>()
  const [queryKeys, setQueryKeys] = useSafeState<string[]>([])
  const [error, setError] = useSafeState("")
  const [loading, setLoading] = useSafeState(true)
  const [online, opposite] = ChatOnline_listener(chat_to)
  const [isOpenChat] = ChatOpen_listener(chat_id, chat_to)


  useEffect(() => {
    let exec = InteractionManager.runAfterInteractions(async () => {
      let error = ''
      if (chat_to == undefined || chat_to == '') {
        error = "Tujuan chat tidak ditemukan"
      } else if (chat_to == user.id) {
        error = "Tidak dapat mengirim pesan ke diri sendiri"
      } else if (group_id == undefined || group_id == "") {
        error = "Tujuan chat tidak valid"
      }
      if (error != '') {
        setError(error)
        return
      }
      if (!chat_id)
        chatLib.getChatId(chat_to, group_id, chat_id => {
          setLoading(false)
          setChat_id(chat_id)
        })
      else
        setLoading(false)
    })
    return () => exec.cancel()
  }, [])

  useEffect(() => {
    if (chat_id && !loading) {
      getCache(chat_id, (chats) => {
        if (chats) {
          setData({ ...chats, ...data })
          setQueryKeys(Object.keys(chats))
        } else {
          chatLib.chatGetAll(chat_id, '', (chats) => {
            setData({ ...chats, ...data })
            setCache(chat_id, { ...chats, ...data })
          })
        }
      })
    }
  }, [chat_id, loading])

  useEffect(() => {
    let chatAddListener: any = undefined
    let chatChangeListener: any = undefined
    if (!loading && chat_id && chatAddListener == undefined) {
      if (
        data != undefined &&
        Object.keys(data).length > 0 
      ) {
        let keys = Object.keys(data)
        chatAddListener = chatLib.chatListenAdd(chat_id, String(data[keys[keys.length - 1]]), (chat: any) => {
          setData({ ...data, chat })
        })
        chatChangeListener = chatLib.chatListenChange(chat_id, (chat) => {
          setData({ ...data, chat })
        })
      }
    }
    return () => {
      if (!loading) {
        if (chatChangeListener) chatChangeListener()
        if (chatAddListener) chatAddListener()
      }
    }
  }, [data, loading, chat_id])

  function loadPrevious(lastKey: string) {
    if (!queryKeys.includes(lastKey)) {
      chatLib.chatGetAll(chat_id, lastKey, (chats) => {
        const allKeys = LibObject.push(queryKeys, lastKey)()
        if (allKeys.length == queryKeys.length) {
          setHasNext(false)
        }
        setQueryKeys(allKeys)
        setData({ ...chats, ...data })
        setCache(chat_id, { ...chats, ...data })
      })
    } else {
      setHasNext(false)
    }
  }

  function setNotif(chat_id: string, message: string): void {
    if (isOpenChat) {
      new LibCurl('user_notif_chat', {
        chat_id: chat_id,
        chat_from: user.id,
        chat_to: chat_to,
        group_id: group_id,
        message: message
      })
    }
  }

  function send(message: string, attach?: ChattingItemAttach, callback?: (chat_id: string, message: string) => void) {
    if (chat_id) {
      chatLib.chatSend(chat_id, chat_to, message, attach, (msg) => {
        esp.log('JEJEE');
        callback && callback(chat_id, message)
        setNotif(chat_id, message)
      })
    } else {
      chatLib.chatSendNew(chat_to, message, attach, true, (message: string, chat_id: string) => {
        esp.log('JEJEE');
        setChat_id(chat_id)
        callback && callback(chat_id, message)
        setNotif(chat_id, message)
      })
    }
  }

  return {
    chat_id: chat_id,
    chat_list: data && Object.values(data) || [],
    chat_to_online_status: online,
    chat_to_user_data: opposite,
    error: error,
    firstKey: data && Object.keys(data)[0],
    hasPrevious: hasNext,
    loading: loading,
    loadPrevious: loadPrevious,
    send: send
  }
}