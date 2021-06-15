
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
  my_profile_more.style.animation = 'open_from_right200 .3s';
});
m_button_my_profile.addEventListener('click', () => {
  m_my_profile_more.style.display = 'flex';
  m_my_profile_more.style.animation = 'open_from_right .3s';
});

close_my_profile.addEventListener('click', () => {
  this.event.stopPropagation();
  my_profile_more.style.animation = 'close_to_right200 .3s';

  setTimeout(() => {
    my_profile_more.style.display = 'none';
  }, 300)
});
m_close_my_profile.addEventListener('click', () => {
  this.event.stopPropagation();
  m_my_profile_more.style.animation = 'close_to_right .3s';

  setTimeout(() => {
    m_my_profile_more.style.display = 'none';
  }, 300)
});


let input_file = document.querySelector('input[type="file"]');
let custom_input = document.querySelector('.load_img span');
input_file.addEventListener('change', () => {
  custom_input.innerText = 'Выбрано: ' + String(input_file.files[0].name);
})
