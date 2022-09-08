import * as Esoftplay from 'esoftplay';
import * as ErrorReport from 'esoftplay/error';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';
import { enableFreeze, enableScreens } from 'react-native-screens';
const { globalIdx } = require('esoftplay/global');
enableScreens();
enableFreeze();

Notifications.addNotificationResponseReceivedListener(x => Esoftplay.LibNotification.onAction(x));

export default function App() {
	const Home = useRef(Esoftplay.esp.home()).current

	useEffect(() => {
		globalIdx.reset()
		ErrorReport.getError()
	}, [])

	return (<Home />)
}