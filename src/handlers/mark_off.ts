import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "🚫 Mark Off", data: "mark_off", order: 70 });

const composer = new Composer<Ctx>();
composer.callbackQuery("mark_off", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("No active standup. You may update your DND preference from team settings.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
