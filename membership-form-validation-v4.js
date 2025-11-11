// Form validation for membership registration
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const membershipForm = document.getElementById('membership-form');
    console.log('Membership form element:', membershipForm);

    if (membershipForm) {
        membershipForm.addEventListener('submit', function(event) {
            console.log('Form submission triggered');

            // Check all required fields
            const requiredFields = [
                { id: 'fullName', type: 'text', message: 'Full Name is required.' },
                { id: 'email', type: 'email', message: 'A valid Email Address is required.' },
                { id: 'phone', type: 'tel', message: 'Phone Number is required.' },
                { id: 'employment', type: 'select', message: 'Employment Status must be selected.' },
                { id: 'gender', type: 'select', message: 'Gender must be selected.' },
                { id: 'maritalStatus', type: 'select', message: 'Marital Status must be selected.' },
                { id: 'idFrontUpload', type: 'file', message: 'ID Front upload is required.' },
                { id: 'idBackUpload', type: 'file', message: 'ID Back upload is required.' },
                { id: 'passportUpload', type: 'file', message: 'Passport upload is required.' },
                { id: 'signatureUpload', type: 'file', message: 'Signature upload is required.' },
                { id: 'terms', type: 'checkbox', message: 'You must agree to the terms and conditions.' },
                { id: 'kycCallback', type: 'checkbox', message: 'You must acknowledge the KYC callback notice.' }
            ];

            for (let field of requiredFields) {
                const element = document.getElementById(field.id);
                if (!element) continue;

                let isValid = false;
                switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'tel':
                        isValid = element.value.trim() !== '';
                        break;
                    case 'select':
                        isValid = element.value !== '';
                        break;
                    case 'file':
                        isValid = element.files.length > 0;
                        break;
                    case 'checkbox':
                        isValid = element.checked;
                        break;
                }

                if (!isValid) {
                    alert(field.message);
                    event.preventDefault();
                    element.focus();
                    return false;
                }
            }

            // If all validations pass
            return true;
        });
    }
});
