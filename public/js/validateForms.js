// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// const inputValidation = (e) => {

//     // get value form event
//     const value = e.target.value

//     // validate value
//     const validatedValue = value.replace(/[^0-9]/g, '');

//     return validatedValue;


// }
const nav = document.querySelector('.active');


function toggle(el, className) {
    if (el.classList.contains(className)) {
        el.classList.remove(className)
    }
    else {
        el.classList.add(className)
    }
}

nav.addEventListener('click', (e) => {

    toggle(e.target, 'red')
})