import { Store } from 'react-stores';
import { string } from 'prop-types';
import { VARIABLES } from '../common/variables';
import { startOfDay } from 'date-fns';

export interface CommonStoreState {
  appReady: boolean;
  today: Date;
  currentLocale: string;
}

const initialState: CommonStoreState = {
  appReady: false,
  today: startOfDay(new Date()),
  currentLocale: VARIABLES.DEFAULT_LOCALE,
};

export const commonStore = new Store<CommonStoreState>(initialState);
