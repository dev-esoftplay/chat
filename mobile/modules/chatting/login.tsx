// withHooks

import React, { useEffect } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { LibProgress, LibCurl, LibCrypt, UserClass, LibNavigation, ChattingLib, LibIcon, LibImage, esp } from 'esoftplay';


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