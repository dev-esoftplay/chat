// withHooks

import React, { useRef } from 'react';
import { View } from 'react-native';
import { LibInput, LibList, ChatChat, LibUtils, LibTextstyle, ChattingItem, LibLoading, esp } from 'esoftplay';


export interface ChatChattingProps {

}
export default function m(props: ChatChattingProps): any {
  const inputMsg = useRef<LibInput>(null)
  const {
    loading,
    chat_id,
    error,
    chat_list,
    firstKey,
    loadPrevious,
    chat_to_online_status,
    chat_to_user_data,
    send
  } = ChatChat(LibUtils.getArgsAll(props))

  return (
    <View style={{ flex: 1 }} >
      {
        error ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
            <LibTextstyle textStyle="callout" text={error} />
          </View>
          :
          loading ?
            <LibLoading />
            :
            <LibList
              data={chat_list}
              onEndReached={() => loadPrevious(firstKey)}
              onEndReachedThreshold={0.5}
              renderItem={(item: ChattingItem) => <LibTextstyle text={item.msg} textStyle="body" style={{ padding: 17 }} />}
            />
      }
      <LibInput
        label="Pesan"
        ref={inputMsg}
        onSubmitEditing={() => send(inputMsg.current!.getText(), undefined, (chat_id, message) => {
          esp.log(chat_id, message);
        })}
      />
    </View>
  )
}