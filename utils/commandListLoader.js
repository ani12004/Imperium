import fs from 'fs';
import path from 'path';

let cachedCommands = null;

export function loadCommandList() {
    if (cachedCommands) return cachedCommands;

    const filePath = path.join(process.cwd(), 'filtered_commands.txt');

    if (!fs.existsSync(filePath)) {
        console.error("filtered_commands.txt not found at", filePath);
        return new Map();
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const categories = new Map();
    let currentCategory = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Check for category header: ### **Category Name (Count)**
        const categoryMatch = line.match(/^### \*\*(.*?)\*\*/);
        if (categoryMatch) {
            currentCategory = categoryMatch[1].replace(/\s*\(\d+\)?$/, '').trim(); // Remove count if present
            categories.set(currentCategory, []);
            continue;
        }

        // Check for command: name: description
        // Use first colon to separate name and description
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1 && currentCategory) {
            const name = line.substring(0, colonIndex).trim();
            const description = line.substring(colonIndex + 1).trim();

            categories.get(currentCategory).push({ name, description });
        }
    }

    cachedCommands = categories;
    return categories;
}
