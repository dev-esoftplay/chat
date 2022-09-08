// withHooks
import { esp } from 'esoftplay';
import { ChattingLib } from 'esoftplay/cache/chatting/lib.import';
import { LibCrypt } from 'esoftplay/cache/lib/crypt.import';
import { LibCurl } from 'esoftplay/cache/lib/curl.import';
import { LibIcon } from 'esoftplay/cache/lib/icon.import';
import { LibImage } from 'esoftplay/cache/lib/image.import';
import { LibNavigation } from 'esoftplay/cache/lib/navigation.import';
import { LibProgress } from 'esoftplay/cache/lib/progress.import';
import { UserClass } from 'esoftplay/cache/user/class.import';
import { useEffect } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';


export interface ChatLoginProps {

}
export default function m(props: ChatLoginProps): any {

  useEffect(() => {
    LibProgress.show('Mohon tunggu')
    new LibCurl('user_login', {
      username: new LibCrypt().encode('admin'),
      password: new LibCrypt().encode('123456'),
    },
      (res) => {
        UserClass.create(res).then(() => {
          LibProgress.hide()
          LibNavigation.reset('chat/index')
          new ChattingLib().setUser()
        })
      },
      (msg) => {
        LibProgress.hide()
        Alert.alert('Kesalahan', msg)
      }, 1)
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
      <TouchableOpacity onPress={() => LibImage.fromGallery().then((x) => { esp.log(x); })} >
        <LibIcon name="image-album" />
      </TouchableOpacity>
    </View>
  )
}