import { Manager } from './Manager';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonStore } from '../stores/commonStore';
import { NativeModules, Platform } from 'react-native';
import dayjs from 'dayjs';

import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/nb';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/th';

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

  public formatDate(date: Date, f: string) {
    return dayjs(date)
      .locale(commonStore.state.currentLocale)
      .format(f);
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
