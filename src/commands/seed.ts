import {
  ChannelType,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";

type SeedChannel = {
  name: string;
  messages: string[];
};

const seedChannels: SeedChannel[] = [
  {
    name: "general",
    messages: [
      "Welcome to the test server!",
      "This is seeded test data.",
      "Feel free to use this channel for testing.",
    ],
  },
  {
    name: "announcements",
    messages: [
      "Important announcement #1",
      "The server seed command ran successfully.",
    ],
  },
  {
    name: "random",
    messages: [
      "This is a random test message.",
      "Another message for pagination and message-list testing.",
    ],
  },
];

export const seedCommand = {
  name: "seed",
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

      for (const seedChannel of seedChannels) {
        // Reuse an existing text channel with the same name if one exists.
        let channel = interaction.guild?.channels.cache.find(
          (existingChannel) =>
            existingChannel.type === ChannelType.GuildText &&
            existingChannel.name === seedChannel.name,
        ) as TextChannel | undefined;

        if (!channel) {
          channel = await interaction.guild?.channels.create({
            name: seedChannel.name,
            type: ChannelType.GuildText,
            reason: "Creating test seed data",
          });
        }

        for (const content of seedChannel.messages) {
          await channel?.send({ content });
        }

        if (channel) {
          createdChannels.push(channel);
        }
      }

      await interaction.editReply(
        `Seed complete. Created or reused ${createdChannels.length} channels and added test messages.`,
      );
    } catch (error) {
      console.error("Failed to seed server:", error);

      const message =
        error instanceof Error ? error.message : "Unknown error";

      await interaction.editReply(
        `Failed to seed the server: ${message}`,
      );
    }
  },
};
