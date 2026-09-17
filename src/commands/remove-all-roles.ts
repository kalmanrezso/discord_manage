import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";

export const removeAllRolesCommand = {
  name: "remove_all_roles",
  description: "Removes and deletes all manageable roles.",
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

    // Fetch/cache the guild's roles and select roles the bot can delete.
    const removableRoles = guild.roles.cache.filter(
      (role) =>
        role.id !== guild.id && // Exclude @everyone
        !role.managed && // Exclude integration/bot-managed roles
        role.editable, // Bot's highest role must be above this role
    );

    let removedAssignments = 0;
    let skippedMembers = 0;
    let deletedRoles = 0;
    let failedRoleDeletes = 0;

    // Remove the roles from members first.
    for (const member of members.values()) {
      const memberRoles = member.roles.cache.filter((role) =>
        removableRoles.has(role.id),
      );

      if (memberRoles.size === 0) {
        skippedMembers++;
        continue;
      }

      try {
        await member.roles.remove(
          memberRoles,
          "Required by the remove_all_roles command",
        );

        removedAssignments += memberRoles.size;
      } catch (error) {
        console.error(
          `Failed to remove roles from member ${member.user.tag}:`,
          error,
        );

        skippedMembers++;
      }
    }

    // Delete the roles themselves.
    for (const role of removableRoles.values()) {
      try {
        await role.delete("Required by the remove_all_roles command");
        deletedRoles++;
      } catch (error) {
        console.error(`Failed to delete role ${role.name} (${role.id}):`, error);
        failedRoleDeletes++;
      }
    }

    await interaction.editReply(
      [
        "Finished removing roles.",
        `Removed ${removedAssignments} role assignment(s).`,
        `Deleted ${deletedRoles} role(s).`,
        `Skipped ${skippedMembers} member(s).`,
        failedRoleDeletes > 0
          ? `Failed to delete ${failedRoleDeletes} role(s).`
          : null,
      ]
        .filter(Boolean)
        .join(" "),
    );
  },
};
