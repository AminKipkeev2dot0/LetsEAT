let button_buy = document.querySelector('.buy__button');
let button_buy_price = document.querySelector('.buy__button > span');
let button_complete_buy = document.querySelector('#serve_dishes .complete_buy');
let modal_serve_dishes = document.querySelector('#serve_dishes');
let modal_serve_dishes_content = document.querySelector('#serve_dishes__content');
let modal_make_an_order = document.querySelector('#make_an_order')
let modal_make_an_order_content = document.querySelector('#make_an_order_content')

let form_block = document.querySelector('.form-block');
let form_block_button = form_block.querySelector('form button');
let input_address = document.querySelector('.form-block form input[name="address"]');
let input_phone = document.querySelector('.form-block form input[name="phone"]');
let input_name = document.querySelector('.form-block form input[name="name"]');
let textarea_message = document.querySelector('.form-block form textarea');

let menu_of_client = {dishes: {}};
let empty_menu_of_client = {dishes: {}};


function choice_dish(id) {
  let dish_block = document.querySelector(`#dish-${id}`);
  let dish_price = document.querySelector(`#dish-${id} .dish__price`).innerText.slice(1, -2)
  let quantity_dish = document.querySelector(`#dish-${id} .quantity`);
  let dish_count = document.querySelector(`#dish-${id} .quantity .count`);

  if (Array.from(dish_block.classList).includes('checked_dish')) {
    dish_block.classList.remove('checked_dish');
    quantity_dish.style.display = 'none';
    dish_count.innerText = '1';

    let current_total_price = button_buy_price.innerText.slice(1, -2);
    let total_dish_price = Number(menu_of_client['dishes'][id]['count']) * Number(dish_price);

    button_buy_price.innerText = '(' + String(Number(current_total_price) - total_dish_price) + '₽)';
    delete menu_of_client['dishes'][id];

    if (button_buy_price.innerText === '(0₽)') {
      button_buy_price.innerText = '';
      button_buy.classList.add('disabled_buy');
    }
  } else {
    menu_of_client['dishes'][id] = {count: 1};
    dish_block.classList.add('checked_dish');
    quantity_dish.style.display = 'flex';

    button_buy.classList.remove('disabled_buy');

    if (button_buy_price.innerText === '') {
      button_buy_price.innerText = '(' + dish_price + '₽)'
    } else {
      let current_total_price = button_buy_price.innerText.slice(1, -2)
      button_buy_price.innerText = '(' + String(Number(dish_price) + Number(current_total_price)) + '₽)'
    }
  }
}

function add_dish(id) {
  this.event.stopPropagation();
  let dish_count = document.querySelector(`#dish-${id} .quantity .count`);
  let dish_price = document.querySelector(`#dish-${id} .dish__price`).innerText.slice(1, -2)
  let current_total_price = button_buy_price.innerText.slice(1, -2)

  dish_count.innerText = Number(dish_count.innerText) + 1;
  menu_of_client['dishes'][id]['count'] += 1;
  button_buy_price.innerText = '(' + String(Number(dish_price) + Number(current_total_price)) + '₽)'

}

function minus_dish(id) {
  this.event.stopPropagation();
  let dish_count = document.querySelector(`#dish-${id} .quantity .count`);
  let dish_price = document.querySelector(`#dish-${id} .dish__price`).innerText.slice(1, -2)
  let current_total_price = button_buy_price.innerText.slice(1, -2)

  if (dish_count.innerText !== '1') {
    dish_count.innerText = Number(dish_count.innerText) - 1;
    menu_of_client['dishes'][id]['count'] -= 1;
    button_buy_price.innerText = '(' + String( Number(current_total_price) - Number(dish_price)) + '₽)'
  }
}

function check_not_empty() {
  if (input_name.value.length > 0 &&
  input_address.value.length > 0 &&
  input_phone.value.length > 0) {
    form_block_button.removeAttribute('disabled');
  } else {
    form_block_button.setAttribute('disabled', 'disabled');
  }
}

function buy_dishes_offline() {
  if (JSON.stringify(menu_of_client) !== JSON.stringify(empty_menu_of_client) ) {
    modal_serve_dishes.style.display = 'flex';
    modal_serve_dishes.style.zIndex = '10';
    modal_serve_dishes.style.opacity = '1';
    modal_serve_dishes.style.animation = 'opacity_dark 0.3s';
    modal_serve_dishes_content.style.animation = 'from_center 0.4s';
  }
}

// Открытие формы оформления заказа
function buy_dishes_online() {
  if (JSON.stringify(menu_of_client) !== JSON.stringify(empty_menu_of_client) ) {
    button_buy.style.display = 'none';
    form_block.style.display = 'block';
    form_block.style.animation = 'open_from_right .5s forwards';
  }
}

// Закрытие формы
let form_button_back = document.querySelector('.form-block .to_back');
form_button_back.addEventListener('click', () => {
  let form_block = document.querySelector('.form-block');
  button_buy.style.display = 'flex';
  form_block.style.animation = 'close_to_right100 .4s forwards';
  setTimeout(() => {
    form_block.style.display = 'none';
  }, 400)
})

