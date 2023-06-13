import { MAIN_PROCESS_ID } from '../shared';
import { MessageCenter } from './MessageCenterMain';

import './mainProcess';

const messageCenter = new MessageCenter();

export { MessageCenter, messageCenter, MAIN_PROCESS_ID };
