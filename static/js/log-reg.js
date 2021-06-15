"use strict";

let user_email = document.querySelector('.form_user_email');


let modal_rp = document.querySelector('.modal-rp');
let modal_content = document.querySelector('.modal-rp__content');
let modal_form = document.querySelector('.modal-rp__form form');
let modal_email = modal_rp.querySelector('input');
let modal_button = document.querySelector('.modal-rp__form button');

let modal_send = document.querySelector('.modal-send');
let modal_send_content = document.querySelector('.modal-send__content');

try {
  let modal_confirm = document.querySelector('.modal-confirm_reg');
  let modal_confirm_close = modal_confirm.querySelector('.close_modal');

  modal_confirm_close.addEventListener('click', () => {
    modal_confirm.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_confirm.style.display = 'none';
    }, 400)
  })
} catch (e) {}

try {
  let modal_complete = document.querySelector('.modal-complete-reg');
  let modal_complete_close = modal_complete.querySelector('.close_modal');

  modal_complete_close.addEventListener('click', () => {
    modal_complete.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_complete.style.display = 'none';
    }, 400)
  })
} catch (e) {}


function open_modal() {
  modal_email.value = user_email.value;

  modal_rp.style.display = 'flex';
  modal_rp.style.animation = 'opacity_dark .4s forwards';

  modal_content.style.animation = 'from_center_without_translate .4s forwards';
}

function close_modal() {
  modal_rp.style.animation = 'opacity_disappear .4s forwards';

  setTimeout(() => {
    modal_rp.style.display = 'none';
  }, 400);
}


modal_button.addEventListener('click', () => {
  this.event.preventDefault();

  if (modal_email.value.length > 0) {
    modal_content.style.animation = 'to_center_without_translate .4s forwards';

    setTimeout(() => {
      modal_rp.style.display = 'none';

      modal_send.style.display = 'flex';
      modal_send.style.animation = 'opacity_dark .4s forwards';

      modal_send_content.style.animation = 'from_center_without_translate .4s forwards';
    }, 400);

    setTimeout(() => {
      modal_form.submit();
    }, 2500)
  }
})
