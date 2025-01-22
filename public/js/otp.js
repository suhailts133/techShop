function moveToNext(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
    if (index === inputs.length - 1) {
      // Combine the values into the hidden input
      document.getElementById('otp').value = Array.from(inputs).map(input => input.value).join('');
    }
  }

  document.getElementById("otpForm").addEventListener("submit", () => {
    document.getElementById("otp").value = Array.from(
      document.querySelectorAll(".otp-input")
    )
      .map((input) => input.value)
      .join("");
  });

  // Start the timer
  let timer = 60;
  let timerInterval;

  function startTimer() {
    timerInterval = setInterval(() => {
      timer--;
      document.getElementById("timerValue").textContent = timer;
      if (timer <= 0) {
        clearInterval(timerInterval);
        document.getElementById("timerValue").classList.add("text-danger");
        document.getElementById("timerValue").textContent = "Expired";
        document.querySelectorAll(".otp-input").forEach(input => input.disabled = true);
        document.getElementById("resendOTPButton").disabled = false;
      }
    }, 1000);
  }

  startTimer();

  function validateOTPForm() {
    const otpInput = document.getElementById("otp").value;
    if (otpInput.length !== 6) {
        Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text: "Please enter a 6-digit OTP.",
        });
        clearOTPFields(); // Clear fields when OTP is invalid
        return false;
    }

    $.ajax({
        type: "POST",
        url: "verify-otp",
        data: { otp: otpInput },
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "OTP verified successfully",
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    window.location.href = response.redirectUrl;
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message,
                });
                clearOTPFields(); // Clear fields when OTP is invalid
            }
        },
        error: function () {
            Swal.fire({
                icon: "error",
                title: "Invalid OTP",
                text: "Please try again",
            });
            clearOTPFields(); // Clear fields on error
        },
    });
    return false;
}


function clearOTPFields() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(input => {
        input.value = ''; 
        input.disabled = false; 
    });
    inputs[0].focus(); 
    document.getElementById("otp").value = ''; 
}


  function resendOTP() {
    clearInterval(timerInterval);
    timer = 60;
    document.querySelectorAll(".otp-input").forEach(input => input.disabled = false);
    document.getElementById("timerValue").classList.remove("text-danger");
    document.getElementById("timerValue").textContent = timer;
    startTimer();

    document.getElementById("resendOTPButton").disabled = true;

    $.ajax({
      type: "POST",
      url: "resend-otp",
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "OTP resent successfully",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while resending the OTP. Please try again.",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
        });
      },
    });
  }