const csrftoken = Cookies.get('csrftoken');

let error_block = document.querySelector('.error');

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


let accessed_call_waiter = true;

let button_waiter = document.querySelector('#waiter');
let waiter_content = document.querySelector('#waiter .menu-item__content');
let button_close_waiter_block = document.querySelector('#waiter .close');
let click_close = false;

let button_menu = document.querySelector('#menu');
let button_feedback = document.querySelector('#feedback');
let feedback__content = document.querySelector('#feedback .menu-item__content')

button_waiter.addEventListener('click', async () => {
  let seconds = document.querySelector('.number-seconds');

  if (click_close === false) {
    waiter_content.style.display = 'flex';

  } else {
    click_close = false;
  }


  if (accessed_call_waiter) {
    let url = 'https://letseat.su/client_page/telegram/waiter'
    let data = {
      'id_establishment': (window.location.pathname).split('/')[2],
      'number_table': (window.location.pathname).split('/')[3],
    }
    let json = await base_post(url, data);
    if (json['status'] === 'ok') {
      accessed_call_waiter = false;
      let timer = setInterval(() => {
        seconds.innerText = Number(seconds.innerText) - 1;
      }, 1000)

      setTimeout(() => {
        clearInterval(timer);
        waiter_content.style.display = 'none';
        seconds.innerText = '60';
        $('#timer').polartimer('reset');

        accessed_call_waiter = true;
      }, 60000);

      $(`#timer`).polartimer({
        timerSeconds: 60,
        color: '#1074F3',
        opacity: 1.7,
        callback: function () {

        },
      });

      // Запуск таймера
      $('#timer').polartimer('start');
      } else {
    show_error()
  }
  }
});

button_close_waiter_block.addEventListener('click', () => {
  click_close = true;
  waiter_content.style.display = 'none';
});

document.querySelector('body').style.maxWidth = 'initial';

  setTimeout(() => {
    document.querySelector('body').style.maxWidth = '100%';
  }, 100);

  setTimeout(() => {
    document.querySelector('body').style.maxWidth = 'initial';
  }, 200);

  setTimeout(() => {
    document.querySelector('body').style.maxWidth = '100%';
  }, 300)

// Открытие меню
button_menu.addEventListener('click', async () => {
  let menu_block = document.querySelector('.menu-block');
  let button_buy = document.querySelector('.buy__button');
  let button_w_buy = document.querySelector('.buy');
  button_buy.style.display = 'flex';
  menu_block.style.display = 'block';
  menu_block.style.animation = 'open_from_right .5s forwards';

  setTimeout(() => {
    let home_block = document.querySelector('.home-block');
    home_block.style.display = 'none';
  }, 500)

  if (document.querySelector('.menu_mb') === null) {
    let url = 'https://letseat.su/client_page/get_menu'
    let data = {
      'id_establishment': (window.location.pathname).split('/')[2]
    }
    let json = await base_post(url, data);

    if (json['status'] === 'ok') {
      // Убираем анимацию загрузки
      document.querySelector('.load-menu').remove()

      let html_categories = '';
      let html_ul_categories = '';
      for (let category of json['categories']) {
        let html_dishes = ''
        for (let dish of category['dishes']) {
          let dish_img;
          if (dish['path_img'] !== '') {
            dish_img = `<div class="img-block_mb"><img src="${dish['path_img']}" alt="Изображение блюда"></div>`;
          } else {
            dish_img = '';
          }
          let html_dish = `
            <div class="dish" id="dish-${dish['pk']}" onclick="choice_dish(${dish['pk']})">
              <div class="dish__main-block">
                ${dish_img}
                <div class="dish__content">
                  <h3>${dish['name']} <span class="dish__price">(${dish['price']}₽)</span></h3>
                  <div class="dish__description">${dish['description']}</div>
                </div>
              </div>
              <div class="quantity">
                <span class="minus" onclick="minus_dish(${dish['pk']})"><span>-</span></span>
                <span class="count">1</span>
                <span class="plus" onclick="add_dish(${dish['pk']})">+</span>
              </div>
            </div>`;
          html_dishes += html_dish;
        }

        let html_category = `
        <div class="menu-category" id="category_${category['id']}">
          <h2>${category['name']}</h2>
          <div class="menu-category__content">
              ${html_dishes}
          </div>
        </div>`;
        let html_ul_category = `<li data-category="${category['id']}" onclick="check_category(${category['id']})">${category['name']}</li>`;
        html_categories += html_category;
        html_ul_categories += html_ul_category;
      }

      if (json['categories'].length > 0) {
        menu_block.insertAdjacentHTML('beforeend', `
        <div class="menu_mb">
            <div class="choice_category">
                <h2>Выберите категорию:</h2>
                <ul>
                    <li class="check_category" onclick="check_category('all')">Все</li>
                    ${html_ul_categories}
                </ul>
            </div>
            ${html_categories}
        </div>
      `)
      } else {
        menu_block.insertAdjacentHTML('beforeend', '<div class="empty-menu">Пусто...</div>')
      }

    } else {
    show_error()
  }
  }
});

// Закрытие меню
let button_back = document.querySelector('.menu-block .to_back');
button_back.addEventListener('click', () => {
  let menu_block = document.querySelector('.menu-block');
  let button_buy = document.querySelector('.buy__button');
  let home_block = document.querySelector('.home-block');
  home_block.style.display = 'block';
  button_buy.style.display = 'none';
  menu_block.style.animation = 'close_to_right100 .4s forwards';
  setTimeout(() => {
    menu_block.style.display = 'none';
  }, 400)
})


// Открытие отзыва
let open_feedback_flag = false;
button_feedback.addEventListener('click', () => {
  feedback__content.style.display = 'flex';
  open_feedback_flag = true;
});


