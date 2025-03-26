const fs = require("fs");
const path = require("path");
const marked = require("marked");

const inputFolder = "./blog";  // Folder where .md files are stored
const outputFolder = "./public/index.html";  // Folder where .html files will be saved

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Read all markdown files from the data folder
fs.readdirSync(inputFolder).forEach((file) => {
  if (path.extname(file) === ".md") {
    const filePath = path.join(inputFolder, file);
    const markdownContent = fs.readFileSync(filePath, "utf8");
    const htmlContent = marked(markdownContent);

    // Wrap it in a basic HTML template
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${file.replace(".md", "")}</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <article>${htmlContent}</article>
      </body>
      </html>
    `;

    const outputFilePath = path.join(outputFolder, file.replace(".md", ".html"));
    fs.writeFileSync(outputFilePath, fullHtml, "utf8");
    console.log(`Converted ${file} -> ${file.replace(".md", ".html")}`);
  }
});
