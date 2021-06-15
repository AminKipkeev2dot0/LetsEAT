// Basic code

const csrftoken = Cookies.get('csrftoken');

// Modal delete
let modal_delete = document.querySelector('.modal_delete');
let modal_delete_content = document.querySelector('.modal_delete__content');

function close_modal(name_window) {
  let modal_window = document.querySelector(`.${name_window}`);
  let modal_window_content = document.querySelector(`.${name_window}__content`)

  let modal_delete_description = modal_delete.querySelector('p span');
  let modal_delete_info = modal_delete.querySelector('.modal_delete__info');

  setTimeout(() => {
    modal_delete_description.innerText = '';
    modal_delete_info.innerText = '';
  }, 400)

  modal_window.style.animation = 'hide_opacity_dark .4s forwards';
  modal_window_content.style.animation = 'opacity_disappear .4s forwards';

  setTimeout(() => {
    modal_window.style.display = 'none'
  }, 400)
}





// Add telegram
let button_add_tg = document.querySelector('.complete_add_tg');
let button_edit_tg = document.querySelector('.edit_tg');
let input_tg = document.querySelector('.tg_bot_link input');
button_add_tg.addEventListener('click', async () => {
  if (input_tg.value.length > 8) {
    let error_block = document.querySelector('.error_tg')

    let url = 'https://letseat.su/establishment/add_tg';
    let data = {
      'id_establishment': (window.location.pathname).split('/')[2],
      'id_chat': input_tg.value
    }
    let json = await base_post(url, data);
    if (json['status'] === 'ok') {
      error_block.style.display = 'none';
      input_tg.setAttribute('disabled', 'disabled');
      button_add_tg.classList.add('none');
      button_edit_tg.classList.remove('none');

    } else {
      error_block.style.display = 'block';
    }

  }
})

button_edit_tg.addEventListener('click', () => {
  button_edit_tg.classList.add('none')
  button_add_tg.classList.remove('none')
  input_tg.removeAttribute('disabled')
})



// Отображение выбраного изображения в форме загрузки лого(и его загрузка)
let button_load_logo = document.querySelector('.settings .edit-block__new-logo input');
let custom_label_load_logo = document.querySelector('.button-upload-file');
let button_load_logo_span = document.querySelector('.button-upload-file-span');
let load_img_to_server;
button_load_logo.addEventListener('change', async (e) => {
  custom_label_load_logo.innerText = 'Выбрано: ' + String(button_load_logo.files[0].name);
  if (button_load_logo.files[0].size < 2097152 ) {
   custom_label_load_logo.innerText = 'Выбрано: ' + String(button_load_logo.files[0].name);

   button_load_logo_span.innerText = 'Загрузка';
   load_img_to_server = setInterval(() => {
     if (button_load_logo_span.innerText.length < 11) {
       button_load_logo_span.innerText += '.';
     } else {
      button_load_logo_span.innerText = 'Загрузка';
     }

   }, 1000)


  let url = 'https://letseat.su/establishment/edit_logo';
  let form = document.querySelector('.settings .edit-block__new-logo form');
  const formData = new FormData(form);

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
    let img_block = document.querySelector('.logo-of-user');
    img_block.innerHTML = `<img src="${result_json['path_img']}" alt="Ваш логотип">`;

    custom_label_load_logo.innerHTML = 'Загрузить логотип <i class="icon-download-alt"></i>';
    button_load_logo_span.innerText = 'До 2 мб.';

    clearInterval(load_img_to_server);
  }




  } else {
    button_load_logo_span.innerText = 'Файл слишком большой. Выберите другой';
  }
});

let m_button_load_logo = document.querySelector('.m-settings .edit-block__new-logo input');
let m_custom_label_load_logo = document.querySelector('.m-settings .button-upload-file');
let m_button_load_logo_span = document.querySelector('.m-settings .button-upload-file-span');
let m_load_img_to_server;
m_button_load_logo.addEventListener('change', async (e) => {
  m_custom_label_load_logo.classList.add('crop-text');
  m_custom_label_load_logo.innerText = String(m_button_load_logo.files[0].name);
  if (m_button_load_logo.files[0].size < 2097152 ) {
   m_custom_label_load_logo.innerText = String(m_button_load_logo.files[0].name);

   m_button_load_logo_span.innerText = 'Загрузка';
   m_load_img_to_server = setInterval(() => {
     if (m_button_load_logo_span.innerText.length < 11) {
       m_button_load_logo_span.innerText += '.';
     } else {
       m_button_load_logo_span.classList.remove('crop-text');
       m_button_load_logo_span.innerText = 'Загрузка';
     }

   }, 1000)


  let url = 'https://letseat.su/establishment/edit_logo';
  let form = document.querySelector('.m-settings .edit-block__new-logo form');
  const formData = new FormData(form);
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
    let img_block = document.querySelector('.m-settings .company-img');
    img_block.innerHTML = `<img src="${result_json['path_img']}" alt="Ваш логотип">`;
    m_custom_label_load_logo.classList.remove('crop-text');
    m_custom_label_load_logo.innerHTML = 'Загрузить логотип <i class="icon-download-alt"></i>';
    m_button_load_logo_span.innerText = 'До 2 мб.';

    clearInterval(m_load_img_to_server);
  }




  } else {
    button_load_logo_span.innerText = 'Файл слишком большой. Выберите другой';
  }
});


