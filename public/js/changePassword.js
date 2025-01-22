(function () {
    'use strict';
  
    const forms = document.querySelectorAll('#changePassword');
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  

        const passwordInput = form.querySelector('#password');
        const confirmPasswordInput = form.querySelector('#confirmPassword');
        
        const passwordFeedback = passwordInput.nextElementSibling;
        const confirmPasswordFeedback = confirmPasswordInput.nextElementSibling;
  
        // Validate Password (regex check for upper/lowercase, number, special character)
        const passwordValue = passwordInput.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%#*?&]{8,}$/;
        if (!passwordRegex.test(passwordValue)) {
          isValid = false;
          passwordInput.setCustomValidity('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.');
          passwordFeedback.textContent = 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.';
        } else {
          passwordInput.setCustomValidity('');
          passwordFeedback.textContent = '';
        }
  
        // Validate Confirm Password (must match password)
        const confirmPasswordValue = confirmPasswordInput.value;
        if (confirmPasswordValue !== passwordValue) {
          isValid = false;
          confirmPasswordInput.setCustomValidity('Passwords must match.');
          confirmPasswordFeedback.textContent = 'Passwords do not match.';
        } else {
          confirmPasswordInput.setCustomValidity('');
          confirmPasswordFeedback.textContent = '';
        }
  
        // If any field is invalid, prevent form submission
        if (!form.checkValidity() || !isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      });
    });
  })();
  