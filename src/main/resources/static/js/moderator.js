document.addEventListener('DOMContentLoaded', () => {
    renderOrdersTable();
    const btnOrders = document.getElementById('btnOrders');
    if (btnOrders) {
        btnOrders.addEventListener('click', () => {
            renderOrdersTable();
        });
    }
});



//создание таблицы заказов
async function renderOrdersTable() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = ''; // Очистим содержимое

    // Загружаем заказы и курьеров с сервера
    const [orders, couriers] = await Promise.all([
        fetch('/moderator/orders').then(res => res.json()),
        fetch('/moderator/couriers').then(res => res.json()),
    ]);

    // Создаём таблицу
    const table = document.createElement('table');
    table.className = 'table table-striped';

    // Заголовок таблицы
    table.innerHTML = `
        <thead>
            <tr>
                <th>Номер заказа</th>
                <th>Время заказа</th>
                <th>Имя пользователя</th>
                <th>Курьер</th>
                <th>Статус</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');

    orders.forEach(order => {
        const tr = document.createElement('tr');

        // Номер заказа
        const tdNumber = document.createElement('td');
        tdNumber.textContent = order.id;
        tr.appendChild(tdNumber);

        // Время заказа (форматируем дату)
        const tdTime = document.createElement('td');
        const date = new Date(order.orderTime);
        tdTime.textContent = date.toLocaleString();
        tr.appendChild(tdTime);

        // Имя пользователя
        const tdUser = document.createElement('td');
        tdUser.textContent = order.userName;
        tr.appendChild(tdUser);

        // Выбор курьера (select)
        const tdCourier = document.createElement('td');
        const selectCourier = document.createElement('select');
        selectCourier.className = 'form-select form-select-sm';
        selectCourier.style.minWidth = '150px';

        // Добавляем пустой вариант для "не назначен"
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Не назначен';
        selectCourier.appendChild(emptyOption);

        couriers.forEach(courier => {
            const option = document.createElement('option');
            option.value = courier.id;
            option.textContent = courier.name;
            if (order.courierId === courier.id) {
                option.selected = true;
            }
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
            } catch (e) {
                showUniversalToast('Ошибка', 'Не удалось назначить курьера', 'danger');
            }
        });

        tdCourier.appendChild(selectCourier);
        tr.appendChild(tdCourier);

        // Статус заказа с радиокнопками
        const tdStatus = document.createElement('td');
        tdStatus.appendChild(createStatusRadioGroup(order));
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    adminContent.appendChild(table);
}
//радио кнопки статуса
function createStatusRadioGroup(order) {
    const statuses = [
        {id: 'accepted', label: 'Заказ принят'},
        {id: 'processing', label: 'Заказ в обработке'},
        {id: 'dispatched', label: 'Курьер выехал'},
        {id: 'delivered', label: 'Заказ доставлен'}
    ];

    const group = document.createElement('div');
    group.className = 'btn-group-vertical';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Vertical radio toggle button group');

    statuses.forEach((status, index) => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'btn-check';
        input.name = `status-${order.id}`;
        input.id = `status-${order.id}-${status.id}`;
        input.autocomplete = 'off';
        input.checked = order.status === status.id;

        const label = document.createElement('label');
        label.className = 'btn btn-outline-danger';
        label.setAttribute('for', input.id);
        label.textContent = status.label;

        input.addEventListener('change', async () => {
            if (input.checked) {
                try {
                    await fetch(`/moderator/orders/${order.id}/status`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({status: status.id})
                    });
                    showUniversalToast('Успех', `Статус изменён на "${status.label}"`, 'success');
                } catch (e) {
                    showUniversalToast('Ошибка', 'Не удалось изменить статус', 'danger');
                }
            }
        });

        group.appendChild(input);
        group.appendChild(label);
    });

    return group;
}


////////////////////////////////////////////////////////
//работа с клиентами

let currentPage = 0;
const pageSize = 10;
let currentSortBy = 'id';
let currentDirection = 'asc';

async function renderClientsTable(page = 0, sortBy = 'id', direction = 'asc') {
    const adminContent = document.getElementById('adminContent');
    try {
        const response = await fetch(`/admin/clients?page=${page}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`);
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
                    // Переключаем направление
                    currentDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortBy = clickedSortBy;
                    currentDirection = 'asc';
                }
                renderClientsTable(currentPage, currentSortBy, currentDirection);
            });
        });

        // Пагинация
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

// Навешиваем загрузку клиентов на кнопку
document.getElementById('btnClients').addEventListener('click', () => {
    renderClientsTable(0, currentSortBy, currentDirection);
});
