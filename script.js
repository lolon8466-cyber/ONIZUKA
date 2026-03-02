const faders = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {
    faders.forEach(fade => {
        const rect = fade.getBoundingClientRect();
        if(rect.top < window.innerHeight - 100){
            fade.classList.add('visible');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    faders.forEach(fade => fade.classList.add('visible'));
});