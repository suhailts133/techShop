const croppers = [];

    function initializeCropper(index) {
        const input = document.getElementById(`input${index}`);
        const container = document.getElementById(`crop-container${index}`);
        const image = document.getElementById(`crop-image${index}`);

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                image.src = e.target.result;
                container.style.display = 'block';

                if (croppers[index]) {
                    croppers[index].destroy();
                }

                croppers[index] = new Cropper(image, {
                    aspectRatio: 13/17,
                    viewMode: 1,
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function saveCrop(index) {
        const cropper = croppers[index];
        if (!cropper) return;

        cropper.getCroppedCanvas().toBlob((blob) => {
            const file = new File([blob], `cropped-image-${index}.jpeg`, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            document.getElementById(`input${index}`).files = dataTransfer.files;
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
                <input type="text" name="variants[${variantCount}].color" class="form-control" placeholder="Color" required>
                <div class="invalid-feedback">Color is required for this variant.</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Size</label>
                <input type="text" name="variants[${variantCount}].size" class="form-control" placeholder="Size" required>
                <div class="invalid-feedback">Size is required for this variant.</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Price</label>
                <input type="number" name="variants[${variantCount}].price" class="form-control" placeholder="Price" required>
                <div class="invalid-feedback">Price is required for this variant.</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Sale Price</label>
                <input type="number" name="variants[${variantCount}].salePrice" class="form-control" placeholder="Sale Price" required>
                <div class="invalid-feedback">Sale Price is required for this variant.</div>
            </div>
            <div class="mb-3">
                <label class="form-label">Quantity</label>
                <input type="number" name="variants[${variantCount}].quantity" class="form-control" placeholder="Quantity" required>
                <div class="invalid-feedback">Quantity is required for this variant.</div>
            </div>
        `;
        document.getElementById('variants-container').appendChild(newVariant);
    }