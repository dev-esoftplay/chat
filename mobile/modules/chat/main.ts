// useLibs


import React from 'react'
import { esp, ChatFirebase } from 'esoftplay'

export default function m(): firebase.database.Reference {
  const main = esp.config("chat_prefix") + "chat"
  return new ChatFirebase(main).getMainRef()
}