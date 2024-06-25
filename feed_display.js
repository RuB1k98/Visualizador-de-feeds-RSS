// feed_display.js

// Función asíncrona para obtener el feed RSS
async function fetchFeed(url, title, category) {
    try {
        // Realiza una petición a la API de rss2json para convertir el RSS a JSON
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        
        // Comprueba si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Convierte la respuesta a JSON
        const data = await response.json();
        
        // Llama a la función para mostrar el feed
        displayFeed(data, title, category, url);
    } catch (error) {
                // Si hay un error, muestra un mensaje de error y lo registra en la consola
        const errorMessage = `Error cargando el feed "${title}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error fetching RSS feed:', error);
    }
}

// Función para mostrar errores del feed
function displayFeedError(errorMessage, url) {
    // Busca todos los elementos con la clase 'feedItem'
    const feedItems = document.querySelectorAll('.feedItem');
    
    // Recorre la lista de feeds
    for (let i = 0; i < feeds.length; i++) {
        // Si encuentra el feed con la URL correspondiente
        if (feeds[i].url === url) {
            // Crea un elemento para mostrar el error
            const errorElement = document.createElement('p');
            errorElement.classList.add('feed-error');
            errorElement.textContent = errorMessage;
            
            // Inserta el mensaje de error antes del primer hijo de 'feed-actions'
            const feedActions = feedItems[i].querySelector('.feed-actions');
            feedActions.insertBefore(errorElement, feedActions.firstChild);
            break;
        }
    }
}

// Función para añadir event listeners de arrastre a un elemento
function addDragEventListeners(element) {
    element.addEventListener('mousedown', (e) => mouseDownHandler(e, element));
    element.addEventListener('mouseleave', () => mouseLeaveHandler(element));
    element.addEventListener('mouseup', () => mouseUpHandler(element));
    element.addEventListener('mousemove', (e) => mouseMoveHandler(e, element));
}

// Función asíncrona para mostrar el feed
async function displayFeed(data, feedTitle, category, url) {
    try {
        if (data.items && data.items.length > 0) {
            if (category.toLowerCase() === 'podcast') {
                displayFeedPodcast(data, feedTitle, url);
            } else {
                displayFeedCentral(data, feedTitle, category, url);
            }
        } else {
            const errorMessage = `El feed "${feedTitle}" no tiene artículos disponibles.`;
            displayFeedError(errorMessage, url);
        }
    } catch (error) {
        // Manejar errores durante la visualización del feed
        const errorMessage = `Error mostrando el feed "${feedTitle}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error displaying RSS feed:', error);
    }
}

// Nueva función para mostrar feeds centrales
function displayFeedCentral(data, feedTitle, category, url) {
    const feedsContainer = document.getElementById('feedsContainer');
    const feedContent = document.createElement('div');
    feedContent.className = 'feed-content';

    for (const item of data.items) {
        const card = createCard(item, category, feedTitle);
        feedContent.appendChild(card);
    }

    const feedSection = document.createElement('section');
    feedSection.className = 'feed-section';
    feedSection.setAttribute('data-category', category);
    
    feedSection.innerHTML = `
        <h2 class="feed-title">${feedTitle}${category ? ` <span class="feed-category">(${category})</span>` : ''}</h2>
    `;
    
    feedSection.appendChild(feedContent);
    feedsContainer.appendChild(feedSection);
    
    addDragEventListeners(feedContent);
}

// Nueva función para mostrar feeds de podcast
function displayFeedPodcast(data, feedTitle, url) {
    const podcastContainer = document.getElementById('podcastContainer');
    
    if (data.items.length > 0) {
        const card = createCard(data.items[0], 'podcast', feedTitle);
        podcastContainer.appendChild(card);
    }

    addDragEventListeners(podcastContainer);
}

// Función para crear una tarjeta para cada elemento del feed
function createCard(item, category, feedTitle) {
    // Crea un nuevo elemento div para la tarjeta
    const card = document.createElement('div');
    card.className = 'card';
    
    // Obtiene la URL de la imagen del elemento o extrae una del contenido
    let imageUrl = item.thumbnail || extractImageFromContent(item.content);
    if (!imageUrl) {
        imageUrl = 'path/to/default-image.jpg';
    }
    
    // Obtiene una descripción corta del elemento
    let description = item.description ? stripImages(item.description).slice(0, 100) + '...' : '';
    
    // Calcula el tiempo transcurrido desde la publicación
    const publishedDate = new Date(item.pubDate);
    const timeAgo = getTimeAgo(publishedDate);
    
    if (category.toLowerCase() === 'podcast') {
        // Crea el contenido HTML de la tarjeta para podcasts
        card.innerHTML = `
            <div class="card-background" ${imageUrl ? `style="background-image: url('${imageUrl}');"` : ''}></div>
            <div class="card-content">
                <h3>${item.title}</h3>
                <p>${description}</p>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
                <div class="card-footer">
                    <span class="time-ago">${timeAgo}</span>
                    <span class="feed-name">Por ${feedTitle}.</span>
                </div>
            </div>
        `;
        
        // Si hay una imagen, la añade a la tarjeta (dentro de card-content)
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = item.title;
            img.onerror = function() {
                this.style.display = 'none';
            };
            card.querySelector('.card-content').insertBefore(img, card.querySelector('.card-content h3'));
        }
    } else {
        // Crea el contenido HTML de la tarjeta para otras categorías
        card.innerHTML = `
            <div class="card-background" ${imageUrl ? `style="background-image: url('${imageUrl}');"` : ''}></div>
            <div class="card-content">
                <h3>${item.title}</h3>
                ${item.title.length < 50 ? `<p>${description}</p>` : ''}
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
                <div class="card-footer">
                    <span class="time-ago">${timeAgo}</span>
                    <span class="feed-name">Por ${feedTitle}.</span>
                </div>
            </div>
        `;
        
        // Si hay una imagen, la añade a la tarjeta (después de card-content)
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = item.title;
            img.className = 'card-image'; // Añadimos una clase para estilizar
            img.onerror = function() {
                this.style.display = 'none';
            };
            card.insertBefore(img, card.firstChild);
        }
    }
    
    return card;
}

// Función para calcular el tiempo transcurrido
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / secondsInUnit);
        if (interval >= 1) {
            return `Hace ${interval} ${unit}${interval > 1 ? (unit === 'mes' ? 'es' : 's') : ''}`;
        }
    }
    
    return 'Hace un momento';
}