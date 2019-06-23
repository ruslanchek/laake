import { Manager } from './Manager';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonStore } from '../stores/commonStore';
import { NativeModules, Platform } from 'react-native';

const DEFAULT_LOCALE = 'en';
const LOCALES = {
  en: {
    translation: require('../locales/en.json'),
  },
};

class LocaleManager extends Manager {
  public translator: i18n.TFunction | null = null;

  public getSystemLocale(): string {
    if (Platform.OS === 'ios') {
      return NativeModules.SettingsManager.settings.AppleLocale;
    } else {
      return NativeModules.I18nManager.localeIdentifier;
    }
  }

  public filterLocale(locale: string): string {
    if ((LOCALES as any)[locale]) {
      return locale;
    } else {
      return DEFAULT_LOCALE;
    }
  }

  public t(key: string, values?: any): string {
    if (this.translator) {
      return this.translator(key, values);
    }

    return ' ';
  }

  public reset(): void {}

  public async init(): Promise<any> {
    this.translator = await i18n.use(initReactI18next).init({
      resources: LOCALES,
      lng: commonStore.state.currentLocale,
      fallbackLng: DEFAULT_LOCALE,
      keySeparator: '.',
      interpolation: {
        escapeValue: false,
      },
      react: {
        wait: true,
      },
    });
  }
}

export const localeManager = new LocaleManager();
