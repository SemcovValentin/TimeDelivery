let allDishes = [];

// Функция загрузки блюд с кешированием
async function loadAllDishes() {
    if (allDishes.length > 0) {
        return allDishes;
    }
    try {
        const response = await fetch("/timeDelivery/catalog", { credentials: 'include' });
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        allDishes = await response.json();
        return allDishes;
    } catch (error) {
        console.error("Ошибка при загрузке блюд:", error);
        return [];
    }
}

// функция проверки авторизации через сервер
async function userIsAuthorized() {
    try {
        const response = await fetch('/timeDelivery/user/me', {
            credentials: 'include'
        });
        return response.ok;
    } catch (e) {
        console.error('Ошибка при проверке авторизации:', e);
        return false;
    }
}

//////////////////////////////////////////////////////
// Универсальная функция показа
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
//модальное окно для вызова не зарегистрированным пользователем
function showAuthRequiredModal() {
    const modalEl = document.getElementById('authRequiredModal');
    const modal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: true
    });
    modal.show();
}

/////////////////////////////////////////////////////////
//карусель
const carouselIndicators = document.getElementById('carouselExampleIndicators');
if (carouselIndicators) {
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

if (searchInput) {
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { // при нажатии Enter
            event.preventDefault();
            const query = encodeURIComponent(searchInput.value.trim());
            if (query) {
                window.location.href = `/timeDelivery/search?query=${query}`;
            }
        }
    });
}

////////////////////////////////////////////////////////////
//выводит карточки товаров по выборке
document.addEventListener("DOMContentLoaded", () => {
    const catalog = document.getElementById("catalog");
    if (!catalog) {
        console.warn("Контейнер с id 'catalog' не найден, каталог не будет отрисован.");
        return;
    }
    const searchInput = document.getElementById("catalogSearchInput") || document.getElementById("searchInput");

    // Получить параметр из URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || '';
    }

    // Отрисовка карточек блюд
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
                            ${count > 99 ? '99+' : count}
                            <span class="visually-hidden">товаров в корзине</span>
                        </span>
                    </button>
                </div>
            </div>
            `;
            catalog.appendChild(card);
        });

        // Навешиваем обработчики на кнопки "В корзину"
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
                updateCardBadges();
            });
        });
    }

    // Получить список НЕвыбранных типов из чекбоксов
    function getUnselectedTypes() {
        const allCheckboxes = document.querySelectorAll('.btn-check');
        return Array.from(allCheckboxes)
            .filter(cb => !cb.checked)
            .map(cb => cb.name.toLowerCase());
    }

    // Основная функция фильтрации
    function filterDishes() {
        const unselectedTypes = getUnselectedTypes();
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let filtered = allDishes;

        // Фильтрация по категории из URL
        const categoryParam = getQueryParam("category");
        if (categoryParam) {
            const currentCategory = categoryParam.toLowerCase();
            filtered = filtered.filter(dish => {
                if (!dish.typeDishes || dish.typeDishes.length === 0) return false;
                return dish.typeDishes.some(cat => cat.name.toLowerCase() === currentCategory);
            });
        }

        // Фильтрация по поиску
        if (searchValue) {
            filtered = filtered.filter(dish => dish.name.toLowerCase().includes(searchValue));
        } else {
            const queryParam = getQueryParam("query");
            if (queryParam) {
                filtered = filtered.filter(dish => dish.name.toLowerCase().includes(queryParam.toLowerCase()));
            }
        }

        // Фильтрация по выбранным типам
        if (unselectedTypes.length > 0) {
            filtered = filtered.filter(dish => {
                if (!dish.types || dish.types.length === 0) return false;
                const dishTypeNames = dish.types.map(t => t.name.toLowerCase());
                return unselectedTypes.every(type => dishTypeNames.includes(type));
            });
        }
        renderCards(filtered);
    }

    // Функция debounce для оптимизации поиска
    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Инициализация обработчиков на чекбоксы типов
    function initTypeFilters() {
        document.querySelectorAll('.btn-check').forEach(checkbox => {
            checkbox.addEventListener('change', filterDishes);
        });
    }

    // Подставляем параметр query в поле поиска, если есть
    const initialQuery = getQueryParam('query');
    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    // Загружаем все блюда
    loadAllDishes()
        .then(() => {
            initTypeFilters();
            filterDishes();
        })
        .catch(error => console.error("Ошибка при загрузке данных:", error));

    // Навешиваем debounce на поле поиска
    if (searchInput) {
        const debouncedFilter = debounce(filterDishes, 300);
        searchInput.addEventListener("input", debouncedFilter);
    }
});

///////////////////////////////////////////////////////////////////////////////////
//scroll menu, которая следует за экраном
document.addEventListener('DOMContentLoaded', () => {
    const scrollMenu = document.querySelector(".scroll-menu");
    if (!scrollMenu) return;

    let lastScrollTop = 0;

    window.addEventListener("scroll", () => {
        let scrollTop = window.scrollY;

        if (scrollTop > lastScrollTop) {
            // Прокрутка вниз
            if (scrollTop > 150) {
                scrollMenu.style.display = "block";
                scrollMenu.classList.remove("hide");
                scrollMenu.classList.add("show");
            }
        } else {
            // Прокрутка вверх
            if (scrollTop < 150) {
                scrollMenu.classList.remove("show");
                scrollMenu.classList.add("hide");
                scrollMenu.style.display = "none";
            }
        }

        lastScrollTop = scrollTop;
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});


///////////////////////////////////////////////////////////
//функцию для отображения содержимого корзины
function renderCartTable(dishes) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    let total = 0;
    let rows = '';

    Object.keys(cart).forEach(dishId => {
        const dish = dishes.find(d => d.id == dishId);
        const encodedImageUrl = '/photos' + encodeURI(dish.imageUrl);
        if (!dish) return;
        const count = cart[dishId];
        const sum = dish.price * count;
        total += sum;
        rows += `
    <tr>
        <td>
            <a href="/timeDelivery/search?query=${encodeURIComponent(dish.name)}" target="_blank">
                <img src="${encodedImageUrl}" alt="${dish.name}" style="width:60px; height:40px; object-fit:cover;">
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

    // Получить сохранённый комментарий, если есть
    const savedComment = localStorage.getItem('cartComment') || '';

    document.getElementById('cartTableContainer').innerHTML = `
        <table class="table table-dark table-striped align-middle mb-3">
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
        <div class="mb-3">
            <label for="cartComment" class="form-label">Комментарий к заказу:</label>
            <textarea id="cartComment" class="form-control" rows="2" placeholder="Уточнения по доставке, пожелания и т.д.">${savedComment}</textarea>
        </div>
    `;
}

