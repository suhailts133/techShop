(function () {
    'use strict';
  
    const forms = document.querySelectorAll('#loginForm');
  
    Array.from(forms).forEach(function (form) {
      // Handle form submission
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Get the input fields
        const emailInput = form.querySelector('#email');
        const passwordInput = form.querySelector('#password');
  
        // Get the feedback elements
        const emailFeedback = emailInput.nextElementSibling;
        const passwordFeedback = passwordInput.nextElementSibling;
  
        // Validate email (basic email format)
        const emailValue = emailInput.value;
        if (!emailValue || !emailValue.match(/^[^@]+@[^@]+\.[^@]+$/)) {
          isValid = false;
          emailInput.setCustomValidity('Please enter a valid email address.');
          emailFeedback.textContent = 'Please enter a valid email address.';
        } else {
          emailInput.setCustomValidity('');
          emailFeedback.textContent = '';
        }
  
        // Validate password (cannot be empty)
        const passwordValue = passwordInput.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%#*?&]{8,}$/;
        if (!passwordValue.trim()) {
          isValid = false;
          passwordInput.setCustomValidity('Please enter your password.');
          passwordFeedback.textContent = 'Please enter your password.';
        } 
        else {
          passwordInput.setCustomValidity('');
          passwordFeedback.textContent = '';
        }
  
        // If any field is invalid, prevent form submission
        if (!form.checkValidity() || !isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      });
  
      // Real-time validation: Reset error message when the user types or changes the input
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', function () {
          const feedback = input.nextElementSibling;
          // Check if the input is valid
          if (input.validity.valid) {
            feedback.textContent = ''; // Clear feedback
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
          } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            feedback.textContent = input.validationMessage; // Show the custom validation message
          }
        });
      });
    });
  })();
  