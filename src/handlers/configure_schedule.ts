import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "⏰ Configure Schedule", data: "configure_schedule", order: 30 });

const composer = new Composer<Ctx>();
composer.callbackQuery("configure_schedule", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Configure Schedule is not yet available.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
