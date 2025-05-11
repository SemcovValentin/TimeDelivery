//////////////////////////////////////////////////////
//форма входа и регистрации
// Функция показа Toast
/*function showUniversalToast(title, message, type = 'success') {
    const toastEl = document.getElementById('universalToast');
    const toastTitle = toastEl.querySelector('.toast-title');
    const toastBody = toastEl.querySelector('.toast-body');
    const toastHeader = toastEl.querySelector('.toast-header');

    toastEl.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');
    toastHeader.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');
    toastEl.classList.add('bg-' + type);
    toastHeader.classList.add('bg-' + type);

    toastTitle.textContent = title;
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    setTimeout(() => toast.hide(), 5000);
}

document.addEventListener("DOMContentLoaded", function () {
    // Элементы управления
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Переключение между формами
    function switchForm(formToShow) {
        loginForm.classList.toggle('d-none', formToShow !== 'login');
        registerForm.classList.toggle('d-none', formToShow !== 'register');
        loginTab.classList.toggle('active', formToShow === 'login');
        registerTab.classList.toggle('active', formToShow === 'register');
        loginTab.classList.toggle('btn-primary', formToShow === 'login');
        loginTab.classList.toggle('btn-outline-primary', formToShow !== 'login');
        registerTab.classList.toggle('btn-primary', formToShow === 'register');
        registerTab.classList.toggle('btn-outline-primary', formToShow !== 'register');
        if (formToShow === 'login') {
            document.getElementById('loginPhone').value = '';
        }
    }

    loginTab.addEventListener('click', () => switchForm('login'));
    registerTab.addEventListener('click', () => switchForm('register'));

    // Маска для номеров телефона
    function initPhoneMask(inputId) {
        const input = document.getElementById(inputId);
        input.addEventListener('focus', () => {
            if (!input.value) input.value = '+7 (';
        });
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(1);
            if (val.length > 10) val = val.substring(0, 10);
            e.target.value = `+7 (${val.substring(0,3)}) ${val.substring(3,6)}-${val.substring(6,8)}-${val.substring(8,10)}`;
        });
    }

    initPhoneMask('loginPhone');
    initPhoneMask('registerPhone');

    // Валидация формы регистрации
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        const email = document.getElementById('registerEmail').value;

        if (password !== confirm) {
            alert('Пароли не совпадают!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Введите корректный email!');
            return;
        }

        showUniversalToast('Регистрация', 'Вы успешно зарегистрировались!', 'success');
        this.reset();
        switchForm('login');
    });
});

//отправка на backend при регистрации
function cleanPhone(phone) {
    return phone.replace(/[^+0-9]/g, '');
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const phone = document.getElementById('registerPhone').value;
    const cleanPhoneValue = cleanPhone(phone);
    const data = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        phone: cleanPhoneValue,
        password: document.getElementById('registerPassword').value
    };
    console.log('Отправляемые данные:', data);

    fetch('/timeDelivery/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(text => console.log(text))
        .catch(err => console.error(err));
});

//Функция обновления кнопки вход
function updateLoginButton(clientName, roles) {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    loginBtn.textContent = clientName;
    loginBtn.removeAttribute('data-bs-toggle');
    loginBtn.removeAttribute('data-bs-target');
    loginBtn.removeAttribute('aria-controls');

    loginBtn.onclick = () => {
        redirectByRole(roles);
    };
}

function redirectByRole(roles) {
    const rolePriority = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_COURIER', 'ROLE_USER'];
    const highestRole = rolePriority.find(role => roles.includes(role)) || 'ROLE_USER';

    const routes = {
        'ROLE_ADMIN': '/timeDelivery/admin',
        'ROLE_MODERATOR': '/timeDelivery/moderator',
        'ROLE_COURIER': '/timeDelivery/courier',
        'ROLE_USER': '/timeDelivery/user'
    };

    window.location.href = routes[highestRole];
}

//При загрузке страницы проверяем, залогинен ли пользователь
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/timeDelivery/user/me', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(res => res.json())
            .then(client => {
                // client должен содержать name и role
                localStorage.setItem('role', client.role); // <--- сохраняем роль
                localStorage.setItem('clientName', client.name);
                updateLoginButton(client.name, client.role);
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('clientName');
            });
    }
});



//отправка на backend при входе
/!*document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const cleanPhoneValue = cleanPhone(phone);
    const data = {
        phone: cleanPhoneValue,
        password: document.getElementById('loginPassword').value
    };
    fetch('/timeDelivery/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            // Сохраняем токен, например, в localStorage
            localStorage.setItem('token', data.token);
            // Перенаправляем или показываем сообщение об успешном входе
            showUniversalToast('Вход', 'Вход выполнен!', 'success');
            localStorage.setItem('role', data.role);
            // Если в ответе нет имени, нужно сделать отдельный запрос для получения client
            localStorage.setItem('clientName', data.clientName || 'С возвращением!'); // замените на реальное поле
            updateLoginButton(data.clientName, data.role);
            // Закрываем offcanvas
            const offcanvasElement = document.getElementById('offcanvasRight');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvas) offcanvas.hide();
        })
        .catch(err => {
            showUniversalToast('Ошибка', 'Неверный телефон или пароль', 'danger');
        });
});*!/
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const phone = document.getElementById('loginPhone').value;
    const cleanPhoneValue = cleanPhone(phone);
    const password = document.getElementById('loginPassword').value;

    const data = {
        phone: cleanPhoneValue,
        password: password
    };

    fetch('/timeDelivery/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error('Login failed');
            return res.json();
        })
        .then(data => {
            // Здесь обрабатываем успешный ответ
            localStorage.setItem('token', data.token);
            localStorage.setItem('clientName', data.username);
            localStorage.setItem('roles', JSON.stringify(Array.from(data.roles)));
            updateLoginButton(data.username, data.roles);
            redirectByRole(data.roles);

            // Закрываем offcanvas, показываем уведомление и т.д.
            showUniversalToast('Вход', 'Вход выполнен!', 'success');
            const offcanvasElement = document.getElementById('offcanvasRight');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvas) offcanvas.hide();

        })
        .catch(err => {
            // Обработка ошибки входа
            showUniversalToast('Ошибка', 'Неверный телефон или пароль', 'danger');
        });
});*/

