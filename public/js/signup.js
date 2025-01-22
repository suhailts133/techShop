(function () {
    'use strict';
  
    const forms = document.querySelectorAll('.validated-form');
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Get the input fields
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const phoneInput = form.querySelector('#phone');
        const passwordInput = form.querySelector('#password');
        const confirmPasswordInput = form.querySelector('#confirmPassword');
        
        // Get the feedback elements
        const nameFeedback = nameInput.nextElementSibling;
        const emailFeedback = emailInput.nextElementSibling;
        const phoneFeedback = phoneInput.nextElementSibling;
        const passwordFeedback = passwordInput.nextElementSibling;
        const confirmPasswordFeedback = confirmPasswordInput.nextElementSibling;
  
        // Validate Name (only alphabets and spaces)
        const nameValue = nameInput.value;
        if (nameValue.trim() === '' || !/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(nameValue)) {
          isValid = false;
          nameInput.setCustomValidity('Name should only contain alphabets and spaces.');
          nameFeedback.textContent = 'Name should only contain alphabets and spaces.';
        } else {
          nameInput.setCustomValidity('');
          nameFeedback.textContent = '';
        }
  
        // Validate Email (valid email format)
        const emailValue = emailInput.value;
        if (!/\S+@\S+\.\S+/.test(emailValue)) {
          isValid = false;
          emailInput.setCustomValidity('Please enter a valid email address.');
          emailFeedback.textContent = 'Please enter a valid email address.';
        } else {
          emailInput.setCustomValidity('');
          emailFeedback.textContent = '';
        }
  
        // Validate Phone (exactly 10 digits)
        const phoneValue = phoneInput.value;
        if (!/^\d{10}$/.test(phoneValue)) {
          isValid = false;
          phoneInput.setCustomValidity('Phone number should be exactly 10 digits.');
          phoneFeedback.textContent = 'Phone number should be exactly 10 digits.';
        } else {
          phoneInput.setCustomValidity('');
          phoneFeedback.textContent = '';
        }
  
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
  