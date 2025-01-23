const croppers = [];

function initializeCropper(index) {
    const input = document.getElementById(`input${index}`);
    const container = document.getElementById(`crop-container${index}`);
    const image = document.getElementById(`crop-image${index}`);

    // Check if the input has a file selected
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
            container.style.display = 'block'; // Show crop container

            // Destroy any existing cropper if present
            if (croppers[index]) {
                croppers[index].destroy();
            }

            // Initialize a new cropper for the selected image
            croppers[index] = new Cropper(image, {
                aspectRatio: 13 / 17, // Adjust aspect ratio if needed
                viewMode: 1,
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveCrop(index) {
    const cropper = croppers[index];
    if (!cropper) return;

    // Get the cropped image as a blob and create a new file object
    cropper.getCroppedCanvas().toBlob((blob) => {
        const file = new File([blob], `cropped-image-${index}.jpeg`, { type: 'image/jpeg' });
        
        // Create a DataTransfer object to assign the cropped image to the input field
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Update the input field with the new file
        document.getElementById(`input${index}`).files = dataTransfer.files;

        // Hide the crop container and destroy the cropper instance
        document.getElementById(`crop-container${index}`).style.display = 'none';
        cropper.destroy();
        croppers[index] = null;
    });
}

function addVariant() {
    const variantCount = document.querySelectorAll('.variant-section').length;
    const newVariant = document.createElement('div');
    newVariant.classList.add('variant-section');
    newVariant.id = `variant${variantCount + 1}`;
    newVariant.innerHTML = `
        <h5>Variant ${variantCount + 1}</h5>
        <div class="mb-3">
            <label class="form-label">Color</label>
            <input type="text" name="variants[${variantCount}][color]" class="form-control" placeholder="Color" required>
            <div class="invalid-feedback">Color is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Size</label>
            <input type="text" name="variants[${variantCount}][size]" class="form-control" placeholder="Size" required>
            <div class="invalid-feedback">Size is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Price</label>
            <input type="number" name="variants[${variantCount}][price]" class="form-control" placeholder="Price" required>
            <div class="invalid-feedback">Price is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Sale Price</label>
            <input type="number" name="variants[${variantCount}][salePrice]" class="form-control" placeholder="Sale Price" required>
            <div class="invalid-feedback">Sale Price is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Quantity</label>
            <input type="number" name="variants[${variantCount}][quantity]" class="form-control" placeholder="Quantity" required>
            <div class="invalid-feedback">Quantity is required for this variant.</div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeVariant(${variantCount})">Delete Variant</button>
        <hr>
    `;
    document.getElementById('variants-container').appendChild(newVariant);
}

function removeVariant(index) {
    // Remove the variant section by its id
    document.getElementById(`variant${index}`).remove();
}

function removeImage(index) {
    // Hide the image and disable the input field for the removed image
    document.getElementById(`imageUploads`).children[index].style.display = "none";
    document.getElementById(`input${index}`).disabled = true;
}

// Initialize Croppers with Pre-Existing Images (on page load)
window.addEventListener('DOMContentLoaded', () => {
    // Iterate over existing images and initialize a cropper for each image if present
    const existingImages = document.querySelectorAll('.current-image');
    existingImages.forEach((imageContainer, index) => {
        const image = imageContainer.querySelector('img');
        if (image) {
            const container = document.getElementById(`crop-container${index}`);
            const cropImage = document.getElementById(`crop-image${index}`);
            cropImage.src = image.src;
            container.style.display = 'block';

            croppers[index] = new Cropper(cropImage, {
                aspectRatio: 13 / 17, // Aspect ratio can be adjusted
                viewMode: 1,
            });
        }
    });
});
