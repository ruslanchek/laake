import { Platform } from 'react-native';

export function platform(iosMethod: any, androidMethod: any) {
  if (Platform.OS === 'ios') {
    return iosMethod();
  } else {
    return androidMethod();
  }
}
