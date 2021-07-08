// QR codes

// let domain = 'http://127.0.0.1:8000';
let domain = 'https://letseat.su';

function delete_table(id_table) {
  let table = document.querySelector(`#table-${id_table}`);
  let number_table = Number(table.querySelector(`.number-table`).innerText);

  let modal_delete_description = modal_delete.querySelector('p span');
  let modal_delete_info = modal_delete.querySelector('.modal_delete__info');
  let confirm_delete_button = modal_delete.querySelector('.button-confirm-delete');
  confirm_delete_button.setAttribute('onclick', `confirm_delete_table(${id_table})`)

  modal_delete_description.innerText = `столик №${number_table}`
  modal_delete_info.innerText = ''

  modal_delete.style.display = 'flex';
  modal_delete.style.animation = 'opacity_dark .5s forwards';

  modal_delete_content.style.animation = 'from_center_without_translate .5s forwards';
}

async function confirm_delete_table(id_table) {
  const url = domain + '/qr/delete';
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

    let modal_delete_description = modal_delete.querySelector('p span');
    let modal_delete_info = modal_delete.querySelector('.modal_delete__info');

    setTimeout(() => {
      modal_delete_description.innerText = '';
      modal_delete_info.innerText = '';
    }, 400)

    let table = document.querySelector(`#table-${id_table}`);
    modal_delete.style.animation = 'hide_opacity_dark .4s forwards'
    modal_delete_content.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_delete.style.display = 'none';
    }, 400)

    table.remove();


  } catch (error) {
    console.error('Ошибка:', error);
    document.querySelector(`#table-${id_table}`).remove()
  }
}

async function open_qr(id_table) {
  const url = domain + '/qr/open_qr';
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
  const url = domain + '/qr/new';
  const data = {
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
    if (json['status'] === 'ok') {
      let pk = json['pk'];
      let number_table = json['table'];


      let plus_qr_table = document.querySelector('.qr-codes__plus');

      plus_qr_table.innerHTML = `<div class="qr-item__header">
                <p class="number-table">${number_table}</p>
                <p class="p-table">Столик</p>
              </div>
              <div class="qr-item__menu">
                <span onclick="open_qr(${pk})"><i class="icon-qrcode"></i></span>
                <span onclick="delete_table(${pk})"><i class="icon-trash"></i></span>
              </div>`
      plus_qr_table.classList.add('qr-codes__item');
      plus_qr_table.id = `table-${pk}`;
      plus_qr_table.removeAttribute('onclick');
      plus_qr_table.classList.remove('qr-codes__plus');
      all_tables.insertAdjacentHTML('beforeend',
          `<div class="qr-codes__plus" onclick="new_qr_table()">
                    <span><i class="icon-plus-1"></i></span>
                </div>`);
    }

  } catch (error) {
    console.error('Ошибка:', error);
  }

}

async function download_qr_as_pdf() {
  this.event.preventDefault();

  const url = domain + '/qr/download_qrs_pdf';
  const data = {
    'id_establishment': (window.location.pathname).split('/')[2],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
    const json = await response.json();
    if (json['status'] === 'ok') {
      window.location = json['path_pdf'];
    }

  } catch (error) {
    console.error('Ошибка: ', error);
  }

}

async function download_qr_as_zip(a) {
  this.event.preventDefault();

  const url = domain + '/qr/download_qrs_zip';
  const data = {
    'id_establishment': (window.location.pathname).split('/')[2],
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
    const json = await response.json();
    if (json['status'] === 'ok') {
     window.location = json['path_zip'];
    }

  } catch (error) {
    console.error('Ошибка: ', error);
  }
}




// Menu

let add_category = document.querySelector('.menu-block .pa-header_button');

