const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const MarkdownIt = require("markdown-it");

const app = express();
const PORT = 3000;
const BLOG_DIR = path.join(__dirname, "blog");
const md = new MarkdownIt();

// Serve static files (CSS, images, etc.)
app.use(express.static("public"));

// List all Markdown files as blog posts
app.get("/", async (req, res) => {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const posts = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const slug = file.replace(".md", "");
        return `<li><a href="/post/${slug}">${slug}</a></li>`;
      })
      .join("");

    res.send(`<h1>Blog Posts</h1><ul>${posts}</ul>`);
  } catch (error) {
    res.status(500).send("Error reading blog directory");
  }
});

// Render individual Markdown files as HTML
app.get("/post/:slug", async (req, res) => {
  try {
    const filePath = path.join(BLOG_DIR, `${req.params.slug}.md`);
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).send("Post not found");
    }

    const content = await fs.readFile(filePath, "utf-8");
    const htmlContent = md.render(content);

    res.send(`
      <html>
        <head><title>${req.params.slug}</title></head>
        <body>
          <a href="/">⬅ Back</a>
          ${htmlContent}
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error loading post");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// The server.js file uses the Express.js framework to create a simple web server. The server serves static files from the public directory and lists all Markdown files in the blog directory as blog posts. It also renders individual Markdown files as HTML when accessed via the /post/:slug route.