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

// Función para agregar un nuevo feed
function addFeed() {
    const newFeedUrl = document.getElementById('feedInput').value;
    const category = document.getElementById('categoryInput').value;
    
    // Verificar que la URL del feed no esté vacía y no esté duplicada
    if (newFeedUrl && !feeds.some(feed => feed.url === newFeedUrl)) {
        // Solicitar al usuario un título para el nuevo feed
        const feedTitle = prompt("Ingrese un título para este feed:", "Nuevo Feed");
        // Crear un objeto para el nuevo feed
        const newFeed = { url: newFeedUrl, title: feedTitle || "Nuevo Feed", category: category };
        // Agregar el nuevo feed al arreglo de feeds
        feeds.push(newFeed);
        // Guardar los feeds actualizados en localStorage
        saveFeed();
        // Limpiar los campos de entrada
        document.getElementById('feedInput').value = '';
        document.getElementById('categoryInput').value = '';
        // Cargar el nuevo feed y actualizar la interfaz
        fetchFeed(newFeed.url, newFeed.title, newFeed.category);
        updateCategories();
        updateFeedList();
    } else {
        // Mostrar un mensaje de error si la URL del feed ya está agregada o es inválida
        document.getElementById('errorMessage').textContent = 'El feed ya está agregado o la URL es inválida.';
    }
}

// Función asincrónica para cargar un feed desde su URL
async function fetchFeed(url, title, category) {
    try {
        // Hacer una solicitud HTTP para obtener el feed
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parsear la respuesta como JSON
        const data = await response.json();
        // Mostrar el feed en la interfaz gráfica
        displayFeed(data, title, category, url);
    } catch (error) {
        // Manejar errores al cargar el feed y mostrar un mensaje de error
        const errorMessage = `Error cargando el feed "${title}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error fetching RSS feed:', error);
    }
}

// Función para mostrar un mensaje de error junto al feed correspondiente
function displayFeedError(errorMessage, url) {
    const feedItems = document.querySelectorAll('.feedItem');
    for (let i = 0; i < feeds.length; i++) {
        if (feeds[i].url === url) {
            const errorElement = document.createElement('p');
            errorElement.classList.add('feed-error');
            errorElement.textContent = errorMessage;
            
            const feedActions = feedItems[i].querySelector('.feed-actions');
            feedActions.insertBefore(errorElement, feedActions.firstChild);
            break;
        }
    }
}

// Función asincrónica para mostrar el contenido del feed en la interfaz
async function displayFeed(data, feedTitle, category, url) {
    const feedsContainer = document.getElementById('feedsContainer');
    const feedContent = document.createElement('div');
    feedContent.className = 'feed-content';

    try {
        // Verificar si el feed tiene artículos disponibles
        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Obtener la imagen asociada al artículo o una imagen predeterminada
                let imageUrl = item.thumbnail || extractImageFromContent(item.content);
                if (!imageUrl) {
                    imageUrl = await fetchImageFromArticle(item.link) || 'path/to/default-image.jpg';
                }
                
                // Obtener una descripción del artículo
                let description = item.description ? stripImages(item.description).slice(0, 100) + '...' : '';
                
                // Construir el contenido de la tarjeta del artículo
                card.innerHTML = `
                    <div class="card-background" ${imageUrl ? `style="background-image: url('${imageUrl}');"` : ''}></div>
                    <div class="card-content">
                        <h3>${item.title}</h3>
                        <p>${description}</p>
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
                    </div>
                `;
                
                // Si hay una imagen de fondo, intentar usarla también como imagen principal
                if (imageUrl) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = item.title;
                    img.onerror = function() {
                        this.style.display = 'none';
                    };
                    card.querySelector('.card-content').insertBefore(img, card.querySelector('.card-content h3'));
                }
                
                // Agregar la tarjeta al contenido del feed
                feedContent.appendChild(card);
            }
        } else {
            // Mostrar un mensaje de error si el feed no tiene artículos disponibles
            const errorMessage = `El feed "${feedTitle}" no tiene artículos disponibles.`;
            displayFeedError(errorMessage, url);
            return;
        }
    
        // Crear una sección para el feed y agregarla al contenedor de feeds
        const feedSection = document.createElement('section');
        feedSection.className = 'feed-section';
        feedSection.setAttribute('data-category', category);
        
        feedSection.innerHTML = `
            <h2 class="feed-title">${feedTitle}${category ? ` <span class="feed-category">(${category})</span>` : ''}</h2>
        `;
        
        feedSection.appendChild(feedContent);
        feedsContainer.appendChild(feedSection);
        
        // Añadir eventos de arrastre al feedContent
        feedContent.addEventListener('mousedown', (e) => mouseDownHandler(e, feedContent));
        feedContent.addEventListener('mouseleave', () => mouseLeaveHandler(feedContent));
        feedContent.addEventListener('mouseup', () => mouseUpHandler(feedContent));
        feedContent.addEventListener('mousemove', (e) => mouseMoveHandler(e, feedContent));
    } catch (error) {
        // Manejar errores al mostrar el feed y mostrar un mensaje de error
        const errorMessage = `Error mostrando el feed "${feedTitle}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error displaying RSS feed:', error);
    }
}

