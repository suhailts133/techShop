// Update the main image when a thumbnail is clicked
function updateMainImage(imagePath) {
    document.getElementById('main-image').src = imagePath;
}

// Handle variant selection
function updateVariantDetails() {
    const variantSelect = document.getElementById('variant');
    const variantId = variantSelect.value;

    // Retrieve the productId from the data attribute
    const productId = variantSelect.getAttribute('data-product-id');

    console.log("From JS - Variant ID:", variantId);
    console.log("From JS - Product ID:", productId);

    // Make an AJAX request to fetch the variant details
    $.ajax({
        url: '/updateVariant', // Endpoint to fetch variant details
        type: 'POST',
        data: { productId, variantId },
        success: function (response) {
            // Update price, regular price, and available quantity dynamically
            document.getElementById('price').textContent = `${response.salePrice}`;
            document.getElementById('regular-price').textContent = `${response.price}`;
            document.getElementById('quantity').textContent = response.quantity;

            // Reset selected quantity to 1
            document.getElementById('selected-quantity').textContent = '1';
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


function addToCart() {
    const variantSelect = document.getElementById('variant');
    const variantId = variantSelect.value;
    const productId = variantSelect.getAttribute('data-product-id');
    const quantity = parseInt(document.getElementById('selected-quantity').textContent, 10);  // Get the selected quantity
    const productImage = document.getElementById('main-image').src.split('/').pop();  // Get the main image of the product (image filename)

    // Prepare data to send in the POST request
    const data = {
        productId: productId,
        variantId: variantId,
        quantity: quantity,
        productImage: productImage  // Only the image filename
    };
    console.log(data);

    // Send the data to the backend via POST request
    fetch('/addToCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            const messageEl = document.getElementById('cart-message');
            const message = data.message || 'An unexpected error occurred.';

            if (data.success) {
                // Show success message
                messageEl.innerHTML = `
                <div class="alert alert-success" role="alert">
                ${message}
                </div>`;

                if (data.redirectTo) {
                    setTimeout(() => {
                        window.location.href = data.redirectTo;  // Redirect to login page
                    }, 2000); // You can adjust the timeout
                }
            } else {
                // Show error message
                messageEl.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>`;

                // If the response has a redirectTo URL, redirect to the login page
                if (data.redirectTo) {
                    setTimeout(() => {
                        window.location.href = data.redirectTo;  // Redirect to login page
                    }, 2000); // You can adjust the timeout
                }
            }

            // Clear the message after 3 seconds
            setTimeout(() => {
                messageEl.innerHTML = '';
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);

            // Show error message
            const messageEl = document.getElementById('cart-message');
            messageEl.innerHTML = `
            <div class="alert alert-danger" role="alert">
                An error occurred while adding the product to the cart. Please try again later.
            </div>`;

            // Clear the message after 3 seconds
            setTimeout(() => {
                messageEl.innerHTML = '';
            }, 1000);
        });
}
