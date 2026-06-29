import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "➕ Create Team", data: "create_team", order: 10 });

const composer = new Composer<Ctx>();

// In-memory teams for duplicate check + persistent (in prod use RedisSessionStorage keyed by name)
const teamsStore = new Map<string, { team_id: string; admin_id: number; timezone: string }>();

composer.callbackQuery("create_team", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_team_name";
  await ctx.editMessageText("Team name?", {
    reply_markup: inlineKeyboard([[inlineButton("Cancel", "menu:main")]]),
  });
});

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step !== "awaiting_team_name") return next();
  try {
    const name = ctx.message.text.trim();
    if (!name) {
      await ctx.reply("Please enter a non-empty team name.");
      return;
    }
    if (teamsStore.has(name)) {
      await ctx.reply("That team name is already taken. Please choose another.");
      return;
    }
    const adminId = ctx.from?.id ?? 0;
    teamsStore.set(name, { team_id: name.toLowerCase().replace(/\s+/g, "-"), admin_id: adminId, timezone: "UTC" });
    ctx.session.teamDraft = { name, admin_id: adminId, timezone: "UTC" };
    ctx.session.step = "awaiting_channel";
    console.log("[create_team] persisted team name", { name, adminId });
    await ctx.reply("Provide the team channel ID for digests.");
  } catch (err) {
    console.error("[create_team] handler failure:", err);
    await ctx.reply("Could not save team name. Please try again.");
  }
});

export default composer;
