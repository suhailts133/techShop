document.addEventListener("DOMContentLoaded", function () {
    const wishlistIcons = document.querySelectorAll(".wishlist-icon");

    wishlistIcons.forEach(icon => {
        icon.addEventListener("click", async function () {
            const productId = this.getAttribute("data-product-id");
            const variantId = this.getAttribute("data-variant-id");

            try {
                const response = await fetch('/wishlistToggle', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, variantId })
                });

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    icon.innerHTML = result.added
                        ? '<i class="bi bi-heart-fill fs-3 text-danger"></i>' // Added (Red)
                        : '<i class="bi bi-heart fs-3 text-dark"></i>'; // Removed (Dark)
                } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error("Error toggling wishlist:", error.message);
            }
        });
    });
});