// feed_management.js

// Función para añadir un nuevo feed
function addFeed() {
    // Obtiene la URL y la categoría del nuevo feed de los inputs
    const newFeedUrl = document.getElementById('feedInput').value;
    const category = document.getElementById('categoryInput').value;
    
    // Comprueba si la URL no está vacía y no existe ya en la lista de feeds
    if (newFeedUrl && !feeds.some(feed => feed.url === newFeedUrl)) {
        // Pide al usuario un título para el feed
        const feedTitle = prompt("Ingrese un título para este feed:", "Nuevo Feed");
        
        // Crea un nuevo objeto feed y lo añade a la lista de feeds
        const newFeed = { url: newFeedUrl, title: feedTitle || "Nuevo Feed", category: category };
        feeds.push(newFeed);
        
        // Guarda los feeds actualizados (presumiblemente en localStorage)
        saveFeed();
        
        // Limpia los inputs
        document.getElementById('feedInput').value = '';
        document.getElementById('categoryInput').value = '';
        
        // Obtiene y muestra el nuevo feed
        fetchFeed(newFeed.url, newFeed.title, newFeed.category);
        
        // Actualiza las categorías y la lista de feeds en la UI
        updateCategories();
        updateFeedList();
    } else {
        // Muestra un mensaje de error si el feed ya existe o la URL es inválida
        document.getElementById('errorMessage').textContent = 'El feed ya está agregado o la URL es inválida.';
    }
}

// Función para modificar un feed existente
function modifyFeed(index) {
    // Obtiene el feed a modificar
    const feed = feeds[index];
    
    // Pide al usuario el nuevo título y categoría
    const newTitle = prompt("Ingrese el nuevo título para este feed:", feed.title);
    const newCategory = prompt("Ingrese la nueva categoría para este feed:", feed.category);
    
    // Actualiza el título si el usuario ingresó uno nuevo
    if (newTitle !== null) {
        feed.title = newTitle || feed.title;
    }
    
    // Actualiza la categoría si el usuario ingresó una nueva
    if (newCategory !== null) {
        feed.category = newCategory;
    }
    
    // Guarda los feeds actualizados
    saveFeed();
    
    // Limpia el contenedor de feeds
    document.getElementById('feedsContainer').innerHTML = '';
    
    // Actualiza las categorías y la lista de feeds en la UI
    updateCategories();
    updateFeedList();
    
    // Vuelve a obtener y mostrar todos los feeds
    feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
}

// Función para eliminar un feed
function removeFeed(index) {
    // Pide confirmación al usuario antes de eliminar
    if (confirm(`¿Estás seguro de que deseas eliminar el feed "${feeds[index].title}"?`)) {
        // Elimina el feed de la lista
        feeds.splice(index, 1);
        
        // Guarda los feeds actualizados
        saveFeed();
        
        // Limpia el contenedor de feeds
        document.getElementById('feedsContainer').innerHTML = '';
        
        // Actualiza las categorías y la lista de feeds en la UI
        updateCategories();
        updateFeedList();
        
        // Vuelve a obtener y mostrar todos los feeds
        feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
    }
}

// Función para actualizar la lista de feeds en la UI
function updateFeedList() {
    const feedList = document.getElementById('feedList');
    feedList.innerHTML = `
        <details>
            <summary>Feeds cargados</summary>
            <div id="feedItems"></div>
        </details>
    `;
    
    const feedItems = document.getElementById('feedItems');
    
    // Crea un elemento en la lista para cada feed
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
        feedItems.appendChild(feedItem);
    });
}
