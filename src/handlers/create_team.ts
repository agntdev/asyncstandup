import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "➕ Create Team", data: "create_team", order: 10 });

const composer = new Composer<Ctx>();

composer.callbackQuery("create_team", async (ctx) => {
  await ctx.answerCallbackQuery();
  // NOTE: admin auth check TODO in owner controls (see feedback #7)
  ctx.session.step = "awaiting_team_name";
  await ctx.editMessageText("Team name?", {
    reply_markup: inlineKeyboard([[inlineButton("Cancel", "menu:main")]]),
  });
});

composer.on("message:text", async (ctx, next) => {
  const step = ctx.session.step;
  if (step !== "awaiting_team_name" && step !== "awaiting_channel") return next();
  try {
    if (step === "awaiting_team_name") {
      const name = ctx.message.text.trim();
      if (!name) {
        await ctx.reply("Please enter a non-empty team name.");
        return;
      }
      const adminId = ctx.from?.id ?? 0;
      ctx.session.teamDraft = { name, admin_id: adminId, timezone: "UTC" };
      ctx.session.step = "awaiting_channel";
      await ctx.reply("Provide the team channel ID for digests.");
      return;
    }
    if (step === "awaiting_channel") {
      const channelId = ctx.message.text.trim();
      if (!channelId || !channelId.startsWith("-100")) {
        await ctx.reply("Invalid channel ID. Provide a Telegram supergroup/channel ID starting with -100.");
        return;
      }
      const draft = ctx.session.teamDraft;
      if (!draft) {
        await ctx.reply("Session expired. Restart with Create Team.");
        ctx.session.step = undefined;
        return;
      }
      ctx.session.step = undefined;
      ctx.session.teamDraft = undefined;
      await ctx.reply(`Team "${draft.name}" created. Channel set to ${channelId}. (Team will be persisted with Redis in full impl.)`);
      return;
    }
  } catch (err) {
    console.error("[create_team] handler failure:", err);
    await ctx.reply("Could not complete. Please try again.");
  }
});

export default composer;
