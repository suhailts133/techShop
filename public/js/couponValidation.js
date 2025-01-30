document.getElementById('applyCouponBtn').addEventListener('click', async () => {
  const couponCode = document.getElementById('couponCode').value;
  const cartTotalElement = document.getElementById('cartTotal');
  const cartTotal = parseFloat(cartTotalElement.dataset.total); // Get from data attribute
  const couponMessage = document.getElementById('couponMessage');
  const discountDisplay = document.getElementById('discountDisplay');
  const discountAmount = document.getElementById('discountAmount');
  const finalTotal = document.getElementById('finalTotal');

  if (!couponCode) {
    couponMessage.textContent = 'Please enter a coupon code.';
    return;
  }

  try {
    const response = await fetch('/checkout/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode, cartTotal })
    });

    // Handle 401 Unauthorized (from checkAuth middleware)
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    const data = await response.json();

    if (data.success) {
      discountDisplay.classList.remove('d-none');
      discountAmount.textContent = data.discountAmount.toFixed(2);
      finalTotal.textContent = (cartTotal - data.discountAmount).toFixed(2);
      couponMessage.textContent = 'Coupon applied successfully!';
      couponMessage.classList.remove('text-danger');
      couponMessage.classList.add('text-success');
    } else {
      couponMessage.textContent = data.message;
      couponMessage.classList.remove('text-success');
      couponMessage.classList.add('text-danger');
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    couponMessage.textContent = 'Error applying coupon. Please try again.';
  }
});