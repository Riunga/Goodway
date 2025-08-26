// Form validation for membership registration
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const membershipForm = document.getElementById('membership-form');
    console.log('Membership form element:', membershipForm);
    
    if (membershipForm) {
        membershipForm.addEventListener('submit', function(event) {
            console.log('Form submission triggered');
            const termsCheckbox = document.getElementById('terms');
            console.log('Terms checkbox element:', termsCheckbox);
            
            if (!termsCheckbox.checked) {
                alert('You must agree to the terms and conditions before submitting the form.');
                event.preventDefault();
                return false;
            }
            
            // Additional validation can be added here if needed
            return true;
        });
    }
});
