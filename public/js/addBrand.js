(function () {
    'use strict';
  
    const form = document.querySelector('#addBrandForm');
  
    form.addEventListener('submit', function (event) {
      let isValid = true;
  
      // Get the input fields
      const brandNameInput = form.querySelector('#brandName');
      const imageInput = form.querySelector('#image');
  
      // Validate Brand Name (should not be empty and trimmed)
      const brandNameValue = brandNameInput.value.trim();
      if (brandNameValue === '') {
        isValid = false;
        brandNameInput.setCustomValidity('Please enter a brand name.');
        brandNameInput.nextElementSibling.textContent = 'Please enter a brand name.';
      } else {
        brandNameInput.setCustomValidity('');
        brandNameInput.nextElementSibling.textContent = '';
      }
  
      // Validate Image (only image files allowed)
      const imageValue = imageInput.value;
      if (imageValue === '') {
        isValid = false;
        imageInput.setCustomValidity('Please upload a brand logo.');
        imageInput.nextElementSibling.textContent = 'Please upload a brand logo.';
      } else {
        const allowedExtensions = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        const file = imageInput.files[0];
  
        if (!allowedExtensions.includes(file.type)) {
          isValid = false;
          imageInput.setCustomValidity('Please upload a valid image file (JPEG, PNG, or GIF).');
          imageInput.nextElementSibling.textContent = 'Please upload a valid image file (JPEG, PNG, or GIF).';
        } else {
          imageInput.setCustomValidity('');
          imageInput.nextElementSibling.textContent = '';
        }
      }
  
      // If any field is invalid, prevent form submission
      if (!form.checkValidity() || !isValid) {
        event.preventDefault();
        event.stopPropagation();
      }
  
      form.classList.add('was-validated');
    });
  })();
  