// Универсальная функция показа Toast
function showUniversalToast(title, message, type = 'success') {
    const toastEl = document.getElementById('universalToast');
    const toastTitle = toastEl.querySelector('.toast-title');
    const toastBody = toastEl.querySelector('.toast-body');
    const toastHeader = toastEl.querySelector('.toast-header');

    // Сброс и установка классов для цвета
    toastEl.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');
    toastHeader.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');
    toastEl.classList.add('bg-' + type);
    toastHeader.classList.add('bg-' + type);

    toastTitle.textContent = title;
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    setTimeout(() => toast.hide(), 5000);
}

// Очистка номера телефона - оставляем только + и цифры
function cleanPhone(phone) {
    return phone.replace(/[^+0-9]/g, '');
}

// Маска для телефона
function initPhoneMask(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('focus', () => {
        if (!input.value) input.value = '+7 (';
    });
    input.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(1);
        if (val.length > 10) val = val.substring(0, 10);
        e.target.value = `+7 (${val.substring(0,3)}) ${val.substring(3,6)}-${val.substring(6,8)}-${val.substring(8,10)}`;
    });
}

// Переключение между формами входа и регистрации
function switchForm(formToShow) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    loginForm.classList.toggle('d-none', formToShow !== 'login');
    registerForm.classList.toggle('d-none', formToShow !== 'register');

    loginTab.classList.toggle('active', formToShow === 'login');
    registerTab.classList.toggle('active', formToShow === 'register');

    loginTab.classList.toggle('btn-primary', formToShow === 'login');
    loginTab.classList.toggle('btn-outline-primary', formToShow !== 'login');

    registerTab.classList.toggle('btn-primary', formToShow === 'register');
    registerTab.classList.toggle('btn-outline-primary', formToShow !== 'register');

    if (formToShow === 'login') {
        document.getElementById('loginPhone').value = '';
    }
}

