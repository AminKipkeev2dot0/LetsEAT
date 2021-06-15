let button_save = document.querySelector('form button');
let error_short = document.querySelector('form .too_short');
let error_not_same = document.querySelector('form .not_the_same');
let first_field = document.querySelector('#first_password');
let second_field = document.querySelector('#second_password');

let form = document.querySelector('form');
let form_button = document.querySelector('form button');

first_field.addEventListener('input', () => {
  if (first_field.value.length < 8) {
    error_short.style.display = 'block';
    error_short.innerText = 'Пароль слишком краткий';
  } else {
    error_short.style.display = 'none';
  }

  if (first_field.value !== second_field.value) {
    error_not_same.style.display = 'block';
    error_not_same.innerText = 'Пароли не совпадают';
  } else {
    error_not_same.style.display = 'none';
  }

  if (first_field.value.length >= 8 && first_field.value === second_field.value) {
    button_save.removeAttribute('disabled');
  } else {
    button_save.setAttribute('disabled', 'disabled');
  }
})

second_field.addEventListener('input', () => {
  if (second_field.value !== first_field.value) {
    error_not_same.style.display = 'block';
    error_not_same.innerText = 'Пароли не совпадают';
  } else {
    error_not_same.style.display = 'none';
  }

  if (first_field.value.length >= 8 && first_field.value === second_field.value) {
    button_save.removeAttribute('disabled');
  } else {
    button_save.setAttribute('disabled', 'disabled');
  }
})

let modal_complete = document.querySelector('#complete_change')
let modal_complete_content = document.querySelector('#complete_change_content')
// $('form').submit(function (e) {
//
//     // Отправка через ajax инфы об изменении пароля
//
//     modal_complete.style.zIndex = '1000';
//     modal_complete.style.opacity = '1';
//     modal_complete.style.animation = 'opacity_dark 0.3s';
//     modal_complete_content.style.animation = 'from_center 0.4s';
//     e.preventDefault();
//
// });

form_button.addEventListener('click', () => {
  this.event.preventDefault();

  modal_complete.style.zIndex = '1000';
  modal_complete.style.opacity = '1';
  modal_complete.style.animation = 'opacity_dark 0.3s';
  modal_complete_content.style.animation = 'from_center 0.4s';

  // if (modal_email.value.length > 0) {
  //   modal_content.style.animation = 'to_center_without_translate .4s forwards';
  //
  //   setTimeout(() => {
  //     modal_rp.style.display = 'none';
  //
  //     modal_send.style.display = 'flex';
  //     modal_send.style.animation = 'opacity_dark .4s forwards';
  //
  //     modal_send_content.style.animation = 'from_center_without_translate .4s forwards';
  //   }, 400);

    setTimeout(() => {
      form.submit();
    }, 2500)
})

