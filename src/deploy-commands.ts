import {
  REST,
  Routes
} from "discord.js";

import { env } from "./config/env.js";

import { helloCommand } from "./commands/hello.js";
import { seedCommand } from "./commands/seed.js";
import { backupCommand } from "./commands/backup-messages.js";
import { assignRoleCommand } from "./commands/assign-role.js";
import { removeAllRolesCommand } from "./commands/remove-all-roles.js";
import { sendMessagesCommand } from "./commands/send-messages.js";
import { removeAllChannelsCommand } from "./commands/remove-all-channels.js";

const rest = new REST({ version: "10" }).setToken(env.discordToken);

await rest.put(
  Routes.applicationCommands(env.discordClientId),
  {
    body: [
      helloCommand,
      seedCommand,
      backupCommand,
      assignRoleCommand,
      removeAllRolesCommand,
      sendMessagesCommand,
      removeAllChannelsCommand
    ]
  }
);

console.log("Successfully registered slash commands.");