add_category.addEventListener('click', () => {
  // Проверяю было ли уже ранее нажато на создание новой категории(и не закончено)
  let check_new_category = document.querySelector('#new_category');
  if (check_new_category) {
    // Если ранее создание не было закончено, то перейти к вводу названия новой категории к ранее созданому инпуту
    let new_category_input = check_new_category.querySelector('.title_category');
    new_category_input.focus();
  } else {
    let all_categories_block = document.querySelector('.menu-block__categories');
    all_categories_block.insertAdjacentHTML('beforeend', `
      <div class="menu-block__category" id="new_category">
        <input type="text" class="title_category"
          size="8" placeholder="Название"
          minlength="1" maxlength="30"
          onkeydown="size=value.length||15" onkeyup="onkeydown()"
          onkeypress="onkeydown()" onchange="onkeydown()"
        />
        <span class="edit-category">
          <i class="icon-pencil-1 button-edit-category"></i>
          <i class="icon-check button-complete-edit-category" onclick="complete_create_category()"></i>
          <i class="icon-trash button-delete-category" onclick="delete_new_category()"></i>
        </span>
        <div class="menu-block__dishes">
        </div>
      </div>
    `);

    let new_category = Array.from(all_categories_block.querySelectorAll('.menu-block__category')).slice(-1)[0]
    let input_category = new_category.querySelector('.title_category');
    let button_edit_category = new_category.querySelector('.button-edit-category');
    let button_complete_edit_category = new_category.querySelector('.button-complete-edit-category');
    let button_delete_category = new_category.querySelector('.button-delete-category');

    input_category.focus();
    button_edit_category.style.display = 'none';
    button_complete_edit_category.style.display = 'inline';
    button_delete_category.style.display = 'inline';
  }

})

async function complete_create_category() {
  let new_category = document.querySelector('#new_category');
  let new_category_title = new_category.querySelector('.title_category');
  let new_category_dishes = new_category.querySelector('.menu-block__dishes');


  if (new_category_title.value.length > 0) {
    let url = domain + '/menu/add_category';
    let data = {
      'name_category': new_category_title.value,
      'id_establishment': (window.location.pathname).split('/')[2]
    }

    let result_json = await base_post(url, data);

    if (result_json['status'] === 'ok') {
      let pk = result_json['pk'];

      new_category.id = `category_${pk}`
      let button_edit_category = new_category.querySelector('.button-edit-category');
      let button_complete_edit_category = new_category.querySelector('.button-complete-edit-category');
      let button_delete_category = new_category.querySelector('.button-delete-category');

      button_edit_category.style.display = 'inline';
      button_edit_category.setAttribute('onclick', `edit_category(${pk})`);

      button_complete_edit_category.style.display = 'none';
      button_complete_edit_category.setAttribute('onclick', `complete_edit_category(${pk})`);

      button_delete_category.style.display = 'none';
      button_delete_category.setAttribute('onclick', `delete_category(${pk})`);

      new_category_title.setAttribute('disabled', 'disabled');

      new_category_dishes.insertAdjacentHTML('beforeend', `<div class="dish__plus"><span onclick="new_dish(${pk})"><i class="icon-plus-1"></i></span></div>`)
    }


  }
}

function delete_new_category() {
  document.querySelector('#new_category').remove();
}

function edit_category(id_category) {
  let category = document.querySelector(`#category_${id_category}`);
  let category_input = category.querySelector('.title_category');

  category_input.removeAttribute('disabled');
  category_input.focus();

  let category_edit_button = category.querySelector('.button-edit-category');
  let complete_edit_button = category.querySelector('.button-complete-edit-category');
  let delete_category_button = category.querySelector('.button-delete-category');

  category_edit_button.style.display = 'none';
  complete_edit_button.style.display = 'inline';
  delete_category_button.style.display = 'inline';
}

async function complete_edit_category(id_category) {
  let category = document.querySelector(`#category_${id_category}`);
  let category_input = category.querySelector('.title_category');

  if (category_input.value.length > 0) {
    let url = domain + '/menu/rename_category';
    let data = {
      'id_establishment': (window.location.pathname).split('/')[2],
      'id_category': id_category,
      'new_name': category_input.value,
    }

    let result_json = await base_post(url, data);

    if (result_json['status'] === 'ok') {
      let category_edit_button = category.querySelector('.button-edit-category');
      let complete_edit_button = category.querySelector('.button-complete-edit-category');
      let delete_category_button = category.querySelector('.button-delete-category');

      category_input.setAttribute('disabled', 'disabled');
      category_edit_button.style.display = 'inline';
      complete_edit_button.style.display = 'none';
      delete_category_button.style.display = 'none';
    }
  }
}