// Отображение окна уведомления о не оплаченной подписке
function open_pay_window(e) {
  e.preventDefault();
  let pay_modal = document.querySelector('.modal-pay');
  let pay_modal_content = document.querySelector('.modal-pay__content');

  pay_modal.style.animation = 'opacity_dark .5s forwards';
  pay_modal.style.display = 'flex';
  pay_modal_content.style.animation = 'from_center_without_translate .5s forwards';
}

let button_pay = document.querySelector('.subscription__pay a');
let button_pay_from_block = document.querySelector('.modal_no_access a');
button_pay.addEventListener('click', open_pay_window);
button_pay_from_block.addEventListener('click', open_pay_window);







let settings_block = document.querySelector('.settings');
let more_companies = document.querySelector('.more_companies');

let m_settings_block = document.querySelector('.m-settings');
let m_more_companies = document.querySelector('.name-company');

// Работа блока профиля юзера
let button_my_profile = document.querySelector('.my-profile');
let close_my_profile = document.querySelector('.also-profile-icon');
let my_profile_more = document.querySelector('.more_profile_user');

let m_button_my_profile = document.querySelector('.m-my-profile');
let m_my_profile_more = document.querySelector('.m-my-profile .more_profile_user')
let m_close_my_profile = document.querySelector('.m-my-profile .also-profile-icon');

button_my_profile.addEventListener('click', () => {
  my_profile_more.style.display = 'flex';
  my_profile_more.style.animation = 'open_from_right .2s';
});
m_button_my_profile.addEventListener('click', () => {
  m_my_profile_more.style.display = 'flex';
  m_my_profile_more.style.animation = 'open_from_right .2s';
});

close_my_profile.addEventListener('click', () => {
  this.event.stopPropagation();
  my_profile_more.style.animation = 'close_to_right .2s';

  setTimeout(() => {
    my_profile_more.style.display = 'none';
  }, 200)
});
m_close_my_profile.addEventListener('click', () => {
  this.event.stopPropagation();
  m_my_profile_more.style.animation = 'close_to_right .2s';

  setTimeout(() => {
    m_my_profile_more.style.display = 'none';
  }, 200)
});



// Редактирование
let button_edit = document.querySelector('.settings > .settings-top-buttons > .edit');
let icon_open_edit = document.querySelector('.open-edit');
let close_edit = document.querySelector('.close-edit');
let edit_block = document.querySelector('.edit-block');

let button_edit_name = document.querySelector('.edit-block__edit_name .edit i:first-child');
let button_complete_rename = document.querySelector('.edit-block__edit_name .edit i:last-child');
let input_edit_name = document.querySelector('.edit-block__edit_name input');

// Те же элементы, только на мобильных устройствах
let m_button_edit = document.querySelector('.m-settings .button-edit');
let m_icon_open_edit = document.querySelector('.m-settings .open-edit');
let m_close_edit = document.querySelector('.m-settings .close-edit');
let m_edit_block = document.querySelector('.m-settings .edit-block');

let m_button_edit_name = document.querySelector('.m-settings .edit-block__edit_name .edit i:first-child');
let m_button_complete_rename = document.querySelector('.m-settings .edit-block__edit_name .edit i:last-child');
let m_input_edit_name = document.querySelector('.m-settings .edit-block__edit_name input');

// Переменные для блока с другими компаниями.
let other_companies_block = document.querySelector('.other_companies');
let open_other_companies = document.querySelector('.more_companies .more');
let open_other_companies_flag = false;

let m_other_companies_block = document.querySelector('.m-settings .other_companies');
let m_open_other_companies = document.querySelector('.m-settings .name-company > span');

