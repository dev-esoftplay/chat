import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, query, setDoc, where, writeBatch } from 'firebase/firestore';

const config =
{
  "apiKey": "AIzaSyBsrXb66B_a99o3jtSJ29JwFBp3CmE8aAc",
  "authDomain": "kamerapengintaibi.firebaseapp.com",
  "storageBucket": "kamerapengintaibi.appspot.com",
  "projectId": "kamerapengintaibi",
  "databaseURL": "https://kamerapengintaibi-default-rtdb.firebaseio.com/"
}

function castPathToString(path) {
  const strings = path?.map?.(x => String(x)) || []
  return strings
}

function conditionIsNotValid(where) {
  return where[2] == undefined || where[0] == undefined
}

const init = initializeApp(config, "firestore")
const db = getFirestore(init)

const fData = [
  {
    "data": {
      "status_read": "1",
      "shop_id": "",
      "replied_name": "admin",
      "buttons": {
        "key-0": {
          "reply": {
            "text": "tersedia",
            "title": "Tersedia"
          },
          "payload": "Tersedia"
        },
        "key-1": {
          "payload": "Kosong",
          "reply": {
            "text": "Kosong",
            "title": "Kosong"
          }
        }
      },
      "msg": "Hallo PT. MAKMUR ABADI SENANTIASA apakah product ini ready?DS-2CD2563G2-IS-2.8MM Rp.1,703,230 2 pcs",
      "reply_time": "2024-07-18 19:16:01",
      "marketplace_name": "6285210200900",
      "user_id": 1,
      "marketplace_id": "1",
      "time": "1721304961",
      "user_online_id": "‪628116365422‬",
      "shop_name": "Kamerapengintai",
      "file": "",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "is_received": "0",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSM0U5MDA2OUEyMTg3MzNBNTRDAA=="
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSM0U5MDA2OUEyMTg3MzNBNTRDAA=="
  },
  {
    "data": {
      "time": "1721378566",
      "is_received": "0",
      "shop_id": "",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMDg1OUZGREVEQkI5RkU5OEUxAA==",
      "status_read": "1",
      "file": "",
      "marketplace_name": "6285210200900",
      "user_id": "93",
      "reply_time": "2024-07-19 15:42:46",
      "context": null,
      "user_online_id": "‪628116365422‬",
      "msg": "Tersedia",
      "replied_name": "victoronline",
      "marketplace_id": "1",
      "shop_name": "Kamerapengintai",
      "msg_id": "1-6285210200900-‪628116365422‬"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMDg1OUZGREVEQkI5RkU5OEUxAA=="
  },
  {
    "data": {
      "status_read": "1",
      "shop_id": "",
      "marketplace_id": "1",
      "is_received": "0",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "msg": "Halo, PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000238\nCS-TY1-4MP-PRO 5 pcs\\n",
      "shop_name": "Kamerapengintai",
      "file": {
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000238-2024-07-26 10:49:59.pdf",
        "type": 3
      },
      "time": "1721966138",
      "user_id": "0",
      "replied_name": null,
      "marketplace_name": "6285210200900",
      "user_online_id": "‪628116365422‬",
      "reply_time": "2024-07-26 10:55:38",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMTI4QUFBQkEzNTQwQkI2Q0EzAA=="
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMTI4QUFBQkEzNTQwQkI2Q0EzAA=="
  },
  {
    "data": {
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000264-2024-07-29 15:49:13.pdf"
      },
      "reply_time": "2024-07-29 15:49:43",
      "shop_id": "",
      "status_read": "1",
      "time": "1722242983",
      "shop_name": "Kamerapengintai",
      "is_received": "0",
      "msg": "Halo,\n PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000264\nST1000VX005-SKYHAWK-1TB-MFI 2 pcs.",
      "marketplace_name": "6285210200900",
      "replied_name": null,
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMUIyN0VDRDJCMjUxQjY5NDk3AA==",
      "user_id": "0",
      "user_online_id": "‪628116365422‬",
      "marketplace_id": "1",
      "msg_id": "1-6285210200900-‪628116365422‬"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMUIyN0VDRDJCMjUxQjY5NDk3AA=="
  },
  {
    "data": {
      "shop_name": "Kamerapengintai",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "user_online_id": "‪628116365422‬",
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000255-2024-07-29 10:43:55.pdf"
      },
      "replied_name": null,
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMjgxQzY3Rjk5RTYwQjg2M0U4AA==",
      "time": "1722224685",
      "status_read": "1",
      "reply_time": "2024-07-29 10:44:45",
      "marketplace_id": "1",
      "is_received": "0",
      "msg": "Halo,\n PT. GRAHAA MEGAH KORPORINDO\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000255\nHAC-HFW1240C-A-DIP-3.6MM 4 pcs, IPC-HDW1230T1-A-S5-2.8MM 1 pcs, LR1002-1ET 1 pcs, NVR4232-4KS3 1 pcs, XVR4232AN-I 2 pcs.",
      "marketplace_name": "6285210200900",
      "user_id": "0",
      "shop_id": ""
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMjgxQzY3Rjk5RTYwQjg2M0U4AA=="
  },
  {
    "data": {
      "marketplace_id": "1",
      "checked": 0,
      "shop_id": "",
      "marketplace_name": "6285210200900",
      "status_read": "1",
      "user_online_id": "‪628116365422‬",
      "time": "1721364780",
      "reply_time": "2024-07-19 11:53:00",
      "file": "",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "replied_name": "admin",
      "user_id": 1,
      "buttons": {
        "key-1": {
          "payload": "Kosong",
          "reply": {
            "text": "Kosong",
            "title": "Kosong"
          }
        },
        "key-0": {
          "payload": "Tersedia",
          "reply": {
            "title": "Tersedia",
            "text": "tersedia"
          }
        }
      },
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMzRBQjc1MUU4Q0Q2RTFDRUJEAA==",
      "msg": "Hallo PT. MAKMUR ABADI SENANTIASA apakah product ini ready?DS-2CD1021G0-I-4MM Rp.412,456 1 pcs",
      "shop_name": "Kamerapengintai",
      "is_received": "0"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSMzRBQjc1MUU4Q0Q2RTFDRUJEAA=="
  },
  {
    "data": {
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSN0E0MzA0MjY3OTIyMjZGREJBAA==",
      "reply_time": "2024-07-19 16:38:13",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "user_id": 1,
      "marketplace_name": "6285210200900",
      "shop_name": "Kamerapengintai",
      "time": "1721381893",
      "shop_id": "",
      "buttons": {
        "key-0": {
          "reply": {
            "text": "tersedia",
            "title": "Tersedia"
          },
          "payload": "Tersedia"
        },
        "key-1": {
          "reply": {
            "text": "Kosong",
            "title": "Kosong"
          },
          "payload": "Kosong"
        }
      },
      "status_read": "1",
      "user_online_id": "‪628116365422‬",
      "replied_name": "admin",
      "msg": "Hallo PT. MAKMUR ABADI SENANTIASA apakah product ini ready?DS-2CD1027G2-L-4MM Rp.650,848 2 pcs",
      "marketplace_id": "1",
      "file": "",
      "is_received": "0"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSN0E0MzA0MjY3OTIyMjZGREJBAA=="
  },
  {
    "data": {
      "is_received": "0",
      "user_id": "0",
      "status_read": "1",
      "user_online_id": "‪628116365422‬",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "time": "1722052719",
      "marketplace_id": "1",
      "marketplace_name": "6285210200900",
      "shop_id": "",
      "msg": "Halo,\n PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000253\nDS-2CD2T63G2-4I-2.8MM 3 pcs, CS-C6N-4MP 4 pcs, CS-H8C-4G-2K 1 pcs.",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSNzMyMDEzMUZBMkU0RDQyOTZCAA==",
      "reply_time": "2024-07-27 10:58:39",
      "shop_name": "Kamerapengintai",
      "replied_name": null,
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000253-2024-07-27 10:57:34.pdf"
      }
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSNzMyMDEzMUZBMkU0RDQyOTZCAA=="
  },
  {
    "data": {
      "is_received": "0",
      "reply_time": "2024-07-27 12:43:57",
      "msg": "Halo,\n PT. GRAHAA MEGAH KORPORINDO\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000254\nHAC-T1A21-3.6MM 1 pcs.",
      "shop_id": "",
      "status_read": "1",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSODFBRUE5Q0YxNjUwNkI3NDdEAA==",
      "marketplace_name": "6285210200900",
      "user_online_id": "‪628116365422‬",
      "user_id": "0",
      "replied_name": null,
      "marketplace_id": "1",
      "shop_name": "Kamerapengintai",
      "file": {
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000254-2024-07-27 12:43:34.pdf",
        "type": 3
      },
      "time": "1722059037"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSODFBRUE5Q0YxNjUwNkI3NDdEAA=="
  },
  {
    "data": {
      "shop_id": "",
      "replied_name": "admin",
      "user_online_id": "‪628116365422‬",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "buttons": {
        "key-0": {
          "payload": "Tersedia",
          "reply": {
            "title": "Tersedia",
            "text": "tersedia"
          }
        },
        "key-1": {
          "reply": {
            "title": "Kosong",
            "text": "Kosong"
          },
          "payload": "Kosong"
        }
      },
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOTA5MDVDQzMyODhEMDgxODNDAA==",
      "msg": "Hallo PT. MAKMUR ABADI SENANTIASA apakah product ini ready?DS-3E0106P-E/M Rp.369,370 1 pcs",
      "is_received": "0",
      "user_id": 1,
      "shop_name": "Kamerapengintai",
      "status_read": "1",
      "reply_time": "2024-07-19 14:38:38",
      "marketplace_name": "6285210200900",
      "marketplace_id": "1",
      "time": "1721374718",
      "file": ""
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOTA5MDVDQzMyODhEMDgxODNDAA=="
  },
  {
    "data": {
      "user_online_id": "‪628116365422‬",
      "is_received": "0",
      "buttons": {
        "key-1": {
          "reply": {
            "text": "Kosong",
            "title": "Kosong"
          },
          "payload": "Kosong"
        },
        "key-0": {
          "payload": "Tersedia",
          "reply": {
            "text": "tersedia",
            "title": "Tersedia"
          }
        }
      },
      "file": "",
      "shop_name": "Kamerapengintai",
      "user_id": 1,
      "marketplace_name": "6285210200900",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOTFGOTgxMjFFRUNGOTM3MDREAA==",
      "time": "1721309992",
      "marketplace_id": "1",
      "replied_name": "admin",
      "shop_id": "",
      "msg": "Hallo PT. MAKMUR ABADI SENANTIASA apakah product ini ready?DS-7616NXI-K1 Rp.1,543,786 1 pcs",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "status_read": "1",
      "reply_time": "2024-07-18 20:39:52"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOTFGOTgxMjFFRUNGOTM3MDREAA=="
  },
  {
    "data": {
      "replied_name": null,
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000260-2024-07-29 12:46:16.pdf"
      },
      "msg": "Halo,\n PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000260\nST2-32-S1-IMOU-32GB 100 pcs, CS-C6N-4MP 30 pcs, CS-H6C-2MP-PRO 20 pcs, DS-1LN6U-W/CCA 1 pcs, DS-UPS3000 2 pcs, DS20HKVS-VX1 1 pcs.",
      "marketplace_id": "1",
      "shop_name": "Kamerapengintai",
      "reply_time": "2024-07-29 12:47:03",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOUZGMjZDMTBEQTg2MzlBMDkxAA==",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "status_read": "1",
      "is_received": "0",
      "marketplace_name": "6285210200900",
      "time": "1722232023",
      "user_online_id": "‪628116365422‬",
      "shop_id": "",
      "user_id": "0"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSOUZGMjZDMTBEQTg2MzlBMDkxAA=="
  },
  {
    "data": {
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000258-2024-07-29 12:14:30.pdf"
      },
      "msg": "Halo,\n PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000258\nST2-32-S1-IMOU-32GB 100 pcs, CS-C6N-4MP 30 pcs, CS-H6C-2MP-PRO 20 pcs, DS-1LN6U-W/CCA 1 pcs, DS-UPS3000 2 pcs, DS20HKVS-VX1 1 pcs.",
      "is_received": "0",
      "reply_time": "2024-07-29 12:16:43",
      "user_online_id": "‪628116365422‬",
      "status_read": "1",
      "user_id": "0",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "replied_name": null,
      "shop_id": "",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRDVBNTQ4MkEzQjZFQjdCNTE3AA==",
      "shop_name": "Kamerapengintai",
      "marketplace_id": "1",
      "time": "1722230203",
      "marketplace_name": "6285210200900"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRDVBNTQ4MkEzQjZFQjdCNTE3AA=="
  },
  {
    "data": {
      "msg": "Halo,\n PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000241\nST1000VX005-SKYHAWK-1TB-MFI 1 pcs, DS-2FA1205-C8 PSU 1 pcs.",
      "status_read": "1",
      "marketplace_id": "1",
      "file": {
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000241-2024-07-26 14:37:18.pdf",
        "type": 3
      },
      "shop_name": "Kamerapengintai",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRTIyN0I5MzYwRTEyRTk0NjE2AA==",
      "replied_name": null,
      "marketplace_name": "6285210200900",
      "time": "1721979469",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "user_online_id": "‪628116365422‬",
      "is_received": "0",
      "shop_id": "",
      "reply_time": "2024-07-26 14:37:49",
      "user_id": "0"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRTIyN0I5MzYwRTEyRTk0NjE2AA=="
  },
  {
    "data": {
      "status_read": "1",
      "is_received": "0",
      "replied_name": null,
      "msg_id": "1-6285210200900-‪628116365422‬",
      "time": "1721970041",
      "marketplace_id": "1",
      "user_id": "0",
      "shop_name": "Kamerapengintai",
      "shop_id": "",
      "msg": "Halo, PT. MAKMUR ABADI SENANTIASA\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000242\nDS-3E1552P-SI 1 pcs\\n",
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000242-2024-07-26 12:00:07.pdf"
      },
      "user_online_id": "‪628116365422‬",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRUY4OUE4OTREMTVEODdEOTRBAA==",
      "reply_time": "2024-07-26 12:00:41",
      "marketplace_name": "6285210200900"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRUY4OUE4OTREMTVEODdEOTRBAA=="
  },
  {
    "data": {
      "user_online_id": "‪628116365422‬",
      "shop_id": "",
      "reply_id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRjJEQUNENTg4N0MxNkM1NTI5AA==",
      "replied_name": null,
      "is_received": "0",
      "reply_time": "2024-07-29 15:25:36",
      "shop_name": "Kamerapengintai",
      "status_read": "1",
      "msg_id": "1-6285210200900-‪628116365422‬",
      "msg": "Halo,\n PT. GRAHAA MEGAH KORPORINDO\nberikut kami lampirkan \nPO : PURC/KPI/24/VII/000262\nXVR5108HS-I3 1 pcs, CS4010-8GT-60 1 pcs.",
      "marketplace_id": "1",
      "time": "1722241536",
      "marketplace_name": "6285210200900",
      "file": {
        "type": 3,
        "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000262-2024-07-29 15:25:15.pdf"
      },
      "user_id": "0"
    },
    "id": "wamid.HBgMNjI4MTE2MzY1NDIyFQIAERgSRjJEQUNENTg4N0MxNkM1NTI5AA=="
  }
]

const Firestore = {
  get: {
    collection(path, condition, cb, err) {
      const fixedPath = castPathToString(path)
      if (fixedPath.length % 2 == 0) {
        console.warn("path untuk akses Collection data tidak boleh berhenti di Doc [Firestore.get.collectionIds]")
        return
      }
      //@ts-ignore
      const colRef = collection(db, ...fixedPath)
      let conditionsArray = []
      if (condition.length > 0) {
        condition.forEach((c) => {
          if (conditionIsNotValid(c)) {
            console.warn("condition tidak boleh undefined", fixedPath)
          } else {
            //@ts-ignore
            conditionsArray.push(where(...c))
          }
        })
      }
      //@ts-ignore
      const fRef = conditionsArray.length > 0 ? query(colRef, ...conditionsArray) : colRef
      let datas = []
      getDocs(fRef).then((snap) => {
        snap.docs.forEach((doc) => {
          datas.push({ data: doc.data(), id: doc.id })
        })
        cb(datas)
      }).catch(err)
    }
  },
  add: {
    doc(path, value, cb, err) {
      if (path.length % 2 > 0) {
        console.warn("path untuk akses Doc data tidak boleh berhenti di Collection [Firestore.add.doc]")
        return
      }
      const colRef = doc(db, ...path)
      setDoc(colRef, value).then((snap) => {
        cb()
      }).catch(err)
    }
  }
}

// const path = ["marketplace-kamerapengintai", "chat", "chat", "1-6285210200900-‪628116365422‬", "conversation"]
// Firestore.get.collection(path, [], (snap) => {
//   const dt = snap
//   console.log(JSON.stringify(dt))
// })


// Firestore.add.doc(path, {
//   "marketplace_name": "6285210200900",
//   "file": {
//     "type": 3,
//     "file_url": "https://erp.kamerapengintai.com/images/modules/warehouse/po/PURC-KPI-24-VII-000262-2024-07-29 15:25:15.pdf"
//   }
// }, () => { }, (er) => {
//   console.log({ err })
// })

const batch = writeBatch(db)

fData.forEach((x) => {
  const path = ["marketplace-kamerapengintai", "chat", "chat", "1-6285210200900-628116365422", "conversation", x.id]
  const colRef = doc(db, ...path)
  batch.set(colRef, x.data)
})

await batch.commit()
