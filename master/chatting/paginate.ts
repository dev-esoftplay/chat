// useLibs
// noPage

import { esp } from "esoftplay";
import useFirestore from "esoftplay-firestore";
import {
  collection,
  DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  startAfter,
  Unsubscribe
} from "firebase/firestore";

const itemPerPage = 15;

export interface ChattingPaginageReturn {
  getFirstChatsBatch: (chat_id: string, snapshotCallback: (querySnapshot: QuerySnapshot<DocumentData>) => void) => () => void,
  chatsNextBatch: (chat_id: string, lastDocument: any) => any
}

export default function m(): ChattingPaginageReturn {
  const rootPath: string = esp?.appjson?.()?.expo?.name
  const pathChat = [rootPath, 'chat', 'chat']
  const { db } = useFirestore().init()

  function getFirstChatsBatch(
    chat_id: string,
    snapshotCallback: (querySnapshot: QuerySnapshot<DocumentData>) => void
  ): Unsubscribe {
    const q = query(
      //@ts-ignore
      collection(db, ...[...pathChat, chat_id, "conversation"]),
      orderBy("time", "desc"),
      limit(itemPerPage)
    );

    return onSnapshot(q, snapshotCallback);
  }

  async function chatsNextBatch(chat_id: string, lastDocument: any) {
    const next = query(
      //@ts-ignore
      collection(db, ...[...pathChat, chat_id, "conversation"]),
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