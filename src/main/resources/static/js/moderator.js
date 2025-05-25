document.addEventListener('DOMContentLoaded', () => {
    const btnOrders = document.getElementById('btnOrders');
    if (btnOrders) {
        btnOrders.addEventListener('click', () => {
            renderOrdersTable(0);
        });
    }
});

////////////////////////////////////////////////////////////////////////////////////
//создание таблицы заказов
const adminContent = document.getElementById('adminContent');
const pageSize = 10;
let currentPage = 0;
let totalPages = 0;
let currentStatusFilter = '';

async function renderOrdersTable(page = 0) {
    if (!adminContent) return;

    try {
        const queryParams = new URLSearchParams({
            page,
            size: pageSize,
        });
        if (currentStatusFilter) {
            queryParams.append('status', currentStatusFilter);
        }

        const [ordersPage, couriers] = await Promise.all([
            fetch(`/moderator/orders?${queryParams.toString()}`).then(res => res.json()),
            fetch('/moderator/couriers').then(res => res.json()),
        ]);

        currentPage = page;
        totalPages = ordersPage.totalPages;
        const orders = ordersPage.content;

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
                    <li><a class="dropdown-item${currentStatusFilter === 'ACCEPTED' ? ' active' : ''}" href="#" data-status="ACCEPTED">Заказ принят</a></li>
                    <li><a class="dropdown-item${currentStatusFilter === 'PROCESSING' ? ' active' : ''}" href="#" data-status="PROCESSING">Заказ в обработке</a></li>
                    <li><a class="dropdown-item${currentStatusFilter === 'ON_THE_WAY' ? ' active' : ''}" href="#" data-status="ON_THE_WAY">Курьер выехал</a></li>
                    <li><a class="dropdown-item${currentStatusFilter === 'DELIVERED' ? ' active' : ''}" href="#" data-status="DELIVERED">Заказ доставлен</a></li>
                </ul>
            </div>
        </div>
        <table class="table table-striped" id="ordersTable">
            <thead>
                <tr>
                    <th>Номер</th>
                    <th>Время</th>
                    <th>Телефон</th>
                    <th>Имя</th>
                    <th>Сумма</th>
                    <th>Адрес</th>
                </tr>
            </thead>
            <tbody id="ordersTableBody"></tbody>
        </table>
        <nav>
            <ul class="pagination justify-content-center">
                <li class="page-item ${page === 0 ? 'disabled' : ''}">
                    <button class="page-link" id="prevPage">Предыдущая</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Страница ${page + 1} из ${totalPages}</span>
                </li>
                <li class="page-item ${page + 1 >= totalPages ? 'disabled' : ''}">
                    <button class="page-link" id="nextPage">Следующая</button>
                </li>
            </ul>
        </nav>
        `;

        const tbody = document.getElementById('ordersTableBody');
        orders.forEach(order => {
            const trMain = document.createElement('tr');
            [
                order.id,
                new Date(order.createdAt || order.orderTime).toLocaleString(),
                order.client?.phone || '—',
                order.client?.name || '—',
                order.totalAmount ? `${order.totalAmount} руб.` : '—',
                order.client?.address || '—'
            ].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                trMain.appendChild(td);
            });
            tbody.appendChild(trMain);

            const trValues = document.createElement('tr');

            const tdComment = document.createElement('td');
            tdComment.colSpan = 3;
            tdComment.textContent = order.comment && order.comment.trim() !== '' ? order.comment : '—';
            tdComment.style.fontStyle = 'italic';
            tdComment.style.whiteSpace = 'normal';
            tdComment.style.wordBreak = 'break-word';
            tdComment.style.textAlign = 'left';
            trValues.appendChild(tdComment);

            const tdCourier = document.createElement('td');
            const selectCourier = document.createElement('select');
            selectCourier.className = 'form-select form-select-sm';
            selectCourier.style.minWidth = '150px';

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Выбери курьера';
            selectCourier.appendChild(emptyOption);

            couriers.forEach(courier => {
                const option = document.createElement('option');
                option.value = courier.id;
                option.textContent = courier.clientName || courier.name || 'Без имени';
                if (order.courierId === courier.id) option.selected = true;
                selectCourier.appendChild(option);
            });

            selectCourier.addEventListener('change', async () => {
                try {
                    await fetch(`/moderator/orders/${order.id}/assign-courier`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({courierId: selectCourier.value || null})
                    });
                    showUniversalToast('Успех', 'Курьер назначен', 'success');
                } catch {
                    showUniversalToast('Ошибка', 'Не удалось назначить курьера', 'danger');
                }
            });

            tdCourier.appendChild(selectCourier);
            trValues.appendChild(tdCourier);

            const tdStatus = document.createElement('td');
            tdStatus.colSpan = 2;
            tdStatus.appendChild(createStatusRadioGroup2x2(order));
            trValues.appendChild(tdStatus);

            tbody.appendChild(trValues);
        });

        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 0) renderOrdersTable(currentPage - 1);
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage + 1 < totalPages) renderOrdersTable(currentPage + 1);
        });

        // Обработчик фильтра статуса
        document.querySelectorAll('#statusFilterMenu .dropdown-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('#statusFilterMenu .dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                document.getElementById('statusFilterBtn').textContent = `Статус: ${item.textContent.trim()}`;
                currentStatusFilter = item.dataset.status;
                renderOrdersTable(0);
            });
        });

    } catch (error) {
        adminContent.innerHTML = `<p class="text-danger">Ошибка загрузки заказов: ${error.message}</p>`;
    }
}

// Вспомогательная функция для отображения статуса в кнопке
function getStatusLabel(status) {
    switch (status) {
        case 'ACCEPTED': return 'Заказ принят';
        case 'PROCESSING': return 'Заказ в обработке';
        case 'ON_THE_WAY': return 'Курьер выехал';
        case 'DELIVERED': return 'Заказ доставлен';
        default: return 'Все';
    }
}

// Радио-кнопки для статуса заказа (2x2, Bootstrap)
function createStatusRadioGroup2x2(order) {
    const statuses = [
        {id: 'ACCEPTED', label: 'Заказ принят'},
        {id: 'PROCESSING', label: 'Заказ в обработке'},
        {id: 'ON_THE_WAY', label: 'Курьер выехал'},
        {id: 'DELIVERED', label: 'Заказ доставлен'}
    ];

    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1fr';
    container.style.gap = '4px';
    container.style.minWidth = '300px';

    statuses.forEach(status => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'btn-check';
        input.name = `status-${order.id}-${uniqueSuffix}`;
        input.id = `status-${order.id}-${status.id}-${uniqueSuffix}`;
        input.autocomplete = 'off';
        input.value = status.id;
        input.checked = order.status === status.id;

        input.addEventListener('change', async () => {
            try {
                const response = await fetch(`/timeDelivery/orders/${order.id}/update-status`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({status: status.id})
                });
                if (!response.ok) throw new Error('Ошибка при обновлении статуса');
                showUniversalToast('Успех', `Статус изменён на "${status.label}"`, 'success');
            } catch (e) {
                showUniversalToast('Ошибка', 'Не удалось изменить статус', 'danger');
            }
        });

        const label = document.createElement('label');
        label.className = 'btn btn-outline-danger';
        label.setAttribute('for', input.id);
        label.textContent = status.label;
        label.style.color = 'black';

        container.appendChild(input);
        container.appendChild(label);
    });

    return container;
}

////////////////////////////////////////////////////////
//работа с клиентами
let currentSortBy = 'id';
let currentDirection = 'asc';

async function renderClientsTable(page = 0, sortBy = 'id', direction = 'asc') {
    const adminContent = document.getElementById('adminContent');
    try {
        const response = await fetch(`/moderator/clients?page=${page}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`);
        if (!response.ok) throw new Error('Ошибка загрузки клиентов');
        const data = await response.json();

        const clients = data.content;
        const totalPages = data.totalPages;

        adminContent.innerHTML = `
            <h4>Клиенты</h4>
            <table class="table table-striped" id="clientsTable">
                <thead>
                    <tr>
                        <th data-sort="id" style="cursor:pointer">ID</th>
                        <th data-sort="phone" style="cursor:pointer">Телефон</th>
                        <th data-sort="name" style="cursor:pointer">Имя</th>
                        <th data-sort="email" style="cursor:pointer">Email</th>
                        <th data-sort="address" style="cursor:pointer">Адрес</th>
                        <th data-sort="city" style="cursor:pointer">Город</th>
                        <th data-sort="birthday" style="cursor:pointer">Дата рождения</th>
                    </tr>
                </thead>
                <tbody>
                    ${clients.map(client => `
                        <tr>
                            <td>${client.id || ''}</td>
                            <td>${client.phone || ''}</td>
                            <td>${client.name || ''}</td>
                            <td>${client.email || ''}</td>
                            <td>${client.address || ''}</td>
                            <td>${client.city || ''}</td>
                            <td>${client.birthday ? new Date(client.birthday).toLocaleDateString() : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <nav>
                <ul class="pagination justify-content-center">
                    <li class="page-item ${page === 0 ? 'disabled' : ''}">
                        <button class="page-link" id="prevPage">Предыдущая</button>
                    </li>
                    <li class="page-item disabled">
                        <span class="page-link">Страница ${page + 1} из ${totalPages}</span>
                    </li>
                    <li class="page-item ${page + 1 >= totalPages ? 'disabled' : ''}">
                        <button class="page-link" id="nextPage">Следующая</button>
                    </li>
                </ul>
            </nav>
        `;

        // Навешиваем сортировку на заголовки
        document.querySelectorAll('#clientsTable th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const clickedSortBy = th.getAttribute('data-sort');
                if (currentSortBy === clickedSortBy) {
                    currentDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortBy = clickedSortBy;
                    currentDirection = 'asc';
                }
                renderClientsTable(currentPage, currentSortBy, currentDirection);
            });
        });

        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderClientsTable(currentPage, currentSortBy, currentDirection);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage + 1 < totalPages) {
                currentPage++;
                renderClientsTable(currentPage, currentSortBy, currentDirection);
            }
        });

        currentPage = page;

    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
    }
}

document.getElementById('btnClients').addEventListener('click', () => {
    renderClientsTable(0, currentSortBy, currentDirection);
});
