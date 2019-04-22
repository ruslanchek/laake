import { NavigationScreenProp } from 'react-navigation';
import { Platform } from 'react-native';
import { VARIABLES } from '../common/variables';
import { IFormSelectItem } from '../components/ui/FormSelect';
import { localeManager } from '../managers/LocaleManager';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export class CommonService {
  static goBackAfterSelect(navigation: NavigationScreenProp<any, any> | undefined) {
    if (navigation) {
      setTimeout(() => {
        navigation.goBack();
      }, 200);
    }
  }

  static times<T = any>(iterations: number, iterator: (i: number) => T): T[] {
    const result: T[] = [];

    for (let i = 0; i < iterations; i++) {
      result.push(iterator(i));
    }

    return result;
  }

  static formatDosageParts(dosage: number, dosagePart: string, locale: string): string {
    let result = '';

    if (dosage > 0) {
      result += dosage.toLocaleString(locale);
    }

    if (dosagePart !== VARIABLES.NULL_VALUE_SYMBOL) {
      result += ` ${dosagePart}`;
    }

    return result;
  }

  static generateSelectItemsFromEnumMap<TEnum>(
    map: Map<TEnum, string>,
    count?: number,
  ): IFormSelectItem<TEnum>[] {
    const values: any = {};

    if (count || count === 0) {
      values.count = count;
    }

    return Array.from(map.keys()).map(key => {
      return {
        value: key,
        title: localeManager.t(map.get(key) || '', values),
      };
    });
  }

  static haptic() {
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
    }
  }
}
