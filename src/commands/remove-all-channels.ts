import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export const removeAllChannelsCommand = {
  name: "remove_all_channels",
  description: "Deletes every channel and message on the server.",

  async execute(interaction: ChatInputCommandInteraction) {
    // Must be used inside a server.
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const channels = await interaction.guild.channels.fetch();

      let deleted = 0;
      let failed = 0;

      for (const channel of channels.values()) {
        if (!channel) continue;

        try {
          await channel.delete("Resetting configured test server");
          deleted++;
        } catch (error) {
          failed++;
          console.error(`Could not delete channel ${channel.id}`, error);
        }
      }

      await interaction.editReply(
        `Test server reset complete. Deleted ${deleted} channel(s)${
          failed ? `; ${failed} channel(s) failed` : ""
        }.`,
      );
    } catch (error) {
      console.error("Test server reset failed:", error);

      await interaction.editReply(
        "The test server reset failed. Check the bot's permissions and logs.",
      );
    }
  },
};
