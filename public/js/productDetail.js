
function updateMainImage(imagePath) {
    document.getElementById('main-image').src = imagePath;
}
function updateVariantDetails() {
    const variantSelect = document.getElementById('variant');
    const variantId = variantSelect.value;

    // Retrieve the productId from the data attribute
    const productId = variantSelect.getAttribute('data-product-id');

    console.log("From JS - Variant ID:", variantId);
    console.log("From JS - Product ID:", productId);

    $.ajax({
        url: '/updateVariant', 
        type: 'POST',
        data: { productId, variantId },
        success: function (response) {
            console.log("response from updateVariable",response);
            
            document.getElementById('price').textContent = `${response.salePrice}`;
            document.getElementById('regular-price').textContent = `${response.originalPrice}`;

            const discountBadge = document.querySelector('.badge.bg-danger');
            if (response.applicableOffer > 0) {
                discountBadge.textContent = `-${response.applicableOffer}% OFF `;
                discountBadge.style.display = 'inline-block';
            } else {
                discountBadge.style.display = 'none';
            }
            
            const quantityElement = document.getElementById('quantity');
            const selectedQuantityElement = document.getElementById('selected-quantity');
            const decreaseButton = document.querySelector('button[onclick="changeQuantity(-1)"]');
            const increaseButton = document.querySelector('button[onclick="changeQuantity(1)"]');
            const addToCartButton = document.querySelector('button[onclick="addToCart()"]');

            if (response.quantity === 0) {
                
                quantityElement.textContent = 'Out of Stock';
                quantityElement.classList.add('text-danger', 'fw-bold');
                selectedQuantityElement.textContent = '0';

                decreaseButton.disabled = true;
                increaseButton.disabled = true;
                addToCartButton.disabled = true;
            } else {
             
                quantityElement.innerHTML = response.quantity;
                quantityElement.classList.remove('text-danger', 'fw-bold');
                selectedQuantityElement.textContent = '1';

       
                decreaseButton.disabled = false;
                increaseButton.disabled = false;
                addToCartButton.disabled = false;
            }
        },
        error: function (error) {
            console.error('Error fetching variant details:', error);
        }
    });
}


function changeQuantity(amount) {
    const quantityEl = document.getElementById('selected-quantity');
    const availableQuantity = parseInt(document.getElementById('quantity').textContent, 10);
    const errorEl = document.getElementById('quantity-error');
    const currentQuantity = parseInt(quantityEl.textContent, 10);

    // Calculate the new quantity
    const newQuantity = currentQuantity + amount;

    // Check if the new quantity is valid
    if (newQuantity > 0 && newQuantity <= availableQuantity) {
        // Update the quantity display
        quantityEl.textContent = newQuantity;

        // Hide the error message if it's currently displayed
        errorEl.style.display = 'none';
    } else if (newQuantity > availableQuantity) {
        // Show the error message if the quantity exceeds the limit
        errorEl.textContent = 'Exceeds available quantity.';
        errorEl.style.display = 'block';
    } else if (newQuantity <= 0) {
        // Show an error if the quantity drops below 1
        errorEl.textContent = 'Minimum quantity is 1.';
        errorEl.style.display = 'block';
    }
}

async function addToCart() {
    try {
        const variantSelect = document.getElementById('variant');
        const variantId = variantSelect.value;
        const productId = variantSelect.getAttribute('data-product-id');
        const quantity = parseInt(document.getElementById('selected-quantity').textContent, 10); // Get the selected quantity
        const productImage = document.getElementById('main-image').src.split('/').pop(); // Get the main image filename

        // Prepare data to send in the POST request
        const data = {
            productId: productId,
            variantId: variantId,
            quantity: quantity,
            productImage: productImage // Only the image filename
        };
        console.log(data);

        // Send the data to the backend via POST request
        const response = await fetch('/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            window.location.href = "/login";
            return;
        }


        const result = await response.json();
        const messageEl = document.getElementById('cart-message');
        const message = result.message || 'An unexpected error occurred.';

        if (result.success) {
            // Show success message
            messageEl.innerHTML = `
                <div class="alert alert-success" role="alert">
                    ${message}
                </div>`;

            if (result.redirectTo) {
                setTimeout(() => {
                    console.log('Redirecting to:', result.redirectTo);
                    window.location.href = result.redirectTo; 
                }, 2000); 
            }
        } else {
          
            messageEl.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>`;

           
            if (result.redirectTo) {
                setTimeout(() => {
                    console.log('Redirecting to:', result.redirectTo);
                    window.location.href = result.redirectTo; 
                }, 2000); 
            }
        }

       
        setTimeout(() => {
            messageEl.innerHTML = '';
        }, 3000);
    } catch (error) {
        console.error('Error:', error);

      
        const messageEl = document.getElementById('cart-message');
        messageEl.innerHTML = `
            <div class="alert alert-danger" role="alert">
                An error occurred while adding the product to the cart. Please try again later.
            </div>`;

       
        setTimeout(() => {
            messageEl.innerHTML = '';
        }, 3000);
    }
}