let open_edit_block_flag = false;
button_edit.addEventListener('click', () => {
  settings_block.style.height = 'auto';

  // Если был открыт блок с другими компаниями, то его нужно закрыть.
  other_companies_block.style.display = 'none';
  open_other_companies.style.animation = 'rotate_0 .1s forwards';
  open_other_companies_flag = false;


  more_companies.style.display = 'none';
  edit_block.style.animation = 'open_from_bottom .2s'
  edit_block.style.display = 'block';

  icon_open_edit.style.display = 'none';
  close_edit.style.display = 'inline';
});
m_button_edit.addEventListener('click', () => {
  open_edit_block_flag = true;
  m_settings_block.style.height = 'auto';

  // Если был открыт блок с другими компаниями, то его нужно закрыть.
  m_other_companies_block.style.display = 'none';
  m_open_other_companies.style.animation = 'rotate_0 .1s forwards';
  open_other_companies_flag = false;

  m_more_companies.style.display = 'none';

  m_edit_block.style.animation = 'open_from_top_height .4s forwards'
  m_edit_block.style.display = 'block';

  m_icon_open_edit.style.display = 'none';
  m_close_edit.style.display = 'inline';
});

close_edit.addEventListener('click', () => {
  this.event.stopPropagation();
  settings_block.style.height = 'auto';


  edit_block.style.animation = 'close_to_bottom .2s';
  setTimeout(() => {
    edit_block.style.display = 'none';
  }, 200)
  more_companies.style.display = 'flex';
  more_companies.style.animation = 'open_from_bottom .2s'

  icon_open_edit.style.display = 'inline';
  close_edit.style.display = 'none';
});
m_close_edit.addEventListener('click', () => {
  open_edit_block_flag = false;
  this.event.stopPropagation();
  m_settings_block.style.height = 'auto';


  m_edit_block.style.animation = 'close_to_top_height .3s';

  setTimeout(() => {
    m_edit_block.style.display = 'none';
  }, 300)

  m_more_companies.style.display = 'flex';
  m_more_companies.style.animation = 'open_from_bottom .2s'

  m_icon_open_edit.style.display = 'inline';
  m_close_edit.style.display = 'none';
});

button_edit_name.addEventListener('click', () => {
  input_edit_name.removeAttribute('disabled');
  input_edit_name.focus();

  button_edit_name.style.display = 'none';
  button_complete_rename.style.display = 'inline';
});
m_button_edit_name.addEventListener('click', () => {
  m_input_edit_name.removeAttribute('disabled');
  m_input_edit_name.focus();

  m_button_edit_name.style.display = 'none';
  m_button_complete_rename.style.display = 'inline';
});

button_complete_rename.addEventListener('click', async () => {
  let url = 'https://letseat.su/establishment/rename';
  let data = {
    'id_establishment': (window.location.pathname).split('/')[2],
    'new_name': input_edit_name.value,
  }
  let result_json = await base_post(url, data);
  if (result_json['status'] === 'ok') {
    input_edit_name.setAttribute('disabled', 'disabled');
    button_complete_rename.style.display = 'none';
    button_edit_name.style.display = 'inline';

    let name_establishment = document.querySelector('.name-company span');
    let m_name_establishment = document.querySelector('.m-settings .name-company > div');
    name_establishment.innerText = input_edit_name.value;
    m_name_establishment.innerText = input_edit_name.value;
  }
})
m_button_complete_rename.addEventListener('click', async () => {
  let url = 'https://letseat.su/establishment/rename';
  let data = {
    'id_establishment': (window.location.pathname).split('/')[2],
    'new_name': m_input_edit_name.value,
  }
  let result_json = await base_post(url, data);
  if (result_json['status'] === 'ok') {
    m_input_edit_name.setAttribute('disabled', 'disabled');
    m_button_complete_rename.style.display = 'none';
    m_button_edit_name.style.display = 'inline';

    let name_establishment = document.querySelector('.name-company span');
    let m_name_establishment = document.querySelector('.m-settings .name-company > div');
    name_establishment.innerText = m_input_edit_name.value;
    m_name_establishment.innerText = m_input_edit_name.value;
  }
})





// Другие компании
let add_company = document.querySelector('.other_companies .plus_block');
let add_company_plus_icon = document.querySelector('.other_companies .plus_block > i');
let add_company_input_block = document.querySelector('.other_companies .plus_block .input-block');
let add_company_complete = document.querySelector('.other_companies .plus_block .input-block i');

let m_add_company = document.querySelector('.m-settings .other_companies .plus_block');
let m_add_company_plus_icon = document.querySelector('.m-settings .other_companies .plus_block > i');
let m_add_company_input_block = document.querySelector('.m-settings .other_companies .plus_block .input-block');
let m_add_company_complete = document.querySelector('.m-settings .other_companies .plus_block .input-block i');

