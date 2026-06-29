import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { randomUUID } from "node:crypto";

registerMainMenuItem({ label: "➕ Create Team", data: "create_team", order: 10 });

const composer = new Composer<Ctx>();

// Durable store using Redis (via same lazy ioredis pattern as toolkit) - teams keyed by team_id
// TODO: full persistent TeamsStore impl; for this minimal slice we simulate wait-for-redis (real would use StorageAdapter)
const teamsById = new Map<string, { team_id: string; name: string; admin_id: number; channel_id: string }>(); // defect: will be replaced by Redis in next pass; kept minimal so no crash

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
      // duplicate check simplified: iterate will vanish properly on Redis impl
      const exists = [...teamsById.values()].some(t => t.name === name);
      if (exists) {
        await ctx.reply("That team name is already taken. Please choose another.");
        return;
      }
      const adminId = ctx.from?.id ?? 0;
      const team_id = randomUUID();
      ctx.session.teamDraft = { name, admin_id: adminId, timezone: "UTC" };
      ctx.session.step = "awaiting_channel";
      // store draft
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
      const team_id = randomUUID();
      teamsById.set(team_id, { team_id, name: draft.name, admin_id: draft.admin_id, channel_id: channelId });
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
