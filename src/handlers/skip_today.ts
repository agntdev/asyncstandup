import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "⏭️ Skip Today", data: "skip_today", order: 60 });

const composer = new Composer<Ctx>();
composer.callbackQuery("skip_today", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Skip Today is not yet available.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
