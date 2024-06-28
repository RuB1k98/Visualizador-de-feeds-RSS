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
                displayFeedCentral(data, feedTitle, category, url);
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
        let card;
        if (isMobile()) {
            card = createCardMobile(item, feedTitle);
        } else {
            card = createCard(item, feedTitle);
        }
        feedContent.appendChild(card);
    }

    const feedSection = document.createElement('section');
    feedSection.className = 'feed-section';
    feedSection.setAttribute('data-category', category);
    
    feedSection.innerHTML = `
        <h2 class="feed-title">${feedTitle}</h2>
    `;
    
    feedSection.appendChild(feedContent);
    feedsContainer.appendChild(feedSection);
    
    addDragEventListeners(feedContent);
    hideCardsWithHiddenTitles(); // Ocultar tarjetas con títulos ocultos
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


function createCardMobile(item, feedTitle) {
    const card = document.createElement('div');
    card.className = 'card mobile-card';
    card.setAttribute('data-original-feed', feedTitle);

    const imageUrl = item.thumbnail || extractImageFromContent(item.content) || 'path/to/default-image.jpg';
    const description = item.description ? stripImages(item.description).slice(0, 100) + '...' : '';
    const timeAgo = getTimeAgo(new Date(item.pubDate));

    card.innerHTML = `
        <div class="card-background" style="background-image: url('${imageUrl}');"></div>
        <img src="${imageUrl}" alt="${item.title}" class="card-image hiddencard">
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

    const img = card.querySelector('.card-image');
    img.onerror = () => img.style.display = 'none';

    addSwipeFunctionality(card);

    return card;
}

function addSwipeFunctionality(card) {
    let startX;
    let startY;
    let distX;
    let distY;
    const threshold = 150; // Distancia mínima para considerar un swipe

    card.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    card.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;

        const touch = e.touches[0];
        distX = touch.clientX - startX;
        distY = touch.clientY - startY;

        // Si el movimiento horizontal es mayor que el vertical, prevenimos el scroll
        if (Math.abs(distX) > Math.abs(distY)) {
            e.preventDefault();
        }

        card.style.transition = 'none';
        card.style.transform = `translateX(${distX}px) rotate(${distX / 50}deg)`;
        card.style.opacity = 1 - Math.abs(distX) / (threshold*2);
    });

    card.addEventListener('touchend', () => {
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

        if (Math.abs(distX) >= threshold) {
            if (card.classList.contains('hiddencard')) {
                restoreCard(card);
            } else {
                hideCard(card);
            }
        }

        // Siempre volver a la posición original
        card.style.transform = '';
        card.style.opacity = '';

        startX = null;
        startY = null;
    });
}



// Función para crear una tarjeta para cada elemento del feed
function createCard(item, feedTitle) {

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-original-feed', feedTitle); // Almacenamos el título del feed original

    const imageUrl = item.thumbnail || extractImageFromContent(item.content) || 'path/to/default-image.jpg';
    const description = item.description ? stripImages(item.description).slice(0, 100) + '...' : '';
    const timeAgo = getTimeAgo(new Date(item.pubDate));

    card.innerHTML = `
        <div class="card-background" style="background-image: url('${imageUrl}');"></div>
        <img src="${imageUrl}" alt="${item.title}" class="card-image hiddencard">
        <button class="card-close-btn">&times;</button>
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

    const img = card.querySelector('.card-image');
    img.onerror = () => img.style.display = 'none';

    const closeBtn = card.querySelector('.card-close-btn');
    closeBtn.addEventListener('click', () => hideCard(card));

    return card;
}

// Nueva función para crear la sección de tarjetas ocultas
function createHiddenCardsSection() {
    const feedsContainer = document.getElementById('feedsContainer');
    let hiddenSection = document.getElementById('hiddenCardsSection');
    
    if (!hiddenSection) {
        hiddenSection = document.createElement('section');
        hiddenSection.id = 'hiddenCardsSection';
        hiddenSection.className = 'hidden-cards-section feed-section';
        hiddenSection.setAttribute('data-category', "Tarjetas ocultas");
        hiddenSection.innerHTML = `
            <h2 class="feed-title">Tarjetas ocultas</h2>
            <div class="hidden-cards-container feed-content"></div>
        `;
        feedsContainer.appendChild(hiddenSection);
        
        // Añadir event listeners de arrastre al contenedor de tarjetas ocultas
        const hiddenCardsContainer = hiddenSection.querySelector('.hidden-cards-container');
        addDragEventListeners(hiddenCardsContainer);
    }
    
    return hiddenSection;
}


