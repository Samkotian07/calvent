fetch('https://crazy-haibt.173-209-53-178.plesk.page/wp-json/wp/v2/posts?_embed=wp:featuredmedia', {
    method: 'GET',
    headers: {
        'Authorization': 'Basic ' + btoa('your_username:your_application_password'),
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));