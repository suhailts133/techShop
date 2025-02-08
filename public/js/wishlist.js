document.addEventListener("DOMContentLoaded", async function () {
    const wishlistIcon = document.getElementById("wishlist-icon");
    const variantSelect = document.getElementById("variant");

    if (!wishlistIcon || !variantSelect) {
        console.error("Wishlist icon or variant selector not found.");
        return;
    }

    let productId = variantSelect.getAttribute("data-product-id");
    let variantId = variantSelect.value;

    async function updateWishlistStatus() {
        try {
            const response = await fetch(`/wishlistStatus?productId=${productId}&variantId=${variantId}`);
            const result = await response.json();
        console.log(result);
        
            wishlistIcon.innerHTML = result.isInWishlist
                ? '<i class="bi bi-heart-fill fs-3 text-danger"></i>'  
                : '<i class="bi bi-heart fs-3 text-white"></i>';  
        } catch (error) {
            console.error("Error while updating wishlist item status:", error.message);
        }
    }
    
    await updateWishlistStatus();

   
    variantSelect.addEventListener("change", async function () {
        variantId = this.value;
        await updateWishlistStatus();
    });

    wishlistIcon.addEventListener("click", async function () {
        try {
            const response = await fetch("/wishlistToggle", {
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
                wishlistIcon.innerHTML = result.added
                    ? '<i class="bi bi-heart-fill fs-3 text-danger"></i>'  
                    : '<i class="bi bi-heart fs-3 text-white"></i>';  
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error("Error while toggling wishlist:", error.message);
        }
    });
});