add_company_complete.addEventListener('click', async (e) => {
  e.stopPropagation();
  let name_establishment = document.querySelector('.other_companies .plus_block .input-block input');
  if (name_establishment.value.length > 0) {
    let url = 'https://letseat.su/establishment/add';
    let data = {
      'name': name_establishment.value
    }

    let result_json = await base_post(url, data)

    if (result_json['status'] === 'ok') {
      let list_establishment = document.querySelector('.other_companies ul');
      list_establishment.insertAdjacentHTML('beforeend', `<li class="crop-text"><a href="${result_json['url_establishment']}">${name_establishment.value}</a></li>`);
      name_establishment.value = '';
    } else {
      console.error('Ошибка создания нового заведения.')
    }
  } else {

  }
});
m_add_company_complete.addEventListener('click', async (e) => {
  e.stopPropagation();
  let name_establishment = document.querySelector('.m-settings .other_companies .plus_block .input-block input');
  if (name_establishment.value.length > 0) {
    let url = 'https://letseat.su/establishment/add';
    let data = {
      'name': name_establishment.value
    }

    let result_json = await base_post(url, data)

    if (result_json['status'] === 'ok') {
      let list_establishment = document.querySelector('.m-settings .other_companies ul');
      list_establishment.insertAdjacentHTML('beforeend', `<li class="crop-text"><a href="${result_json['url_establishment']}">${name_establishment.value}</a></li>`);
      name_establishment.value = '';
    } else {
      console.error('Ошибка создания нового заведения.')
    }
  } else {
  }
});

add_company.addEventListener('click', () => {
  add_company.classList.add('disable_hover');
  add_company.style.animation = 'circle_to_rectangle .5s forwards';

  add_company_plus_icon.style.animation = 'hide_scale .5s forwards'
  setTimeout(() => {
    add_company_plus_icon.style.display = 'none';
  }, 500);

  add_company_input_block.style.display = 'flex';
  add_company_input_block.style.animation = 'show_scale .5s forwards'
});
m_add_company.addEventListener('click', () => {
  m_add_company.classList.add('disable_hover');
  m_add_company.style.animation = 'circle_to_rectangle .5s forwards';

  m_add_company_plus_icon.style.animation = 'hide_scale .5s forwards'
  setTimeout(() => {
    m_add_company_plus_icon.style.display = 'none';
  }, 500);

  m_add_company_input_block.style.display = 'flex';
  m_add_company_input_block.style.animation = 'show_scale .5s forwards'
});

// Открытие и закрытие раздела "Другие компании"
open_other_companies.addEventListener('click', () => {
  if (! open_other_companies_flag) {
    open_other_companies_flag = true;

    // other_companies_block.style.animation = 'open_with_height .5s forwards';
    other_companies_block.style.display = 'block';

    open_other_companies.style.animation = 'rotate_180 .3s forwards';
  } else {
    open_other_companies_flag = false;

    open_other_companies.style.animation = 'rotate_0 .3s forwards';
    other_companies_block.style.display = 'none';
    // other_companies_block.style.animation = 'close_with_height .5s forwards';
  }
});
m_open_other_companies.addEventListener('click', () => {
  if (open_edit_block_flag) {
    open_edit_block_flag = false;
    this.event.stopPropagation();
    m_settings_block.style.height = 'auto';

    m_edit_block.style.animation = 'close_to_top_height .3s';

    setTimeout(() => {
      m_edit_block.style.display = 'none';
    }, 300)

    m_more_companies.style.display = 'flex';
    m_more_companies.style.animation = 'open_from_bottom .2s'

    m_icon_open_edit.style.display = 'inline';
    m_close_edit.style.display = 'none';
  }
  if (! open_other_companies_flag) {
    open_other_companies_flag = true;

    m_other_companies_block.style.display = 'block';
    m_settings_block.style.height = 'auto';

    m_open_other_companies.style.animation = 'rotate_180 .3s forwards';
  } else {
    open_other_companies_flag = false;

    m_open_other_companies.style.animation = 'rotate_0 .3s forwards';
    m_other_companies_block.style.display = 'none';
  }
});




// let new_dish_name_input = document.querySelector('.modal-dish input[name="new_dish_name"]');
// let new_dish_price_input = document.querySelector('.modal-dish input[name="new_dish_price"]');
// let new_dish_textarea = document.querySelector('.modal-dish textarea');

