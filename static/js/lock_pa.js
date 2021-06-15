// QR codes

let modal_lock = document.querySelector('.modal_no_access');
let modal_lock_content = document.querySelector('.modal_no_access__content');

function show_no_access() {
    modal_lock.style.display = 'flex';
    modal_lock.style.animation = 'opacity_dark .5s forwards';

    modal_lock_content.style.animation = 'from_center_without_translate .5s forwards'
}

function delete_table(id_table) {
  show_no_access()
}

async function confirm_delete_table(id_table) {
  show_no_access()
}

async function open_qr(id_table) {
  const url = 'https://letseat.su/qr/open_qr';
  const data = {
    'id_table': id_table,
    'id_establishment': (window.location.pathname).split('/')[2],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      }
    });

    const json = await response.json();
    let path_img = json['path_img'];

    document.body.insertAdjacentHTML('afterend', `
    <div class="modal modal-qr" id="modal-qr_${id_table}">
      <div class="modal__content modal-qr__content">
        <div class="close_qr" onclick="close_modal_qr(${id_table})"><span><i class="icon-cancel"></i></span></div>
        <img src="${path_img}" alt="Изображение с qr кодом столика">
        <div class="link-block"><a href="${path_img}" download="proposed_file_name"><span><i class="icon-download-alt"></i></span></a></div>
      </div>
    </div>`);
    let modal_qr = document.querySelector(`#modal-qr_${id_table}`);
    let modal_qr_content = document.querySelector(`#modal-qr_${id_table} .modal-qr__content`);

    modal_qr.style.display = 'flex';
    modal_qr.style.animation = 'opacity_dark .5s forwards';

    modal_qr_content.style.animation = 'from_center_without_translate .5s forwards'


  } catch (error) {
    console.error('Ошибка:', error);
    document.querySelector(`#table-${id_table}`).remove()
  }
}

function close_modal_qr(id_table) {
  let modal_qr = document.querySelector(`#modal-qr_${id_table}`);
  let modal_qr_content = document.querySelector(`#modal-qr_${id_table} .modal-qr__content`);

  modal_qr.style.animation = 'hide_opacity_dark .35s forwards';
  modal_qr_content.style.animation = 'opacity_disappear .35s forwards'

  setTimeout(() => {
    modal_qr.style.display = 'none';
  }, 350)
}


let all_tables = document.querySelector('.qr-codes__content');

async function new_qr_table() {
  show_no_access()
}

async function download_qr_as_pdf() {
  this.event.preventDefault();
  show_no_access()
}

async function download_qr_as_zip(a) {
  this.event.preventDefault();
  show_no_access()
}




// Menu

let add_category = document.querySelector('.menu-block .pa-header_button');

async function complete_create_category() {
  show_no_access()
}

function delete_new_category() {
  show_no_access()
}

function edit_category(id_category) {
  show_no_access()
}

async function complete_edit_category(id_category) {
  show_no_access()
}

function delete_category(id_table) {
  show_no_access()
}

function delete_dish(id_dish) {
  show_no_access()
}

function edit_dish(id_dish) {
  show_no_access()
}

function new_dish(id_category) {
  show_no_access()
}

// Кнопка создания нового блюда
document.querySelector('.modal-dish button').addEventListener('click', async (e) => {
  e.preventDefault();
  show_no_access()
})




// Кнопки
function activate_edit_button(id_button) {
  show_no_access()
}

async function complete_rename_button_post(id_button, new_name) {
  show_no_access()
}

async function complete_rename_button(id_button) {
  show_no_access()
}

function add_button() {
  show_no_access()
}

async function new_button() {
  this.event.preventDefault();
  show_no_access()
}

async function base_post(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      }
    });
    const json = await response.json();

    return json

  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function button_save_message(id_button) {
  show_no_access()
}

function delete_new_button() {
  show_no_access()
}

function button_add_message() {
  show_no_access()
}

function delete_button(id_button) {
  show_no_access()
}

async function confirm_delete_button(id_button) {
  show_no_access()
}

function edit_message_button(id_button) {
  show_no_access()
}

async function check_button(id_button) {
  show_no_access()
}

