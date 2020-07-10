import React from 'react';
import { createStore } from 'redux';
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { esp, _global } from 'esoftplay';
import * as ErrorReport from 'esoftplay/error'
import * as ErrorRecovery from 'expo-error-recovery';
import './node_modules/esoftplay/timeout_fix'
import { enableScreens } from 'react-native-screens';
enableScreens();

_global.store = createStore(esp.reducer())
_global.persistor = persistStore(_global.store)

export default class App extends React.Component {
	Home = esp.home()

	constructor(props: any) {
		super(props)
		ErrorRecovery.setRecoveryProps(props)
		ErrorReport.getError(props.exp.errorRecovery)
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