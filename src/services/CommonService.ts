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

  static convertDosagePartToString(dosagePart: number): string {
    if (dosagePart >= 0 && dosagePart < 0.25) {
      return VARIABLES.NULL_VALUE_SYMBOL;
    } else if (dosagePart > 0 && dosagePart < 0.26) {
      return '¼';
    } else if (dosagePart > 0.26 && dosagePart < 0.333339) {
      return '⅓';
    } else if (dosagePart > 0.333339 && dosagePart < 0.51) {
      return '½';
    } else if (dosagePart > 0.51 && dosagePart < 0.666669) {
      return '⅔';
    } else {
      return '¾';
    }
  }

  static capitalizeFirstWord(value: string): string {
    return `${value.substring(0, 1).toLocaleUpperCase()}${value.substring(1, value.length)}`;
  }

  static formatDosageTotal(number: number): string {
    const numberParts: string[] = number >= 0 ? number.toString().split('.') : [''];
    const whole: number | null = numberParts[0] ? parseInt(numberParts[0]) : null;
    const part: number | null = numberParts[1] ? parseFloat(`0.${numberParts[1]}`) : null;

    if (whole && part) {
      return `${whole} ${this.convertDosagePartToString(part)}`;
    } else if (whole && !part) {
      return `${whole}`;
    } else if (part && !whole) {
      return `${this.convertDosagePartToString(part)}`;
    } else {
      return '0';
    }
  }

  static formatDosageParts(dosage: number, dosagePart: number, locale: string): string {
    let result = '';

    if (dosage > 0) {
      result += dosage.toLocaleString(locale);
    }

    if (dosagePart > 0) {
      result += ` ${this.convertDosagePartToString(dosagePart)}`;
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
