import { api } from 'sdk';
import { getChat, removeChat } from '../lib/store.js';
export default async function(update) {
 const status = update.new_chat_member.status;
 if (['left', 'kicked'].includes(status)) { await removeChat(update.chat.id); return; }
 await getChat(update.chat.id);
 if (['left', 'kicked'].includes(update.old_chat_member.status)) await api.sendMessage({ chat_id: update.chat.id,
  text: 'زرپایش اضافه شد. مدیر گروه با /settings تنظیمات را باز کند و با /help راهنما را ببیند. برای کنترل دسترسی تنظیمات، بات را مدیر کنید. تا ثبت برنامه، پیام خودکار ارسال نمی‌شود.' });
}
