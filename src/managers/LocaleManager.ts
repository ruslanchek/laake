import { Manager } from './Manager';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonStore } from '../stores/commonStore';
import { NativeModules, Platform } from 'react-native';

const DEFAULT_LOCALE = 'en';

const LOCALES = {
  de: {
    translation: require('../locales/de.json'),
  },

  en: {
    translation: require('../locales/en.json'),
  },

  es: {
    translation: require('../locales/es.json'),
  },

  fr: {
    translation: require('../locales/fr.json'),
  },

  hi: {
    translation: require('../locales/hi.json'),
  },

  it: {
    translation: require('../locales/it.json'),
  },

  ja: {
    translation: require('../locales/ja.json'),
  },

  ko: {
    translation: require('../locales/ko.json'),
  },

  nb: {
    translation: require('../locales/nb.json'),
  },

  pt: {
    translation: require('../locales/pt.json'),
  },

  ru: {
    translation: require('../locales/ru.json'),
  },

  th: {
    translation: require('../locales/th.json'),
  },

  uk: {
    translation: require('../locales/uk.json'),
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
    locale = locale.substring(0, 2);

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
    const locale = this.getSystemLocale();
    console.log(locale);

    const localeFiltered = this.filterLocale(locale);

    commonStore.setState({
      currentLocale: localeFiltered,
    });

    this.translator = await i18n.use(initReactI18next).init({
      resources: LOCALES,
      lng: localeFiltered,
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
