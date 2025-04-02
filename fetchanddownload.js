import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { convert } from "html-to-text";
import slugify from "slugify";
import { fileURLToPath } from "url";

// Fix for `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "posts");
const IMAGE_DIR = path.join(__dirname, "image");
const API_URL = "https://crazy-haibt.173-209-53-178.plesk.page/wp-json/wp/v2/posts?_embed=wp:featuredmedia";

async function fetchAndStorePosts() {
    try {
        // Ensure directories exist
        await fs.ensureDir(BLOG_DIR);
        await fs.ensureDir(IMAGE_DIR);

        // Fetch posts from WordPress
        const { data: posts } = await axios.get(API_URL);
        if (posts.length === 0) {
            console.log("No posts found in WordPress API.");
            return;
        }

        // Store the latest slugs
        const latestSlugs = new Set(posts.map(post => slugify(post.slug, { lower: true, strict: true })));

        // Remove posts that no longer exist in WordPress
        const existingFiles = await fs.readdir(BLOG_DIR);
        await Promise.all(existingFiles.map(async (file) => {
            const slug = path.basename(file, ".md");
            if (!latestSlugs.has(slug)) {
                await fs.remove(path.join(BLOG_DIR, file));
                console.log(`Deleted: ${file} (No longer exists in WordPress)`);
            }
        }));

        // Process and save each post
        await Promise.all(posts.map(async (post) => {
            let imageUrl = "";
            let localImagePath = "";

            // Fetch and download image
            if (post._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
                imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
                localImagePath = await downloadImage(imageUrl);
            }

            // Create Markdown content
            const markdownContent = `---
title: "${post.title.rendered.replace(/"/g, '\\"')}"
slug: "${post.slug}"
featured_image: "${localImagePath}"
date: "${post.date}"
---
${convert(post.content.rendered)}`;

            // Save post as Markdown
            const safeSlug = slugify(post.slug, { lower: true, strict: true });
            const filePath = path.join(BLOG_DIR, `${safeSlug}.md`);
            await fs.writeFile(filePath, markdownContent);
            console.log(`Saved: ${safeSlug}.md`);
        }));

    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

async function downloadImage(imageUrl) {
    try {
        const fileName = path.basename(imageUrl);
        const filePath = path.join(IMAGE_DIR, fileName);

        // Skip downloading if the image already exists
        if (await fs.pathExists(filePath)) {
            console.log(`Image already exists: ${fileName}`);
            return `./image/${fileName}`;
        }

        const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.writeFile(filePath, Buffer.from(data));
        console.log(`Downloaded: ${fileName}`);

        return `./image/${fileName}`;
    } catch (error) {
        console.error(`Error downloading image ${imageUrl}:`, error);
        return "";
    }
}

// Run the function to fetch posts
fetchAndStorePosts();
