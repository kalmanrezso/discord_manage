import {
  REST,
  Routes
} from "discord.js";

import { env } from "./config/env.js";

import { helloCommand } from "./commands/hello.js";
import { seedCommand } from "./commands/seed.js";

const rest = new REST({ version: "10" }).setToken(env.discordToken);

await rest.put(
  Routes.applicationCommands(env.discordClientId),
  {
    body: [helloCommand, seedCommand]
  }
);

console.log("Successfully registered slash commands.");
