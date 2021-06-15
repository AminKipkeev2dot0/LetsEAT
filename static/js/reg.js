let button_reg = document.querySelector('form button');

let checkbox_terms = document.querySelector('input[type="checkbox"]');

checkbox_terms.addEventListener('change', () => {
    if (checkbox_terms.checked) {
        button_reg.removeAttribute('disabled');
    } else {
        button_reg.setAttribute('disabled', 'disabled');
    }
})

let input_name = document.querySelector('#id_first_name');
let input_username = document.querySelector('#username');

button_reg.addEventListener('click', (e) => {
    e.preventDefault();
    input_username.value = input_name.value.split(' ')[0] + String(Number(Math.random() * 100000).toFixed(0));
    document.querySelector('form').submit();
})

