import { Manager } from './Manager';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { commonStore } from '../stores/commonStore';

const RESOURCES = {
  en: {
    translation: require('../locales/en.json'),
  },
};

class LocaleManager extends Manager {
  public translator: i18n.TFunction | null = null;

  public t(key: string, values?: any): string {
    if (this.translator) {
      return this.translator(key, values);
    }

    return ' ';
  }

  public reset(): void {}

  public async init(): Promise<any> {
    this.translator = await i18n.use(initReactI18next).init({
      resources: RESOURCES,
      lng: commonStore.state.currentLocale,
      fallbackLng: commonStore.state.currentLocale,
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
