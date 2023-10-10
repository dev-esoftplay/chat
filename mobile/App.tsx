import { LibNotification } from 'esoftplay/cache/lib/notification/import';
import { UserIndex } from 'esoftplay/cache/user/index/import';
import * as Notifications from 'expo-notifications';
import { /* enableFreeze, */ enableScreens } from 'react-native-screens';

/* enableFreeze() */
enableScreens()

Notifications.addNotificationResponseReceivedListener(x => LibNotification.onAction(x));
Notifications.addNotificationReceivedListener(x => LibNotification.onAction(x));

export default UserIndex