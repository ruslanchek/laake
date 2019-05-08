import { Store } from 'react-stores';
import { ICourse } from '../common/course';
import { ITakeTime } from '../common/take';
import { ILogEvent } from '../managers/LogManager';

interface LogStoreState {
  loadingEvents: boolean;
  events: Map<string, ILogEvent>;
}

const initialState: LogStoreState = {
  loadingEvents: false,
  events: new Map<string, ILogEvent>(),
};

export const logStore = new Store<LogStoreState>(initialState);
