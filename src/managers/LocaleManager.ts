import { Manager } from './Manager';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonStore } from '../stores/commonStore';
import { NativeModules, Platform } from 'react-native';

import de from 'date-fns/locale/de';
import en from 'date-fns/locale/en';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';
import it from 'date-fns/locale/it';
import ja from 'date-fns/locale/ja';
import ko from 'date-fns/locale/ko';
import nb from 'date-fns/locale/nb';
import pt from 'date-fns/locale/pt';
import ru from 'date-fns/locale/ru';
import th from 'date-fns/locale/th';
import { format } from 'date-fns';

const DEFAULT_LOCALE = 'en';

const LOCALES = {
  de: {
    translation: require('../locales/de.json'),
    dateFns: de,
  },

  en: {
    translation: require('../locales/en.json'),
    dateFns: en,
  },

  es: {
    translation: require('../locales/es.json'),
    dateFns: es,
  },

  fr: {
    translation: require('../locales/fr.json'),
    dateFns: fr,
  },

  it: {
    translation: require('../locales/it.json'),
    dateFns: it,
  },

  ja: {
    translation: require('../locales/ja.json'),
    dateFns: ja,
  },

  ko: {
    translation: require('../locales/ko.json'),
    dateFns: ko,
  },

  nb: {
    translation: require('../locales/nb.json'),
    dateFns: nb,
  },

  pt: {
    translation: require('../locales/pt.json'),
    dateFns: pt,
  },

  ru: {
    translation: require('../locales/ru.json'),
    dateFns: ru,
  },

  th: {
    translation: require('../locales/th.json'),
    dateFns: th,
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

  get currentFnsLocale() {
    return (LOCALES as any)[commonStore.state.currentLocale].dateFns;
  }

  public formatDate(date: Date, f: string) {
    return format(date, f, { locale: this.currentFnsLocale });
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
