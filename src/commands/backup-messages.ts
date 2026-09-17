import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { writeFile } from "node:fs/promises";

type BackupMessage = {
  id: string;
  channelId: string;
  channelName: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatarUrl: string | null;
  };
  content: string;
  createdAt: string;
  editedAt: string | null;
  attachments: {
    id: string;
    name: string | null;
    url: string;
    contentType: string | null;
    size: number;
  }[];
  embeds: unknown[];
  replyTo: string | null;
};

export const backupCommand = {
  name: "backup",
  description: "Backs up messages from all accessible server channels.",

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const backup: {
      guild: {
        id: string;
        name: string;
      };
      createdAt: string;
      channels: Record<string, BackupMessage[]>;
    } = {
      guild: {
        id: guild.id,
        name: guild.name,
      },
      createdAt: new Date().toISOString(),
      channels: {},
    };

    const channels = await guild.channels.fetch();

    let channelCount = 0;
    let messageCount = 0;

    for (const [, channel] of channels) {
      if (!channel) continue;

      // Includes regular text channels and announcement channels.
      if (
        channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildAnnouncement
      ) {
        continue;
      }

      if (
        !channel
          .permissionsFor(guild.members.me!)
          ?.has(PermissionFlagsBits.ViewChannel) ||
        !channel
          .permissionsFor(guild.members.me!)
          ?.has(PermissionFlagsBits.ReadMessageHistory)
      ) {
        continue;
      }

      const messages: BackupMessage[] = [];
      let before: string | undefined;

      while (true) {
        const batch = await channel.messages.fetch({
          limit: 100,
          ...(before ? { before } : {}),
          cache: false,
        });

        if (batch.size === 0) break;

        for (const message of batch.values()) {
          messages.push({
            id: message.id,
            channelId: channel.id,
            channelName: channel.name,
            author: {
              id: message.author.id,
              username: message.author.username,
              discriminator: message.author.discriminator,
              avatarUrl: message.author.displayAvatarURL(),
            },
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            editedAt: message.editedAt?.toISOString() ?? null,
            attachments: [...message.attachments.values()].map(
              (attachment) => ({
                id: attachment.id,
                name: attachment.name,
                url: attachment.url,
                contentType: attachment.contentType,
                size: attachment.size,
              }),
            ),
            embeds: message.embeds.map((embed) => embed.toJSON()),
            replyTo: message.reference?.messageId ?? null,
          });

          messageCount++;
        }

        // Messages are returned newest-first. The oldest ID becomes
        // the cursor for the next request.
        before = batch.last()?.id;

        if (!before || batch.size < 100) break;
      }

      // Store chronologically instead of newest-first.
      messages.reverse();

      backup.channels[channel.id] = messages;
      channelCount++;

      await interaction.editReply(
        `Backing up **${channelCount}** channels — **${messageCount}** messages so far...`,
      );
    }

    const filename = `backup-${guild.id}-${Date.now()}.json`;

    await writeFile(filename, JSON.stringify(backup, null, 2), "utf8");

    await interaction.editReply({
      content: `Backup complete: ${channelCount} channels and ${messageCount} messages.`,
      files: [
        {
          attachment: filename,
          name: filename,
        },
      ],
    });
  },
};