// Función para eliminar imágenes de una cadena HTML
function stripImages(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    images.forEach(img => img.remove());
    return doc.body.innerHTML;
}

// Función asincrónica para extraer una imagen del contenido HTML del artículo
async function fetchImageFromArticle(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const img = doc.querySelector('meta[property="og:image"]') || doc.querySelector('img');
        return img ? img.content || img.src : null;
    } catch (error) {
        console.error('Error fetching image from article:', error);
        return null;
    }
}

// Función para extraer la primera imagen del contenido HTML
function extractImageFromContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}

// Función para actualizar las categorías disponibles y los filtros en la interfaz
function updateCategories() {
    categories = new Set(feeds.map(feed => feed.category).filter(Boolean));
    const categoryFilters = document.getElementById('categoryFilters');
    categoryFilters.innerHTML = '<span>categorías:</span>';
    
    // Agregar opción para seleccionar/deseleccionar todos los filtros
    const selectAllLabel = document.createElement('label');
    selectAllLabel.innerHTML = '<input type="checkbox" id="selectAll" checked> Seleccionar todo';
    categoryFilters.appendChild(selectAllLabel);

    // Agregar checkbox y etiqueta para cada categoría disponible
    categories.forEach(category => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `category-${category}`;
        checkbox.value = category;
        checkbox.checked = true;
        checkbox.addEventListener('change', filterFeeds);

        const label = document.createElement('label');
        label.htmlFor = `category-${category}`;
        label.textContent = category;

        categoryFilters.appendChild(checkbox);
        categoryFilters.appendChild(label);
    });

    // Agregar event listener para seleccionar/deseleccionar todos los filtros
    document.getElementById('selectAll').addEventListener('change', function() {
        const isChecked = this.checked;
        document.querySelectorAll('#categoryFilters input[type="checkbox"]:not(#selectAll)').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        filterFeeds();
    });
}

// Función para filtrar los feeds mostrados según las categorías seleccionadas
function filterFeeds() {
    const selectedCategories = Array.from(document.querySelectorAll('#categoryFilters input:checked:not(#selectAll)')).map(input => input.value);
    const feedSections = document.querySelectorAll('.feed-section');
    feedSections.forEach(section => {
        const category = section.getAttribute('data-category');
        if (selectedCategories.length === 0 || selectedCategories.includes(category)) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Actualizar el estado del checkbox "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.checked = selectedCategories.length === categories.size;
}

// Función para actualizar la lista de feeds mostrados en la interfaz
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

// Función para modificar un feed existente
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
    
    // Guardar los feeds actualizados en localStorage y actualizar la interfaz
    saveFeed();
    document.getElementById('feedsContainer').innerHTML = '';
    updateCategories();
    updateFeedList();
    feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
}

// Función para eliminar un feed existente
function removeFeed(index) {
    // Mostrar un mensaje de confirmación antes de eliminar el feed
    if (confirm(`¿Estás seguro de que deseas eliminar el feed "${feeds[index].title}"?`)) {
        feeds.splice(index, 1);
        // Guardar los feeds actualizados en localStorage y actualizar la interfaz
        saveFeed();
        document.getElementById('feedsContainer').innerHTML = '';
        updateCategories();
        updateFeedList();
        feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
    }
}

// Funciones para manejar el arrastre y desplazamiento
// Variables para el arrastre
let isDown = false;
let startX;
let scrollLeft;
let lastTime = null;
let lastX = null;
let velocity = 0;
let maxVelocity = 30;
let friction = 0.93;
let threshold = 2; 

function mouseDownHandler(e, container) {
    isDown = true;
    container.classList.add('active');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
}

function mouseLeaveHandler(container) {
    isDown = false;
    container.classList.remove('active');
}

function mouseUpHandler(container) {
    isDown = false;
    container.classList.remove('active');

    if (velocity !== 0) {
        // Aplicar efecto de inercia
        if (velocity > maxVelocity) {
            velocity = maxVelocity;
        }
        if (velocity < -maxVelocity) {
            velocity = -maxVelocity;
        }
        animateScroll(container);
    }
}

function animateScroll(container) {


    function scroll() {
        if (Math.abs(velocity) > threshold) {
            container.scrollLeft += velocity;
            velocity *= friction;
            animationFrameId = requestAnimationFrame(scroll);
        } else {
            cancelAnimationFrame(animationFrameId);
        }
    }

    scroll();
}


function mouseMoveHandler(e, container) {
    if (!isDown) return;
    e.preventDefault();

    const currentTime = Date.now();
    const currentTimeInSeconds = currentTime / 1000;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 0.9; // Ajusta la velocidad del desplazamiento
    container.scrollLeft = scrollLeft - walk;

    if (lastTime && lastX !== null) {
        // Calcular la velocidad
        const timeDiffInSeconds = (currentTime - lastTime) / 1000;
        const distance = (lastX - x);
        velocity = distance / timeDiffInSeconds; // píxeles por segundo
        
    }


    lastTime = currentTime;
    lastX = x;
}