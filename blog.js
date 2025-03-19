const API_URL = "http://calvent-blog/wp-json/wp/v2/posts?_fields=id,title,excerpt,slug,date,_links&_embed";

async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

function displayPosts(posts) {
    const blogContainer = document.getElementById("blog-container");
    blogContainer.innerHTML = ""; // Clear previous content

    posts.forEach(post => {
        const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "default-image.jpg";
        const postHTML = `
            <div class="blog-card">
                <img src="${featuredMedia}" alt="${post.title.rendered}" />
                <div class="blog-info">
                    <p>${new Date(post.date).toDateString()}</p>
                    <h3>${post.title.rendered}</h3>
                    <p>${post.excerpt.rendered}</p>
                    <a href="blog-single.html?slug=${post.slug}" class="read-more">Read More</a>
                </div>
            </div>
        `;
        blogContainer.innerHTML += postHTML;
    });
}

// Run fetchPosts on page load
document.addEventListener("DOMContentLoaded", fetchPosts);
// The fetchPosts.js file uses the Fetch API to retrieve blog post data from a WordPress REST API endpoint. The displayPosts function generates HTML content for each post and appends it to the blog-container element in the DOM. The script runs fetchPosts when the DOM content is loaded. This script can be included in an HTML file to display WordPress blog posts on a web page.


