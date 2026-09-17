import type { ChatInputCommandInteraction } from "discord.js";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsFolder = path.resolve(__dirname, "../../assets");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

export const randomImageCommand = {
  name: "random_image",
  description: "Sends a random image.",

  async execute(interaction: ChatInputCommandInteraction) {
    // This must happen before readdir() or other potentially slow work.
    await interaction.deferReply();

    try {
      const files = await readdir(assetsFolder);

      const images = files.filter((file) =>
        imageExtensions.has(path.extname(file).toLowerCase())
      );

      if (images.length === 0) {
        await interaction.editReply("No images were found.");
        return;
      }

      const randomImage =
        images[Math.floor(Math.random() * images.length)];

      const imagePath = path.join(assetsFolder, randomImage);

      await interaction.editReply({
        files: [
          {
            attachment: imagePath,
            name: randomImage,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to send random image:", error);

      // If the interaction was already acknowledged, then edit the deferred reply rather than calling reply() again
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("Failed to load an image.");
      } else {
        await interaction.reply("Failed to load an image.");
      }
    }
  },
};