// Обновление кнопки входа с учётом роли
function updateLoginButton(clientName, roles) {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    loginBtn.textContent = clientName;
    loginBtn.removeAttribute('data-bs-toggle');
    loginBtn.removeAttribute('data-bs-target');
    loginBtn.removeAttribute('aria-controls');

    // Если roles - строка, обернём в массив
    if (!Array.isArray(roles)) {
        try {
            roles = JSON.parse(roles);
        } catch {
            roles = [roles];
        }
    }

    loginBtn.onclick = () => {
        redirectByRole(roles);
    };
}


// Перенаправление по роли
function redirectByRole(roles) {
    console.log('redirectByRole roles:', roles);
    const rolePriority = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_COURIER', 'ROLE_USER'];
    const highestRole = rolePriority.find(role => roles.includes(role)) || 'ROLE_USER';

    const routes = {
        'ROLE_ADMIN': '/admin/',
        'ROLE_MODERATOR': '/moderator/',
        'ROLE_COURIER': '/courier/',
        'ROLE_USER': '/user/'
    };

    window.location.href = routes[highestRole];
}


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем маски телефонов
    initPhoneMask('loginPhone');
    initPhoneMask('registerPhone');

    // Переключение вкладок
    document.getElementById('loginTab').addEventListener('click', () => switchForm('login'));
    document.getElementById('registerTab').addEventListener('click', () => switchForm('register'));

    // Проверяем, залогинен ли пользователь
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/timeDelivery/me', {
            headers: {'Authorization': 'Bearer ' + token}
        })
            .then(res => {
                if (!res.ok) throw new Error('Не удалось получить данные пользователя');
                return res.json();
            })
            .then(client => {
                localStorage.setItem('clientName', client.name);
                const rolesStr = localStorage.getItem('roles');
                let roles = [];
                if (rolesStr) {
                    try {
                        roles = JSON.parse(rolesStr);
                    } catch {
                        roles = [rolesStr];
                    }
                } else if (client.roles) {
                    roles = Array.isArray(client.roles) ? client.roles : [client.roles];
                    localStorage.setItem('roles', JSON.stringify(roles));
                }

                updateLoginButton(client.name, roles);
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('roles');
                localStorage.removeItem('clientName');
            });
    }

    // Обработка формы регистрации
    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        const email = document.getElementById('registerEmail').value;

        if (password !== confirm) {
            alert('Пароли не совпадают!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Введите корректный email!');
            return;
        }

        const phone = document.getElementById('registerPhone').value;
        const cleanPhoneValue = cleanPhone(phone);

        const data = {
            name: document.getElementById('registerName').value,
            email: email,
            phone: cleanPhoneValue,
            password: password
        };

        fetch('/timeDelivery/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error('Ошибка регистрации');
                return res.text();
            })
            .then(text => {
                showUniversalToast('Регистрация', 'Вы успешно зарегистрировались!', 'success');
                this.reset();
                switchForm('login');
                console.log(text);
            })
            .catch(err => {
                showUniversalToast('Ошибка', 'Не удалось зарегистрироваться', 'danger');
                console.error(err);
            });
    });

    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const phone = document.getElementById('loginPhone').value;
        const cleanPhoneValue = cleanPhone(phone);
        const password = document.getElementById('loginPassword').value;

        const data = {
            phone: cleanPhoneValue,
            password: password
        };

        fetch('/timeDelivery/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error('Login failed');
                return res.json();
            })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('clientName', data.clientName || 'С возвращением!');
                const roles = Array.isArray(data.roles) ? data.roles : [data.roles];
                localStorage.setItem('roles', JSON.stringify(roles));
                updateLoginButton(localStorage.getItem('clientName'), roles);

                showUniversalToast('Вход', 'Вход выполнен!', 'success');

                const offcanvasElement = document.getElementById('offcanvasRight');
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) offcanvas.hide();
            })
            .catch(err => {
                showUniversalToast('Ошибка', 'Неверный телефон или пароль', 'danger');
                console.error(err);
            });
    });

});

