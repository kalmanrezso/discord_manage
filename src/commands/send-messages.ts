import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const sendMessagesCommand = {
  name: "send_messages",
  description: "Sends messages to every text channel.",

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const channels = await interaction.guild.channels.fetch();

    const textChannels = channels.filter(
      (channel): channel is TextChannel =>
        channel instanceof TextChannel &&
        channel.isTextBased() &&
        channel.isSendable(),
    );

    for (let i = 0; i < 100; ++i) {
      let sent = 0;
      let failed = 0;

      for (const channel of textChannels.values()) {
        try {
          await channel.send("Message");
          ++sent;
        } catch {
          // The bot may lack permission to send in this channel
          ++failed;
        }
      }

      await interaction.editReply(
        `Message sent to ${sent} text channel${sent === 1 ? "" : "s"}.` +
          (failed > 0 ? ` Failed in ${failed} channel${failed === 1 ? "" : "s"}.` : ""),
      );
    }

  },
};