function delete_category(id_table) {
  let category = document.querySelector(`#category_${id_table}`);
  let category_title = category.querySelector('.title_category').value;

  let modal_delete_description = modal_delete.querySelector('p span');
  let modal_delete_info = modal_delete.querySelector('.modal_delete__info')
  let confirm_delete_button = modal_delete.querySelector('.button-confirm-delete');

  confirm_delete_button.setAttribute('onclick', `confirm_delete_category(${id_table})`)

  modal_delete_description.innerText = `категорию "${category_title}"`
  modal_delete_info.innerText = `(Все блюда этой категории также удалятся.)`

  modal_delete.style.display = 'flex';
  modal_delete.style.animation = 'opacity_dark .5s forwards';

  modal_delete_content.style.animation = 'from_center_without_translate .5s forwards';
}

async function confirm_delete_category(id_category) {
  let url = domain + '/menu/delete_category';
  let data = {
    'id_establishment': (window.location.pathname).split('/')[2],
    'id_category': id_category,
  }

  let result_json = await base_post(url, data);

  if (result_json['status'] === 'ok') {
    let modal_delete_description = modal_delete.querySelector('p span');
    let modal_delete_info = modal_delete.querySelector('.modal_delete__info');

    setTimeout(() => {
      modal_delete_description.innerText = '';
      modal_delete_info.innerText = '';
    }, 400)

    let category = document.querySelector(`#category_${id_category}`);
    modal_delete.style.animation = 'hide_opacity_dark .4s forwards'
    modal_delete_content.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_delete.style.display = 'none';
    }, 400)

    category.remove();
  }
}

function delete_dish(id_dish) {
  let dish_block = document.querySelector(`#dish_${id_dish}`);
  let dish_title = dish_block.querySelector('h4').innerText.split('(').slice(0, -1).join('(').trim();

  let modal_delete_description = modal_delete.querySelector('p span');
  let confirm_delete_button = modal_delete.querySelector('.button-confirm-delete');

  confirm_delete_button.setAttribute('onclick', `confirm_delete_dish(${id_dish})`)

  modal_delete_description.innerText = `блюдо "${dish_title}"`

  modal_delete.style.display = 'flex';
  modal_delete.style.animation = 'opacity_dark .5s forwards';

  modal_delete_content.style.animation = 'from_center_without_translate .5s forwards';
}

async function confirm_delete_dish(id_dish) {
  let url = domain + '/menu/delete_dish';
  let data = {
    'id_dish': id_dish,
  }

  let result_json = await base_post(url, data);

  if (result_json['status'] === 'ok') {
    let modal_delete_description = modal_delete.querySelector('p span');
    let modal_delete_info = modal_delete.querySelector('.modal_delete__info');

    setTimeout(() => {
      modal_delete_description.innerText = '';
      modal_delete_info.innerText = '';
    }, 400)


    let dish_block = document.querySelector(`#dish_${id_dish}`);
    modal_delete.style.animation = 'hide_opacity_dark .4s forwards'
    modal_delete_content.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_delete.style.display = 'none';
    }, 400)

    dish_block.remove();
  }
}


// Отображение выбраного изображения в форме изменения  блюда
let modal_dish_edit_img = document.querySelector('.modal-dish-edit input[type="file"]');
let custom_label_dish_edit = document.querySelector('.modal-dish-edit .dish-load-img');
modal_dish_edit_img.addEventListener('change', async (e) => {
  custom_label_dish_edit.innerText = 'Выбрано: ' + String(modal_dish_edit_img.files[0].name);
});


