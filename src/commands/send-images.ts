import {
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsFolder = path.resolve(__dirname, "../../assets");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

export const sendRandomImagesCommand = {
  name: "send_random_images",
  description: "Sends random images to every text channel.",

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const files = await readdir(assetsFolder);

      const images = files.filter((file) =>
        imageExtensions.has(path.extname(file).toLowerCase()),
      );

      if (images.length === 0) {
        await interaction.editReply("No images were found.");
        return;
      }

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
          // A new random image is selected for each channel.
          const randomImage =
            images[Math.floor(Math.random() * images.length)];

          const imagePath = path.join(assetsFolder, randomImage);

          try {
            await channel.send({
              files: [
                {
                  attachment: imagePath,
                  name: randomImage,
                },
              ],
            });

            sent++;
          } catch (error) {
            console.error(`Failed to send image to ${channel.name}:`, error);
            failed++;
          }
        }
        await interaction.editReply(
          `Random images sent to ${sent} text channel${sent === 1 ? "" : "s"}.` +
            (failed > 0
              ? ` Failed in ${failed} channel${failed === 1 ? "" : "s"}.`
              : ""),
        );
      }
    } catch (error) {
      console.error("Failed to send random images:", error);

      await interaction.editReply("Failed to load or send the images.");
    }
  },
};
