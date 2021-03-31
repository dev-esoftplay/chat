import React from 'react';
import { createStore } from 'redux';
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { esp, LibNotification, _global } from 'esoftplay';
import * as ErrorReport from 'esoftplay/error'
import * as ErrorRecovery from 'expo-error-recovery';
import { enableScreens } from 'react-native-screens';
import * as Notifications from 'expo-notifications';
enableScreens();

_global.store = createStore(esp.reducer())
_global.persistor = persistStore(_global.store)

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x))

export default class App extends React.Component {
	Home = esp.home()
	notification = {}

	constructor(props: any) {
		super(props)
		ErrorRecovery.setRecoveryProps(props)
		ErrorReport.getError(props.exp.errorRecovery)
		this.state = { loading: true }
		_global.useGlobalIdx = 0
		LibNotification.listen(this.notification)
	}

	render() {
		return (
			<Provider store={_global.store}>
				<PersistGate loading={null} persistor={_global.persistor}>
					<this.Home />
				</PersistGate>
			</Provider>
		)
	}
}