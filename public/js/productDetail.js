
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
    const availableQuantityText = document.getElementById('quantity').textContent;
    const availableQuantity = parseInt(availableQuantityText, 10) || 0; // Handle "Out of Stock" or NaN
    const errorEl = document.getElementById('quantity-error');
    const decreaseBtn = document.querySelector('.quantity-control button:first-child'); // `-` button
    const increaseBtn = document.querySelector('.quantity-control button:last-child'); // `+` button
    let currentQuantity = parseInt(quantityEl.textContent, 10);

    // Define the maximum allowed quantity (whichever is smaller: 10 or available stock)
    const maxAllowedQuantity = Math.min(10, availableQuantity);

    // Calculate the new quantity
    const newQuantity = currentQuantity + amount;

    // Check if the new quantity is within valid limits
    if (newQuantity >= 1 && newQuantity <= maxAllowedQuantity) {
        quantityEl.textContent = newQuantity;
        errorEl.style.display = 'none';
        currentQuantity = newQuantity;
    } else if (newQuantity > maxAllowedQuantity) {
        errorEl.textContent = availableQuantity < 10
            ? `Only ${availableQuantity} items available in stock.` 
            : 'Maximum quantity per order is 10.';
        errorEl.style.display = 'block';
    } else if (newQuantity < 1) {
        errorEl.textContent = 'Minimum quantity is 1.';
        errorEl.style.display = 'block';
    }

    // Update button states
    decreaseBtn.disabled = currentQuantity <= 1;
    increaseBtn.disabled = currentQuantity >= maxAllowedQuantity;
}

document.addEventListener('DOMContentLoaded', function () {
    // Ensure the DOM is fully loaded before calling changeQuantity
    changeQuantity(0);
});

async function addToCart() {
    try {
        const variantSelect = document.getElementById('variant');
        const variantId = variantSelect.value;
        const productId = variantSelect.getAttribute('data-product-id');
        const quantity = 1
        const productImage = document.getElementById('main-image').src.split('/').pop(); // Get the main image filename

        // Prepare data to send in the POST request
        const data = {
            productId: productId,
            variantId: variantId,
            quantity: quantity,
            productImage: productImage // Only the image filename
        };
        

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
        }, 2000);
    } catch (error) {
        console.error('Error:', error);

      
        const messageEl = document.getElementById('cart-message');
        messageEl.innerHTML = `
            <div class="alert alert-danger" role="alert">
                An error occurred while adding the product to the cart. Please try again later.
            </div>`;

       
        setTimeout(() => {
            messageEl.innerHTML = '';
        }, 2000);
    }
}