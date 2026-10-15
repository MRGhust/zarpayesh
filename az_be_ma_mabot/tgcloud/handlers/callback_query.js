import { api } from 'sdk';
import { command } from '../lib/commands.js';
import { isAdmin } from '../lib/access.js';
import { getChat, listSubs } from '../lib/store.js';
export default async function(query) {
 const message = query.message;
 if (!message?.chat || !(await isAdmin(message.chat, query.from))) {
  await api.answerCallbackQuery({ callback_query_id: query.id, text: 'فقط مدیران گروه اجازه دارند.', show_alert: true }); return;
 }
 await api.answerCallbackQuery({ callback_query_id: query.id });
 const chat = await getChat(message.chat.id), [action, asset] = (query.data || '').split(':');
 let cmd;
 if (['pause', 'resume', 'help'].includes(action)) cmd = `/${action}`;
 else if (action === 'unit') cmd = `/unit ${chat.unit === 'rial' ? 'toman' : 'rial'}`;
 else if (action === 'silent') cmd = `/silent ${chat.silent ? 'off' : 'on'}`;
 else if (action === 'hourly') cmd = `/schedule ${asset} 60 ${asset === 'usd' ? 'on' : 'off'} 24`;
 else if (action === 'remove') cmd = `/unschedule ${asset}`;
 else if (action === 'chart') {
  const sub = (await listSubs(chat.id)).find(x => x.asset === asset);
  if (!sub) return;
  cmd = `/chart ${asset} ${sub.chart ? 'off' : 'on'} ${sub.hours}`;
 } else return;
 let result;
 try { result = await command({ ...message, from: query.from }, cmd); }
 catch { result = { text: 'خطایی در ذخیرهٔ تنظیمات رخ داد؛ /settings را دوباره باز کنید.' }; }
 if (result) await api.editMessageText({ chat_id: message.chat.id, message_id: message.message_id, ...result });
}
