
import { LibNotification } from 'esoftplay/cache/lib/notification.import';
import * as ErrorReport from 'esoftplay/error';
import esp from 'esoftplay/esp';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';
import { enableFreeze, enableScreens } from 'react-native-screens';
const { globalIdx } = require('esoftplay/global');
enableScreens();
enableFreeze();

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x));

export default function App() {
	const Home = useRef(esp.home()).current
	useEffect(() => {
		globalIdx.reset()
		ErrorReport.getError()
	}, [])

	return (<Home />)
}