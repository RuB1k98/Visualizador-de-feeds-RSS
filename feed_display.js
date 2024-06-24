async function fetchFeed(url, title, category) {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        displayFeed(data, title, category, url);
    } catch (error) {
        const errorMessage = `Error cargando el feed "${title}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error fetching RSS feed:', error);
    }
}

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

async function displayFeed(data, feedTitle, category, url) {
    const feedsContainer = document.getElementById('feedsContainer');
    const podcastContainer = document.getElementById('podcastContainer');
    const feedContent = document.createElement('div');
    feedContent.className = 'feed-content';

    try {
        if (data.items && data.items.length > 0) {
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                const card = createCard(item);

                if (category.toLowerCase() === 'podcast' && i === 0) {
                    podcastContainer.appendChild(card);
                } else if (category.toLowerCase() !== 'podcast') {
                    feedContent.appendChild(card);
                }
            }
        } else {
            const errorMessage = `El feed "${feedTitle}" no tiene artículos disponibles.`;
            displayFeedError(errorMessage, url);
            return;
        }

        if (category.toLowerCase() !== 'podcast') {
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
        }
    } catch (error) {
        const errorMessage = `Error mostrando el feed "${feedTitle}". Por favor, inténtelo nuevamente.`;
        displayFeedError(errorMessage, url);
        console.error('Error displaying RSS feed:', error);
    }
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    
    let imageUrl = item.thumbnail || extractImageFromContent(item.content);
    if (!imageUrl) {
        imageUrl = 'path/to/default-image.jpg';
    }
    
    let description = item.description ? stripImages(item.description).slice(0, 100) + '...' : '';
    
    card.innerHTML = `
        <div class="card-background" ${imageUrl ? `style="background-image: url('${imageUrl}');"` : ''}></div>
        <div class="card-content">
            <h3>${item.title}</h3>
            <p>${description}</p>
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more">Leer más</a>
        </div>
    `;
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = item.title;
        img.onerror = function() {
            this.style.display = 'none';
        };
        card.querySelector('.card-content').insertBefore(img, card.querySelector('.card-content h3'));
    }
    
    return card;
}
