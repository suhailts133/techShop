(function () {
    'use strict';
  
    // Select the form
    const form = document.querySelector('#addCategoryForm');
  
    if (form) {
      // Handle form submission
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Get input fields
        const nameInput = form.querySelector('#name');
        const descriptionInput = form.querySelector('#description');
  
        // Get feedback elements
        const nameFeedback = nameInput.nextElementSibling;
        const descriptionFeedback = descriptionInput.nextElementSibling;
  
        // Validate name (cannot be empty)
        const nameValue = nameInput.value.trim();
        if (!nameValue) {
          isValid = false;
          nameInput.classList.add('is-invalid');
          nameFeedback.textContent = 'Please enter a category name.';
        } else {
          nameInput.classList.remove('is-invalid');
          nameInput.classList.add('is-valid');
          nameFeedback.textContent = '';
        }
  
        // Validate description (cannot be empty)
        const descriptionValue = descriptionInput.value.trim();
        if (!descriptionValue) {
          isValid = false;
          descriptionInput.classList.add('is-invalid');
          descriptionFeedback.textContent = 'Please provide a description for the category.';
        } else {
          descriptionInput.classList.remove('is-invalid');
          descriptionInput.classList.add('is-valid');
          descriptionFeedback.textContent = '';
        }
  
        // Prevent form submission if validation fails
        if (!isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        // Add was-validated class for Bootstrap styling
        form.classList.add('was-validated');
      });
  
      // Real-time validation: Reset error messages when the user types
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', function () {
          if (input.checkValidity()) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            input.nextElementSibling.textContent = ''; // Clear feedback
          }
        });
      });
    }
  })();
  