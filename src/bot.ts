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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
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
