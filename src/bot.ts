import {
  CacheType,
  Client,
  Collection,
  GatewayIntentBits,
  Interaction,
  type ChatInputCommandInteraction
} from "discord.js";

import { env } from "./config/env.js";

import { helloCommand } from "./commands/hello.js";
import { seedCommand } from "./commands/seed.js";
import { backupCommand } from "./commands/backup-messages.js";
import { assignRoleCommand } from "./commands/assign-role.js";
import { removeAllRolesCommand } from "./commands/remove-all-roles.js";
import { sendMessagesCommand } from "./commands/send-messages.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = new Collection<
  string,
  {
    name: string;
    description: string;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
  }
>();

commands.set(helloCommand.name, helloCommand);
commands.set(seedCommand.name, seedCommand);
commands.set(backupCommand.name, backupCommand);
commands.set(assignRoleCommand.name, assignRoleCommand);
commands.set(removeAllRolesCommand.name, removeAllRolesCommand);
commands.set(sendMessagesCommand.name, sendMessagesCommand);

client.once("clientReady", (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `Failed to execute /${interaction.commandName}:`,
      error
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp("Something went wrong.");
    } else {
      await interaction.reply("Something went wrong.");
    }
  }
});

export async function startBot() {
  await client.login(env.discordToken);
}