let edit_dish_name = '';
let edit_dish_price = 0;
let edit_dish_description = '';
let edit_dish_picture = false;
function edit_dish(id_dish) {
  custom_label_dish_edit.innerHTML = 'Изменить изображение <i class="icon-plus"></i>';
  let dish_block = document.querySelector(`#dish_${id_dish}`);
  let dish_title = dish_block.querySelector('h4').innerText.split('(').slice(0, -1).join('(').trim();
  let dish_price = dish_block.querySelector('h4').innerText.split('(').slice(-1)[0].slice(0,-2);
  let dish_description = dish_block.querySelector('.dish__description').innerText;

  let modal_edit = document.querySelector('.modal-dish-edit');
  let modal_edit_content = modal_edit.querySelector('.modal-dish-edit__content');
  let modal_id_dish = modal_edit.querySelector('input[type="hidden"]');
  let modal_edit_title = modal_edit.querySelector('.modal-dish-edit-title');
  let modal_edit_price = modal_edit.querySelector('.modal-dish-edit-price');
  let modal_edit_description = modal_edit.querySelector('.modal-dish-edit-description');
  let dish_picture = modal_edit.querySelector('input[type="file"]');

  modal_id_dish.value = id_dish;

  dish_picture.addEventListener('change', () => {
    edit_dish_picture = true;
  })

  modal_edit.style.animation = 'opacity_dark .5s forwards';
  modal_edit_content.style.animation = 'from_center_without_translate .5s forwards'
  modal_edit.style.display = 'flex';
  modal_edit_content.style.display = 'flex';

  modal_edit_title.value = dish_title;
  modal_edit_price.value = dish_price;
  modal_edit_description.value = dish_description;

  edit_dish_name = modal_edit_title.value;
  edit_dish_price = modal_edit_price.value;
  edit_dish_description = modal_edit_description.value;
}


// Кнопка сохранения изменений блюда
let edit_dish_button = document.querySelector('.modal-dish-edit button');
edit_dish_button.addEventListener('click', async () => {
  this.event.preventDefault();

  let button_edit = document.querySelector('.modal-dish-edit button');
  button_edit.innerText = 'Сохранение';
  button_edit.setAttribute('disabled', 'disabled');
  let anim_save = setInterval(() => {
    if (button_edit.innerText.length > 13) {
      button_edit.innerText = 'Сохранение';
    } else {
      button_edit.innerText += '.';
    }
  }, 700);

  let modal_edit = document.querySelector('.modal-dish-edit');
  let modal_id_dish = modal_edit.querySelector('input[type="hidden"]');
  // let modal_edit_content = modal_edit.querySelector('.modal-dish-edit__content');
  // let dish_picture = modal_edit.querySelector('input[type="file"]');
  let modal_edit_title = modal_edit.querySelector('.modal-dish-edit-title').value;
  let modal_edit_price = modal_edit.querySelector('.modal-dish-edit-price').value;
  let modal_edit_description = modal_edit.querySelector('.modal-dish-edit-description').value;

  let post_edit_dish_name, post_edit_dish_price, post_edit_dish_description;
  if (modal_edit_title === edit_dish_name) {
    post_edit_dish_name = false;
  } else {
    post_edit_dish_name = modal_edit_title;
  }
  if (modal_edit_price === edit_dish_price) {
    post_edit_dish_price = false;
  } else {
    post_edit_dish_price = modal_edit_price;
  }
  if (modal_edit_description === edit_dish_description) {
    post_edit_dish_description = false;
  } else {
    post_edit_dish_description = modal_edit_description;
  }

  let dish = document.querySelector(`#dish_${modal_id_dish.value}`);
  let dish_title_price = dish.querySelector('h4');
  let dish_description = dish.querySelector('.dish__description');
  let dish_img = dish.querySelector('.dish__img');

  if (!edit_dish_picture) {
    let url = domain + '/menu/edit_dish'
    let data = {
      'name_dish': post_edit_dish_name,
      'price': post_edit_dish_price,
      'description': post_edit_dish_description,
      'id_dish': modal_id_dish.value,
    }

    let result_json = await base_post(url, data)
    if (result_json['status'] === 'ok') {
      clearInterval(anim_save);
      button_edit.innerText = 'Сохранить';
      button_edit.removeAttribute('disabled');

      dish_title_price.innerHTML = `${modal_edit_title} <span class="price_dish">(${modal_edit_price}₽)</span>`;
      dish_description.innerText = modal_edit_description;

      close_modal('modal-dish-edit');
    }

  } else {
    let form = document.querySelector('.modal-dish-edit form');
    const formData = new FormData(form);

    let url = domain + '/menu/edit_dish_picture';
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

    let result_json = await fetchResp.json();

    if (result_json['status'] === 'ok') {
      clearInterval(anim_save);
      button_edit.innerText = 'Сохранить';
      button_edit.removeAttribute('disabled');

      dish_title_price.innerHTML = `${modal_edit_title} <span class="price_dish">(${modal_edit_price}₽)</span>`
      dish_description.innerText = modal_edit_description;
      dish_img.innerHTML = `<img src="${result_json['path_img']}" alt="Изображение блюда">`

      close_modal('modal-dish-edit');
    }

  }
});


