import { api } from 'sdk';
export async function isAdmin(chat, user) {
 if (!user || user.is_bot) return false;
 if (chat.type === 'private') return chat.id === user.id;
 try { const member = await api.getChatMember({ chat_id: chat.id, user_id: user.id }); return ['creator', 'administrator'].includes(member.status); }
 catch { return false; }
}
