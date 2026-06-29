import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "❓ Edit Questions", data: "edit_questions", order: 40 });

const composer = new Composer<Ctx>();
composer.callbackQuery("edit_questions", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Using default standup questions. Admins can customize later.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});
export default composer;
