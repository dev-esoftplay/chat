import { esp, LibNotification } from 'esoftplay';
import * as ErrorReport from 'esoftplay/error';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';
import { enableScreens } from 'react-native-screens';
const { globalIdx } = require('esoftplay/global');
enableScreens();

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x));

export default function App() {
	const Home = useRef(esp.home()).current

	useEffect(() => {
		globalIdx.reset()
		ErrorReport.getError()
	}, [])

	return <Home />
}