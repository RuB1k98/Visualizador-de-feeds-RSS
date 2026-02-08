// Arreglo para almacenar los feeds RSS
let feeds = [];
// Conjunto para almacenar las categorías únicas de los feeds
let categories = new Set();

// Función que se ejecuta cuando la ventana se carga
window.onload = function () {
    loadFeeds();

    // Toggle settings menu
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = document.getElementById('settingsMenu');
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('settingsMenu');
        const button = document.getElementById('settingsButton');
        if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && !button.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
};

// Función para cargar los feeds almacenados en el localStorage al inicio
async function loadFeeds() {
    // Mostrar el indicador de carga
    document.getElementById('loader').style.display = 'block';
    // Limpiar mensajes de error y contenido de feeds
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('feedsContainer').innerHTML = '';

    // Obtener los feeds almacenados en localStorage
    const savedFeeds = localStorage.getItem('rssFeeds');
    if (savedFeeds) {
        feeds = JSON.parse(savedFeeds);
        // Initialize originalIndex if missing
        feeds.forEach((feed, index) => {
            if (typeof feed.originalIndex === 'undefined') {
                feed.originalIndex = index;
            }
        });

        // Apply saved sort order
        const savedSort = localStorage.getItem('rssSortOrder') || 'loadOrder';
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = savedSort;
        }

        if (savedSort === 'alphabetical') {
            feeds.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            feeds.sort((a, b) => (a.originalIndex || 0) - (b.originalIndex || 0));
        }

        // Actualizar las categorías disponibles
        updateCategories();
        // Actualizar la lista de feeds cargados abajo
        // Actualizar la lista de feeds cargados abajo
        updateFeedList();

        // Cargar cada feed almacenado (Wait for all to finish to ensure we can sort validly)
        await Promise.all(feeds.map(feed => fetchFeed(feed.url, feed.title, feed.category)));

        // Ensure final order is correct
        window.sortFeeds();
    }

    // Ocultar el indicador de carga al finalizar
    // Ocultar el indicador de carga al finalizar
    document.getElementById('loader').style.display = 'none';
}

// Global function to sort feeds
window.sortFeeds = function () {
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect.value;
    localStorage.setItem('rssSortOrder', sortBy);

    if (sortBy === 'alphabetical') {
        feeds.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        feeds.sort((a, b) => (a.originalIndex || 0) - (b.originalIndex || 0));
    }

    const container = document.getElementById('feedsContainer');
    const sections = Array.from(container.children);

    // Create a map for quick access
    const sectionMap = {};
    sections.forEach(s => {
        if (s.id === 'hiddenCardsSection') {
            sectionMap['hidden'] = s;
        } else {
            const url = s.getAttribute('data-feed-url');
            if (url) sectionMap[url] = s;
        }
    });

    // Re-append in order
    feeds.forEach(feed => {
        const section = sectionMap[feed.url];
        if (section) {
            container.appendChild(section);
        }
    });

    // Append hidden section at the end
    if (sectionMap['hidden']) {
        container.appendChild(sectionMap['hidden']);
    }

    // Save the possibly re-ordered feeds array (optional, but good for consistency)
    saveFeed();
};

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

    // Guardar las categorías seleccionadas en localStorage
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
}


