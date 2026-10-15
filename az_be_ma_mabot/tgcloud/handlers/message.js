import { api } from "sdk";
import { UserError } from "../lib/config.js";
import {
  PRIVATE_ACTIONS,
  PRIVATE_KEYBOARD,
  PRIVATE_WELCOME,
} from "../lib/private.js";
import { command } from "../lib/commands.js";
import { removeChat } from "../lib/store.js";
export default async function (message) {
  if (message.migrate_to_chat_id) {
    // Group migration changes the security boundary; reconfigure in the supergroup.
    await removeChat(message.chat.id);
    return;
  }
  const raw =
    message.chat.type === "private"
      ? PRIVATE_ACTIONS[message.text] || message.text
      : message.text;
  if (!raw?.startsWith("/")) {
    if (message.chat.type === "private" && message.text)
      await api.sendMessage({
        chat_id: message.chat.id,
        text: PRIVATE_WELCOME,
        reply_markup: PRIVATE_KEYBOARD,
      });
    return;
  }
  const addressed = raw.split(/\s/)[0].split("@")[1];
  if (addressed) {
    const me = await api.getMe();
    if (addressed.toLowerCase() !== me.username.toLowerCase()) return;
  }
  let result;
  try {
    result = await command(message, raw);
  } catch (error) {
    // Only application validation errors are exposed. SDK failures stay private.
    const text =
      error instanceof UserError
        ? error.message
        : "خطایی در پردازش رخ داد؛ کمی بعد دوباره امتحان کنید.";
    result = { text };
  }
  if (result)
    await api.sendMessage({
      chat_id: message.chat.id,
      ...(message.chat.type === "private" && !result.reply_markup
        ? { reply_markup: PRIVATE_KEYBOARD }
        : {}),
      ...result,
    });
}
