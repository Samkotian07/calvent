const API_URL = "http://calvent-blog/wp-json/wp/v2/posts?_fields=id,title,content,slug,date,_links&_embed";

// Get slug from URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

async function fetchPost() {
    if (!slug) {
        document.getElementById("post-container").innerHTML = "<h2>Error: No post slug provided.</h2>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}&slug=${slug}`);
        const posts = await response.json();

        if (posts.length > 0) {
            displayPost(posts[0]); // WordPress API returns an array, we take the first item
        } else {
            document.getElementById("post-container").innerHTML = "<h2>Post not found.</h2>";
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        document.getElementById("post-container").innerHTML = "<h2>Error loading post.</h2>";
    }
}

function displayPost(post) {
    document.getElementById("post-container").innerHTML = `
        <h1>${post.title.rendered}</h1>
        <p>${new Date(post.date).toDateString()}</p>
        <img src="${post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "default-image.jpg"}" alt="${post.title.rendered}" />
        <div>${post.content.rendered}</div>
        <a href="index.html">Back to Blog</a>
    `;
}

// Fetch post when the page loads
document.addEventListener("DOMContentLoaded", fetchPost);
// The fetchSinglePost.js script fetches a single blog post from a WordPress REST API endpoint using the Fetch API. It extracts the post slug from the URL query parameters and displays the post content on the page. The displayPost function generates HTML content for the post and updates the post-container element in the DOM. The script runs fetchPost when the DOM content is loaded. This script can be included in an HTML file to display a single WordPress blog post on a web page.