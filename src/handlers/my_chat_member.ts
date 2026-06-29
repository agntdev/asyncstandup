import { Composer } from "grammy";
import type { Ctx } from "../bot.js";

const composer = new Composer<Ctx>();
composer.on("my_chat_member", async (ctx) => {
  const update = ctx.myChatMember;
  if (update.new_chat_member.status === "kicked" || update.new_chat_member.status === "left") {
    console.warn(`[edge] Bot removed/left chat ${update.chat.id}`);
  }
});
export default composer;
