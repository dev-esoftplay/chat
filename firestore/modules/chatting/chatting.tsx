// withHooks
import { ChattingChat } from 'esoftplay/cache/chatting/chat/import';
import { LibInput } from 'esoftplay/cache/lib/input/import';
import { LibList } from 'esoftplay/cache/lib/list/import';
import { LibLoading } from 'esoftplay/cache/lib/loading/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import React, { useRef } from 'react';
import { View } from 'react-native';

export interface ChattingChattingProps {

}
export default function m(props: ChattingChattingProps): any {
  const inputMsg = useRef<LibInput>(null)
  const {
    loading,
    chat_id,
    error,
    hasPrevious,
    conversation,
    firstKey,
    loadPrevious,
    chat_to_user,
    chat_to_online,
    send
  } = ChattingChat(LibUtils.getArgsAll(props))

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
              data={conversation}
              style={{ transform: [{ scaleY: - 1 }] }}
              onEndReached={() => loadPrevious(firstKey)}
              onEndReachedThreshold={1}
              renderItem={(item: any) => (
                <View style={{ transform: [{ scaleY: - 1 }] }} >
                  <LibTextstyle text={item.msg} textStyle="body" style={{ padding: 17 }} />
                  <LibTextstyle text={item.key} textStyle="footnote" style={{ padding: 17 }} />
                </View>
              )}
            />
      }
      <LibInput
        label="Pesan"
        ref={inputMsg}
        onSubmitEditing={() => send(inputMsg.current!.getText(), undefined, (chat_id, message) => {
          // esp.log(chat_id, message);
        })}
      />
    </View>
  )
}