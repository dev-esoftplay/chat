// withHooks
import { ChattingHistory } from 'esoftplay/cache/chatting/history.import';
import { ChattingOnline_setter } from 'esoftplay/cache/chatting/online_setter.import';
import { LibList } from 'esoftplay/cache/lib/list.import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation.import';
import { LibStyle } from 'esoftplay/cache/lib/style.import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle.import';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';



export interface ChatIndexProps {

}

export default function m(props: ChatIndexProps): any {
  ChattingOnline_setter()
  const { data, update, deleteCache } = ChattingHistory()

  useEffect(() => {
    update()
  }, [])

  return (
    <View style={{ flex: 1, paddingTop: LibStyle.STATUSBAR_HEIGHT }} >
      <LibList
        data={data}
        renderItem={(item) => (
          <TouchableOpacity
            onPress={() => LibNavigation.navigate('chat/chatting', { chat_to: item.chat_to })}
            style={{ paddingVertical: 10, paddingHorizontal: 17 }} >
            <LibTextstyle textStyle="body" text={item.username} />
            <LibTextstyle textStyle="footnote" text={item.msg} />
            <LibTextstyle textStyle="footnote" text={item.chat_to} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}