import { StringSelectMenuOptionBuilder } from 'discord.js';

try {
    const builder = new StringSelectMenuOptionBuilder()
        .setLabel('Test')
        .setValue('test')
        .setEmoji('<:test:123456789>');
    console.log("Success with <::>");
} catch (e) {
    console.error("Failed with <::>:", e.message);
}

try {
    const builder = new StringSelectMenuOptionBuilder()
        .setLabel('Test')
        .setValue('test')
        .setEmoji('123456789');
    console.log("Success with ID");
} catch (e) {
    console.error("Failed with ID:", e.message);
}

try {
    const builder = new StringSelectMenuOptionBuilder()
        .setLabel('Test')
        .setValue('test')
        .setEmoji('🛡️');
    console.log("Success with Unicode");
} catch (e) {
    console.error("Failed with Unicode:", e.message);
}
