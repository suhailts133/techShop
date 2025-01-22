(function () {
    'use strict';
  
    // Select the forget password form
    const form = document.querySelector('#forgetPasswordForm');
  
    if (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Select the email input and its feedback element
        const emailInput = form.querySelector('#email');
        const emailFeedback = form.querySelector('.invalid-feedback');
  
        // Validate Email (valid email format)
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
        if (!emailRegex.test(emailValue)) {
          isValid = false;
          emailInput.setCustomValidity('Invalid email address.');
          emailFeedback.textContent = 'Please enter a valid email address.';
        } else {
          emailInput.setCustomValidity('');
          emailFeedback.textContent = '';
        }
  
        // If the form is invalid, prevent submission
        if (!form.checkValidity() || !isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      });
    }
  })();
  