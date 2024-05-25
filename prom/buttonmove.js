
document.addEventListener('DOMContentLoaded', function() {
    const nobutton = document.getElementById('no-button');

    function moveButtonAway(mouseX, mouseY) {
        const buttonRect = nobutton.getBoundingClientRect();
        const buttonX = buttonRect.left;
        const buttonY = buttonRect.top;
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;

        // Calculate the center of the button
        const buttonCenterX = buttonX + buttonWidth / 2;
        const buttonCenterY = buttonY + buttonHeight / 2;

        // Calculate distance from mouse to the button's center
        const distanceX = buttonCenterX - mouseX;
        const distanceY = buttonCenterY - mouseY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // If the mouse is within 10 pixels of the button's edge, move the button
        if (distance < 50 + Math.max(buttonWidth, buttonHeight) / 2) {
            const angle = Math.atan2(distanceY, distanceX);
            const moveDistance = 50;

            const newX = buttonX + Math.cos(angle) * moveDistance;
            const newY = buttonY + Math.sin(angle) * moveDistance;

            // Ensure the button stays within the viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const boundedX = Math.max(0, Math.min(newX, viewportWidth - buttonWidth));
            const boundedY = Math.max(0, Math.min(newY, viewportHeight - buttonHeight));
            
            nobutton.style.left = `${boundedX}px`;
            nobutton.style.top = `${boundedY}px`;
        }
    }
    
    nobutton.addEventListener('click', () => {
    const randomX = Math.random() * 1000;
    const randomY = Math.random() * 1000;
    nobutton.style.left = `${randomX}px`;
    nobutton.style.top = `${randomY}px`;
    alert('☹️');

})
    document.addEventListener('mousemove', function(event) {
        moveButtonAway(event.clientX, event.clientY);
    });
});