// Закрытие отзыва
document.querySelector('#feedback .menu-item__header').addEventListener('click', (e) => {
  if (open_feedback_flag) {
    feedback__content.style.display = 'none';
    open_feedback_flag = false;
    e.stopPropagation();
  }
});


// Родитель элементов star
let parentItems = document.querySelector('.stars');
// Массив из всех star
let allItems = document.querySelectorAll('.stars .star');
// Количетсво активных элементов
let activeItems = document.querySelectorAll('.stars .star.active-radio').length;

// Функция проверяет куда нажали и меняет классы
let cStars = function(nowPos) {
 // Убираем у всех элементов active
 for (let i = 0; allItems.length > i; i++) {
 		allItems[i].classList.remove('active-radio');
 }
 // Добавляет активный класс всем элементам до выбранного, включая выбранный
 for (let i = 0; nowPos + 1 > i; i++) {
    allItems[i].classList.toggle('active-radio');
  }
}

let k;
let currentIndex;
// При наведении
parentItems.addEventListener('mouseover', function(e) {
	let myTarget = e.target;
  // Длина массива
  k = allItems.length;
  // Находи выбранный элемент в массиве и заносим его индекс в переменную
  while(k--) {
    if(allItems[k] == myTarget) {
      currentIndex = k;
      break;
    }
  }
  cStars(currentIndex);
});

// При клике
let i;
parentItems.addEventListener('click', function(e) {
	// Выбранный элемент
	let myTarget = e.target;
  // Длина массива
  i = allItems.length;
  // Находи выбранный элемент в массиве и заносим его индекс в переменную
  while(i--) {
    if(allItems[i] == myTarget) {
      let currentIndex = i;
      break;
    }
  }
  cStars(currentIndex);
	// Меняем количество активных айтемов
  activeItems = document.querySelectorAll('.stars .star.active-radio').length;
});

// При мауслив
parentItems.addEventListener('mouseleave', function(e) {
  cStars(+activeItems - 1);
});


// Проверка поставлены ли звёздочки(чтобы активировать кнопку отправки формы)

let button_send_feedback = document.querySelector('#feedback button');

let star_1 = document.querySelector('#star-1');
let star_2 = document.querySelector('#star-2');
let star_3 = document.querySelector('#star-3');
let star_4 = document.querySelector('#star-4');
let star_5 = document.querySelector('#star-5');

let stars = [star_1, star_2, star_3, star_4, star_5];



for (let star_div of stars) {
  star_div.addEventListener('click', () => {
    button_send_feedback.removeAttribute('disabled');
  })
}



// Отправка отзыва
let modal_feedback = document.querySelector('#send_feedback');
let modal_feedback_content = document.querySelector('#send_feedback_content');

$('form').submit(async function (e) {
    e.preventDefault();
    let form = this;
    let url = 'https://letseat.su/client_page/feedback'
    modal_feedback.style.zIndex = '10';
    modal_feedback.style.opacity = '1';
    modal_feedback.style.animation = 'opacity_dark 0.3s';
    modal_feedback_content.style.animation = 'from_center 0.4s';


    // let form = document.querySelector('.modal-dish form');
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

    let json = await fetchResp.json();

    if (json['status'] === 'ok') {
      form.reset()
      if (open_feedback_flag) {
        feedback__content.style.display = 'none';
        open_feedback_flag = false;
        e.stopPropagation();
      }

      setTimeout(() => {
        let modal = document.querySelector('#send_feedback');
        let modal_content = document.querySelector('#send_feedback_content');

        modal.style.animation = 'opacity_dark 0.3s';
        modal_content.style.animation = 'from_center 0.4s';

        modal.style.animation = 'opacity_disappear .5s forwards';

        setTimeout(() => {
          // modal.style.display = 'none';
          modal.style.zIndex = '-1';
        }, 500)
      }, 1500)
    } else {
    show_error()
  }
});


// Кнопки...
async function custom_button(id_button) {
  let modal_custom_b = document.querySelector('#custom_button');
  let modal_custom_b_content = document.querySelector('#custom_button__content');
  let modal_description = modal_custom_b.querySelector('.modal-button-description');

  let description_button = document.querySelector(`#custom-${id_button} .description_button`).innerText;

  let url = 'https://letseat.su/client_page/telegram/button';
  let data = {
    'id_establishment': (window.location.pathname).split('/')[2],
    'number_table': (window.location.pathname).split('/')[3],
    'button_pk': id_button,
  }

  let json = await base_post(url, data);

  if (json['status'] === 'ok') {
    modal_description.innerText = description_button;

    modal_custom_b.style.zIndex = '10';
    modal_custom_b.style.opacity = '1';
    modal_custom_b.style.animation = 'opacity_dark 0.3s';
    modal_custom_b_content.style.animation = 'from_center 0.4s';
  } else {
    show_error()
  }
}

function show_error() {
  error_block.style.animation = 'open_from_top .3s forwards'
  error_block.style.display = 'flex';
  setTimeout(() => {
    error_block.style.animation = 'close_to_top .3s forwards';
    setTimeout(() => {
      error_block.style.display = 'none';
    }, 300)
  }, 3000)
}

function close_modal_button() {
  let modal_custom_b = document.querySelector('#custom_button');
  let modal_custom_b_content = document.querySelector('#custom_button__content');



  modal_custom_b.style.animation = 'opacity_dark 0.3s';
  modal_custom_b_content.style.animation = 'from_center 0.4s';

  modal_custom_b.style.animation = 'opacity_disappear .5s forwards';

  setTimeout(() => {
    // modal_custom_b.style.display = 'none';
    modal_custom_b.style.zIndex = '-1';
  }, 500)
}
