import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "📜 View History", data: "view_history", order: 50 });

const composer = new Composer<Ctx>();
composer.callbackQuery("view_history", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("No standup history yet. History will appear here after the first daily run completes.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