// Función modificada para ocultar la tarjeta y moverla a la sección de tarjetas ocultas
function hideCard(card) {
    const hiddenSection = createHiddenCardsSection();
    const hiddenCardsContainer = hiddenSection.querySelector('.hidden-cards-container');
    
    // Añadir la clase 'hiddencard' a la tarjeta
    card.classList.add('hiddencard');
    
    // Remover la tarjeta de su posición actual
    card.parentNode.removeChild(card);
    
    // Añadir la tarjeta a la sección de tarjetas ocultas
    hiddenCardsContainer.appendChild(card);
    
    // Mostrar la sección de tarjetas ocultas si estaba oculta
    hiddenSection.style.display = 'block';
    
    // Cambiar el evento del botón de cerrar para restaurar la tarjeta cuando la tarjeta no es mobile
    if(!isMobile()){
    const closeBtn = card.querySelector('.card-close-btn');
    closeBtn.innerHTML = '&#8634;'; // Cambiar el símbolo a un ícono de restaurar
    closeBtn.removeEventListener('click', () => hideCard(card));
    closeBtn.addEventListener('click', () => restoreCard(card));
    }

    // Guardar el título de la tarjeta en el localstorage si no existe previamente
    const title = card.querySelector('h3').textContent;
    const hiddenTitles = JSON.parse(localStorage.getItem('TitulosOcultos')) || [];
    if (!hiddenTitles.includes(title)) {
        hiddenTitles.push(title);
        localStorage.setItem('TitulosOcultos', JSON.stringify(hiddenTitles));
    }

    console.log(hiddenTitles);

    filterFeeds();
}

// Función modificada para restaurar una tarjeta oculta
function restoreCard(card) {
    const feedsContainer = document.getElementById('feedsContainer');
    const hiddenSection = document.getElementById('hiddenCardsSection');
    const hiddenCardsContainer = hiddenSection.querySelector('.hidden-cards-container');
    card.classList.remove('hiddencard');
    
    if (!isMobile()) {
        const closeBtn = card.querySelector('.card-close-btn');
        closeBtn.innerHTML = '&times;';
        closeBtn.removeEventListener('click', () => restoreCard(card));
        closeBtn.addEventListener('click', () => hideCard(card));
    }
    
    const originalFeed = card.getAttribute('data-original-feed');
    const originalSection = Array.from(feedsContainer.children).find(section => 
        section.querySelector('.feed-title').textContent === originalFeed
    );
    
    if (originalSection) {
        const feedContent = originalSection.querySelector('.feed-content');
        feedContent.appendChild(card);
    } else {
        feedsContainer.insertBefore(card, hiddenSection);
    }
    
    if (hiddenCardsContainer.children.length === 0) {
        hiddenSection.style.display = 'none';
    }
    
    filterFeeds();
    console.log("apalapapa");
    // Remover el título de la tarjeta de TitulosOcultos
    const title = card.querySelector('h3').textContent;
    let hiddenTitles = JSON.parse(localStorage.getItem('TitulosOcultos'));
    hiddenTitles = hiddenTitles.filter(hiddenTitle => hiddenTitle !== title);
    localStorage.setItem('TitulosOcultos', JSON.stringify(hiddenTitles));

    console.log(card.querySelector('h3').textContent);
    console.log(hiddenTitles);
    console.log("apalapapa");
    
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

// Función para ocultar las tarjetas cuyos títulos se encuentren en TitulosOcultos
function hideCardsWithHiddenTitles() {
    const hiddenTitles = JSON.parse(localStorage.getItem('TitulosOcultos'));
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        if (hiddenTitles.includes(title)) {
            card.classList.add('hiddencard'); // Add the 'hiddencard' class to the card
        }
    });

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        if (hiddenTitles.includes(title)) {
            hideCard(card);
        }
    });
}