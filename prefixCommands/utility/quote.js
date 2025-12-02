import { AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage, registerFont } from "canvas";

// Helper to wrap text
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

export default {
    name: "quote",
    description: "Generate a quote image.",
    async execute(message, args) {
        try {
            console.log("Starting quote command...");
            let targetMessage = message;
            let content = args.join(" ");
            let author = message.author;

            // Check for reply
            if (message.reference) {
                try {
                    const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    content = repliedMessage.content || "*Image/Attachment*";
                    author = repliedMessage.author;
                } catch (e) {
                    // Ignore if fetch fails
                }
            }

            if (!content) return message.reply("Please provide text or reply to a message to quote!");

            // Canvas Setup
            console.log("Creating canvas...");
            const width = 1000;
            const height = 400; // Dynamic height? For now fixed.
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background (Dark Gradient)
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, '#1a1a1a'); // Dark Grey
            gradient.addColorStop(1, '#000000'); // Black
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Load Avatar
            console.log("Loading avatar...");
            const avatarURL = author.displayAvatarURL({ extension: 'png', size: 512 });
            try {
                const avatar = await loadImage(avatarURL);

                // Draw Circular Avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, 200, 125, 0, Math.PI * 2, true); // Center (200, 200), Radius 125
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 75, 75, 250, 250);
                ctx.restore();
            } catch (e) {
                console.error("Failed to load avatar:", e);
            }

            // Text Styling
            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 40px Sans'; // Default font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Wrap Text
            const maxTextWidth = 500; // Reduced to ensure no overlap
            const lines = wrapText(ctx, content, maxTextWidth);
            const lineHeight = 50;
            const startY = 200 - ((lines.length - 1) * lineHeight) / 2;

            // Draw Text (Centered in the right portion)
            const textX = 675; // Moved slightly right
            lines.forEach((line, i) => {
                ctx.fillText(line, textX, startY + (i * lineHeight));
            });

            // Draw Name
            ctx.font = 'bold 30px Sans';
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(`- ${author.username.toUpperCase()}`, textX, startY + (lines.length * lineHeight) + 30);

            // Create Attachment
            console.log("Creating attachment...");
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'quote.png' });

            await message.channel.send({ files: [attachment] });
            console.log("Quote sent successfully.");
        } catch (error) {
            console.error("Quote Command Error:", error);
            message.reply("❌ An error occurred while generating the quote.");
        }
    },
};
