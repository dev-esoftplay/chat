import React, { useEffect, useRef } from 'react';
import { esp, LibNotification } from 'esoftplay';
import * as ErrorReport from 'esoftplay/error'
import * as ErrorRecovery from 'expo-error-recovery';
import * as Notifications from 'expo-notifications';
import { enableScreens } from 'react-native-screens';
const _global = require('esoftplay/_global')
enableScreens();

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x))

export default function App(props: any) {
	const Home = useRef(esp.home()).current

	useEffect(() => {
		_global.useGlobalIdx = 0
		ErrorRecovery.setRecoveryProps(props)
		ErrorReport.getError(props.exp.errorRecovery)
	}, [])

	return <Home />
}