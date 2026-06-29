import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "👤 Add Member", data: "add_member", order: 20 });

const composer = new Composer<Ctx>();
composer.callbackQuery("add_member", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Add Member is not yet available.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
