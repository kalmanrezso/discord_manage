import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  Role,
} from "discord.js";

export const assignRoleCommand = {
  name: "assign_role",
  description: 'Creates the "abc" role if needed and assigns it to all users.',
  default_member_permissions: PermissionFlagsBits.ManageRoles.toString(),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const guild = interaction.guild;
    const roleName = "abc";

    let role: Role | undefined = guild.roles.cache.find(
      (existingRole) => existingRole.name === roleName,
    );

    if (!role) {
      role = await guild.roles.create({
        name: roleName,
        colors: {
          primaryColor: "DarkGreen"
        },
        mentionable: true,
        reason: "Added by the assign_role command",
      });
    }

    let members;
    try {
      members = await guild.members.fetch({
        time: 120_000,
      });
    } catch (error) {
      console.error("Failed to fetch guild members:", error);

      await interaction.editReply(
        "I could not retrieve the server members. Check the Server Members Intent and try again.",
      );
      return;
    }

    let assigned = 0;
    let skipped = 0;

    for (const member of members.values()) {
      if (member.roles.cache.has(role.id)) {
        ++skipped;
        continue;
      }

      try {
        await member.roles.add(role, "Required by the assign_role command");
        ++assigned;
      } catch {
        ++skipped;
      }
    }

    await interaction.editReply(
      `Role **${role.name}** is ready. Assigned it to ${assigned} member(s); skipped ${skipped}.`,
    );
  },
};