/////////////////////////////////////////////////////////

const carouselIndicators = document.getElementById('carouselExampleIndicators');
if (carouselIndicators) {
    //карусель
    fetch('/timeDelivery/images')
        .then(response => response.json())
        .then(images => {
            const carouselInner = document.getElementById('carouselInner');
            const carouselIndicators = document.getElementById('carouselIndicators');

            // Создание индикаторов
            images.forEach((image, index) => {
                const indicator = document.createElement('button');
                indicator.type = 'button';
                indicator.dataset.bsTarget = '#carouselExampleIndicators';
                indicator.dataset.bsSlideTo = index;
                if (index === 0) {
                    indicator.classList.add('active');
                }
                indicator.ariaLabel = `Slide ${index + 1}`;
                carouselIndicators.appendChild(indicator);
            });

            // Создание изображений в карусели
            images.forEach((image, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) {
                    carouselItem.classList.add('active');
                }

                const img = document.createElement('img');
                img.src = `/photos/news/${image}`;
                img.classList.add('d-block', 'w-100');
                img.alt = image;

                carouselItem.appendChild(img);
                carouselInner.appendChild(carouselItem);
            });
        })
        .catch(error => console.error('Error fetching images:', error));
}


////////////////////////////////////////////////////////////////
//переход по поиску
const searchInput = document.querySelector('input[type="search"]');

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') { // при нажатии Enter
        event.preventDefault();
        const query = encodeURIComponent(searchInput.value.trim());
        if (query) {
            window.location.href = `/timeDelivery/search?query=${query}`;
        }
    }
});
////////////////////////////////////////////////////////////
//выводит карточки товаров по выборке
/*
document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    if (!catalog) {
        console.warn("Контейнер для каталога с id 'catalog' не найден.");
        return;
    }

    let allDishes = [];

    function renderCards(dishes) {
        catalog.innerHTML = "";

        if (dishes.length === 0) {
            catalog.innerHTML = "<p>Нет блюд для отображения</p>";
            return;
        }

        dishes.forEach(dish => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";

            card.innerHTML = `
                <div class="card h-100 d-flex flex-column">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="${dish.imageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
                        <h5 class="card-title">${dish.name}</h5>
                        <p class="card-text ingredient-text">${dish.ingredient}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <h5 class="card-title">${dish.price} руб.</h5>
                            <p class="card-text">${dish.weight} г.</p>
                        </div>
                        <a href="#" class="btn btn-warning w-100 mt-3" style="border-radius: 5px;">В корзину 🛒</a>
                    </div>
                </div>
            `;

            catalog.appendChild(card);
        });
    }

    function filterDishes() {
        // Проверяем наличие всех чекбоксов
        const vegCheckbox = document.getElementById("btn-check-veg");
        const spicyCheckbox = document.getElementById("btn-check-spicy");
        const newCheckbox = document.getElementById("btn-check-new");
        const hitCheckbox = document.getElementById("btn-check-hit");

        if (!vegCheckbox || !spicyCheckbox || !newCheckbox || !hitCheckbox) {
            console.warn("Один или несколько фильтров не найдены. Отображаем все блюда без фильтрации.");
            renderCards(allDishes);
            return;
        }

        const isVeganChecked = !vegCheckbox.checked;
        const isSpicyChecked = !spicyCheckbox.checked;
        const isNewChecked = !newCheckbox.checked;
        const isTopChecked = !hitCheckbox.checked;

        const filtered = allDishes.filter(dish => {
            if (isVeganChecked && !dish.vegan) return false;
            if (isSpicyChecked && !dish.spicy) return false;
            if (isNewChecked && !dish.new) return false;
            if (isTopChecked && !dish.top) return false;
            return true;
        });

        renderCards(filtered);
    }

    fetch("/timeDelivery/catalog")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allDishes = data;
            filterDishes();
        })
        .catch(error => console.error("Ошибка при загрузке данных:", error));

    // Навешиваем обработчики на чекбоксы, если они есть
    ["btn-check-veg", "btn-check-spicy", "btn-check-new", "btn-check-hit"].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener("change", filterDishes);
        }
    });
});
*/

