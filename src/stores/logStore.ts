import { Store } from 'react-stores';
import { ILogEvent } from '../managers/LogManager';

interface LogStoreState {
  loadingEvents: boolean;
  events: Map<string, ILogEvent>;
  lastLoadedDate: number;
}

const initialState: LogStoreState = {
  loadingEvents: false,
  events: new Map<string, ILogEvent>(),
  lastLoadedDate: Infinity,
};

export const logStore = new Store<LogStoreState>(initialState);
