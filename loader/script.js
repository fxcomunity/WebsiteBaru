document.addEventListener('DOMContentLoaded', () => {
    // Inject loader HTML if it doesn't exist
    if (!document.querySelector('.loader-wrapper')) {
        const loaderHTML = `
            <div class="loader-wrapper">
                <div class="loader"></div>
                <div class="loader-text">MEMUAT...</div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    // Show loader for at least 2 seconds
    setTimeout(() => {
        const loader = document.querySelector('.loader-wrapper');
        if (loader) {
            loader.classList.add('fade-out');
        }
    }, 2000);
});