/*function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    let allDishes = [];
    let currentCategory = null;

    // Функция для отрисовки карточек блюд на странице
    function renderCards(dishes) {
        catalog.innerHTML = "";

        if (dishes.length === 0) {
            catalog.innerHTML = "<p>Нет блюд для отображения</p>";
            return;
        }

        dishes.forEach(dish => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
  <div class="card h-100 d-flex flex-column">
    <div class="d-flex justify-content-center mb-3">
      <img src="${dish.imageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
    </div>
    <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
      <h5 class="card-title">${dish.name}</h5>
      <p class="card-text ingredient-text">${dish.ingredient}</p>
      <div class="d-flex justify-content-between align-items-center mt-auto">
        <h5 class="card-title">${dish.price} руб.</h5>
        <p class="card-text">${dish.weight} г.</p>
      </div>
      <a href="#" class="btn btn-warning w-100 mt-3" style="border-radius: 5px;">В корзину 🛒</a>
    </div>
  </div>
`;


            catalog.appendChild(card);
        });
    }

    function initFilters() {
        const ids = ["btn-check-veg", "btn-check-spicy", "btn-check-new", "btn-check-hit"];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("change", filterDishes);
            }
        });
    }

    // Функция фильтрации блюд по категории и чекбоксам
    function filterDishes() {
        // Получаем состояние чекбоксов (инвертировано)
        const isVeganChecked = !document.getElementById("btn-check-veg").checked;
        const isSpicyChecked = !document.getElementById("btn-check-spicy").checked;
        const isNewChecked = !document.getElementById("btn-check-new").checked;
        const isTopChecked = !document.getElementById("btn-check-hit").checked;

        // Сначала фильтруем по категории, если указана
        let filtered = allDishes;
        if (currentCategory) {
            filtered = filtered.filter((dish) => {
                if (!dish.typeDishes || dish.typeDishes.length === 0) {
                    return false; // Если у блюда нет категорий, то не подходит
                }
                // Проверяем, содержит ли блюдо категорию с нужным именем
                return dish.typeDishes.some(
                    (category) => category.name.toLowerCase() === currentCategory
                );
            });
        }

        // Затем фильтруем по чекбоксам
        filtered = filtered.filter((dish) => {
            if (isVeganChecked && !dish.vegan) return false;
            if (isSpicyChecked && !dish.spicy) return false;
            if (isNewChecked && !dish.new) return false;
            if (isTopChecked && !dish.top) return false;
            return true;
        });

        renderCards(filtered);
    }

    // Получаем данные с сервера по адресу /catalog
    fetch("/timeDelivery/catalog")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            allDishes = data;

            // Получаем категорию из URL (в нижнем регистре для удобства)
            currentCategory = getQueryParam("category");
            if (currentCategory) currentCategory = currentCategory.toLowerCase();

            // Отрисовываем блюда с учётом фильтров
            filterDishes();
        })
        .catch((error) => console.error("Ошибка при загрузке данных:", error));

    // Навешиваем обработчики события change на все чекбоксы
    ["btn-check-veg", "btn-check-spicy", "btn-check-new", "btn-check-hit"].forEach(
        (id) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", filterDishes);
            } else {
                console.error(`Элемент с id ${id} не найден!`);
            }
        });
})*/

