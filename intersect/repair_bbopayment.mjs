import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, limit, orderBy, query, startAfter, writeBatch } from 'firebase/firestore';
import fs from "fs/promises";


const config =
{
  "apiKey": "AIzaSyB04JT4JJfFsArIccAjBEn1nwIlg8EVWx4",
  "authDomain": "bigbang-online.firebaseapp.com",
  "databaseURL": "https://bigbang-online.firebaseio.com/",
  "storageBucket": "gs://bigbang-online.appspot.com/",
  "projectId": "bigbang-online"
}

const init = initializeApp(config, "firestore")
const db = getFirestore(init)
// const COLLECTION = "dummy_payment"
const COLLECTION = "bbo_payment"

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const LAST_DOC_FILE = "lastDocument.json"; // File to store the last document reference

async function saveLastDocument(docSnap) {
  const docData = docSnap ? { id: docSnap.id, data: docSnap.data() } : null;
  await fs.writeFile(LAST_DOC_FILE, JSON.stringify(docData, null, 2));
  console.log(`Last document saved: ${docSnap?.id}`);
}

async function loadLastDocument() {
  try {
    const fileContent = await fs.readFile(LAST_DOC_FILE, "utf-8");
    const docData = JSON.parse(fileContent);
    return docData ? doc(db, COLLECTION, docData.id) : null;
  } catch (error) {
    console.log("No saved last document found. Starting fresh.");
    return null;
  }
}

async function updateCollectionBatchRecursive(
  collectionName,
  batchSize,
  updateFn,
  lastDoc = null
) {
  let q = query(
    collection(db, collectionName),
    orderBy("created", "asc"),
    ...(lastDoc ? [startAfter(lastDoc)] : []),
    limit(batchSize)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log("No more documents to process.");
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    const ref = doc(db, collectionName, docSnap.id);
    const newData = updateFn(docSnap.data());
    batch.update(ref, newData);
  });

  await batch.commit();
  console.log(`${snapshot.size} documents updated.`);

  const nextLastDoc = snapshot.docs[snapshot.docs.length - 1];
  await saveLastDocument(nextLastDoc);
  await delay(1000)
  await updateCollectionBatchRecursive(collectionName, batchSize, updateFn, nextLastDoc);
}

(async () => {
  const collectionName = COLLECTION;
  const batchSize = 50;

  const updateFn = (data) => {
    return {
      ...data,
      pay_no: data?.pay_no ? String(data.pay_no).trim() : null,
      pay_id: data?.pay_id ? String(data.pay_id).trim() : null,
    };
  };

  try {
    const lastDoc = await loadLastDocument();
    await updateCollectionBatchRecursive(collectionName, batchSize, updateFn, lastDoc);
    console.log("Batch update completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating documents:", error);
    process.exit(1);
  }
})();