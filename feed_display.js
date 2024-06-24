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
    // Obtener los contenedores principales
    const feedsContainer = document.getElementById('feedsContainer');
    const podcastContainer = document.getElementById('podcastContainer');
    
    // Crear un nuevo contenedor para el contenido del feed
    const feedContent = document.createElement('div');
    feedContent.className = 'feed-content';

    try {
        // Verificar si hay elementos en el feed
        if (data.items && data.items.length > 0) {
            // Iterar sobre los elementos del feed
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                const card = createCard(item, category);

                // Colocar el primer podcast en el contenedor de podcasts, los demás en el contenido general
                if (category.toLowerCase() === 'podcast' && i === 0) {
                    podcastContainer.appendChild(card);
                } else if (category.toLowerCase() !== 'podcast') {
                    feedContent.appendChild(card);
                }
            }
        } else {
            // Mostrar un mensaje de error si no hay artículos disponibles
            const errorMessage = `El feed "${feedTitle}" no tiene artículos disponibles.`;
            displayFeedError(errorMessage, url);
            return;
        }

        // Manejar la visualización según la categoría
        if (category.toLowerCase() === 'podcast') {
            // Añadir event listeners de arrastre al contenedor de podcasts
            addDragEventListeners(podcastContainer);
        } else {
            // Crear una nueva sección para el feed que no es podcast
            const feedSection = document.createElement('section');
            feedSection.className = 'feed-section';
            feedSection.setAttribute('data-category', category);
            
            // Añadir el título del feed y la categoría
            feedSection.innerHTML = `
                <h2 class="feed-title">${feedTitle}${category ? ` <span class="feed-category">(${category})</span>` : ''}</h2>
            `;
            
            // Añadir el contenido del feed a la sección y la sección al contenedor de feeds
            feedSection.appendChild(feedContent);
            feedsContainer.appendChild(feedSection);
            
            // Añadir event listeners de arrastre al contenido del feed
            addDragEventListeners(feedContent);
        }
    } catch (error) {
        // Manejar errores durante la visualización del feed
        const errorMessage = `Error mostrando el feed "${feedTitle}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error displaying RSS feed:', error);
    }
}
// Función para crear una tarjeta para cada elemento del feed
function createCard(item, category) {
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
    
    if (category.toLowerCase() === 'podcast') {
        // Crea el contenido HTML de la tarjeta para podcasts
        card.innerHTML = `
            <div class="card-background" ${imageUrl ? `style="background-image: url('${imageUrl}');"` : ''}></div>
            <div class="card-content">
                <h3>${item.title}</h3>
                <p>${description}</p>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
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
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
            </div>
        `;
        
        // Si hay una imagen, la añade a la tarjeta (después de card-content)
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = item.title;
            img.onerror = function() {
                this.style.display = 'none';
            };
            card.insertBefore(img, card.querySelector('.card-content').nextSibling);
        }
    }
    
    return card;
}