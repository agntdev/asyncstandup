import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "➕ Create Team", data: "create_team", order: 10 });

const composer = new Composer<Ctx>();

composer.callbackQuery("create_team", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.from) {
    await ctx.reply("This action requires a user context.");
    return;
  }
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
      const adminId = ctx.from?.id;
      if (!adminId) {
        await ctx.reply("Could not identify user.");
        ctx.session.step = undefined;
        return;
      }
      ctx.session.teamDraft = { name, admin_id: adminId, timezone: "UTC" };
      ctx.session.step = "awaiting_channel";
      await ctx.reply("Provide the team channel ID for digests.");
      return;
    }
    if (step === "awaiting_channel") {
      const channelId = ctx.message.text.trim();
      const parsed = Number(channelId);
      if (!channelId || isNaN(parsed) || parsed >= 0) {
        await ctx.reply("Invalid channel ID. Provide a Telegram group or channel ID (negative number).");
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
      await ctx.reply(`Team "${draft.name}" created. Channel set to ${channelId}.`);
      return;
    }
  } catch (err) {
    console.error("[create_team] handler failure:", err);
    await ctx.reply("Could not complete. Please try again.");
  }
});

export default composer;
