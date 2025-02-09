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

document.addEventListener('DOMContentLoaded', function() {
    const  imageIdSelector = document.getElementById('main-image').getAttribute('data-zoom')
    // const imageId =
    initDriftZoom(`/uploads/products/${imageIdSelector}`);
});


function updateMainImage(src) {
    const mainImage = document.getElementById('main-image');
    mainImage.src = src;
    initDriftZoom(src);
}