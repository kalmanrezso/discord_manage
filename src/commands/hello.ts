import type { ChatInputCommandInteraction } from "discord.js";

export const helloCommand = {
  name: "hello",
  description: "Says hello.",

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Hello world");
  }
};
