function addFeed() {
    const newFeedUrl = document.getElementById('feedInput').value;
    const category = document.getElementById('categoryInput').value;
    
    if (newFeedUrl && !feeds.some(feed => feed.url === newFeedUrl)) {
        const feedTitle = prompt("Ingrese un título para este feed:", "Nuevo Feed");
        const newFeed = { url: newFeedUrl, title: feedTitle || "Nuevo Feed", category: category };
        feeds.push(newFeed);
        saveFeed();
        document.getElementById('feedInput').value = '';
        document.getElementById('categoryInput').value = '';
        fetchFeed(newFeed.url, newFeed.title, newFeed.category);
        updateCategories();
        updateFeedList();
    } else {
        document.getElementById('errorMessage').textContent = 'El feed ya está agregado o la URL es inválida.';
    }
}

function modifyFeed(index) {
    const feed = feeds[index];
    const newTitle = prompt("Ingrese el nuevo título para este feed:", feed.title);
    const newCategory = prompt("Ingrese la nueva categoría para este feed:", feed.category);
    
    if (newTitle !== null) {
        feed.title = newTitle || feed.title;
    }
    if (newCategory !== null) {
        feed.category = newCategory;
    }
    
    saveFeed();
    document.getElementById('feedsContainer').innerHTML = '';
    updateCategories();
    updateFeedList();
    feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
}

function removeFeed(index) {
    if (confirm(`¿Estás seguro de que deseas eliminar el feed "${feeds[index].title}"?`)) {
        feeds.splice(index, 1);
        saveFeed();
        document.getElementById('feedsContainer').innerHTML = '';
        updateCategories();
        updateFeedList();
        feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
    }
}

function updateFeedList() {
    const feedList = document.getElementById('feedList');
    feedList.innerHTML = '<h2>Feeds cargados</h2>';
    
    feeds.forEach((feed, index) => {
        const feedItem = document.createElement('div');
        feedItem.className = 'feedItem';
        feedItem.innerHTML = `
            <span>${feed.title} (${feed.url}) ${feed.category ? `- ${feed.category}` : ''}</span>
            <div class="feed-actions">
                <button onclick="modifyFeed(${index})">Modificar</button>
                <button onclick="removeFeed(${index})">Eliminar</button>
            </div>
        `;
        feedList.appendChild(feedItem);
    });
}
