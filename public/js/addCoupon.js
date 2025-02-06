
(function () {
    'use strict';
  
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function (event) {
      let isValid = true;
  
    
      const nameInput = document.querySelector('#name');
      const discountValueInput = document.querySelector('#discountValue');
      const minPurchaseInput = document.querySelector('#minPurchase');
      const validityDurationInput = document.querySelector('#validityDuration');
      
   
      const nameFeedback = nameInput.nextElementSibling;
      const discountFeedback = discountValueInput.nextElementSibling;
      const minPurchaseFeedback = minPurchaseInput.nextElementSibling;
      const validityFeedback = validityDurationInput.nextElementSibling;
  
      const nameValue = nameInput.value.trim();
      if (nameValue === '' || !/^[a-zA-Z0-9 ]+$/.test(nameValue)) {
        isValid = false;
        nameInput.setCustomValidity('Coupon name should contain only letters, numbers, and spaces.');
        nameFeedback.textContent = 'Coupon name should contain only letters, numbers, and spaces.';
      } else {
        nameInput.setCustomValidity('');
        nameFeedback.textContent = '';
      }
  

      const discountValue = parseFloat(discountValueInput.value);
      if (isNaN(discountValue) || discountValue <= 0) {
        isValid = false;
        discountValueInput.setCustomValidity('Discount value must be a positive number.');
        discountFeedback.textContent = 'Discount value must be a positive number.';
      } else {
        discountValueInput.setCustomValidity('');
        discountFeedback.textContent = '';
      }
  

      const minPurchaseValue = minPurchaseInput.value;
      if (minPurchaseInput.value !== '' && (isNaN(minPurchaseValue) || minPurchaseValue < 0)) {
        isValid = false;
        minPurchaseInput.setCustomValidity('Minimum purchase must be a positive number or left empty.');
        minPurchaseFeedback.textContent = 'Minimum purchase must be a positive number or left empty.';
      } else {
        minPurchaseInput.setCustomValidity('');
        minPurchaseFeedback.textContent = '';
      }
  

      const validityValue = parseInt(validityDurationInput.value, 10);
      if (isNaN(validityValue) || validityValue < 1) {
        isValid = false;
        validityDurationInput.setCustomValidity('Validity duration must be at least 1 day.');
        validityFeedback.textContent = 'Validity duration must be at least 1 day.';
      } else {
        validityDurationInput.setCustomValidity('');
        validityFeedback.textContent = '';
      }
  

      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();
      }
  
      form.classList.add('was-validated');
    });
  })();
  