import { MAIN_PROCESS_ID } from '../shared';
import { MessageCenter } from './MessageCenterRenderer';

const messageCenter = new MessageCenter();

export { MessageCenter, messageCenter, MAIN_PROCESS_ID };
