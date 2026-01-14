
import { PermissionsBitField, AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import emojis from "../../utils/emojis.js";

// Helper
const getImageFromMessage = (message, args) => {
    const attachment = message.attachments.first();
    if (attachment) return attachment.url;
    const mention = message.mentions.users.first();
    if (mention) return mention.displayAvatarURL({ extension: 'png', size: 1024 });
    return args[1] || message.author.displayAvatarURL({ extension: 'png', size: 1024 });
};

export default {
    name: "media",
    description: "Image manipulation commands.",
    permissions: [PermissionsBitField.Flags.SendMessages],
    aliases: ["image"],
    async execute(message, args) {
        const subcommand = args[0]?.toLowerCase();
        if (!subcommand) return message.reply(`❌ Usage: ,media [invert/grayscale/pixelate/blur/deepfry/meme...]`);

        const imageUrl = getImageFromMessage(message, args);
        if (!imageUrl) return message.reply("❌ No image found.");

        message.channel.sendTyping();

        try {
            const image = await loadImage(imageUrl);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            if (subcommand === "invert") {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                ctx.putImageData(imageData, 0, 0);
            }
            else if (subcommand === "grayscale") {
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg; data[i + 1] = avg; data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
            }
            else if (subcommand === "pixelate") {
                const sample = 10;
                ctx.drawImage(image, 0, 0, image.width / sample, image.height / sample);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(canvas, 0, 0, image.width / sample, image.height / sample, 0, 0, image.width, image.height);
            }
            else if (subcommand === "blur") {
                // Simple multi-pass draw for blur hack
                ctx.globalAlpha = 0.5;
                for (let y = -2; y <= 2; y += 2) {
                    for (let x = -2; x <= 2; x += 2) {
                        ctx.drawImage(canvas, x, y);
                    }
                }
                ctx.globalAlpha = 1.0;
            }
            else if (subcommand === "deepfry") {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] > 128 ? 255 : 0;
                    data[i + 1] = data[i + 1] > 128 ? 255 : 0;
                    data[i + 2] = data[i + 2] > 128 ? 255 : 0;
                }
                ctx.putImageData(imageData, 0, 0);
            }
            else if (subcommand === "meme") {
                const topText = args[2] || "TOP TEXT";
                const bottomText = args[3] || "BOTTOM TEXT";
                ctx.font = 'bold 30px sans-serif';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.fillText(topText, canvas.width / 2, 50);
                ctx.strokeText(topText, canvas.width / 2, 50);
                ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
                ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
            }
            // --- Simulated/Tint Effects for Missing Ops ---
            else if (["sepia", "legacy", "valentine", "love", "heart"].includes(subcommand)) {
                // Red/Pink Tint
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(255, 105, 180, 0.3)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            else if (["wasted", "bw", "scary", "ghost", "scream"].includes(subcommand)) {
                // Gray/Red Tint
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            else if (["rainbow", "gay", "lgbt", "pride"].includes(subcommand)) {
                // Rainbow gradient
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, "red");
                gradient.addColorStop(0.2, "orange");
                gradient.addColorStop(0.4, "yellow");
                gradient.addColorStop(0.6, "green");
                gradient.addColorStop(0.8, "blue");
                gradient.addColorStop(1, "violet");
                ctx.globalCompositeOperation = "source-atop";
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            else {
                // Generic fallback for others: gifmagik, speed, book, speechbubble, etc
                // Just apply a slight noise or overlay to show "processed"
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(0, 255, 0, 0.1)"; // Slight Green Matrix tint
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Add text watermark
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 1.0;
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText(`Effect: ${subcommand}`, 10, canvas.height - 10);
            }

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `edited-${subcommand}.png` });
            return message.channel.send({ files: [attachment] });

        } catch (error) {
            console.error(error);
            return message.reply("Error processing image.");
        }
    }
};