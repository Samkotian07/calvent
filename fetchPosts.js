import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { convert } from "html-to-text";
import slugify from "slugify";
import matter from 'gray-matter';
import { fileURLToPath } from "url";

// Fix for `__dirname` in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "posts");
const API_URL =
  "https://crazy-haibt.173-209-53-178.plesk.page/wp-json/wp/v2/posts?_embed=wp:featuredmedia";

async function fetchAndStorePosts() {
  try {
    const { data: posts } = await axios.get(API_URL);
    await fs.ensureDir(BLOG_DIR);

    for (const post of posts) {
      console.log("Post Data:", JSON.stringify(post, null, 2)); // Debugging

      let imageUrl = "";
      if (
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      ) {
        imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
      } else {
        console.log(`No featured image found for post: ${post.slug}`);
      }

      const markdownContent = 
`---
title: "${post.title.rendered.replace(/"/g, '\\"')}" 
slug: "${post.slug}"
featured_image: "${imageUrl}"
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

fetchAndStorePosts();
