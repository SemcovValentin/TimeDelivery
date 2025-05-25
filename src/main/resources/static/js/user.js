
// Универсальная функция показа Toast
function showUniversalToast(title, message, type = 'success') {
    const toastEl = document.getElementById('universalToast');
    if (!toastEl) {
        console.error('Toast элемент с id "universalToast" не найден');
        return;
    }

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

document.getElementById('clientName').textContent = localStorage.getItem('clientName') || 'Имя пользователя';
fetch('/timeDelivery/me', {
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
    .then(res => res.json())
    .then(client => {
        document.getElementById('clientName').textContent = client.name || 'Имя пользователя';
    });


//кнопка выхода
document.getElementById('logoutBtn').addEventListener('click', async function (e) {
    e.preventDefault();
    try {
        await fetch('/timeDelivery/logout', {method: 'POST', credentials: 'include'});
    } catch (err) {
        console.error('Ошибка при выходе:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('clientName');
    localStorage.removeItem('cart');
    localStorage.removeItem('cartComment');
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/timeDelivery/';
});


///////////////////////////////

const token = localStorage.getItem('token');
let oldPhone = '';

document.getElementById('offcanvasUserEdit').addEventListener('show.bs.offcanvas', async () => {
    try {
        const res = await fetch('/timeDelivery/user/me', {
            headers: {'Authorization': 'Bearer ' + token}
        });
        if (!res.ok) throw new Error('Ошибка загрузки данных пользователя');
        const user = await res.json();
        document.getElementById('userPhoneInput').value = user.phone || '';
        oldPhone = user.phone || '';

        document.getElementById('userPasswordCurrent').value = '';
        document.getElementById('userPasswordNew').value = '';
        document.getElementById('userPasswordNewCheck').value = '';
    } catch (e) {
        showUniversalToast('Ошибка', e.message, 'danger');
    }
});


document.getElementById('userEditForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const phone = document.getElementById('userPhoneInput').value.trim();
    const currentPassword = document.getElementById('userPasswordCurrent').value;
    const newPassword = document.getElementById('userPasswordNew').value;
    const newPasswordCheck = document.getElementById('userPasswordNewCheck').value;

    if (!currentPassword || currentPassword.length < 6) {
        showUniversalToast('Ошибка', 'Введите текущий пароль', 'warning');
        return;
    }

    if (newPassword || newPasswordCheck) {
        if (newPassword.length < 6) {
            showUniversalToast('Ошибка', 'Новый пароль должен быть не короче 6 символов', 'warning');
            return;
        }
        if (newPassword !== newPasswordCheck) {
            showUniversalToast('Ошибка', 'Новый пароль и его повтор не совпадают', 'warning');
            return;
        }
    }

    const payload = {
        phone,
        currentPassword,
        newPassword: newPassword ? newPassword : null
    };

    try {
        const res = await fetch('/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Ошибка обновления данных');
        }

        if (phone !== oldPhone) {
            showUniversalToast('Внимание', 'Ваш логин был изменён. Пожалуйста, войдите в систему с новым логином.', 'info');
            await fetch('/timeDelivery/logout', {method: 'POST', credentials: 'include'});
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            localStorage.removeItem('clientName');
            window.location.href = '/timeDelivery/';
            return;
        }

        showUniversalToast('Успех', 'Данные успешно обновлены', 'success');
        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasUserEdit')).hide();

        document.getElementById('userPasswordCurrent').value = '';
        document.getElementById('userPasswordNew').value = '';
        document.getElementById('userPasswordNewCheck').value = '';
    } catch (err) {
        showUniversalToast('Ошибка', err.message, 'danger');
    }
});


//Форма редактирования личных данных
document.getElementById('offcanvasClientEdit').addEventListener('show.bs.offcanvas', async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/timeDelivery/me', {
            headers: {'Authorization': 'Bearer ' + token}
        });
        if (!res.ok) throw new Error('Ошибка загрузки Client данных');
        const client = await res.json();

        document.getElementById('clientNameInput').value = client.name || '';
        document.getElementById('clientEmailInput').value = client.email || '';
        document.getElementById('clientAddressInput').value = client.address || '';
        document.getElementById('clientCityInput').value = client.city || '';
        document.getElementById('clientBirthdayInput').value = client.birthday ? client.birthday.substring(0, 10) : '';
    } catch (e) {
        alert(e.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const birthdayInput = document.getElementById('clientBirthdayInput');
    if (birthdayInput) {
        const today = new Date().toISOString().split('T')[0];
        birthdayInput.setAttribute('max', today);

        birthdayInput.addEventListener('input', () => {
            if (birthdayInput.value > birthdayInput.max) {
                birthdayInput.setCustomValidity('Дата рождения не может быть в будущем');
            } else {
                birthdayInput.setCustomValidity('');
            }
        });
    }
});

document.getElementById('clientEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientNameInput').value.trim();
    const email = document.getElementById('clientEmailInput').value.trim();
    const address = document.getElementById('clientAddressInput').value.trim();
    const city = document.getElementById('clientCityInput').value.trim();
    const birthday = document.getElementById('clientBirthdayInput').value;

    const payload = {name, email, address, city, birthday};

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/user/updateClient', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Ошибка обновления Client');

        bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasClientEdit')).hide();
        document.getElementById('clientName').textContent = name;
        localStorage.setItem('clientName', name);

        showUniversalToast('Успех', 'Данные обновлены', 'success');
    } catch (e) {
        showUniversalToast('Ошибка', e.message, 'danger');
    }
});

