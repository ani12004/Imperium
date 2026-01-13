import { PermissionsBitField, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import emojis from "../../utils/emojis.js";

// Helper to get image URL from message
const getImageFromMessage = (message, args) => {
    const attachment = message.attachments.first();
    if (attachment) return attachment.url;

    const mention = message.mentions.users.first();
    if (mention) return mention.displayAvatarURL({ extension: 'png', size: 1024 });

    // Check reply
    if (message.reference) {
        // Fetch reference logic would be here, but for now let's rely on direct args or attachment
        // In a real bot resolving references reliably needs async fetch usually
    }

    return args[1] || message.author.displayAvatarURL({ extension: 'png', size: 1024 });
};

export default {
    name: "media",
    description: "Image manipulation commands.",
    permissions: [PermissionsBitField.Flags.SendMessages],
    aliases: ["image"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply(`❌ Usage: ,media [invert/grayscale/pixelate/blur/sepia] [image/user]`);
        }

        const imageUrl = getImageFromMessage(message, args);
        if (!imageUrl) return message.reply("❌ Could not find an image.");

        message.channel.sendTyping();

        try {
            const image = await loadImage(imageUrl);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');

            // Draw original
            ctx.drawImage(image, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            switch (subcommand) {
                case "invert":
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];     // r
                        data[i + 1] = 255 - data[i + 1]; // g
                        data[i + 2] = 255 - data[i + 2]; // b
                    }
                    break;

                case "grayscale":
                case "greyscale":
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i] = avg;
                        data[i + 1] = avg;
                        data[i + 2] = avg;
                    }
                    break;

                case "sepia":
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
                        data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
                        data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
                    }
                    break;

                case "pixelate":
                    // Simple pixelate using scaling (no pixel manipulation loop needed for simple effect)
                    // But here lets just skip complex loop for brevity in this example
                    // Canvas scaling trick:
                    const sampleSize = 10;
                    ctx.drawImage(image, 0, 0, image.width / sampleSize, image.height / sampleSize);
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(canvas, 0, 0, image.width / sampleSize, image.height / sampleSize, 0, 0, image.width, image.height);
                    // Re-get data not needed since we drew directly
                    break;

                case "blur":
                    // Simple blur is hard manually, normally use a library or gl
                    // Placeholder for now
                    return message.reply("Blur effect requires advanced processing libraries.");

                default:
                    return message.reply(`❌ Unknown effect: ${subcommand}`);
            }

            // Put data back if we manipulated pixels
            if (subcommand !== "pixelate") {
                ctx.putImageData(imageData, 0, 0);
            }

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `edited-${subcommand}.png` });
            return message.channel.send({ files: [attachment] });

        } catch (error) {
            console.error(error);
            return message.reply("❌ Failed to process image. It might be too large or invalid.");
        }
    }
};
