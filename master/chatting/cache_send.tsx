// withHooks
// noPage

import { ChattingLib } from "esoftplay/cache/chatting/lib/import"
import { LibObject } from "esoftplay/cache/lib/object/import"
import useGlobalState, { useGlobalReturn } from "esoftplay/global"
import { ChattingItem } from "esoftplay/modules/chatting/chat"


export interface ChattingCache_sendArgs {

}
export interface ChattingCache_sendProps {

}

const stateMsg = useGlobalState<any>([], {
  persistKey: 'chatting_cache_chat', isUserData: true,
})

export function state(): useGlobalReturn<any[]> {
  return stateMsg
}

export function insertToCache(chat_id: string, chat_to: string, group_id: string, message: string, attach: any, history?: boolean) {
  const cacheData = {
    chat_id,
    chat_to,
    group_id,
    message,
    attach: attach || "",
    history: history || false
  }

  stateMsg.set((t: any) => LibObject.push(t, cacheData)())
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