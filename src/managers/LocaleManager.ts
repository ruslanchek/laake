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
  public t!: i18n.TFunction;

  public reset(): void {}

  public async init(): Promise<any> {
    this.t = await i18n.use(initReactI18next).init({
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

    return Promise.resolve();
  }
}

export const localeManager = new LocaleManager();
