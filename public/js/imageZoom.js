let driftInstance = null;
    
function initDriftZoom(imageSrc) {
    if (driftInstance) {
        driftInstance.destroy();
    }
    
    const mainImage = document.getElementById('main-image');
    mainImage.dataset.zoom = imageSrc;
    
    driftInstance = new Drift(mainImage, {
        paneContainer: document.querySelector('.main-image-container'),
        inlinePane: false,
        zoomFactor: 2.5,
        hoverBoundingBox: true,
        touchDelay: 300,
        injectBaseStyles: true
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initDriftZoom('/uploads/products/<%= product.productImage[0] %>');
});

// Modified updateMainImage function
function updateMainImage(src) {
    const mainImage = document.getElementById('main-image');
    mainImage.src = src;
    initDriftZoom(src);
}