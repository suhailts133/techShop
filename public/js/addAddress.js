(function () {
    'use strict';
  
    const forms = document.querySelectorAll("#addAddressForm");
  
    Array.from(forms).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        let isValid = true;
  
        // Get the input fields
        const addressTypeInput = form.querySelector('#addressType');
        const nameInput = form.querySelector('#name');
        const houseAddressInput = form.querySelector('#houseAddress');
        const landMarkInput = form.querySelector('#landMark');
        const stateInput = form.querySelector('#state');
        const pincodeInput = form.querySelector('#pincode');
        const phoneInput = form.querySelector('#phone');
        const altPhoneInput = form.querySelector('#altPhone');
        const cityInput = form.querySelector('#city');
  
        // Get the feedback elements
        const addressTypeFeedback = addressTypeInput.nextElementSibling;
  
        // Validate Address Type (should not be empty and trimmed)
        const addressTypeValue = addressTypeInput.value.trim();
        if (addressTypeValue === '') {
          isValid = false;
          addressTypeInput.setCustomValidity('Please enter the address type (e.g., Home, Office, Work).');
          addressTypeFeedback.textContent = 'Please enter the address type (e.g., Home, Office, Work).';
        } else {
          addressTypeInput.setCustomValidity('');
          addressTypeFeedback.textContent = '';
        }
  
        // Validate Name (only alphabets and spaces)
        const nameValue = nameInput.value.trim();
        if (nameValue === '' || !/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(nameValue)) {
          isValid = false;
          nameInput.setCustomValidity('Name should only contain alphabets and spaces.');
        } else {
          nameInput.setCustomValidity('');
        }
  
        // Validate House Address (should not be empty)
        const houseAddressValue = houseAddressInput.value.trim();
        if (houseAddressValue === '') {
          isValid = false;
          houseAddressInput.setCustomValidity('House address is required.');
        } else {
          houseAddressInput.setCustomValidity('');
        }
  
        // Validate Landmark (should not be empty)
        const landMarkValue = landMarkInput.value.trim();
        if (landMarkValue === '') {
          isValid = false;
          landMarkInput.setCustomValidity('Landmark is required.');
        } else {
          landMarkInput.setCustomValidity('');
        }
        const cityValue = cityInput.value.trim();
        if (cityValue === '') {
          isValid = false;
          cityInput.setCustomValidity('city is required.');
        } else {
          cityInput.setCustomValidity('');
        }
  
        // Validate State (must be selected)
        const stateValue = stateInput.value;
        if (stateValue === '') {
          isValid = false;
          stateInput.setCustomValidity('Please select a state.');
        } else {
          stateInput.setCustomValidity('');
        }
  
        // Validate Pincode (exactly 6 digits)
        const pincodeValue = pincodeInput.value.trim();
        if (!/^\d{6}$/.test(pincodeValue)) {
          isValid = false;
          pincodeInput.setCustomValidity('Pincode must be exactly 6 digits.');
        } else {
          pincodeInput.setCustomValidity('');
        }
  
        // Validate Phone (exactly 10 digits)
        const phoneValue = phoneInput.value.trim();
        if (!/^\d{10}$/.test(phoneValue)) {
          isValid = false;
          phoneInput.setCustomValidity('Phone number should be exactly 10 digits.');
        } else {
          phoneInput.setCustomValidity('');
        }
  
        // Validate Alt Phone (exactly 10 digits or optional)
        const altPhoneValue = altPhoneInput.value.trim();
        if (altPhoneValue !== '' && !/^\d{10}$/.test(altPhoneValue)) {
          isValid = false;
          altPhoneInput.setCustomValidity('Alternate phone number should be exactly 10 digits.');
        } else {
          altPhoneInput.setCustomValidity('');
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
  