document.getElementById('btnOrders').addEventListener('click', () => {
    loadCourierOrdersByUser();
});
document.addEventListener('DOMContentLoaded', () => {
    loadCourierOrdersByUser();
});

let currentStatusFilter = '';

// Получаем данные текущего пользователя и загружаем заказы курьера
async function loadCourierOrdersByUser() {
    try {
        const res = await fetch('/timeDelivery/user/me');
        if (!res.ok) throw new Error('Не удалось получить данные пользователя');
        const user = await res.json();
        const courierId = user.id;

        if (!courierId) {
            throw new Error('ID пользователя не найден');
        }

        renderCourierOrdersTable(courierId);

    } catch (error) {
        console.error(error);
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            adminContent.innerHTML = `<p class="text-danger">Ошибка: ${error.message}</p>`;
        }
    }
}

// Отображаем таблицу заказов курьера с учётом фильтра по статусу
async function renderCourierOrdersTable(courierId) {
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;

    try {
        let url = `/courier/${courierId}/orders`;
        if (currentStatusFilter) {
            url += `?status=${encodeURIComponent(currentStatusFilter)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки заказов курьера');
        const orders = await response.json();

        adminContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>Заказы</h4>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" id="statusFilterBtn">
                        Статус: ${getStatusLabel(currentStatusFilter)}
                    </button>
                    <ul class="dropdown-menu" id="statusFilterMenu">
                        <li><a class="dropdown-item${currentStatusFilter === '' ? ' active' : ''}" href="#" data-status="">Все</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item${currentStatusFilter === 'ON_THE_WAY' ? ' active' : ''}" href="#" data-status="ON_THE_WAY">Принятые</a></li>
                        <li><a class="dropdown-item${currentStatusFilter === 'DELIVERED' ? ' active' : ''}" href="#" data-status="DELIVERED">Доставленные</a></li>
                    </ul>
                </div>
            </div>
            <table class="table table-striped" id="courierOrdersTable">
                <thead>
                    <tr>
                        <th>Номер</th>
                        <th>Телефон</th>
                        <th>Имя</th>
                        <th>Сумма</th>
                        <th>Адрес</th>
                        <th>Комментарий к заказу</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr data-order-id="${order.id}">
                            <td>${order.id}</td>
                            <td>${order.client?.phone || '—'}</td>
                            <td>${order.client?.name || '—'}</td>
                            <td>${order.totalAmount ? order.totalAmount + ' руб.' : '—'}</td>
                            <td>${order.client?.address || '—'}</td>
                            <td>${order.comment ? escapeHtml(order.comment) : '—'}</td>
                           <td>
                              <input type="radio" class="form-check-input order-delivered-radio" 
                                     name="delivered-${order.id}" 
                                     id="delivered-${order.id}" 
                                     ${order.status === 'DELIVERED' ? 'checked' : ''} />
                              <label class="form-check-label" for="delivered-${order.id}">Доставлен</label>
                            </td>

                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        adminContent.querySelectorAll('.order-delivered-radio').forEach(radio => {
            radio.addEventListener('change', async (e) => {
                const orderId = e.target.id.replace('delivered-', '');
                const isChecked = e.target.checked;

                if (isChecked) {
                    try {
                        const res = await fetch(`/timeDelivery/orders/${orderId}/update-status`, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({status: 'DELIVERED'})
                        });
                        if (!res.ok) throw new Error('Не удалось обновить статус');
                        showUniversalToast('Успех', 'Статус заказа изменён на "Доставлен"', 'success');
                    } catch {
                        showUniversalToast('Ошибка', 'Не удалось изменить статус', 'danger');
                        e.target.checked = false;
                    }
                }
            });
        });

        // Обработчики выбора фильтра статуса
        adminContent.querySelectorAll('#statusFilterMenu .dropdown-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                adminContent.querySelectorAll('#statusFilterMenu .dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                adminContent.querySelector('#statusFilterBtn').textContent = `Статус: ${item.textContent.trim()}`;
                currentStatusFilter = item.dataset.status;
                renderCourierOrdersTable(courierId);
            });
        });

    } catch (error) {
        adminContent.innerHTML = `<p class="text-danger">Ошибка: ${error.message}</p>`;
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'ON_THE_WAY': return 'Принятые';
        case 'DELIVERED': return 'Доставленные';
        case '': return 'Все';
        default: return status;
    }
}

// Функция для экранирования HTML
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}
