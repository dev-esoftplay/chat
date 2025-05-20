// useLibs
// noPage

import {
  collection,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Unsubscribe
} from "@react-native-firebase/firestore";
import esp from "esoftplay/esp";

const itemPerPage = 15;

export interface ChattingPaginageReturn {
  getFirstChatsBatch: (chat_id: string, snapshotCallback: (querySnapshot: any) => void) => () => void,
  chatsNextBatch: (chat_id: string, lastDocument: any) => any
}

export default function m(): ChattingPaginageReturn {
  const rootPath: string = esp?.appjson?.()?.expo?.name
  const pathChat = [rootPath, 'chat', 'chat']

  function getFirstChatsBatch(
    chat_id: string,
    snapshotCallback: (querySnapshot: any) => void
  ): Unsubscribe {
    const app: any = esp.mod("firestore/index")().instance()
    const db: any = getFirestore(app)

    const q = query(
      collection(db, esp.mod("firestore/index")().castPathToString([...pathChat, chat_id, "conversation"])),
      orderBy("time", "desc"),
      limit(itemPerPage)
    );

    return onSnapshot(q, snapshotCallback);
  }

  async function chatsNextBatch(chat_id: string, lastDocument: any) {
    const app: any = esp.mod("firestore/index")().instance()
    const db: any = getFirestore(app)

    const next = query(
      collection(db, esp.mod("firestore/index")().castPathToString([...pathChat, chat_id, "conversation"])),
      orderBy("time", "desc"),
      startAfter(lastDocument),
      limit(itemPerPage)
    );

    const chats: any[] = [];

    const documentSnapshots = await getDocs(next);

    const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

    documentSnapshots.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });

    return { chats, lastVisible };
  }

  return {
    getFirstChatsBatch: getFirstChatsBatch,
    chatsNextBatch: chatsNextBatch
  }

}