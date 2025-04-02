import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Paths
const postsDir = path.join(process.cwd(), 'posts');  // Markdown files directory
const imagesDir = path.join(process.cwd(), 'image'); // Image folder
const outputFile = path.join(process.cwd(), 'data', 'posts.json');

async function generatePostsJson() {
  try {
    // Ensure 'posts' directory exists
    const dirExists = await fs.stat(postsDir).catch(() => false);
    if (!dirExists) {
      console.error('Posts directory not found!');
      return;
    }

    // Read markdown files
    const files = await fs.readdir(postsDir);

    // Read image files
    const imageFiles = await fs.readdir(imagesDir).catch(() => []);
    const imageSet = new Set(imageFiles); // Use a Set for quick lookups

    // Process markdown files
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md')) // Ensure only .md files
        .map(async (file) => {
          const filePath = path.join(postsDir, file);
          const fileContent = await fs.readFile(filePath, 'utf-8').catch(err => {
            console.error(`Error reading file ${file}: ${err.message}`);
            return ''; 
          });

          if (!fileContent) return null; // Skip invalid or empty files

          // Extract front matter
          const { data } = matter(fileContent);
          const fileNameWithoutExt = file.replace('.md', '');
          
          // Determine featured image
          let featuredImage = data.featured_image;
          if (!featuredImage) {
            const matchingImage = imageFiles.find(img =>
              img.startsWith(fileNameWithoutExt) // Match based on filename
            );
            if (matchingImage) {
              featuredImage = path.posix.join('image', matchingImage);
            }
          }

          return {
            file: path.posix.join('posts', file),
            title: data.title || fileNameWithoutExt,
            date: data.date || null, // Include date from front matter
            featured_image: featuredImage || null, // If no match, keep it null
          };
        })
    );

    // Filter out any null values
    const validPosts = posts.filter(post => post !== null);

    // Write to posts.json
    await fs.writeFile(outputFile, JSON.stringify(validPosts, null, 2));
    console.log('posts.json has been generated with images and dates!');
  } catch (err) {
    console.error('Error generating posts.json:', err);
  }
}

// Run the function
generatePostsJson();