// Кнопка отправки заказа
async function complete_delivery_order() {
  this.event.preventDefault();
  form_block_button.setAttribute('disabled', 'disabled');
  let modal_complete = document.querySelector('#complete_delivery_order');
  let modal_complete_content = document.querySelector('#complete_delivery_order__content');

  let url = 'https://letseat.su/client_page/online_order';
  let data = {
    establishment_link: (window.location.pathname).split('/')[1],
    user: {
      name: input_name.value,
      address: input_address.value,
      phone: input_phone.value,
      message: textarea_message.value
    },
    order: menu_of_client
  }

  let json = await base_post(url, data)

  if (json['status'] === 'ok') {
    modal_complete.style.zIndex = '10';
    modal_complete.style.opacity = '1';
    modal_complete.style.animation = 'opacity_dark 0.3s';
    modal_complete_content.style.animation = 'from_center 0.4s';
    setTimeout(() => {
      window.location.reload();
    }, 2500)
  } else {
    show_error()
    form_block_button.removeAttribute('disabled');
  }
}



button_complete_buy.addEventListener('click', async () => {
  if (JSON.stringify(menu_of_client) !== JSON.stringify(empty_menu_of_client)) {
    // Отправляем на бекенд заказ клиента
    let radio_sd_1 = document.querySelector('#radio-sd-1');
    if (radio_sd_1.checked) {
      menu_of_client['serve_dishes'] = 'one';
    } else {
      menu_of_client['serve_dishes'] = 'all';
    }

    menu_of_client['id_establishment'] = (window.location.pathname).split('/')[2]
    menu_of_client['number_table'] = (window.location.pathname).split('/')[3]
    let url = 'https://letseat.su/client_page/order'

    let json = await base_post(url, menu_of_client)

    if (json['status'] === 'ok') {
      // Отображаем главную страницу
      let home_block = document.querySelector('.home-block');
      home_block.style.display = 'block';

      // Очищаем "корзину"
      menu_of_client = {dishes: {}};
      let all_dish = document.querySelectorAll('.dish');
      for (let dish of all_dish) {
        dish.classList.remove('checked_dish')
        let quantity = dish.querySelector('.quantity')
        quantity.style.display = 'none';
        let quantity_count = dish.querySelector('.quantity .count')
        quantity_count.innerText = '1';
      }
      button_buy_price.innerText = '';
      button_buy.classList.add('disabled_buy');



      // Закрываем модальное окно с выбором как доставялть еду
      modal_serve_dishes.style.animation = 'opacity_disappear 0.3s';
      modal_serve_dishes_content.style.animation = 'opacity_disappear 0.3s';

      setTimeout(() => {
        modal_serve_dishes.style.display = 'none';
        modal_serve_dishes.style.zIndex = '0';
        modal_serve_dishes.style.opacity = '0';

        modal_make_an_order.style.display = 'flex';
        modal_make_an_order.style.zIndex = '10';
        modal_make_an_order.style.opacity = '1';
        modal_make_an_order.style.animation = 'opacity_dark 0.3s';
        modal_make_an_order_content.style.animation = 'from_center 0.4s';
      }, 300)

      setTimeout(() => {
        // Закрываем модальное окно с успешным заказом
        modal_make_an_order.style.animation = 'opacity_disappear 0.3s';
        setTimeout(() => {
          modal_make_an_order.style.display = 'none';
          modal_make_an_order.style.zIndex = '0';
          modal_make_an_order.style.opacity = '0';



          // Закрываем меню
          let menu_block = document.querySelector('.menu-block');
          let button_buy = document.querySelector('.buy__button');

          button_buy.style.display = 'none';
          menu_block.style.animation = 'close_to_right100 .4s forwards';
          setTimeout(() => {
            menu_block.style.display = 'none';
          }, 400)

        }, 300)
      }, 2000)

    } else {
      modal_serve_dishes.style.animation = 'opacity_disappear 0.3s';
      modal_serve_dishes_content.style.animation = 'opacity_disappear 0.3s';
      setTimeout(() => {
        modal_serve_dishes.style.display = 'none';
        modal_serve_dishes.style.zIndex = '0';
        modal_serve_dishes.style.opacity = '0';

        show_error()
      }, 300)
    }
  }
})


// Выбор категории
function check_category(id_category) {
  let all_categories = document.querySelectorAll('.menu-category');
  let all_li = document.querySelectorAll('.choice_category li');

  if (id_category === 'all') {
    for (let category of all_categories) {
      category.style.display = 'block';
    }

    for (let li of all_li) {
      li.classList.remove('check_category');
    }
    all_li[0].classList.add('check_category');

  } else {
    id_category = Number(id_category);

    for (let li of all_li) {
      if (li.hasAttribute('data-category')) {
        if (Number(li.attributes['data-category'].value) === id_category) {
          li.classList.add('check_category');
        } else {
          li.classList.remove('check_category');
        }
      }
    }
    all_li[0].classList.remove('check_category')

    for (let category of all_categories) {
      let id_this_category = Number(category.id.split('_')[1]);
      if (id_this_category !== id_category) {
        category.style.display = 'none';
      } else {
        category.style.display = 'block';
      }
    }
  }
}