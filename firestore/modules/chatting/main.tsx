// withHooks

import { useSafeState } from 'esoftplay';
import { LibList } from 'esoftplay/cache/lib/list/import';
import { LibStyle } from 'esoftplay/cache/lib/style/import';
import { LibTextstyle } from 'esoftplay/cache/lib/textstyle/import';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Firestore from './firestore';


export interface ChattingMainArgs {

}
export interface ChattingMainProps {

}
export default function m(props: ChattingMainProps): any {
  const [list, setList] = useSafeState<any[]>([]);


  useEffect(() => {
    Firestore.init()
    Firestore.db()
    Firestore.get.collectionIds(['users'], [], (list) => {
      setList(list)
    })
    Firestore.get.doc(['users', 'TB87yOhF8cH81gVmcQjA', 'chat_ids','UTYHdksUqjf3gFdVFrRq'], [], (doc) => {
      console.log("DOC", doc)
    })
  }, [])


  return (
    <View style={{ flex: 1, paddingTop: LibStyle.STATUSBAR_HEIGHT + 10 }} >
      <LibList
        data={list}
        renderItem={(item) => {
          return (
            <View style={{ height: 100 }} >
              <LibTextstyle text={JSON.stringify(item)} textStyle="body" />
            </View>
          )
        }}
      />
    </View>
  )
}