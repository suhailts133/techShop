(function () {
    'use strict';
  
    const forms = document.querySelectorAll('#editProfile');
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Get the input fields
        const nameInput = form.querySelector('#name');

        const phoneInput = form.querySelector('#phone');

        // Get the feedback elements
        const nameFeedback = nameInput.nextElementSibling;

        const phoneFeedback = phoneInput.nextElementSibling;

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
  
    
        // If any field is invalid, prevent form submission
        if (!form.checkValidity() || !isValid) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      });
    });
  })();
  