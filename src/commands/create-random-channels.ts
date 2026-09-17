import {
  ChannelType,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";

export const createRandomChannelsCommand = {
  name: "create_random_channels",
  description: "Creates test channels and messages.",

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const createdChannels: TextChannel[] = [];

      for (let i = 0; i < 100; ++i) {
        const channel = await interaction.guild?.channels.create({
          name: `Channel${i}`,
          type: ChannelType.GuildText,
          reason: "Creating test channels",
        });
        await channel?.send({ content: "Test message" });

        if (channel) {
          createdChannels.push(channel);
        }
      }

      await interaction.editReply(
        `Seed complete. Created or reused ${createdChannels.length} channels and added test messages.`,
      );
    } catch (error) {
      console.error("Failed to create channels and messages:", error);

      const message =
        error instanceof Error ? error.message : "Unknown error";

      await interaction.editReply(
        `Failed to create channels and messages: ${message}`,
      );
    }
  },
};
