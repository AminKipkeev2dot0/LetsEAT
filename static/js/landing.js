const csrftoken = Cookies.get('csrftoken');

let learn_more_block = document.getElementById("how-its-work");
let contact_form_block = document.getElementById('contact_form');
let header_block = document.querySelector('header')

let btn_header = document.querySelector('.button_scroll');
let btn_learn_more = document.querySelector('.header__content-buttons .learn-more');
let btn_contact_us = document.querySelector('.header__content-buttons .contact-with-us');

let m_btn_learn_more = document.querySelector('.m-header__content-buttons .learn-more');
let m_btn_contact_us = document.querySelector('.m-header__content-buttons .contact-with-us');

let btn_to_top = document.querySelector('.to_top')

function go_to_how_its_work() {
  learn_more_block.scrollIntoView({block: "start", behavior: "smooth"});
}

function go_to_contact_form() {
  contact_form_block.scrollIntoView({block: "start", behavior: "smooth"});
}

function go_to_top() {
  header_block.scrollIntoView({block: "start", behavior: "smooth"});
}

btn_header.addEventListener('click', go_to_how_its_work);

btn_learn_more.addEventListener('click', go_to_how_its_work);
btn_contact_us.addEventListener('click', go_to_contact_form);

m_btn_learn_more.addEventListener('click', go_to_how_its_work);
m_btn_contact_us.addEventListener('click', go_to_contact_form);

btn_to_top.addEventListener('click', go_to_top);


let btn_mail = document.querySelector('#btn-mail');
btn_mail.addEventListener('click', async (e) => {
  e.preventDefault();
  btn_mail.setAttribute('disabled', 'disabled');
  form = document.querySelector('#contact_form form');
  const formData = new FormData(form);

  let name_i = form.querySelector('input[name="tsafdsa"]');
  let email_i = form.querySelector('input[name="fdshghh"]');
  let phone_i = form.querySelector('input[name="phone"]');
  let message = form.querySelector('textarea');

  let fake_name = form.querySelector('input[name="name"]');
  let fake_email = form.querySelector('input[name="email"]');

  if ((fake_name.value.length === 0 && fake_email.value.length === 0) &&
      (name_i.value.length > 0) && (email_i.value.length > 0) &&
      (phone_i.value.length > 0) && (message.value.length > 0)) {

    btn_mail.innerText = 'Отправляем';
    btn_mail.setAttribute('disabled', 'disabled');
    let anim_send = setInterval(() => {
      if (btn_mail.innerText.length > 13) {
        btn_mail.innerText = 'Отправляем';
      } else {
        btn_mail.innerText += '.';
      }
    }, 700);

    let url = 'https://letseat.su/send_message';
    const fetchResp = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': csrftoken,
      }
    });
    if (!fetchResp.ok) {
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${fetchResp.status}`);
    }

    let json = await fetchResp.json();
    if (json['status'] === 'ok') {
      clearInterval(anim_send);
      btn_mail.innerText = 'Отправить';
      btn_mail.removeAttribute('disabled');

      form.reset();
      btn_mail.removeAttribute('disabled');
      let modal_message = document.querySelector('#send_message');
      let modal_message_content = document.querySelector('#send_message_content');

      modal_message.style.animation = 'opacity_emergence .4s forwards';
      modal_message.style.zIndex = '9';
      modal_message_content.style.animation = 'from_center .4s forwards';

      setTimeout(() => {
        modal_message.style.animation = 'opacity_disappear .5s forwards';
        modal_message.style.zIndex = '-1';
      }, 3000)
    }
  }
})

