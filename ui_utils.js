function stripImages(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    images.forEach(img => img.remove());
    return doc.body.innerHTML;
}

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

function extractImageFromContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}

function updateCategories() {
    categories = new Set(feeds.map(feed => feed.category).filter(Boolean));
    categories.delete("Podcast");  // Eliminar la categoría "Podcast" de la lista de categorías para que no aparezca en los filtros ya que tienen su seccion propia

    const categoryFilters = document.getElementById('categoryFilters');
    categoryFilters.innerHTML = '<span>categorías:</span>';
    
    const selectAllLabel = document.createElement('label');
    selectAllLabel.innerHTML = '<input type="checkbox" id="selectAll" checked> Seleccionar todo';
    categoryFilters.appendChild(selectAllLabel);

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

    document.getElementById('selectAll').addEventListener('change', function() {
        const isChecked = this.checked;
        document.querySelectorAll('#categoryFilters input[type="checkbox"]:not(#selectAll)').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        filterFeeds();
    });
}

