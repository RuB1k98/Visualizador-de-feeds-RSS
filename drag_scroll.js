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
            requestAnimationFrame(scroll);
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
    const walk = (x - startX) * 0.9;
    container.scrollLeft = scrollLeft - walk;

    if (lastTime && lastX !== null) {
        const timeDiffInSeconds = (currentTime - lastTime) / 1000;
        const distance = (lastX - x);
        velocity = distance / timeDiffInSeconds;
    }

    lastTime = currentTime;
    lastX = x;
}