function new_dish(id_category) {
  let plus_dish = document.querySelector(`#category_${id_category} .dish__plus`);

  let modal_new_dish = document.querySelector('.modal-dish');
  let modal_new_dish_content = document.querySelector('.modal-dish__content');


  let hidden_input = modal_new_dish.querySelector('form input[type="hidden"]');
  hidden_input.value = id_category;

  modal_new_dish.style.animation = 'opacity_dark .5s forwards';
  modal_new_dish_content.style.animation = 'from_center_without_translate .5s forwards';

  modal_new_dish.style.display = 'flex';
  modal_new_dish_content.style.display = 'flex'
}

// Отображение выбраного изображения в форме создания нового блюда
let modal_dish_img = document.querySelector('.modal-dish input[type="file"]');
let custom_label_dish = document.querySelector('.modal-dish .dish-load-img');
modal_dish_img.addEventListener('change', async (e) => {
  custom_label_dish.innerText = 'Выбрано: ' + String(modal_dish_img.files[0].name);
});


// Функция отправки пост запроса с формой создания нового блюда
const ajaxSend = async (formData) => {
    const fetchResp = await fetch(domain + '/menu/new_dish', {
      method: 'POST',
      body: formData,
      headers: {
      'X-CSRFToken': csrftoken,
      }
    });
    if (!fetchResp.ok) {
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${fetchResp.status}`);
    }

    return await fetchResp.json();
};

// Кнопка создания нового блюда
document.querySelector('.modal-dish button').addEventListener('click', async (e) => {
  e.preventDefault();

  let name_input = document.querySelector('.modal-dish input[name="new_dish_name"]');
  let price_input = document.querySelector('.modal-dish input[name="new_dish_price"]');
  let description_textarea = document.querySelector('.modal-dish textarea');

  if (name_input.value.length > 0 && price_input.value.length > 0 && description_textarea.value.length > 0) {
    let i_plus = document.querySelector('.modal-dish button i');
    let img_save = document.querySelector('.modal-dish button img');
    i_plus.style.display = 'none';
    img_save.style.display = 'inline';
    document.querySelector('.modal-dish button').setAttribute('disabled', 'disabled');

    let form = document.querySelector('.modal-dish form');
    const formData = new FormData(form);

    let result_json = await ajaxSend(formData)

    if (result_json['status'] === 'ok') {
      i_plus.style.display = 'inline';
      img_save.style.display = 'none';
      document.querySelector('.modal-dish button').removeAttribute('disabled')
      let name_dish = document.querySelector('.modal-dish input[name="new_dish_name"]').value
      let price_dish = document.querySelector('.modal-dish input[name="new_dish_price"]').value
      let description_dish = document.querySelector('.modal-dish textarea').value
      let id_category = result_json['id_category']
      let pk = result_json['pk']
      let path_img = result_json['path_img']

      let plus_block = document.querySelector(`#category_${id_category} .dish__plus`);
      plus_block.insertAdjacentHTML('beforebegin', `
        <div class="menu-block__dish" id="dish_${pk}">
          <div class="dish__img">
              <img src="${path_img}" alt="Блюдо">
          </div>
          
          <div class="dish__content">
            <div class="dish__content_text">
                <h4>${name_dish} <span class="price_dish">(${price_dish}₽)</span></h4>
                <p class="dish__description">
                    ${description_dish}
                </p>
            </div>
            <div class="dish__buttons">
                <span onclick="edit_dish(${pk})"><i class="icon-pencil-1"></i></span>
                <span onclick="delete_dish(${pk})"><i class="icon-trash"></i></span>
            </div>
          </div>
         
      </div>
      `)

      close_modal('modal-dish');
      setTimeout(() => {
        form.reset();
        custom_label_dish.innerHTML = 'Добавить изображение <i class="icon-plus"></i>';
      }, 400);
    }
  }
})




