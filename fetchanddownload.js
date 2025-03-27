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

// Ensure directories exist
await fs.ensureDir(BLOG_DIR);
await fs.ensureDir(IMAGE_DIR);

async function fetchAndStorePosts() {
    try {
        const { data: posts } = await axios.get(API_URL);

        for (const post of posts) {
            let imageUrl = "";
            let localImagePath = "";

            if (post._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
                imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
                localImagePath = await downloadImage(imageUrl);
            } else {
                console.log(`No featured image found for post: ${post.slug}`);
            }

            const markdownContent = `---
title: "${post.title.rendered.replace(/"/g, '\\"')}"
slug: "${post.slug}"
featured_image: "${localImagePath}"
date: "${post.date}"
---
${convert(post.content.rendered)}`;

            const safeSlug = slugify(post.slug, { lower: true, strict: true });
            const filePath = path.join(BLOG_DIR, `${safeSlug}.md`);
            await fs.writeFile(filePath, markdownContent);
            console.log(`Saved: ${safeSlug}.md`);
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

async function downloadImage(imageUrl) {
    try {
        const fileName = path.basename(imageUrl);
        const filePath = path.join(IMAGE_DIR, fileName);

        const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.writeFile(filePath, Buffer.from(data));

        console.log(`Downloaded: ${fileName}`);
        return `./image/${fileName}`;
    } catch (error) {
        console.error(`Error downloading image ${imageUrl}:`, error);
        return "";
    }
}

fetchAndStorePosts();