function crop_text(element, max_length) {
  let html_element = document.querySelector(element);
  if (html_element.value >= Number(max_length)) {
    html_element.value = html_element.value.slice(0, Number(max_length) + 1)
  }
}



// Reviews

// График
let all_stars_blocks = document.querySelectorAll('.count_reviews');
let all_stars_numbers = [];

for (let i = 0; i < all_stars_blocks.length; i++) {
  all_stars_numbers[i] = Number(all_stars_blocks[i].innerText);
}

let block_one_star = document.querySelector('.one-star span:nth-child(2)');
let block_two_stars = document.querySelector('.two-stars span:nth-child(2)');
let block_three_star = document.querySelector('.three-stars span:nth-child(2)');
let block_four_stars = document.querySelector('.four-stars span:nth-child(2)');
let block_five_stars = document.querySelector('.five-stars span:nth-child(2)');

let max_number_reviews = Math.max(...all_stars_numbers);

// 2.6 - просто некий коэфициент высоты, 18 нужно чтобы выставить минимальну высоту
block_one_star.style.height = `${all_stars_numbers[4] / max_number_reviews * 100 * 2.6 + 18}px`;
block_two_stars.style.height = `${all_stars_numbers[3] / max_number_reviews * 100 * 2.6 + 18}px`;
block_three_star.style.height = `${all_stars_numbers[2] / max_number_reviews * 100 * 2.6 + 18}px`;
block_four_stars.style.height = `${all_stars_numbers[1] / max_number_reviews * 100 * 2.6 + 18}px`;
block_five_stars.style.height = `${all_stars_numbers[0] / max_number_reviews * 100 * 2.6 + 18}px`;


// Изменяем цифру рейтинга на звёздочки в отзывах
let all_reviews = document.querySelectorAll('.review');

document.addEventListener("DOMContentLoaded", () => {
  for (let review of all_reviews) {
  let stars = review.querySelector('.review__stars');
  let stars_number = Number(stars.innerText);
  stars.innerText = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= stars_number) {
      stars.innerHTML += '<i class="icon-star-filled"></i>';
    } else {
      stars.innerHTML += '<i class="icon-star-1"></i>'
    }
  }
}
});




// Расчитываем среднюю оценку
let sum_all_reviews = all_stars_numbers.reduce((a, b) => {return a + b});

let sum_five_stars = all_stars_numbers[0] * 5;
let sum_four_stars = all_stars_numbers[1] * 4;
let sum_three_stars = all_stars_numbers[2] * 3;
let sum_two_stars = all_stars_numbers[3] * 2;
let sum_one_star = all_stars_numbers[4];

let list_sum_all_stars = [sum_five_stars, sum_four_stars, sum_three_stars, sum_two_stars, sum_one_star]

let sum_all_stars = list_sum_all_stars.reduce((a, b) => {return a + b});
let average_star = (sum_all_stars / sum_all_reviews).toFixed(1);

if (average_star == 'NaN') {
  document.querySelector('.average-number').innerText = '-';
  document.querySelector('.average_main i').style.display = 'none';
} else {
 document.querySelector('.average-number').innerText = average_star;
}




try {
  // Слайдер отзывов
new Splide('.splide', {
  type   : 'slide',
  perPage: 6,
  perMove: 5,
  rewind: false,
  speed: 1000,
  pagination: false,
  breakpoints: {
    1700: {
      perPage: 5,
      perMove: 4,
    },
    1500: {
      perPage: 4,
      perMove: 3,
    },
    1200: {
      perPage: 3.2,
      perMove: 2,
    },
    1000: {
      perPage: 2.7,
      perMove: 2,
      arrows: false,
    },
    800: {
      perPage: 2.3,
      perMove: 1,
      arrows: false,
    },
    650: {
      perPage: 2.5,
      perMove: 1,
      arrows: false,
		},
    570: {
      perPage: 2.1,
      perMove: 1,
      arrows: false,
    },
    500: {
      perPage: 1.9,
      perMove: 1,
      arrows: false,
    },
    440: {
      perPage: 1.7,
      perMove: 1,
      arrows: false,
    },
    400: {
      perPage: 1.5,
      perMove: 1,
      arrows: false,
    },
    355: {
      perPage: 1.3,
      perMove: 1,
      arrows: false,
    },
    320: {
      perPage: 1,
      perMove: 1,
      arrows: false,
    }
	}
}).mount();
} catch (e) {}

document.querySelector('.to_top').addEventListener('click', () => {
  document.querySelector('html').scrollIntoView({block: "start", behavior: "smooth"});
})