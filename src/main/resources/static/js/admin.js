//////////////////////////////////
//Создание таблицы сотрудников
async function renderEmployeesTable() {
    const adminContent = document.getElementById('adminContent');
    try {
        const response = await fetch('/admin/employees');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const employees = await response.json();

        adminContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>Сотрудники</h4>
                <button id="btnAddEmployee" class="btn btn-success btn-sm">Добавить сотрудника</button>
                <button id="btnAddRole" class="btn btn-primary btn-sm">Добавить роль</button>
            </div>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Телефон</th>
                        <th>Роли</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(e => `
                        <tr data-id="${e.id}">
                            <td>${e.id}</td>
                            <td>${e.phone}</td>
                            <td>${e.roles.join(', ')}</td>
                            <td>${e.name || ''}</td>
                            <td>${e.email || ''}</td>
                            <td>
                                <button class="btn btn-warning btn-sm btn-edit-employee" title="Редактировать сотрудника">📝</button>
                                <button class="btn btn-danger btn-sm btn-delete-employee" title="Удалить сотрудника">❌</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // удаление сотрудника
        document.querySelectorAll('.btn-delete-employee').forEach(button => {
            button.addEventListener('click', async (event) => {
                const tr = event.target.closest('tr');
                const userId = tr.getAttribute('data-id');
                if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
                    try {
                        const deleteResponse = await fetch(`/admin/employees/${userId}`, {
                            method: 'DELETE',
                        });
                        if (!deleteResponse.ok) {
                            throw new Error('Ошибка при удалении сотрудника');
                        }
                        await renderEmployeesTable();
                    } catch (error) {
                        alert(error.message);
                    }
                }
            });
        });

        // Навешиваем обработчик на кнопки "Добавить..."
        document.getElementById('btnAddEmployee').addEventListener('click', () => {
            renderAddEmployeeForm();
        });
        document.getElementById('btnAddRole').addEventListener('click', () => {
            renderAddRoleForm();
        });
        document.querySelectorAll('.btn-edit-employee').forEach(button => {
            button.addEventListener('click', async (event) => {
                const tr = event.target.closest('tr');
                const userId = tr.getAttribute('data-id');
                await renderEditEmployeeForm(userId);
            });
        });

    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
    }
}

/////////////////////////////////////////////
//добавляем сотрудника
async function renderAddEmployeeForm() {
    const adminContent = document.getElementById('adminContent');

    let rolesOptions = '';
    try {
        const response = await fetch('/admin/roles');
        if (!response.ok) throw new Error('Ошибка загрузки ролей');
        const roles = await response.json();

        rolesOptions = roles.map(role => `
            <option value="${role.name}">${role.name.replace('ROLE_', '')}</option>
        `).join('');
    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки ролей: ${error.message}</div>`;
        return;
    }

    adminContent.innerHTML = `
        <h4 class="mb-3">Добавить сотрудника</h4>
        <form id="addEmployeeForm">
            <div class="mb-3">
                <label for="phone" class="form-label">Телефон</label>
                <input type="text" class="form-control" id="phone" name="phone" required pattern="^\\+?[1-9][0-9]{7,14}$" placeholder="+71234567890">
            </div>
            <div class="mb-3">
                <label for="name" class="form-label">Имя</label>
                <input type="text" class="form-control" id="name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" required>
            </div>
            <div class="mb-3">
                <label for="roles" class="form-label">Роли</label>
                <select multiple class="form-select" id="roles" name="roles" required>
                    ${rolesOptions}
                </select>
                <small class="form-text text-muted">Выберите одну или несколько ролей (Ctrl+клик для выбора нескольких)</small>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-secondary ms-2" id="btnCancelAdd">Отмена</button>
        </form>
    `;

    document.getElementById('btnCancelAdd').addEventListener('click', () => {
        renderEmployeesTable();
    });

    document.getElementById('addEmployeeForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = {
            phone: form.phone.value.trim(),
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            roles: Array.from(form.roles.selectedOptions).map(opt => opt.value)
        };

        try {
            const response = await fetch('/admin/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении сотрудника');
            }

            alert('Сотрудник успешно добавлен!');
            await renderEmployeesTable();

        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    });
}