//Вешаем обработчики на кнопки "+" и "-" и "✖" в корзине
const cartTableContainer = document.getElementById('cartTableContainer');

if (cartTableContainer) {
    cartTableContainer.addEventListener('click', function (e) {
        const cart = JSON.parse(localStorage.getItem('cart') || '{}');

        if (e.target.classList.contains('cart-plus')) {
            const id = e.target.getAttribute('data-dish-id');
            cart[id] = (cart[id] || 0) + 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();
        }

        if (e.target.classList.contains('cart-minus')) {
            const id = e.target.getAttribute('data-dish-id');
            cart[id] = (cart[id] || 1) - 1;
            if (cart[id] <= 0) {
                delete cart[id];
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();
        }

        if (e.target.classList.contains('cart-remove')) {
            const id = e.target.getAttribute('data-dish-id');
            delete cart[id];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();
        }
    });
}

//сохраняем комент в localStorage
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'cartComment') {
        localStorage.setItem('cartComment', e.target.value);
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

const cartModal = document.getElementById('cartModal');
if (cartModal) {
    cartModal.addEventListener('show.bs.modal', function () {
        renderCartTable(allDishes);
    });

    cartModal.addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    });
}



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

// Оформление заказа
const submitOrderBtn = document.getElementById('submitOrderBtn');
if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', async function () {
        const cart = JSON.parse(localStorage.getItem('cart') || '{}');
        const comment = document.getElementById('cartComment')?.value || '';

        // Асинхронно проверяем авторизацию
        if (!(await userIsAuthorized())) {
            showAuthRequiredModal();
            return;
        }

        if (Object.keys(cart).length === 0) {
            showUniversalToast('Ошибка', 'Корзина пуста', 'danger');
            return;
        }

        // Проверяем наличие блюд
        const dishIds = Object.keys(cart);
        const missingDishes = dishIds.filter(id => !allDishes.find(d => d.id == id));
        if (missingDishes.length > 0) {
            showUniversalToast('Ошибка', 'Некоторые блюда больше недоступны. Пожалуйста, обновите корзину.', 'danger');
            missingDishes.forEach(id => delete cart[id]);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();
            return;
        }

        try {
            const response = await fetch('/timeDelivery/orders/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({items: cart, comment}), // <-- добавили комментарий в тело запроса
                redirect: 'manual'
            });

            if (response.status === 401 || response.status === 403) {
                showAuthRequiredModal();
                throw new Error('Пользователь не авторизован');
            }

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = {};
                }
                throw new Error(errorData.error || 'Ошибка оформления заказа');
            }

            const data = await response.json();

            // Успешно оформили заказ
            localStorage.removeItem('cart');
            localStorage.removeItem('cartComment');
            renderCartTable(allDishes);
            updateCartBadge();
            updateCardBadges();

            const orderId = data.orderId || 'неизвестен';
            showUniversalToast('Успех', 'Заказ успешно оформлен! Номер заказа: ' + orderId, 'success');

            const cartModalEl = document.getElementById('cartModal');
            const modalInstance = bootstrap.Modal.getInstance(cartModalEl);
            if (modalInstance) {
                modalInstance.hide();
            }

        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            showUniversalToast('Ошибка', error.message, 'danger');
        }

    });
}







