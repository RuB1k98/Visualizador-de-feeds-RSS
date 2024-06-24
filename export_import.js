function exportFeeds() {
    const filename = 'FeedsList.json';
    const json = JSON.stringify(feeds, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function importFeeds() {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        // Escuchar el cambio en el input de archivo
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];

            if (!file) {
                reject(new Error('Por favor selecciona un archivo JSON.'));
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedFeeds = JSON.parse(event.target.result);
                    // Validar que lo que se importa sea un arreglo de feeds
                    if (!Array.isArray(importedFeeds)) {
                        reject(new Error('El archivo seleccionado no contiene un formato válido de feeds.'));
                        return;
                    }
                    // Actualizar los feeds en la aplicación
                    feeds = importedFeeds;
                    // Guardar los feeds actualizados en localStorage
                    saveFeed();
                    // Limpiar y actualizar la interfaz
                    document.getElementById('feedsContainer').innerHTML = '';
                    updateCategories();
                    updateFeedList();
                    // Cargar nuevamente todos los feeds importados
                    feeds.forEach(feed => fetchFeed(feed.url, feed.title, feed.category));
                    alert('Feeds importados correctamente.');
                    resolve();
                } catch (error) {
                    console.error('Error al importar feeds:', error);
                    reject(new Error('Error al importar feeds. Por favor, verifica el archivo seleccionado.'));
                }
            };

            reader.readAsText(file);
        });

        // Simular clic en el input de tipo file para abrir el cuadro de diálogo
        fileInput.click();
    });
}

// Ejemplo de cómo utilizar la función importFeeds() con async/await
async function handleImport() {
    try {
        await importFeeds();
        // Aquí puedes continuar con cualquier lógica que dependa de la importación de feeds
    } catch (error) {
        console.error('Error al importar feeds:', error);
        alert(error.message);
    }
}
