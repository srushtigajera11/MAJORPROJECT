
(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault(); // ✅ Stops form submission if invalid
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();

