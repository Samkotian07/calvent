const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "blog");
const API_URL =
  "http://calvent-blog/wp-json/wp/v2/posts?_fields=id,title,content,slug,date,_links,_embedded&" +
  "_embed=wp:featuredmedia";

async function fetchAndStorePosts() {
  try {
    const { data: posts } = await axios.get(API_URL);
    await fs.ensureDir(BLOG_DIR);

    for (const post of posts) {
      console.log("Post Data:", JSON.stringify(post, null, 2)); // Log post details

      let imageUrl = "";
      if (
        post._embedded &&
        post._embedded["wp:featuredmedia"] &&
        post._embedded["wp:featuredmedia"][0] &&
        post._embedded["wp:featuredmedia"][0].source_url
      ) {
        imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
      } else {
        console.log(`No featured image found for post: ${post.slug}`);
      }

      const markdownContent = `---
title: ${post.title.rendered}
slug: ${post.slug}
image: ${imageUrl}
date: ${post.date}
---
${post.content.rendered.replace(/<\/?[^>]+(>|$)/g, "")}`;

      const filePath = path.join(BLOG_DIR, `${post.slug}.md`);
      await fs.writeFile(filePath, markdownContent);
      console.log(`Saved: ${post.slug}.md`);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

fetchAndStorePosts();
