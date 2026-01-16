import { DisTubeError, PlayableExtractorPlugin, Playlist, Song } from "distube";
import dargs from "dargs";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPlaylist = (i) => Array.isArray(i.entries);

export class YtDlpPlugin extends PlayableExtractorPlugin {
    constructor({ update = true, cookies } = {}) {
        super();
        this.cookies = cookies;
        if (update) {
            // We rely on the update logic from the base binary or just assume it's there/managed manually
            // For simplicity in this custom handler, we skip auto-download/update logic 
            // and assume yt-dlp is available in the path or node_modules
        }
    }

    validate() {
        return true;
    }

    // Helper to run yt-dlp
    async json(url, flags, options) {
        // Find yt-dlp executable
        // Trying to locate the one installed by @distube/yt-dlp or system
        let ytDlpPath = "yt-dlp";
        try {
            // Try to find the binary from the installed package
            const ytDlpPackage = await import("@distube/yt-dlp");
            // This is hacky because the package entry point might not expose the path directly in a clean way
            // So we will assume a standard path in node_modules if possible, or fallback to 'yt-dlp'
            ytDlpPath = path.resolve("node_modules/@distube/yt-dlp/bin/yt-dlp");
            if (process.platform === "win32") ytDlpPath += ".exe";
        } catch (e) {
            // Fallback
        }

        if (this.cookies) {
            flags.cookies = this.cookies;
        }

        // ADDED: User Agent to bypass simple bot checks
        flags.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

        const args = [url, ...dargs(flags, { useEquals: false })].filter(Boolean);

        return new Promise((resolve, reject) => {
            const process = spawn(ytDlpPath, args, options);
            let output = "";
            let errorOutput = "";

            process.stdout.on("data", (chunk) => { output += chunk; });
            process.stderr.on("data", (chunk) => { errorOutput += chunk; });

            process.on("close", (code) => {
                if (code === 0) {
                    try {
                        resolve(JSON.parse(output));
                    } catch (e) {
                        reject(new Error(`Invalid JSON output: ${output}`));
                    }
                } else {
                    reject(new Error(errorOutput || output));
                }
            });
            process.on("error", reject);
        });
    }

    async resolve(url, options) {
        const info = await this.json(url, {
            dumpSingleJson: true,
            noWarnings: true,
            // noCallHome: true, // REMOVED DEPRECATED FLAG
            preferFreeFormats: true,
            skipDownload: true,
            simulate: true,
            defaultSearch: 'auto' // Handle search strings too
        }).catch((e) => {
            throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
        });

        if (isPlaylist(info)) {
            if (info.entries.length === 0) throw new DisTubeError("YTDLP_ERROR", "The playlist is empty");
            return new Playlist(
                {
                    source: info.extractor,
                    songs: info.entries.map((i) => new YtDlpSong(this, i, options)),
                    id: info.id.toString(),
                    name: info.title,
                    url: info.webpage_url,
                    thumbnail: info.thumbnails?.[0]?.url
                },
                options
            );
        }
        return new YtDlpSong(this, info, options);
    }

    async getStreamURL(song) {
        if (!song.url) {
            throw new DisTubeError("YTDLP_PLUGIN_INVALID_SONG", "Cannot get stream url from invalid song.");
        }
        const info = await this.json(song.url, {
            dumpSingleJson: true,
            noWarnings: true,
            // noCallHome: true, // REMOVED DEPRECATED FLAG
            // preferFreeFormats: true, // REMOVED: Often causes incomplete playback with opus/webm
            skipDownload: true,
            simulate: true,
            format: "bestaudio/best" // Changed from ba/ba* to potentially more stable format
        }).catch((e) => {
            throw new DisTubeError("YTDLP_ERROR", `${e.stderr || e}`);
        });

        if (isPlaylist(info)) throw new DisTubeError("YTDLP_ERROR", "Cannot get stream URL of a entire playlist");
        return info.url;
    }

    getRelatedSongs() {
        return [];
    }
}

class YtDlpSong extends Song {
    constructor(plugin, info, options = {}) {
        super(
            {
                plugin,
                source: info.extractor,
                playFromSource: true,
                id: info.id,
                name: info.title || info.fulltitle,
                url: info.webpage_url || info.original_url,
                isLive: info.is_live,
                thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
                duration: info.is_live ? 0 : info.duration,
                uploader: {
                    name: info.uploader,
                    url: info.uploader_url
                },
                views: info.view_count,
                likes: info.like_count,
                dislikes: info.dislike_count,
                reposts: info.repost_count,
                ageRestricted: Boolean(info.age_limit) && info.age_limit >= 18
            },
            options
        );
    }
}
