import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "➕ Create Team", data: "create_team", order: 10 });

const composer = new Composer<Ctx>();

const back = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

composer.callbackQuery("create_team", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Enter team name.", {
    reply_markup: inlineKeyboard([[inlineButton("Cancel", "menu:main")]]),
  });
  // For input, wait for text in session flow (stub for full impl). Full flow requires ForceReply + text handler.
});

export default composer;
