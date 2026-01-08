import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefixDir = path.join(__dirname, '../prefixCommands');
const slashDir = path.join(__dirname, '../slashCommands');

let commands = [];

// Helper to extract data
function extractData(content, type) {
    let name = 'Unknown';
    let description = 'No description provided.';
    let usage = 'No usage provided.';
    let perms = 'Everyone'; // Default to Everyone
    let args = 'none';

    if (type === 'prefix') {
        // Prefix regex
        const descMatch = content.match(/description:\s*['"](.+?)['"]/);
        if (descMatch) description = descMatch[1];

        const usageMatch = content.match(/usage:\s*['"](.+?)['"]/);
        if (usageMatch) usage = usageMatch[1];

        // Permission handling for prefix commands
        // Check for array: permissions: [ ... ]
        const permArrayMatch = content.match(/permissions:\s*\[(.*?)\]/s);
        if (permArrayMatch) {
            const inner = permArrayMatch[1];
            // Check for PermissionsBitField.Flags.X
            const bitfieldMatches = [...inner.matchAll(/PermissionsBitField\.Flags\.([A-Za-z]+)/g)];
            if (bitfieldMatches.length > 0) {
                perms = [...new Set(bitfieldMatches.map(m => m[1]))].join(', ');
            } else if (inner.trim().length > 0) {
                // Maybe strings?
                perms = inner.replace(/['"]/g, '').trim();
            }
        } else {
            // Check for string: permissions: "..."
            const permStringMatch = content.match(/permissions:\s*['"](.+?)['"]/);
            if (permStringMatch && permStringMatch[1] !== 'None') perms = permStringMatch[1];
        }

        // Parse args from usage
        if (usage !== 'No usage provided.' && usage.includes(' ')) {
            const parts = usage.split(' ');
            if (parts.length > 1) args = parts.slice(1).join(' ');
        }
    } else {
        // Slash regex
        const nameMatch = content.match(/\.setName\s*\(\s*["'](.+?)["']\s*\)/);
        if (nameMatch) name = nameMatch[1];

        const descMatch = content.match(/\.setDescription\s*\(\s*["'](.+?)["']\s*\)/);
        if (descMatch) description = descMatch[1];

        // Try to find permissions in execute block
        const permMatches = [...content.matchAll(/PermissionsBitField\.Flags\.([A-Za-z]+)/g)];
        if (permMatches.length > 0) {
            const p = [...new Set(permMatches.map(m => m[1]))];
            perms = p.join(', ');
        }

        if (content.includes('.add')) args = 'Slash Options';
    }

    return { description, usage, perms, args, name };
}

// Process directories
function processDir(dir, type) {
    if (!fs.existsSync(dir)) return;
    const categories = fs.readdirSync(dir);

    categories.forEach(category => {
        const catPath = path.join(dir, category);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));

            files.forEach(file => {
                const content = fs.readFileSync(path.join(catPath, file), 'utf8');
                let cmdName = file.replace('.js', '');

                const data = extractData(content, type);

                // DEBUG LOGGING
                if (file.includes('cuddle')) {
                    console.log(`DEBUG: Processing ${file} (${type})`);
                    console.log(`DEBUG: Initial cmdName: ${cmdName}`);
                    console.log(`DEBUG: Extracted name: ${data.name}`);
                }

                if (type === 'slash' && data.name !== 'Unknown') cmdName = data.name;

                if (file.includes('cuddle')) {
                    console.log(`DEBUG: Final cmdName: ${cmdName}`);
                }

                commands.push({
                    ...data,
                    name: cmdName,
                    category: category,
                    type: type
                });
            });
        }
    });
}

processDir(prefixDir, 'prefix');
processDir(slashDir, 'slash');

// Generate HTML
let htmlOutput = '';

commands.forEach(cmd => {
    // Determine badge style
    let badgeClass = 'none';
    if (cmd.perms.toLowerCase().includes('admin') || cmd.perms.toLowerCase().includes('manage') || cmd.perms.toLowerCase().includes('ban') || cmd.perms.toLowerCase().includes('kick')) badgeClass = 'admin';
    else if (cmd.perms !== 'Everyone') badgeClass = 'highlight';

    // Prefix for copy
    const prefix = cmd.type === 'prefix' ? ',' : '/';

    htmlOutput += `
        <div class="cmd-card-ref" data-category="${cmd.category}">
            <div class="cmd-card-header">
                <div class="cmd-card-title">${prefix}${cmd.name}</div>
                <i class="far fa-copy cmd-copy-icon" onclick="navigator.clipboard.writeText('${prefix}${cmd.name}')"></i>
            </div>
            <div class="cmd-card-desc">${cmd.description}</div>
            
            <div class="cmd-section-label">Arguments</div>
            <div class="cmd-section-value">
                <span class="cmd-pill ${cmd.args !== 'none' ? 'highlight' : 'none'}">${cmd.args}</span>
            </div>

            <div class="cmd-section-label">Permissions</div>
            <div class="cmd-section-value">
                <span class="cmd-pill ${badgeClass}">${cmd.perms}</span>
            </div>
        </div>
    `;
});

// Read commands.html
const htmlPath = path.join(__dirname, '../website/commands.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const templateStart = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commands - Imperium</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>

<body>
    <!-- Navbar -->
    <nav class="navbar">
        <div class="container nav-content">
            <a href="index.html" class="logo">
                <i class="fas fa-robot text-accent"></i>
                Imperium
            </a>
            <div class="nav-links">
                <a href="index.html#features" class="nav-link">Features</a>
                <a href="commands.html" class="nav-link" style="color: white;">Commands</a>
                <a href="index.html#premium" class="nav-link">Premium</a>
                <a href="index.html#support" class="nav-link">Support</a>
            </div>
            <a href="#" class="btn btn-primary">Add to Discord</a>
        </div>
    </nav>

    <!-- Content -->
    <section class="section" style="padding-top: 120px;">
        <div class="container">
            
            <!-- Header -->
            <div class="cmd-page-header">
                <div class="cmd-page-title">
                    <i class="fas fa-terminal text-accent"></i> Commands
                </div>
                <div class="cmd-search-wrapper">
                    <div class="cmd-search-label">search</div>
                    <div class="cmd-search-container-ref">
                         <input type="text" class="cmd-search-input-ref" placeholder="Search commands...">
                         <i class="fas fa-search cmd-search-icon-ref"></i>
                    </div>
                </div>
            </div>

            <!-- Category Nav -->
            <div class="cmd-category-nav">
                <button class="cmd-cat-pill active" data-cat="all">
                    <i class="fas fa-layer-group"></i> All
                    <span class="cmd-cat-count">${commands.length}</span>
                </button>
                <button class="cmd-cat-pill" data-cat="moderation">
                    <i class="fas fa-gavel"></i> Moderation
                    <span class="cmd-cat-count">${commands.filter(c => c.category === 'moderation').length}</span>
                </button>
                <button class="cmd-cat-pill" data-cat="config">
                    <i class="fas fa-cog"></i> Config
                    <span class="cmd-cat-count">${commands.filter(c => c.category === 'config').length}</span>
                </button>
                <button class="cmd-cat-pill" data-cat="social">
                    <i class="fas fa-heart"></i> Social
                    <span class="cmd-cat-count">${commands.filter(c => c.category === 'social').length}</span>
                </button>
                <button class="cmd-cat-pill" data-cat="utility">
                    <i class="fas fa-tools"></i> Utility
                    <span class="cmd-cat-count">${commands.filter(c => c.category === 'utility').length}</span>
                </button>
                <button class="cmd-cat-pill" data-cat="voicemaster">
                    <i class="fas fa-microphone"></i> Voice
                    <span class="cmd-cat-count">${commands.filter(c => c.category === 'voicemaster').length}</span>
                </button>
            </div>

            <!-- Commands Grid -->
            <div class="commands-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">`;

const templateEnd = `
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2025 Imperium. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        const searchInput = document.querySelector('.cmd-search-input-ref');
        const categoryBtns = document.querySelectorAll('.cmd-cat-pill');
        const commandCards = document.querySelectorAll('.cmd-card-ref');

        // Search Filter
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            commandCards.forEach(card => {
                const name = card.querySelector('.cmd-card-title').textContent.toLowerCase();
                const desc = card.querySelector('.cmd-card-desc').textContent.toLowerCase();
                if (name.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Category Filter
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                categoryBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                const category = btn.getAttribute('data-cat');
                
                commandCards.forEach(card => {
                    if (category === 'all') {
                        card.style.display = 'flex';
                    } else {
                        const cardCategory = card.getAttribute('data-category');
                        if (cardCategory === category) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>`;

const finalHtml = templateStart + htmlOutput + templateEnd;
fs.writeFileSync(htmlPath, finalHtml);
console.log('Successfully updated commands.html with all commands.');
