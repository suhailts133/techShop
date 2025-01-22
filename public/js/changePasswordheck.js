(function () {
    'use strict';
  
    const forms = document.querySelectorAll('#changePasswordCheck');
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
      
        const passwordInput = form.querySelector('#password');
        
        
        
        const passwordFeedback = passwordInput.nextElementSibling;
  
  
  
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
  
        
        // If any field is invalid, prevent form submission
        if (!form.checkValidity() || !isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      });
    });
  })();
  