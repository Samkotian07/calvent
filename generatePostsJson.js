import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Path to your posts folder (adjusted to the correct location)
const postsDir = path.join(process.cwd(), 'posts');  // Ensure 'posts' is in the root directory
const outputFile = path.join(process.cwd(), 'data', 'posts.json');

// Function to generate posts.json file
async function generatePostsJson() {
  try {
    // Ensure 'posts' directory exists
    const dirExists = await fs.stat(postsDir).catch(() => false);
    if (!dirExists) {
      console.error('Posts directory not found!');
      return;
    }

    // Read the contents of the posts directory
    const files = await fs.readdir(postsDir);

    // Filter only .md files and map them to an array with metadata
    const posts = await Promise.all(
      files
        .filter(file => file.endsWith('.md')) // Ensure only .md files
        .map(async (file) => {
          // Read the content of the .md file
          const filePath = path.join(postsDir, file);
          const fileContent = await fs.readFile(filePath, 'utf-8').catch(err => {
            console.error(`Error reading file ${file}: ${err.message}`);
            return ''; // If reading fails, return empty string to skip processing
          });

          if (!fileContent) {
            return null; // Skip invalid or empty files
          }

          // Use gray-matter to extract front matter and content
          const { data } = matter(fileContent);

          // Ensure front matter contains the necessary data
          if (!data.title) {
            console.warn(`No title in front matter for file: ${file}`);
          }

          // Create post metadata using front matter and assume image name is the same as the markdown filename
          return {
            file: path.posix.join('posts', file),  // Path to the .md file using forward slashes
            title: data.title || file.replace('.md', ''),  // Get title from front matter or fallback to filename
            featured_image: data.featured_image || path.posix.join('posts', file.replace('.md', '.jpg')), // Image assumed to match markdown filename
            date: data.date || null,  // Optional date field
          };
        })
    );

    // Filter out any null values caused by failed files
    const validPosts = posts.filter(post => post !== null);

    // Log the posts that are being written to posts.json
    console.log('Generated posts:', validPosts);

    // Write the posts array to posts.json
    await fs.writeFile(outputFile, JSON.stringify(validPosts, null, 2));
    console.log('posts.json has been generated!');
  } catch (err) {
    console.error('Error generating posts.json:', err);
  }
}

// Call the function to generate posts.json
generatePostsJson();
