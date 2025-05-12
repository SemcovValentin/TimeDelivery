//////////////////////////////////////////////////////
//форма входа и регистрации
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
        e.target.value = `+7 (${val.substring(0, 3)}) ${val.substring(3, 6)}-${val.substring(6, 8)}-${val.substring(8, 10)}`;
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

searchInput.addEventListener('keydown', function (event) {
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

let allDishes = [];

document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    if (!catalog) {
        console.warn("Контейнер с id 'catalog' не найден, скрипт остановлен.");
        return;
    }

    // Поиск по id поля поиска (на странице поиска id может быть catalogSearchInput, на других - searchInput)
    const searchInput = document.getElementById("catalogSearchInput") || document.getElementById("searchInput");

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
            const cart = JSON.parse(localStorage.getItem('cart') || '{}');
            const count = cart[dish.id] || 0;
            const encodedImageUrl = '/photos' + encodeURI(dish.imageUrl);
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
            <div class="card h-100 d-flex flex-column">
                <div class="d-flex justify-content-center mb-3">
                    <img src="${encodedImageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
                </div>
                <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
                    <h5 class="card-title">${dish.name}</h5>
                    <p class="card-text ingredient-text">${dish.ingredient}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <h5 class="card-title">${dish.price} руб.</h5>
                        <p class="card-text">${dish.weight} г.</p>
                    </div>
                    <button type="button"
                        class="btn btn-warning w-100 mt-3 add-to-cart-btn position-relative"
                        data-dish-id="${dish.id}"
                        style="border-radius: 5px;">
                        В корзину 🛒
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count"
                              style="font-size: 0.95em; ${count > 0 ? '' : 'display:none;'}">
                            ${count > 99 ? '99+' : (count > 0 ? count : '')}
                            <span class="visually-hidden">товаров в корзине</span>
                        </span>
                    </button>
                </div>
            </div>
        `;
            catalog.appendChild(card);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const dishId = this.getAttribute('data-dish-id');
                let cart = JSON.parse(localStorage.getItem('cart') || '{}');
                cart[dishId] = (cart[dishId] || 0) + 1;
                localStorage.setItem('cart', JSON.stringify(cart));

                // Обновляем бейдж
                const badge = this.querySelector('.cart-count');
                badge.style.display = 'inline-block';
                badge.textContent = cart[dishId] > 99 ? '99+' : cart[dishId];

                updateCartBadge();
                updateCardBadges()
            });
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
        return function (...args) {
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
window.onscroll = function () {
    scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
}

// Когда пользователь нажимает кнопку, прокручивается до начала документа.
scrollToTopBtn.addEventListener("click", function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});

///////////////////////////////////////////////////////////
//функцию для отображения содержимого корзины

function renderCartTable(dishes) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    let total = 0;
    let rows = '';

    Object.keys(cart).forEach(dishId => {
        const dish = dishes.find(d => d.id == dishId);
        if (!dish) return;
        const count = cart[dishId];
        const sum = dish.price * count;
        total += sum;
        rows += `
    <tr>
        <td>
            <a href="/timeDelivery/search?query=${encodeURIComponent(dish.name)}" target="_blank">
                <img src="${dish.imageUrl}" alt="${dish.name}" style="width:60px; height:40px; object-fit:cover;">
            </a>
        </td>
        <td>
            <a href="/timeDelivery/search?query=${encodeURIComponent(dish.name)}" class="text-warning" style="text-decoration: underline;" target="_blank">
                ${dish.name}
            </a>
        </td>
        <td>${dish.price} руб.</td>
        <td>
            <button class="btn btn-sm btn-outline-warning cart-minus" data-dish-id="${dish.id}">-</button>
            <span class="mx-2">${count}</span>
            <button class="btn btn-sm btn-outline-warning cart-plus" data-dish-id="${dish.id}">+</button>
        </td>
        <td>${sum} руб.</td>
        <td>
            <button class="btn btn-sm btn-outline-danger cart-remove" data-dish-id="${dish.id}">✖</button>
        </td>
    </tr>
`;

    });

    if (!rows) {
        document.getElementById('cartTableContainer').innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    document.getElementById('cartTableContainer').innerHTML = `
        <table class="table table-dark table-striped align-middle">
            <thead>
                <tr>
                    <th></th>
                    <th>Блюдо</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Сумма</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="4" class="text-end"><b>Итого:</b></td>
                    <td colspan="2"><b>${total} руб.</b></td>
                </tr>
            </tfoot>
        </table>
    `;
}

//Вешаем обработчики на кнопки "+" и "-" и "✖" в корзине
document.getElementById('cartTableContainer').addEventListener('click', function (e) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (e.target.classList.contains('cart-plus')) {
        const id = e.target.getAttribute('data-dish-id');
        cart[id] = (cart[id] || 0) + 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartTable(allDishes);
        updateCartBadge();
        updateCardBadges()
    }
    if (e.target.classList.contains('cart-minus')) {
        const id = e.target.getAttribute('data-dish-id');
        cart[id] = (cart[id] || 1) - 1;
        if (cart[id] <= 0) {
            delete cart[id];
        } else {
            // Оставляем товар с новым количеством
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartTable(allDishes);
        updateCartBadge();
        updateCardBadges()
    }
    if (e.target.classList.contains('cart-remove')) {
        const id = e.target.getAttribute('data-dish-id');
        delete cart[id];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartTable(allDishes);
        updateCartBadge();
        updateCardBadges()
    }
});

//Обновление бейджа на кнопке корзины
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    let total = Object.values(cart).reduce((sum, n) => sum + n, 0);
    document.querySelectorAll('.cart-badge').forEach(badge => {
        if (total > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = total > 99 ? '99+' : total;
        } else {
            badge.style.display = 'none';
        }
    });
}

document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    });
});


document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    updateCardBadges();
});


document.getElementById('cartModal').addEventListener('show.bs.modal', function () {
    renderCartTable(allDishes);
});

document.getElementById('cartModal').addEventListener('hide.bs.modal', () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
});

//обновления бейджей на карточках
function updateCardBadges() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        const dishId = btn.getAttribute('data-dish-id');
        const badge = btn.querySelector('.cart-count');
        const count = cart[dishId] || 0;
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    });
}

//Оформление заказа
document.getElementById('submitOrderBtn').addEventListener('click', async function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');

    if (Object.keys(cart).length === 0) {
        showUniversalToast('Ошибка', 'Корзина пуста', 'danger');
        return;
    }

    fetch('/timeDelivery/orders/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Обязательно указываем тип содержимого
            // НЕ добавляем заголовок Authorization, так как используем cookie для аутентификации
        },
        credentials: 'include', // Важно! Чтобы браузер отправлял cookie с запросом
        body: JSON.stringify({ items: cart }),
        redirect: 'manual' // Опционально: чтобы не следовать редиректам автоматически
    })
        .then(async response => {
            if (response.status === 401 || response.status === 403) {
                // Пользователь не авторизован - показываем модальное окно логина
                showLoginModal();
                throw new Error('Пользователь не авторизован');
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка оформления заказа');
            }
            return response.json();
        })
        .then(data => {
            // Успешно оформили заказ
            localStorage.removeItem('cart');
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();

            showUniversalToast('Успех', 'Заказ успешно оформлен! Номер заказа: ' + data.orderId, 'success');

            const cartModalEl = document.getElementById('cartModal');
            const modalInstance = bootstrap.Modal.getInstance(cartModalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
        })
        .catch(error => {
            console.error('Ошибка при оформлении заказа:', error);
            showUniversalToast('Ошибка', error.message, 'danger');
        })
        });



