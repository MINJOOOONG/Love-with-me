import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const KEY = 'hourlyReminder';

export const reminderSupported = Platform.OS !== 'web';

export async function getReminder() {
  return (await AsyncStorage.getItem(KEY)) === 'on';
}

// 매 정각 셀로그 알림 (기기 로컬 알림, 서버 불필요)
export async function setReminder(on: boolean) {
  if (!reminderSupported) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (on) {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) {
      await AsyncStorage.setItem(KEY, 'off');
      return false;
    }
    for (let hour = 8; hour <= 23; hour++) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '2uram', body: `${hour}시예요! 지금의 일상을 남겨볼까요? 🥟` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
      });
    }
  }
  await AsyncStorage.setItem(KEY, on ? 'on' : 'off');
  return on;
}
