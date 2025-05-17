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
/*let currentPage = 0;
const pageSize = 10;

async function renderClientsTable(page = 0) {
    const adminContent = document.getElementById('adminContent');
    try {
        const response = await fetch(`/admin/clients?page=${page}&size=${pageSize}`);
        if (!response.ok) throw new Error('Ошибка загрузки клиентов');
        const data = await response.json();

        const clients = data.content;
        const totalPages = data.totalPages;

        adminContent.innerHTML = `
            <h4>Клиенты</h4>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Телефон</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Адрес</th>
                        <th>Город</th>
                        <th>Дата рождения</th>
                    </tr>
                </thead>
                <tbody>
                    ${clients.map(client => `
                        <tr>
                            <td>${client.userId || ''}</td>
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

        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderClientsTable(currentPage);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage + 1 < totalPages) {
                currentPage++;
                renderClientsTable(currentPage);
            }
        });

        currentPage = page;

    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
    }
}

// Навесить вызов renderClientsTable() на кнопку "Клиенты"
document.getElementById('btnClients').addEventListener('click', () => {
    renderClientsTable(0);
});*/

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



