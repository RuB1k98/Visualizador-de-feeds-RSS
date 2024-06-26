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
        // Actualizar la lista de feeds cargados abajo
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
    let visibleSections = 0;

    feedSections.forEach(section => {
        const category = section.getAttribute('data-category');
        const feedContent = section.querySelector('.feed-content'); // Obtener el contenedor de contenido del feed

        // Verificar si hay elementos visibles dentro del feedContent
        const visibleItems = feedContent.querySelectorAll('.card:not(.hidden)');
        
        if (selectedCategories.includes(category) && visibleItems.length > 0) {
            section.style.display = '';
            visibleSections++;
        } else {
            section.style.display = 'none';
        }
    });
    
    // Mostrar u ocultar el mensaje "Aquí no hay nada"
    const noContentMessage = document.getElementById('noContentMessage');
    if (visibleSections === 0) {
        noContentMessage.style.display = 'block';
    } else {
        noContentMessage.style.display = 'none';
    }
    
    // Actualizar el estado del checkbox "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.checked = selectedCategories.length === categories.size;
}


