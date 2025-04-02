document.addEventListener("DOMContentLoaded", () => {
    const postsPerPage = 9; // Number of posts to display per page
    let currentPage = 1;
    let posts = [];
  
    function displayPosts(page) {
      const start = (page - 1) * postsPerPage;
      const end = start + postsPerPage;
      const paginatedPosts = posts.slice(start, end);
  
      const postsContainer = document.getElementById("blog-posts");
      postsContainer.innerHTML = "";
  
      paginatedPosts.forEach(post => {
        // Extract and format the date correctly
        let formattedDate = post.date.length >= 12 ? post.date.slice(0, 10) : post.date; 
  
        const postCard = document.createElement("div");
        postCard.classList.add("blog-card");
        postCard.innerHTML = `
          <img src="${post.featured_image}" alt="" class="featured-image">
          <div class="blog-info">
            <p>${formattedDate}</p>
            <h3><a href="blog-single.html?post=${encodeURIComponent(post.file)}">${post.title}</a></h3>
            <a href="blog-single.html?post=${encodeURIComponent(post.file)}" class="read-more">Read More</a>
          </div>
        `;
        postsContainer.appendChild(postCard);
      });
  
      updatePagination();
    }
  
    function updatePagination() {
      const totalPages = Math.ceil(posts.length / postsPerPage);
      const paginationContainer = document.querySelector(".block-27 ul");
      paginationContainer.innerHTML = "";
  
      paginationContainer.innerHTML += `<li><a href="#" onclick="changePage(${Math.max(1, currentPage - 1)})">&lt;</a></li>`;
  
      for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `<li class="${i === currentPage ? 'active' : ''}">
          <a href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
      }
  
      paginationContainer.innerHTML += `<li><a href="#" onclick="changePage(${Math.min(totalPages, currentPage + 1)})">&gt;</a></li>`;
    }
  
    window.changePage = (page) => {
      if (page < 1 || page > Math.ceil(posts.length / postsPerPage)) return;
      currentPage = page;
      displayPosts(currentPage);
    };
  
    fetch("data/posts.json")
      .then(response => response.json())
      .then(data => {
        posts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayPosts(currentPage);
      })
      .catch(error => console.error("Error loading posts:", error));
  });
  