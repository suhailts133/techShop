const croppers = [];
const existingImages = {};

document.addEventListener('DOMContentLoaded', () => {
    const currentImages = document.querySelectorAll('.current-image img');
    currentImages.forEach((img, index) => {
        existingImages[index + 1] = img.src.split('/').pop(); 
    });
});

function initializeCropper(index) {
    const input = document.getElementById(`input${index}`);
    const container = document.getElementById(`crop-container${index}`);
    const image = document.getElementById(`crop-image${index}`);
    const currentImageDiv = input.previousElementSibling;
    
    function showError(message) {
        input.classList.add('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            showError('Please upload only JPG, PNG, or WebP images.');
            input.value = '';
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('Image size should be less than 5MB');
            input.value = '';
            return;
        }

        // Clear any previous errors
        input.classList.remove('is-invalid');

        // Hide current image if exists
        if (currentImageDiv && currentImageDiv.classList.contains('current-image')) {
            currentImageDiv.style.display = 'none';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
            container.style.display = 'block';

            if (croppers[index]) {
                croppers[index].destroy();
            }

            croppers[index] = new Cropper(image, {
                aspectRatio: NaN,
                viewMode: 1,
                autoCropArea: 1
            });
        };

        reader.onerror = () => {
            showError('Error reading file');
            input.value = '';
        };

        reader.readAsDataURL(file);
    }
}

function saveCrop(index) {
    const cropper = croppers[index];
    const input = document.getElementById(`input${index}`);
    const container = document.getElementById(`crop-container${index}`);
    const currentImageDiv = input.previousElementSibling;

    if (!cropper) return;

    cropper.getCroppedCanvas().toBlob((blob) => {
        const file = new File([blob], `cropped-image-${index}.jpeg`, { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        container.style.display = 'none';
        
        // Keep current image hidden
        if (currentImageDiv && currentImageDiv.classList.contains('current-image')) {
            currentImageDiv.style.display = 'none';
        }

        cropper.destroy();
        croppers[index] = null;
    }, 'image/jpeg');
}

function removeVariant(index) {
    const variant = document.getElementById(`variant${index}`);
    if (variant) {
        variant.remove();
        // Reindex remaining variants
        const variants = document.querySelectorAll('.variant-section');
        variants.forEach((v, i) => {
            v.id = `variant${i}`;
            v.querySelector('h5').textContent = `Variant ${i + 1}`;
            // Update input names
            v.querySelectorAll('input').forEach(input => {
                const name = input.getAttribute('name');
                if (name) {
                    input.setAttribute('name', name.replace(/\[\d+\]/, `[${i}]`));
                }
            });
        });
    }
}

function addVariant() {
    const variantCount = document.querySelectorAll('.variant-section').length;
    const newVariant = document.createElement('div');
    newVariant.classList.add('variant-section');
    newVariant.id = `variant${variantCount}`;
    
    newVariant.innerHTML = `
        <h5>Variant ${variantCount + 1}</h5>
        <div class="mb-3">
            <label class="form-label">Color</label>
            <input type="text" name="variants[${variantCount}][color]" class="form-control" required>
            <div class="invalid-feedback">Color is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Size</label>
            <input type="text" name="variants[${variantCount}][size]" class="form-control" required>
            <div class="invalid-feedback">Size is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Price</label>
            <input type="number" name="variants[${variantCount}][price]" class="form-control" required>
            <div class="invalid-feedback">Price is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Sale Price</label>
            <input type="number" name="variants[${variantCount}][salePrice]" class="form-control" required>
            <div class="invalid-feedback">Sale Price is required for this variant.</div>
        </div>
        <div class="mb-3">
            <label class="form-label">Quantity</label>
            <input type="number" name="variants[${variantCount}][quantity]" class="form-control" required>
            <div class="invalid-feedback">Quantity is required for this variant.</div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeVariant(${variantCount})">Delete Variant</button>
        <hr>
    `;
    
    document.getElementById('variants-container').appendChild(newVariant);
}