///////////////////////////////////////////////
//добавляем роль
async function renderAddRoleForm() {
    const adminContent = document.getElementById('adminContent');

    // Получаем роли с сервера
    let roles = [];
    try {
        const response = await fetch('/admin/roles');
        if (!response.ok) throw new Error('Ошибка загрузки ролей');
        roles = await response.json();
    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки ролей: ${error.message}</div>`;
        return;
    }

    adminContent.innerHTML = `
        <div class="d-flex gap-4">
            <!-- Левая часть: таблица ролей -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Список ролей</h4>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название роли</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roles.map(role => `
                            <tr data-id="${role.id}">
                                <td>${role.id}</td>
                                <td>${role.name}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm btn-delete-role" title="Удалить роль">❌</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Правая часть: форма добавления роли -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Добавить роль</h4>
                <form id="addRoleForm">
                    <div class="mb-3">
                        <label for="roleName" class="form-label">Название роли</label>
                        <input type="text" class="form-control" id="roleName" name="roleName" placeholder="Например, ROLE_CHEF" required pattern="^ROLE_[A-Z_]+$" title="Роль должна начинаться с 'ROLE_' и содержать только заглавные буквы и подчеркивания">
                        <div class="form-text">Формат: ROLE_ПРАВО</div>
                    </div>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelAddRole">Отмена</button>
                </form>
            </div>
        </div>
    `;

    // Обработчик отмены - возвращаемся к таблице сотрудников
    document.getElementById('btnCancelAddRole').addEventListener('click', () => {
        renderEmployeesTable();
    });

    // Обработчик отправки формы добавления роли
    document.getElementById('addRoleForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const roleNameInput = event.target.roleName.value.trim();

        try {
            const response = await fetch('/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roleNameInput })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении роли');
            }

            alert('Роль успешно добавлена!');
            // Обновляем таблицу ролей, перерисовываем форму
            await renderAddRoleForm();

        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    });

    // Навешиваем обработчики на кнопки удаления ролей
    document.querySelectorAll('.btn-delete-role').forEach(button => {
        button.addEventListener('click', async (event) => {
            const tr = event.target.closest('tr');
            const roleId = tr.getAttribute('data-id');
            if (confirm('Вы уверены, что хотите удалить эту роль?')) {
                try {
                    const deleteResponse = await fetch(`/admin/roles/${roleId}`, {
                        method: 'DELETE',
                    });
                    if (!deleteResponse.ok) {
                        throw new Error('Ошибка при удалении роли');
                    }
                    // После удаления обновляем таблицу и форму
                    await renderAddRoleForm();
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    });
}

/////////////////////////////////////
//редактирование сотрудника
async function renderEditEmployeeForm(userId) {
    const adminContent = document.getElementById('adminContent');

    try {
        // Получаем данные сотрудника по ID
        const response = await fetch(`/admin/employees/${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных сотрудника');
        const employee = await response.json();

        // Получаем список ролей для селекта
        const rolesResponse = await fetch('/admin/roles');
        if (!rolesResponse.ok) throw new Error('Ошибка загрузки ролей');
        const allRoles = await rolesResponse.json();

        // Формируем опции селекта с выбранными ролями
        const rolesOptions = allRoles.map(role => {
            const selected = employee.roles.includes(role.name) ? 'selected' : '';
            return `<option value="${role.name}" ${selected}>${role.name.replace('ROLE_', '')}</option>`;
        }).join('');

        adminContent.innerHTML = `
            <h4 class="mb-3">Редактировать сотрудника</h4>
            <form id="editEmployeeForm">
                <input type="hidden" id="employeeId" value="${employee.id}">
                <div class="mb-3">
                    <label for="phone" class="form-label">Телефон</label>
                    <input type="text" class="form-control" id="phone" name="phone" value="${employee.phone}" required pattern="^\\+?[1-9][0-9]{7,14}$" placeholder="+71234567890">
                </div>
                <div class="mb-3">
                    <label for="name" class="form-label">Имя</label>
                    <input type="text" class="form-control" id="name" name="name" value="${employee.name || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" value="${employee.email || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="roles" class="form-label">Роли</label>
                    <select multiple class="form-select" id="roles" name="roles" required>
                        ${rolesOptions}
                    </select>
                    <small class="form-text text-muted">Выберите одну или несколько ролей (Ctrl+клик для выбора нескольких)</small>
                </div>
                <button type="submit" class="btn btn-primary">Сохранить</button>
                <button type="button" class="btn btn-secondary ms-2" id="btnCancelEdit">Отмена</button>
            </form>
        `;

        // Обработчик отмены
        document.getElementById('btnCancelEdit').addEventListener('click', () => {
            renderEmployeesTable();
        });

        // Обработчик отправки формы редактирования
        document.getElementById('editEmployeeForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const form = event.target;
            const updatedData = {
                id: employee.id,
                phone: form.phone.value.trim(),
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                roles: Array.from(form.roles.selectedOptions).map(opt => opt.value)
            };

            try {
                const updateResponse = await fetch(`/admin/employees/${employee.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || 'Ошибка при обновлении сотрудника');
                }

                alert('Сотрудник успешно обновлён!');
                await renderEmployeesTable();

            } catch (error) {
                alert(`Ошибка: ${error.message}`);
            }
        });

    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
    }
}

document.getElementById('btnEmployees').addEventListener('click', renderEmployeesTable);

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

//////////////////////////////////////////////////////////////////////////
//работа с блюдами
document.addEventListener("DOMContentLoaded", () => {
    const adminContent = document.getElementById("adminContent");
    let currentPage = 0;
    const pageSize = 6;
    let totalPages = 1;

    // Функция для загрузки и отображения категорий
    async function renderCategoriesDropdown(buttonsContainer) {
        const dropdownMenu = buttonsContainer.querySelector('.btn-group:first-child .dropdown-menu');
        dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">Загрузка...</span></li>';
        try {
            const response = await fetch('/admin/categories');
            if (!response.ok) throw new Error('Ошибка загрузки категорий');
            const categories = await response.json();
            dropdownMenu.innerHTML = '';
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="#" data-category-id="${category.id}">${category.name}</a>`;
                dropdownMenu.appendChild(li);
            });
        } catch (error) {
            dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-danger">Ошибка загрузки</span></li>';
        }
    }

    // Функция для отрисовки кнопок и фильтров
    // Глобальная переменная для выбранной категории
    let selectedCategoryId = null;

    async function renderButtonsAndFilters() {
        adminContent.innerHTML = "";

        // Создаём контейнер с кнопками и фильтрами
        const buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'buttonsContainer';
        buttonsContainer.className = 'mb-4 d-flex gap-3';
        buttonsContainer.innerHTML = `
      <div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          Категории
        </button>
        <ul class="dropdown-menu"></ul>
      </div>
      <div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          Типы
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#">Вегетарианское</a></li>
          <li><a class="dropdown-item" href="#">Острое</a></li>
          <li><a class="dropdown-item" href="#">Новинки</a></li>
          <li><a class="dropdown-item" href="#">Хиты</a></li>
        </ul>
      </div>
      <button type="button" class="btn btn-success" id="btnAddDish">
        Добавить блюдо
      </button>
    `;
        adminContent.appendChild(buttonsContainer);

        // Загружаем категории из API и наполняем dropdown меню
        await renderCategoriesDropdown(buttonsContainer);

        // Обработчик клика по пунктам меню категорий для фильтрации блюд
        buttonsContainer.querySelector('.btn-group:first-child .dropdown-menu').addEventListener('click', e => {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                selectedCategoryId = e.target.dataset.categoryId;
                currentPage = 0;
                loadAndRenderDishes(currentPage);
            }
        });

        // Обработчик кнопки "Добавить блюдо"
        buttonsContainer.querySelector('#btnAddDish').addEventListener('click', () => {
            console.log('Открыть форму добавления блюда');
            // TODO: открыть модальное окно или форму добавления
        });

        // Загрузка и отображение блюд без фильтра или с выбранным фильтром
        loadAndRenderDishes();
    }


    // Функция для отрисовки карточек блюд
    function renderCards(dishes) {
        let oldRow = adminContent.querySelector('.row');
        if (oldRow) oldRow.remove();
        let oldPagination = adminContent.querySelector('#pagination');
        if (oldPagination) oldPagination.remove();

        if (dishes.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = "Нет блюд для отображения";
            adminContent.appendChild(empty);
            return;
        }

        const row = document.createElement("div");
        row.className = "row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4";

        dishes.forEach(dish => {
            const encodedImageUrl = '/photos' + encodeURI(dish.imageUrl);
            const col = document.createElement("div");
            col.className = "col";

            col.innerHTML = `
                <div class="card h-100 d-flex flex-column">
                    <div class="d-flex justify-content-center mb-3">
                        <img src="${encodedImageUrl}" class="card-img-top img-fluid" alt="${dish.name}" style="max-height: 200px; object-fit: contain;">
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between flex-grow-1">
                        <h5 class="card-title">${dish.name}</h5>
                        <p class="card-text ingredient-text">${dish.ingredient}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto mb-3">
                            <h5 class="card-title">${dish.price} руб.</h5>
                            <p class="card-text">${dish.weight} г.</p>
                        </div>
                        <div class="btn-group-responsive d-flex justify-content-between">
                            <button type="button" class="btn btn-primary btn-edit" data-dish-id="${dish.id}" style="flex: 1; margin-right: 5px;">
                                Редактировать
                            </button>
                            <button type="button" class="btn btn-danger btn-delete" data-dish-id="${dish.id}" style="flex: 1; margin-left: 5px;">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });

        adminContent.appendChild(row);

        // Навесить обработчики кнопок
        adminContent.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', e => {
                const dishId = e.currentTarget.getAttribute('data-dish-id');
                console.log('Редактировать блюдо с id:', dishId);
            });
        });

        adminContent.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', e => {
                const dishId = e.currentTarget.getAttribute('data-dish-id');
                console.log('Удалить блюдо с id:', dishId);
            });
        });
    }

    // Пагинация
    function renderPagination() {
        let oldPagination = adminContent.querySelector("#pagination");
        if (oldPagination) oldPagination.remove();

        const pagination = document.createElement("ul");
        pagination.id = "pagination";
        pagination.className = "pagination justify-content-center mt-4";

        // Кнопка "Предыдущая"
        const prevLi = document.createElement("li");
        prevLi.className = "page-item" + (currentPage === 0 ? " disabled" : "");
        prevLi.innerHTML = `<button class="page-link">Предыдущая</button>`;
        prevLi.addEventListener("click", () => {
            if (currentPage > 0) {
                currentPage--;
                loadAndRenderDishes(currentPage);
            }
        });
        pagination.appendChild(prevLi);

        // Кнопки с номерами страниц
        const maxPagesToShow = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement("li");
            li.className = "page-item" + (i === currentPage ? " active" : "");
            li.innerHTML = `<button class="page-link">${i + 1}</button>`;
            li.addEventListener("click", () => {
                currentPage = i;
                loadAndRenderDishes(currentPage);
            });
            pagination.appendChild(li);
        }

        // Кнопка "Следующая"
        const nextLi = document.createElement("li");
        nextLi.className = "page-item" + (currentPage === totalPages - 1 ? " disabled" : "");
        nextLi.innerHTML = `<button class="page-link">Следующая</button>`;
        nextLi.addEventListener("click", () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                loadAndRenderDishes(currentPage);
            }
        });
        pagination.appendChild(nextLi);
        adminContent.appendChild(pagination);
    }

    // Загрузка и рендер блюд
    async function loadAndRenderDishes(page = 0) {
        try {
            let url = `/admin/dishes?page=${page}&size=${pageSize}`;
            if (selectedCategoryId) {
                url += `&categoryId=${selectedCategoryId}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка загрузки блюд');
            const data = await response.json();

            totalPages = data.totalPages;
            currentPage = data.number;

            renderCards(data.content);
            renderPagination();
        } catch (error) {
            adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
        }
    }

    // Навесить вызов на кнопку "Блюда"
    const btnDishes = document.getElementById('btnDishes');
    if (btnDishes) {
        btnDishes.addEventListener('click', () => {
            renderButtonsAndFilters();
        });
    }
});

//////////////////////////////////////////////////////
// Функция для загрузки и отображения категорий с формой добавления
async function renderCategoriesManagement() {
    const adminContent = document.getElementById('adminContent');

    // Загружаем категории с сервера
    let categories = [];
    try {
        const response = await fetch('/admin/categories');
        if (!response.ok) throw new Error('Ошибка загрузки категорий');
        categories = await response.json();
    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки категорий: ${error.message}</div>`;
        return;
    }

    // Рендерим таблицу и форму
    adminContent.innerHTML = `
        <div class="d-flex gap-4">
            <!-- Левая часть: таблица категорий -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Список категорий</h4>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название категории</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(category => `
                            <tr data-id="${category.id}">
                                <td>${category.id}</td>
                                <td>${category.name}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm btn-delete-category" title="Удалить категорию">❌</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Правая часть: форма добавления категории -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Добавить категорию</h4>
                <form id="addCategoryForm">
                    <div class="mb-3">
                        <label for="categoryName" class="form-label">Название категории</label>
                        <input type="text" class="form-control" id="categoryName" name="categoryName" placeholder="Например, Бургеры" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelAddCategory">Отмена</button>
                </form>
            </div>
        </div>
    `;

    // Обработчик отправки формы добавления категории
    const addCategoryForm = document.getElementById('addCategoryForm');
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryNameInput = document.getElementById('categoryName');
        const name = categoryNameInput.value.trim();
        if (!name) return alert('Введите название категории');

        try {
            const response = await fetch('/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Ошибка при добавлении категории');
                return;
            }

            // Успешно добавлено - обновляем список категорий
            renderCategoriesManagement();

        } catch (error) {
            alert('Ошибка сети: ' + error.message);
        }
    });

    // Обработчик кнопки отмены (очищаем форму)
    const btnCancel = document.getElementById('btnCancelAddCategory');
    btnCancel.addEventListener('click', () => {
        addCategoryForm.reset();
    });

    // Обработчики удаления категорий
    adminContent.querySelectorAll('.btn-delete-category').forEach(button => {
        button.addEventListener('click', async (e) => {
            const tr = e.target.closest('tr');
            const categoryId = tr.dataset.id;
            if (!confirm('Удалить категорию?')) return;

            try {
                const response = await fetch(`/admin/categories/${categoryId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    alert(errorData.message || 'Ошибка при удалении категории');
                    return;
                }
                // Успешно удалено - обновляем список
                renderCategoriesManagement();
            } catch (error) {
                alert('Ошибка сети: ' + error.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnCategory = document.getElementById('btnCategory');
    if (btnCategory) {
        btnCategory.addEventListener('click', () => {
            renderCategoriesManagement();
        });
    }
});

////////////////////////////////////////////////////////////////////////////
//работа с типами блюд
async function renderTypesManagement() {
    const adminContent = document.getElementById('adminContent');

    // Загружаем типы с сервера
    let types = [];
    try {
        const response = await fetch('/admin/types');
        if (!response.ok) throw new Error('Ошибка загрузки типов');
        types = await response.json();
    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки типов: ${error.message}</div>`;
        return;
    }

    adminContent.innerHTML = `
        <div class="d-flex gap-4">
            <!-- Левая часть: таблица типов -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Список типов</h4>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название типа</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${types.map(type => `
                            <tr data-id="${type.id}">
                                <td>${type.id}</td>
                                <td>${type.name}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm btn-delete-type" title="Удалить тип">❌</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Правая часть: форма добавления типа -->
            <div style="flex: 1; max-width: 50%;">
                <h4>Добавить тип</h4>
                <form id="addTypeForm">
                    <div class="mb-3">
                        <label for="typeName" class="form-label">Название типа</label>
                        <input type="text" class="form-control" id="typeName" name="typeName" placeholder="Например, Вегетарианское" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelAddType">Отмена</button>
                </form>
            </div>
        </div>
    `;

    // Обработчик отправки формы добавления типа
    const addTypeForm = document.getElementById('addTypeForm');
    addTypeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const typeNameInput = document.getElementById('typeName');
        const name = typeNameInput.value.trim();
        if (!name) return alert('Введите название типа');

        try {
            const response = await fetch('/admin/types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Ошибка при добавлении типа');
                return;
            }

            // Успешно добавлено - обновляем список типов
            renderTypesManagement();

        } catch (error) {
            alert('Ошибка сети: ' + error.message);
        }
    });

    // Обработчик кнопки отмены (очищаем форму)
    const btnCancel = document.getElementById('btnCancelAddType');
    btnCancel.addEventListener('click', () => {
        addTypeForm.reset();
    });

    // Обработчики удаления типов
    adminContent.querySelectorAll('.btn-delete-type').forEach(button => {
        button.addEventListener('click', async (e) => {
            const tr = e.target.closest('tr');
            const typeId = tr.dataset.id;
            if (!confirm('Удалить тип?')) return;

            try {
                const response = await fetch(`/admin/types/${typeId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    alert(errorData.message || 'Ошибка при удалении типа');
                    return;
                }
                // Успешно удалено - обновляем список
                renderTypesManagement();
            } catch (error) {
                alert('Ошибка сети: ' + error.message);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnTypes = document.getElementById('btnTypes');
    if (btnTypes) {
        btnTypes.addEventListener('click', () => {
            renderTypesManagement();
        });
    }
});