// Кнопки
function activate_edit_button(id_button) {
  let button = document.querySelector(`#button-${id_button}`);
  let button_input = button.querySelector('input[type="text"]');
  let checkbox_span = button.querySelector('.checkbox span');

  button_input.removeAttribute('disabled');
  button_input.style.borderBottom = '2px solid #2f2f2f';
  button_input.focus();

  checkbox_span.classList.add('yellow');
  checkbox_span.setAttribute('onclick', `complete_rename_button(${id_button})`);
  checkbox_span.style.display = 'inline';
  checkbox_span.style.opacity = '0.5';


    checkbox_span.addEventListener('mouseover', () => {
      if (!button_input.hasAttribute('disabled')) {
        checkbox_span.style.opacity = '1';
      }
    });
    checkbox_span.addEventListener('mouseleave', () => {
      if (!button_input.hasAttribute('disabled')) {
        checkbox_span.style.opacity = '0.5';
      }
    });

}

async function complete_rename_button_post(id_button, new_name) {
  const url = domain + '/button/rename';
  const data = {
    'id_button': id_button,
    'new_name': new_name,
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

    return json

  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function complete_rename_button(id_button) {
  let button = document.querySelector(`#button-${id_button}`);
  let input_checkbox = button.querySelector('input[type="checkbox"]');
  let button_input = button.querySelector('input[type="text"]');
  let checkbox_span = button.querySelector('.checkbox span');

  if (button_input.value.length > 0) {
    let result_json = await complete_rename_button_post(id_button, button_input.value);
    if (result_json['status'] === 'ok') {
     checkbox_span.style.opacity = '1';

      checkbox_span.classList.remove('yellow');
      checkbox_span.removeAttribute('onclick');
      checkbox_span.removeAttribute('style');

      button_input.setAttribute('disabled', 'disabled');
      button_input.style.borderBottom = 'none';

      input_checkbox.checked = true;
    }
  }
}

function add_button() {
  let add_button_block = document.querySelector('.buttons__add');

  if (!document.querySelector('.new_button')) {
    add_button_block.insertAdjacentHTML('beforebegin', `
    <div class="buttons__item new_button">
      <div class="button-main">
        <div class="button__name">
          <input type="text" maxlength="30" minlength="1" placeholder="Название кнопки">
          <textarea></textarea>
        </div>
      </div>
      <div class="button-settings">
        <span title="Добавить сообщение" onclick="button_add_message()"><i class="icon-comment"></i></span>
        <span title="Удалить кнопку" onclick="delete_new_button()"><i class="icon-trash"></i></span>
        <label>
          <input type="checkbox">
          <div class="checkbox"><span class="yellow" onclick="new_button()"><i class="icon-check"></i></span></div>
        </label>
      </div>
    </div>`)

    let all_buttons = document.querySelectorAll('.buttons__item');
    if (all_buttons.length >= 3) {
        add_button_block.remove()
    }

    let new_button = document.querySelector('.new_button')

    new_button.style.display = 'flex';

    if (window.screen.width > 1700 || (1500 >= window.screen.width && window.screen.width > 1200)) {
      new_button.style.animation = 'open_button420 .4s forwards';
    } else if (1700 >= window.screen.width && window.screen.width > 1500) {
      new_button.style.animation = 'open_button350 .4s forwards';
    } else if (1200 >= window.screen.width && window.screen.width > 480) {
      new_button.style.animation = 'open_button48 .4s forwards';
    } else {
      new_button.style.animation = 'open_button100 .4s forwards';
    }

    new_button.focus()
  } else {
    document.querySelector('.new_button input[type="text"]').focus()
  }
}

async function new_button() {
  this.event.preventDefault();

  let new_button_block = document.querySelector('.new_button');
  let new_button_input = new_button_block.querySelector('input[type="text"]');
  let new_button_message = new_button_block.querySelector('.button-settings span:nth-child(1)');
  let new_button_delete = new_button_block.querySelector('.button-settings span:nth-child(2)');
  let new_button_textarea = new_button_block.querySelector('.button-main textarea');

  let new_button_checkbox_span = new_button_block.querySelector('.checkbox span');
  let new_button_checkbox_input = new_button_block.querySelector('input[type="checkbox"]');

  let last_id_button = Number(Array.from(document.querySelectorAll('.buttons__item')).slice(-2)[0].id.split('-')[1])

  if (new_button_textarea.value.length === 0) {
    new_button_message.style.animation = '';
    setTimeout(() => {
      new_button_message.style.animation = 'splash 1.1s';
    }, 20)
  }

  if (new_button_input.value.length < 1) {
    new_button_input.style.animation = '';
    setTimeout(() => {
      new_button_input.style.animation = 'input_highlight_blue 1.1s';
    }, 20)
  }

  if (new_button_input.value.length > 0 && new_button_textarea.value.length > 0) {
    let result_add = await new_button_post(new_button_input.value, new_button_textarea.value)
    if (result_add['status'] === 'ok') {
      new_button_input.setAttribute('onclick', `activate_edit_button(${result_add['pk']})`)
      new_button_message.setAttribute('onclick', `edit_message_button(${result_add['pk']})`)
      new_button_delete.setAttribute('onclick', `delete_button(${result_add['pk']})`)

      new_button_checkbox_span.removeAttribute('class');
      new_button_checkbox_span.removeAttribute('onclick');

      new_button_checkbox_input.checked = true;
      new_button_block.classList.remove('new_button');
      new_button_block.id = `button-${result_add['pk']}`;
    }

    // new_button_textarea.value = document.querySelector('.modal-button textarea').value;
  }
}

async function new_button_post(name_button, text_button) {
  const url = domain + '/button/add';
  const data = {
    'name': name_button,
    'text': text_button,
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

    return json;

  } catch (error) {
    console.error('Ошибка:', error);
  }
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
  let button_textarea;
  let result_json = false;


  let modal_button = document.querySelector('.modal-button');
  let modal_content = document.querySelector('.modal-button__content');
  let modal_textarea = document.querySelector('.modal-button textarea');

  if (id_button === 'new_button') {
    button_textarea = document.querySelector('.new_button .button-main textarea');
    button_textarea.value = modal_textarea.value;
  } else {
    button_textarea = document.querySelector(`#button-${id_button} .button-main textarea`);
    button_textarea.value = modal_textarea.value;

    let url = domain + '/button/edit_text';
    let data = {
      'id_button': id_button,
      'text_button': button_textarea.value,
      'id_establishment': (window.location.pathname).split('/')[2],
    }
    result_json = await base_post(url, data);
  }

  if (result_json['status'] === 'ok' || id_button === 'new_button') {
    modal_button.style.animation = 'hide_opacity_dark .5s forwards';
    modal_content.style.animation = 'opacity_disappear .5s forwards';

    setTimeout(() => {
      modal_button.style.display = 'none';
    }, 500);
  }
}

function delete_new_button() {
  let new_button = document.querySelector('.new_button');
  new_button.style.animation = 'close_button .4s forwards';
  setTimeout(() => {
    new_button.remove();
    let all_buttons = document.querySelectorAll('.buttons__item');
    let button = document.querySelector('.buttons-block .buttons__add');
      if (all_buttons.length < 3 && button == null) {
        document.querySelector('.buttons__content').insertAdjacentHTML('beforeend', '<div class="buttons__add"><div class="add" onclick="add_button()"><span title="Добавить кнопку"><i class="icon-plus-1"></i></span></div></div>')
    }
  }, 400)
}

function button_add_message() {
  let button_title = document.querySelector(`.new_button input[type="text"]`).value;
  let button_textarea = document.querySelector('.new_button .button-main textarea');

  let modal_button = document.querySelector('.modal-button');
  let modal_button_content = document.querySelector('.modal-button__content');
  let modal_button_title = modal_button.querySelector('.button__title');
  let modal_button_textarea = modal_button.querySelector('textarea');
  let modal_button_button_complete = modal_button.querySelector('button');
  let settings_inscription = modal_button.querySelector('.modal-button__header span:nth-child(2)');

  if (button_title.length === 0) {
    settings_inscription.innerText = 'Настройка кнопки';
  } else {
    settings_inscription.innerText = '· Настройка';
  }

  modal_button_title.innerText = button_title;

  modal_button.style.display = 'flex';
  modal_button.style.animation = 'opacity_dark .4s forwards';

  modal_button_content.style.animation = 'from_center_without_translate .4s forwards';

  if (button_textarea.value.length > 0) {
    modal_button_textarea.value = button_textarea.value;
  } else {
    modal_button_textarea.value = '';
  }


  modal_button_textarea.addEventListener('input', () => {
    if (modal_button_textarea.value.length > 0) {
      modal_button_button_complete.removeAttribute('disabled');
    } else {
      modal_button_button_complete.setAttribute('disabled', 'disabled');
    }
  });

  modal_button_button_complete.setAttribute('onclick', `button_save_message("new_button")`);
}

function delete_button(id_button) {
  let button_block = document.querySelector(`#button-${id_button}`);
  let button_title = button_block.querySelector('input[type="text"]').value.trim();

  let modal_delete_description = modal_delete.querySelector('p span');
  let confirm_delete_button = modal_delete.querySelector('.button-confirm-delete');

  confirm_delete_button.setAttribute('onclick', `confirm_delete_button(${id_button})`)

  modal_delete_description.innerText = `кнопку "${button_title}"`

  modal_delete.style.display = 'flex';
  modal_delete.style.animation = 'opacity_dark .5s forwards';

  modal_delete_content.style.animation = 'from_center_without_translate .5s forwards';
}

async function confirm_delete_button(id_button) {
  const url = domain + '/button/delete';
  const data = {
    'id_button': id_button,
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

    let modal_delete_description = modal_delete.querySelector('p span');
    let modal_delete_info = modal_delete.querySelector('.modal_delete__info');

    setTimeout(() => {
      modal_delete_description.innerText = '';
      modal_delete_info.innerText = '';
    }, 400)


    let button_block = document.querySelector(`#button-${id_button}`);
    modal_delete.style.animation = 'hide_opacity_dark .4s forwards'
    modal_delete_content.style.animation = 'opacity_disappear .4s forwards';

    setTimeout(() => {
      modal_delete.style.display = 'none';
    }, 400)

    button_block.style.animation = 'close_button .4s forwards';

    setTimeout(() => {
      button_block.remove();
      let all_buttons = document.querySelectorAll('.buttons__item');
      let button = document.querySelector('.buttons-block .buttons__add');
      if (all_buttons.length < 3 && button == null) {
          document.querySelector('.buttons__content').insertAdjacentHTML('beforeend', '<div class="buttons__add"><div class="add" onclick="add_button()"><span title="Добавить кнопку"><i class="icon-plus-1"></i></span></div></div>')
      }
    }, 400);

  } catch (error) {
    console.error('Ошибка:', error);
  }

}

function edit_message_button(id_button) {
  let button_title = document.querySelector(`#button-${id_button} input[type="text"]`).value;
  let button_message = document.querySelector(`#button-${id_button} .button-main textarea`);


  let modal_button = document.querySelector('.modal-button');
  let modal_button_content = document.querySelector('.modal-button__content');
  let modal_button_title = modal_button.querySelector('.button__title');
  let modal_button_textarea = modal_button.querySelector('textarea');
  let modal_button_button_complete = modal_button.querySelector('button');

  let settings_inscription = modal_button.querySelector('.modal-button__header span:nth-child(2)')
  settings_inscription.innerText = '· Настройка';

  modal_button_title.innerText = button_title;

  modal_button.style.display = 'flex';
  modal_button.style.animation = 'opacity_dark .4s forwards';

  modal_button_content.style.animation = 'from_center_without_translate .4s forwards';

  modal_button_textarea.value = button_message.value;
  if (modal_button_textarea.value.length > 0) {
    modal_button_button_complete.removeAttribute('disabled');
  }

  modal_button_button_complete.setAttribute('onclick', `button_save_message(${id_button})`);

  modal_button_textarea.addEventListener('input', () => {
    if (modal_button_textarea.value.length > 0) {
      modal_button_button_complete.removeAttribute('disabled');
    } else {
      modal_button_button_complete.setAttribute('disabled', 'disabled');
    }
  });
}

async function check_button(id_button) {
  let button = document.querySelector(`#button-${id_button} input[type="checkbox"]`);
  let button_span = document.querySelector(`#button-${id_button} .checkbox span`);
  if (!button_span.hasAttribute('onclick')) {
    button.checked = !button.checked;
    let url = domain + '/button/on_off'
    let data = {
      'id_button': id_button,
      'id_establishment': (window.location.pathname).split('/')[2],
      'value': !button.checked
    }
    let result = await base_post(url, data)
    if (result['status'] === 'ok') {
      button.checked = !button.checked;
    }
  }
}