/*function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    if (!catalog) {
        console.warn("Контейнер с id 'catalog' не найден, скрипт остановлен.");
        return;
    }

    let allDishes = [];
    let currentCategory = null;

    // Функция для отрисовки карточек блюд на странице
    function renderCards(dishes) {
        catalog.innerHTML = "";

        if (dishes.length === 0) {
            catalog.innerHTML = "<p>Нет блюд для отображения</p>";
            return;
        }

        dishes.forEach(dish => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
                <div class="card h-100 d-flex flex-column">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="${dish.imageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
                        <h5 class="card-title">${dish.name}</h5>
                        <p class="card-text ingredient-text">${dish.ingredient}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <h5 class="card-title">${dish.price} руб.</h5>
                            <p class="card-text">${dish.weight} г.</p>
                        </div>
                        <a href="#" class="btn btn-warning w-100 mt-3" style="border-radius: 5px;">В корзину 🛒</a>
                    </div>
                </div>
            `;
            catalog.appendChild(card);
        });
    }

    // Навешиваем обработчики на чекбоксы, если они есть
    function initFilters() {
        const checkboxIds = ["btn-check-veg", "btn-check-spicy", "btn-check-new", "btn-check-hit"];
        checkboxIds.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", filterDishes);
            }
        });
    }

    // Функция фильтрации блюд по категории и чекбоксам
    function filterDishes() {
        // Получаем состояние чекбоксов с проверкой наличия
        const vegCheckbox = document.getElementById("btn-check-veg");
        const spicyCheckbox = document.getElementById("btn-check-spicy");
        const newCheckbox = document.getElementById("btn-check-new");
        const hitCheckbox = document.getElementById("btn-check-hit");

        const isVeganChecked = vegCheckbox ? !vegCheckbox.checked : false;
        const isSpicyChecked = spicyCheckbox ? !spicyCheckbox.checked : false;
        const isNewChecked = newCheckbox ? !newCheckbox.checked : false;
        const isTopChecked = hitCheckbox ? !hitCheckbox.checked : false;

        // Фильтрация по категории
        let filtered = allDishes;
        if (currentCategory) {
            filtered = filtered.filter(dish => {
                if (!dish.typeDishes || dish.typeDishes.length === 0) return false;
                return dish.typeDishes.some(category => category.name.toLowerCase() === currentCategory);
            });
        }

        // Фильтрация по чекбоксам
        filtered = filtered.filter(dish => {
            if (isVeganChecked && !dish.vegan) return false;
            if (isSpicyChecked && !dish.spicy) return false;
            if (isNewChecked && !dish.new) return false;
            if (isTopChecked && !dish.top) return false;
            return true;
        });

        renderCards(filtered);
    }

    // Инициализация
    fetch("/timeDelivery/catalog")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allDishes = data;

            currentCategory = getQueryParam("category");
            if (currentCategory) {
                currentCategory = currentCategory.toLowerCase();
            }

            initFilters();
            filterDishes();
        })
        .catch(error => console.error("Ошибка при загрузке данных:", error));
});*/

