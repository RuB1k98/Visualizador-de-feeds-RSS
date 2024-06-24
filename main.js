// Arreglo para almacenar los feeds RSS
let feeds = [];
// Conjunto para almacenar las categorías únicas de los feeds
let categories = new Set();

// Función que se ejecuta cuando la ventana se carga
window.onload = loadFeeds;

// Función para cargar los feeds almacenados en el localStorage al inicio
function loadFeeds() {
    // Mostrar el indicador de carga
    document.getElementById('loader').style.display = 'block';
    // Limpiar mensajes de error y contenido de feeds
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('feedsContainer').innerHTML = '';
    
    // Obtener los feeds almacenados en localStorage
    const savedFeeds = localStorage.getItem('rssFeeds');
    if (savedFeeds) {
        // Parsear los feeds almacenados
        feeds = JSON.parse(savedFeeds);
        // Actualizar las categorías disponibles
        updateCategories();
        // Actualizar la lista de feeds mostrados
        updateFeedList();
        // Cargar cada feed almacenado
        feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
    }
    
    // Ocultar el indicador de carga al finalizar
    document.getElementById('loader').style.display = 'none';
}

// Función para guardar los feeds en localStorage
function saveFeed() {
    localStorage.setItem('rssFeeds', JSON.stringify(feeds));
}

// Función para filtrar los feeds mostrados según las categorías seleccionadas
function filterFeeds() {
    const selectedCategories = Array.from(document.querySelectorAll('#categoryFilters input:checked:not(#selectAll)')).map(input => input.value);
    const feedSections = document.querySelectorAll('.feed-section');
    feedSections.forEach(section => {
        const category = section.getAttribute('data-category');
        if (selectedCategories.includes(category)) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Actualizar el estado del checkbox "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.checked = selectedCategories.length === categories.size;
}