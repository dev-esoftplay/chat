// withHooks
// noPage

import { useGlobalReturn, useGlobalState } from "esoftplay"
import { ChattingItem } from "esoftplay/cache/chatting/chat/import"
import { ChattingLib } from "esoftplay/cache/chatting/lib/import"
import { LibObject } from "esoftplay/cache/lib/object/import"


export interface ChattingCache_sendArgs {

}
export interface ChattingCache_sendProps {

}


let allowProcessMsg = useGlobalState<boolean>(true)
const stateMsg = useGlobalState<any[]>([], {
  loadOnInit: true,
  persistKey: 'chatting_cache_chat1', inFile: true, isUserData: true, listener(data) {
    syncFromCacheNew()
  },
})

export function state(): useGlobalReturn<any[]> {
  return stateMsg
}

export function insertToCache(chat_id: string, chat_to: string, group_id: string, message: string, attach: any, history?: boolean) {
  const msgCache = stateMsg.get()

  const cacheData = {
    chat_id,
    chat_to,
    group_id,
    message,
    attach: attach || "",
    history: history || false
  }

  const edit = LibObject.push(msgCache, cacheData)()
  stateMsg.set(edit)
}

export function syncFromCacheNew() {

  if (allowProcessMsg.get()) {
    allowProcessMsg.set(false)
    execSend(0)
  }
  function execSend(idx: number, chat_id?: string) {
    const arr = stateMsg.get()
    let currentChat = arr?.[idx]
    let nextChat = arr?.[idx + 1]

    if (currentChat) {
      chat_id = chat_id ? chat_id : currentChat.chat_id
      if (chat_id) {
        currentChat = { ...currentChat, chat_id: chat_id }
      }
      sendCacheToServer(currentChat, (msg, chat_id) => {
        if (nextChat) {
          stateMsg.set(LibObject.splice(stateMsg.get(), 0, 1)())
          execSend(idx)
        } else {
          allowProcessMsg.set(true)
          stateMsg.set(LibObject.splice(stateMsg.get(), 0, 1)())
        }
      }, () => { });
    } else {
      allowProcessMsg.set(true)
    }
  }
}

export function sendCacheToServer(messageObject: any, onResult: (res: any, chat_id?: string) => void, onFailed: (err: string) => void) {
  const { chat_to, message, attach, chat_id } = messageObject
  if (chat_id.length > 1)
    ChattingLib().chatSend(chat_id, chat_to, message, attach, (msg: ChattingItem) => {
      onResult(msg)
    })
  else
    ChattingLib().chatSendNew(chat_to, message, attach, true, (msg, chat_id) => {
      onResult(msg, chat_id)
    })
}

export default function m(props: ChattingCache_sendProps): any {
  return null
}