document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    if (!catalog) {
        console.warn("Контейнер с id 'catalog' не найден, скрипт остановлен.");
        return;
    }

    // Поиск по id поля поиска (на странице поиска id может быть catalogSearchInput, на других - searchInput)
    const searchInput = document.getElementById("catalogSearchInput") || document.getElementById("searchInput");

    let allDishes = [];

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || '';
    }

    function renderCards(dishes) {
        catalog.innerHTML = "";
        if (dishes.length === 0) {
            catalog.innerHTML = "<p>Нет блюд для отображения</p>";
            return;
        }
        dishes.forEach(dish => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
                <div class="card h-100 d-flex flex-column">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="${dish.imageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
                        <h5 class="card-title">${dish.name}</h5>
                        <p class="card-text ingredient-text">${dish.ingredient}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <h5 class="card-title">${dish.price} руб.</h5>
                            <p class="card-text">${dish.weight} г.</p>
                        </div>
                        <a href="#" class="btn btn-warning w-100 mt-3" style="border-radius: 5px;">В корзину 🛒</a>
                    </div>
                </div>
            `;
            catalog.appendChild(card);
        });
    }

    function filterDishes() {
        const vegCheckbox = document.getElementById("btn-check-veg");
        const spicyCheckbox = document.getElementById("btn-check-spicy");
        const newCheckbox = document.getElementById("btn-check-new");
        const hitCheckbox = document.getElementById("btn-check-hit");

        const isVeganChecked = vegCheckbox ? !vegCheckbox.checked : false;
        const isSpicyChecked = spicyCheckbox ? !spicyCheckbox.checked : false;
        const isNewChecked = newCheckbox ? !newCheckbox.checked : false;
        const isTopChecked = hitCheckbox ? !hitCheckbox.checked : false;

        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let filtered = allDishes;

        // Фильтрация по категории, если параметр есть
        const categoryParam = getQueryParam("category");
        if (categoryParam) {
            const currentCategory = categoryParam.toLowerCase();
            filtered = filtered.filter(dish => {
                if (!dish.typeDishes || dish.typeDishes.length === 0) return false;
                return dish.typeDishes.some(cat => cat.name.toLowerCase() === currentCategory);
            });
        }

        // Фильтрация по поиску (если есть поле и значение)
        if (searchValue) {
            filtered = filtered.filter(dish => dish.name.toLowerCase().includes(searchValue));
        } else {
            // Если поле поиска отсутствует или пустое, но в URL есть query - фильтруем по нему
            const queryParam = getQueryParam("query");
            if (queryParam) {
                filtered = filtered.filter(dish => dish.name.toLowerCase().includes(queryParam.toLowerCase()));
            }
        }

        // Фильтрация по чекбоксам
        filtered = filtered.filter(dish => {
            if (isVeganChecked && !dish.vegan) return false;
            if (isSpicyChecked && !dish.spicy) return false;
            if (isNewChecked && !dish.new) return false;
            if (isTopChecked && !dish.top) return false;
            return true;
        });

        renderCards(filtered);
    }

    function debounce(fn, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    function initFilters() {
        ["btn-check-veg", "btn-check-spicy", "btn-check-new", "btn-check-hit"].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", filterDishes);
            }
        });
    }

    // Если есть поле поиска и параметр query, подставляем в поле
    const initialQuery = getQueryParam('query');
    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    fetch("/timeDelivery/catalog")
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allDishes = data;
            initFilters();
            filterDishes();
        })
        .catch(error => console.error("Ошибка при загрузке данных:", error));

    if (searchInput) {
        const debouncedFilter = debounce(filterDishes, 300);
        searchInput.addEventListener("input", debouncedFilter);
    }
});


///////////////////////////////////////////////////////////////////////////////////
//менюшка, которая следует за экраном
let lastScrollTop = 0;

window.addEventListener("scroll", () => {
    let scrollTop = window.scrollY;
    let scrollMenu = document.querySelector(".scroll-menu");

    if (scrollTop > lastScrollTop) {
        // Прокрутка вниз
        if (scrollTop > 150) { // Появляется после прокрутки на 200 пикселей
            scrollMenu.style.display = "block"; // Показываем элемент
            scrollMenu.classList.remove("hide");
            scrollMenu.classList.add("show");
        }
    } else {
        // Прокрутка вверх
        if (scrollTop < 150) { // Исчезает при прокрутке до 100 пикселей от верха
            scrollMenu.classList.remove("show");
            scrollMenu.classList.add("hide");
            scrollMenu.style.display = "none"; // Скрываем элемент
        }
    }

    lastScrollTop = scrollTop;
});

//////////////////////////////////////////////////////////////////
// кнопка вверх

let scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Когда пользователь прокручивает документ на 20 пикселей вниз от его верхней части, покажите кнопку
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
}
// Когда пользователь нажимает кнопку, прокручивается до начала документа.
scrollToTopBtn.addEventListener("click", function(){
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});