// Variables para el desplazamiento horizontal
let isDownX = false;
let startX;
let scrollLeft;
let lastTimeX = null;
let lastX = null;
let velocityX = 0;

// Variables para el desplazamiento vertical
let isDownY = false;
let startY;
let scrollTop;
let lastTimeY = null;
let lastY = null;
let velocityY = 0;

// Configuración general
let maxVelocity = 30;
let friction = 0.93;
let threshold = 2; 

// Manejador de evento cuando se presiona el botón del ratón
function mouseDownHandler(e, container) {
    isDownX = true;
    isDownY = true;
    container.classList.add('active');
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
}

// Manejador de evento cuando el ratón sale del contenedor
function mouseLeaveHandler(container) {
    isDownX = false;
    isDownY = false;
    container.classList.remove('active');
}

// Manejador de evento cuando se suelta el botón del ratón
function mouseUpHandler(container) {
    isDownX = false;
    isDownY = false;
    container.classList.remove('active');

    // Iniciar animación de desplazamiento si hay velocidad
    if (velocityX !== 0 || velocityY !== 0) {
        velocityX = Math.max(Math.min(velocityX, maxVelocity), -maxVelocity);
        velocityY = Math.max(Math.min(velocityY, maxVelocity), -maxVelocity);
        animateScroll(container);
    }
}

// Función para animar el desplazamiento
function animateScroll(container) {
    function scroll() {
        if (Math.abs(velocityX) > threshold || Math.abs(velocityY) > threshold) {
            container.scrollLeft += velocityX;
            container.scrollTop += velocityY;
            velocityX *= friction;
            velocityY *= friction;
            requestAnimationFrame(scroll);
        }
    }
    scroll();
}

// Manejador de evento para el movimiento del ratón
function mouseMoveHandler(e, container) {
    if (!isDownX && !isDownY) return;
    e.preventDefault();

    const currentTime = Date.now();
    const currentTimeInSeconds = currentTime / 1000;

    // Cálculo para el desplazamiento horizontal
    const x = e.pageX - container.offsetLeft;
    const walkX = (x - startX) * 0.9;
    container.scrollLeft = scrollLeft - walkX;

    // Cálculo para el desplazamiento vertical
    const y = e.pageY - container.offsetTop;
    const walkY = (y - startY) * 0.9;
    container.scrollTop = scrollTop - walkY;

    // Cálculo de velocidad para el eje X
    if (lastTimeX && lastX !== null) {
        const timeDiffInSeconds = (currentTime - lastTimeX) / 1000;
        const distanceX = (lastX - x);
        velocityX = distanceX / timeDiffInSeconds;
    }

    // Cálculo de velocidad para el eje Y
    if (lastTimeY && lastY !== null) {
        const timeDiffInSeconds = (currentTime - lastTimeY) / 1000;
        const distanceY = (lastY - y);
        velocityY = distanceY / timeDiffInSeconds;
    }
    console.log(velocityY)
    lastTimeX = currentTime;
    lastX = x;
    lastTimeY = currentTime;
    lastY = y;
}