//////////////////////////////////////////////////////
//снимаем фокус с модального окна корзины
document.addEventListener('DOMContentLoaded', () => {
    const cartModalEl = document.getElementById('cartModal');
    const cartBtn = document.querySelector('.cart-btn');

    if (!cartModalEl) return;

    cartModalEl.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

        if (document.activeElement instanceof HTMLElement && cartModalEl.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        if (cartBtn) {
            cartBtn.focus();
        }
    });
});

async function loadAndRenderUserOrders(userOrders) {
    if (typeof loadAllDishes !== 'function') {
        console.warn('loadAllDishes не определена, пропускаем загрузку блюд');
        renderUserOrdersTable(userOrders, []);
        return;
    }
    const allDishes = await loadAllDishes();
    renderUserOrdersTable(userOrders, allDishes);
}

// Функция для рендера таблицы заказов пользователя
function renderUserOrdersTable(userOrders, allDishes) {
    const container = document.getElementById('userOrdersTableContainer');
    if (!container) {return;}
    const emptyMessage = document.getElementById('userOrdersEmptyMessage');

    if (!userOrders || userOrders.length === 0) {
        container.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    let html = '';

    userOrders.forEach(order => {
        if (!order.id) {
            console.warn('Пропущен заказ без id:', order);
            return;
        }

        let itemsRows = '';
        let total = 0;

        if (!Array.isArray(order.items) || order.items.length === 0) {
            itemsRows = `<tr><td colspan="5" class="text-center text-muted">В этом заказе нет товаров</td></tr>`;
        } else {
            order.items.forEach(item => {
                if (!item.dishName || !item.price || !item.quantity) {
                    console.warn('Пропущен товар с неполными данными:', item);
                    return;
                }
                const sum = item.price * item.quantity;
                total += sum;

                const dish = allDishes.find(d => d.name === item.dishName);
                const encodedImageUrl = dish ? '/photos' + encodeURI(dish.imageUrl) : '/photos/default.jpg';
                const altText = dish ? dish.name : item.dishName;
                const query = encodeURIComponent(altText);

                itemsRows += `
                    <tr>
                        <td>
                            <a href="/timeDelivery/search?query=${query}" target="_blank" rel="noopener noreferrer">
                                <img src="${encodedImageUrl}" alt="${altText}" style="width:60px; height:40px; object-fit:cover; border-radius: 4px;">
                            </a>
                        </td>
                        <td>
                            <a href="/timeDelivery/search?query=${query}" class="link-black-no-underline" target="_blank" rel="noopener noreferrer">${altText}</a>
                        </td>
                        <td>${item.price} руб.</td>
                        <td>${item.quantity}</td>
                        <td>${sum} руб.</td>
                    </tr>
                `;
            });
        }

        const commentHtml = order.comment && order.comment.trim() !== ''
            ? `<div class="p-3 border-top" style="background-color: #f8f9fa; color: #212529;">
                   <strong>Комментарий к заказу:</strong>
                   <p class="mb-0" style="white-space: pre-wrap;">${escapeHtml(order.comment)}</p>
               </div>`
            : '';

        html += `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div class="order-number">Заказ №${order.id}</div>
                    <div><small class="order-number">Дата: ${new Date(order.createdAt).toLocaleString()}</small></div>
                    <div><span class="badge bg-info text-dark order-status">${statusLabels[order.status] || 'NEW'}</span></div>
                </div>
               
                <div class="card-body p-0">
                    <table class="table table-striped align-middle mb-0">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Блюдо</th>
                                <th>Цена</th>
                                <th>Кол-во</th>
                                <th>Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-end"><b>Итого:</b></td>
                                <td><b>${total} руб.</b></td>
                            </tr>
                        </tfoot>
                    </table>
                    ${commentHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/timeDelivery/orders/userOrders', {
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Ошибка загрузки заказов: ${response.status} ${response.statusText}`);

        const userOrders = await response.json();

        if (!Array.isArray(userOrders)) {
            throw new Error('Некорректный формат данных заказов');
        }

        await loadAndRenderUserOrders(userOrders);
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        const container = document.getElementById('userOrdersTableContainer');
        if (container) {
            container.innerHTML = '<p class="text-danger">Не удалось загрузить заказы.</p>';
        }
        const emptyMessage = document.getElementById('userOrdersEmptyMessage');
        if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }
    }
});

const statusLabels = {
    ACCEPTED: 'Заказ принят',
    PROCESSING: 'Заказ в обработке',
    ON_THE_WAY: 'Курьер выехал',
    DELIVERED: 'Заказ доставлен'
};

async function updateUserOrderStatuses() {
    try {
        const response = await fetch('/timeDelivery/orders/userOrders', { credentials: 'include' });
        if (!response.ok) throw new Error('Ошибка при загрузке статусов');

        const userOrders = await response.json();
        userOrders.forEach(order => {
            const orderCard = document.querySelector(`.card[data-order-id="${order.id}"]`);
            if (orderCard) {
                const statusElem = orderCard.querySelector('.order-status');
                if (statusElem) {
                    const newStatusText = statusLabels[order.status] || 'NEW';
                    if (statusElem.textContent !== newStatusText) {
                        statusElem.textContent = newStatusText;
                    }
                }
            }
        });
    } catch (e) {
        console.error('Ошибка обновления статусов заказов:', e);
    }
}

setInterval(updateUserOrderStatuses, 10000);


