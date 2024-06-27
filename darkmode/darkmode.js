// Incluir una cadena vacía para representar el esquema de colores original
const colorModes = ['', 'dark-mode', 'pastel-colors', 'vibrant-dark-colors'];

function toggleDarkMode() {
    // Eliminar la clase de modo de color actual
    if(colorModes[currentModeIndex] !== '') {
        document.body.classList.remove(colorModes[currentModeIndex]);
    }
    
    // Calcular el siguiente índice de modo de color
    currentModeIndex = (currentModeIndex + 1) % colorModes.length;
    
    // Aplicar la nueva clase de modo de color, si no es el esquema original
    if(colorModes[currentModeIndex] !== '') {
        document.body.classList.add(colorModes[currentModeIndex]);
    }
    
    // Guardar el modo de color actual en el almacenamiento local
    localStorage.setItem('colorMode', colorModes[currentModeIndex]);
    
    // Actualizar el texto del botón
    updateDarkModeButton();
}

document.addEventListener('DOMContentLoaded', () => {
    const colorModes = [
        { value: '', text: 'Modo original' },
        { value: 'dark-mode', text: 'Modo oscuro' },
        { value: 'pastel-colors', text: 'Colores pastel' },
        { value: 'vibrant-dark-colors', text: 'Oscuro y vibrante' }
    ];

    const colorModeSelect = document.getElementById('colorModeSelect');

    // Añadir opciones al select
    colorModes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode.value;
        option.textContent = mode.text;
        colorModeSelect.appendChild(option);
    });

    // Evento para cambiar el modo de color
    colorModeSelect.addEventListener('change', function() {
        const selectedMode = this.value;
        document.body.className = ''; // Limpia todas las clases primero
        if(selectedMode !== '') {
            document.body.classList.add(selectedMode);
        }
        localStorage.setItem('colorMode', selectedMode);
    });

    // Cargar la preferencia de modo de color guardada
    const savedMode = localStorage.getItem('colorMode') || '';
    colorModeSelect.value = savedMode;
    if(savedMode) {
        document.body.classList.add(savedMode);
    }
});

function loadDarkModePreference() {
    const savedMode = localStorage.getItem('colorMode');
    currentModeIndex = colorModes.indexOf(savedMode) !== -1 ? colorModes.indexOf(savedMode) : 0;
    if(colorModes[currentModeIndex] !== '') {
        document.body.classList.add(colorModes[currentModeIndex]);
    }
    updateDarkModeButton();
}

function updateDarkModeButton() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const nextModeIndex = (currentModeIndex + 1) % colorModes.length;
    darkModeToggle.textContent = `Cambiar a ${colorModes[nextModeIndex] ? colorModes[nextModeIndex].replace('-', ' ') : 'modo original'}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleDarkMode);
});