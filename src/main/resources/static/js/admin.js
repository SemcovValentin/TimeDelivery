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
                        showUniversalToast('Ошибка',error.message, 'danger');
                    }
                }
            });
        });

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

            showUniversalToast('Успех','Сотрудник успешно добавлен!', 'success');
            await renderEmployeesTable();

        } catch (error) {
            showUniversalToast('Ошибка',`Ошибка: ${error.message}`, 'danger');
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

    document.getElementById('btnCancelAddRole').addEventListener('click', () => {
        renderEmployeesTable();
    });

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

            showUniversalToast('Успех','Роль успешно добавлена!', 'success');
            await renderAddRoleForm();

        } catch (error) {
            showUniversalToast('Ошибка',`Ошибка: ${error.message}`, 'danger');
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
                    await renderAddRoleForm();
                } catch (error) {
                    showUniversalToast('Ошибка',error.message, 'danger');
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
        const response = await fetch(`/admin/employees/${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных сотрудника');
        const employee = await response.json();

        const rolesResponse = await fetch('/admin/roles');
        if (!rolesResponse.ok) throw new Error('Ошибка загрузки ролей');
        const allRoles = await rolesResponse.json();

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

        document.getElementById('btnCancelEdit').addEventListener('click', () => {
            renderEmployeesTable();
        });

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

                showUniversalToast('Успех','Сотрудник успешно обновлён!', 'success');
                await renderEmployeesTable();

            } catch (error) {
                showUniversalToast('Ошибка',`Ошибка: ${error.message}`, 'danger' );
            }
        });

    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка: ${error.message}</div>`;
    }
}

const btnEmployees = document.getElementById('btnEmployees');
if (btnEmployees) {
    btnEmployees.addEventListener('click', renderEmployeesTable);
} else {
    console.warn('Кнопка btnEmployees не найдена в DOM');
}

//////////////////////////////////////////////////////////////////////////
//работа с блюдами
let selectedCategoryId = null;
let selectedTypeId = null;

document.addEventListener("DOMContentLoaded", () => {
    const adminContent = document.getElementById("adminContent");
    let currentPage = 0;
    const pageSize = 6;
    let totalPages = 1;

    window.loadAndRenderDishes = async function(page = 0) {
            try {
                let url = `/admin/dishes?page=${page}&size=${pageSize}`;
                if (selectedCategoryId) {
                    url += `&categoryId=${selectedCategoryId}`;
                }
                if (selectedTypeId) {
                    url += `&typeId=${selectedTypeId}`;
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
    };

    // Функция для загрузки и отображения категорий
    window.renderCategoriesDropdown = async function(buttonsContainer) {
        const dropdownMenu = buttonsContainer.querySelector('.btn-group:first-child .dropdown-menu');
        dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">Загрузка...</span></li>';
        try {
            const response = await fetch('/admin/categories');
            if (!response.ok) throw new Error('Ошибка загрузки категорий');
            const categories = await response.json();

            dropdownMenu.innerHTML = '';

            const allLi = document.createElement('li');
            allLi.innerHTML = `<a class="dropdown-item" href="#" data-category-id="" data-category-name="Все блюда">Все блюда</a>`;
            dropdownMenu.appendChild(allLi);

            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="#" data-category-id="${category.id}" data-category-name="${category.name}">${category.name}</a>`;
                dropdownMenu.appendChild(li);
            });
        } catch (error) {
            dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-danger">Ошибка загрузки</span></li>';
        }
    }

    // Функция для загрузки и отображения типов
    window.renderTypesDropdown = async function(buttonsContainer) {
        const dropdownMenu = buttonsContainer.querySelector('.btn-group:nth-child(2) .dropdown-menu');
        dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-muted">Загрузка...</span></li>';
        try {
            const response = await fetch('/admin/types');
            if (!response.ok) throw new Error('Ошибка загрузки типов');
            const types = await response.json();

            dropdownMenu.innerHTML = '';

            const allLi = document.createElement('li');
            allLi.innerHTML = `<a class="dropdown-item" href="#" data-type-id="" data-type-name="Все типы">Все типы</a>`;
            dropdownMenu.appendChild(allLi);

            types.forEach(type => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="#" data-type-id="${type.id}" data-type-name="${type.name}">${type.name}</a>`;
                dropdownMenu.appendChild(li);
            });
        } catch (error) {
            dropdownMenu.innerHTML = '<li><span class="dropdown-item-text text-danger">Ошибка загрузки</span></li>';
            console.error(error);
        }
    }

    function renderNoDishesMessage() {
        const oldMessages = Array.from(adminContent.querySelectorAll('p'));
        oldMessages.forEach(p => {
            if (p.textContent === "Нет блюд для отображения") {
                p.remove();
            }
        });

        const empty = document.createElement('p');
        empty.textContent = "Нет блюд для отображения";
        empty.classList.add('text-center', 'my-4'); // для стилизации
        adminContent.appendChild(empty);
    }

    function renderCards(dishes) {
        let oldRow = adminContent.querySelector('.row');
        if (oldRow) oldRow.remove();
        let oldPagination = adminContent.querySelector('#pagination');
        if (oldPagination) oldPagination.remove();
        const oldMessages = Array.from(adminContent.querySelectorAll('p'));
        oldMessages.forEach(p => {
            if (p.textContent === "Нет блюд для отображения") {
                p.remove();
            }
        });

        if (dishes.length === 0) {
            renderNoDishesMessage();
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

        // Кнопка редактирования блюда
        adminContent.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async e => {
                const dishId = e.currentTarget.getAttribute('data-dish-id');
                console.log('Редактировать блюдо с id:', dishId);

                try {
                    const [dishResponse, categories, types] = await Promise.all([
                        fetch(`/admin/dishes/${dishId}`),
                        fetchCategories(),
                        fetchTypes()
                    ]);

                    if (!dishResponse.ok) throw new Error('Ошибка загрузки данных блюда');
                    const dish = await dishResponse.json();

                    renderAddDishForm(categories, types, dish);
                } catch (error) {
                    showUniversalToast('Ошибка', 'Не удалось загрузить данные блюда: ' + error.message, 'danger');
                }
            });
        });

        //Кнопка удаления блюда
        adminContent.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async e => {
                const dishId = e.currentTarget.getAttribute('data-dish-id');
                if (!dishId) return;

                if (!confirm('Вы уверены, что хотите удалить это блюдо?')) {
                    return;
                }

                try {
                    const response = await fetch(`/admin/dishes/${dishId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        showUniversalToast('Ошибка', errorData.error || 'Не удалось удалить блюдо', 'danger');
                        return;
                    }

                    showUniversalToast('Успех', 'Блюдо успешно удалено', 'success');
                    await renderButtonsAndFilters();

                } catch (error) {
                    showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
                }
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

    const btnDishes = document.getElementById('btnDishes');
    if (btnDishes) {
        btnDishes.addEventListener('click', () => {
            renderButtonsAndFilters();
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    window.renderButtonsAndFilters = async function() {
        const adminContent = document.getElementById("adminContent");
        adminContent.innerHTML = "";

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
                <ul class="dropdown-menu"></ul>
            </div>
            <button type="button" class="btn btn-success" id="btnAddDish">
                Добавить блюдо
            </button>
            <button type="button" class="btn btn-success" id="deletedDish">
                Корзина
            </button>
        `;
        adminContent.appendChild(buttonsContainer);

        await window.renderCategoriesDropdown(buttonsContainer);
        await window.renderTypesDropdown(buttonsContainer);

        function initDropdownHandler(buttonsContainer, groupIndex, onSelect) {
            const dropdownGroup = buttonsContainer.querySelector(`.btn-group:nth-child(${groupIndex})`);
            const dropdownBtn = dropdownGroup.querySelector('button.dropdown-toggle');
            const dropdownMenu = dropdownGroup.querySelector('.dropdown-menu');

            dropdownMenu.addEventListener('click', e => {
                if (e.target.classList.contains('dropdown-item')) {
                    e.preventDefault();
                    onSelect(e.target, dropdownBtn);
                }
            });
        }

        initDropdownHandler(buttonsContainer, 1, (target, btn) => {
            selectedCategoryId = target.dataset.categoryId || null;
            btn.textContent = target.dataset.categoryName;
            currentPage = 0;
            window.loadAndRenderDishes(currentPage);
        });

        initDropdownHandler(buttonsContainer, 2, (target, btn) => {
            selectedTypeId = target.dataset.typeId || null;
            btn.textContent = target.dataset.typeName;
            currentPage = 0;
            window.loadAndRenderDishes(currentPage);
        });

        buttonsContainer.querySelector('#btnAddDish').addEventListener('click', async () => {
            const categories = await fetchCategories();
            const types = await fetchTypes();

            renderAddDishForm(categories, types);
        });

        buttonsContainer.querySelector('#deletedDish').addEventListener('click', () => {
            window.loadAndRenderDeletedDishes();
        });

        window.loadAndRenderDishes();
    };
    window.renderButtonsAndFilters();
});

//////////////////////////////////////////////////////
// Функция для загрузки и отображения категорий с формой добавления
async function renderCategoriesManagement() {
    const adminContent = document.getElementById('adminContent');

    let categories = [];
    try {
        const response = await fetch('/admin/categories');
        if (!response.ok) throw new Error('Ошибка загрузки категорий');
        categories = await response.json();
    } catch (error) {
        adminContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки категорий: ${error.message}</div>`;
        return;
    }

    adminContent.innerHTML = `
        <div class="d-flex gap-4">
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
        if (!name) return showUniversalToast('Ошибка','Введите название категории', 'danger');

        try {
            const response = await fetch('/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                showUniversalToast(errorData.message ||'Ошибка', 'Ошибка при добавлении категории', 'danger');
                return;
            }

            renderCategoriesManagement();

        } catch (error) {
            showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
        }
    });

    const btnCancel = document.getElementById('btnCancelAddCategory');
    btnCancel.addEventListener('click', () => {
        addCategoryForm.reset();
    });

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
                    showUniversalToast(errorData.message ||'Ошибка', 'Ошибка при удалении категории', 'danger');
                    return;
                }
                // Успешно удалено - обновляем список
                renderCategoriesManagement();
            } catch (error) {
                showUniversalToast('Ошибка','Ошибка сети: ' + error.message, 'danger');
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
        if (!name) return showUniversalToast('Введите название типа', 'danger');

        try {
            const response = await fetch('/admin/types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                showUniversalToast(errorData.message || 'Ошибка при добавлении типа', 'danger');
                return;
            }

            renderTypesManagement();

        } catch (error) {
            showUniversalToast('Ошибка','Ошибка сети: ' + error.message, 'danger');
        }
    });

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
                    showUniversalToast(errorData.message || 'Ошибка при удалении типа', 'danger');
                    return;
                }
                // Успешно удалено - обновляем список
                renderTypesManagement();
            } catch (error) {
                showUniversalToast('Ошибка','Ошибка сети: ' + error.message, 'danger');
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

///////////////////////////////////////////////////////
//Добавление блюда
function renderAddDishForm(categories = [], types = [], dish = null) {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <h3 id="formTitle">${dish ? 'Редактирование блюда' : 'Добавить новое блюдо'}</h3>
        <form id="addDishForm">
          <input type="hidden" id="dishId" name="dishId" value="${dish ? dish.id : ''}">
          <div class="row g-3">
            <div class="col-md-4">
              <label for="dishName" class="form-label">Название</label>
              <input type="text" class="form-control" id="dishName" name="name" required value="${dish ? dish.name : ''}">
            </div>
            <div class="col-md-4">
              <label for="dishPrice" class="form-label">Цена</label>
              <input type="number" class="form-control" id="dishPrice" name="price" required value="${dish ? dish.price : ''}">
            </div>
            <div class="col-md-4">
              <label for="dishWeight" class="form-label">Вес (г)</label>
              <input type="number" class="form-control" id="dishWeight" name="weight" required value="${dish ? dish.weight : ''}">
            </div>
            <div class="col-md-4">
              <label for="dishImage" class="form-label">Изображение блюда</label>
              <input class="form-control" type="file" id="dishImage" name="image" accept="image/*" ${dish ? '' : 'required'}>
            </div>
            <div class="col-md-4">
              <label class="form-label">Категория</label>
              <div class="btn-group w-100">
                <button type="button" class="btn btn-primary dropdown-toggle w-100" id="categoryDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false">
                  ${dish ? (categories.find(c => c.id === dish.categoryId)?.name || 'Выберите категорию') : 'Выберите категорию'}
                </button>
                <ul class="dropdown-menu" id="categoryDropdownMenu">
                  ${categories.map(cat => `<li><a class="dropdown-item" href="#" data-id="${cat.id}">${cat.name}</a></li>`).join('')}
                </ul>
              </div>
              <input type="hidden" id="selectedCategoryId" name="categoryId" required value="${dish && dish.typeDishes && dish.typeDishes.length > 0 ? dish.typeDishes[0].id : ''}">

            </div>
            <div class="col-md-4">
              <label class="form-label">Тип</label>
              <div class="btn-group w-100">
                <button type="button" class="btn btn-primary dropdown-toggle w-100" id="typeDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false">
                  ${dish ? (types.find(t => t.id === dish.typeId)?.name || 'Выберите тип') : 'Выберите тип'}
                </button>
                <ul class="dropdown-menu" id="typeDropdownMenu">
                  ${types.map(type => `<li><a class="dropdown-item" href="#" data-id="${type.id}">${type.name}</a></li>`).join('')}
                </ul>
              </div>
              <input type="hidden" id="selectedTypeId" name="typeId" required value="${dish && dish.types && dish.types.length > 0 ? dish.types[0].id : ''}">
            </div>
            <div class="col-12">
              <label for="dishIngredient" class="form-label">Ингредиенты</label>
              <textarea class="form-control" id="dishIngredient" name="ingredient" rows="3" required>${dish ? dish.ingredient : ''}</textarea>
            </div>
          </div>
          <div class="mt-3">
            <button type="submit" id="submitAddDishBtn" class="btn btn-primary">${dish ? 'Сохранить изменения' : 'Добавить'}</button>
            <button type="button" id="btnCancelAddDish" class="btn btn-secondary ms-2">Отмена</button>
          </div>
        </form>
    `;

    attachDropdownHandlers();

    const form = document.getElementById('addDishForm');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const dishId = form.elements['dishId']?.value;
            let success = false;
            if (dishId) {
                success = await submitEditDishForm(dishId);
            } else {
                success = await submitAddDishForm();
            }
            if (success) {
                await renderButtonsAndFilters();
            }
        });
    } else {
        console.warn('Форма addDishForm не найдена');
    }

    const btnCancel = document.getElementById('btnCancelAddDish');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            renderButtonsAndFilters();
        });
    }
}

//обработка выбора категорий и типов
function attachDropdownHandlers() {
    const categoryDropdownMenu = document.getElementById('categoryDropdownMenu');
    const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
    const selectedCategoryIdInput = document.getElementById('selectedCategoryId');

    categoryDropdownMenu.querySelectorAll('a.dropdown-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const id = item.dataset.id;
            const name = item.textContent;
            selectedCategoryIdInput.value = id;
            categoryDropdownBtn.textContent = name;
        });
    });

    const typeDropdownMenu = document.getElementById('typeDropdownMenu');
    const typeDropdownBtn = document.getElementById('typeDropdownBtn');
    const selectedTypeIdInput = document.getElementById('selectedTypeId');

    typeDropdownMenu.querySelectorAll('a.dropdown-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const id = item.dataset.id;
            const name = item.textContent;
            selectedTypeIdInput.value = id;
            typeDropdownBtn.textContent = name;
        });
    });
}

//загрузка блюд и категорий из бд
async function fetchCategories() {
    try {
        const response = await fetch('/admin/categories');
        if (!response.ok) throw new Error('Ошибка загрузки категорий');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        showUniversalToast('Ошибка', 'Не удалось загрузить категории: ' + error.message, 'danger');
        return [];
    }
}

async function fetchTypes() {
    try {
        const response = await fetch('/admin/types');
        if (!response.ok) throw new Error('Ошибка загрузки типов');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке типов:', error);
        showUniversalToast('Ошибка', 'Не удалось загрузить типы: ' + error.message, 'danger');
        return [];
    }
}

//Отправка формы для добавления блюда
async function submitAddDishForm() {
    const form = document.getElementById('addDishForm');
    const formData = new FormData();

    formData.append('name', form.dishName.value.trim());
    formData.append('price', form.dishPrice.value);
    formData.append('weight', form.dishWeight.value);
    formData.append('ingredient', form.dishIngredient.value.trim());
    formData.append('categoryId', form.selectedCategoryId.value);
    formData.append('typeId', form.selectedTypeId.value);

    const imageFile = form.dishImage.files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/admin/create/dishes', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409 && errorData.error) {
                showUniversalToast(errorData.error, 'danger');
            } else {
                showUniversalToast('Ошибка','Ошибка при добавлении блюда: ' + (errorData.error || response.statusText), 'danger');
            }
            return false;
        }

        showUniversalToast('Успех', 'Блюдо успешно добавлено!', 'success');
        return true;
    } catch (error) {
        showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
        return false;
    }
}

//Редактирование блюд
async function submitEditDishForm(dishId) {
    const form = document.getElementById('addDishForm');
    if (!form) {
        showUniversalToast('Ошибка', 'Форма не найдена', 'danger');
        return false;
    }

    const formData = new FormData();

    formData.append('name', form.dishName.value.trim());
    formData.append('price', form.dishPrice.value);
    formData.append('weight', form.dishWeight.value);
    formData.append('ingredient', form.dishIngredient.value.trim());
    formData.append('categoryId', form.selectedCategoryId.value);
    formData.append('typeId', form.selectedTypeId.value);

    const imageFile = form.dishImage.files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`/admin/dishes/${dishId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409 && errorData.error) {
                showUniversalToast(errorData.error, 'danger');
            } else {
                showUniversalToast('Ошибка', 'Ошибка при обновлении блюда: ' + (errorData.error || response.statusText), 'danger');
            }
            return false;
        }

        showUniversalToast('Успех', 'Блюдо успешно обновлено!', 'success');
        return true;
    } catch (error) {
        showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
        return false;
    }
}

//отрисовка удалённых карточек
window.loadAndRenderDeletedDishes = async function() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '';

    const deletedDishesContainer = document.createElement('div');
    deletedDishesContainer.id = 'deletedDishesContainer';
    adminContent.appendChild(deletedDishesContainer);

    try {
        const response = await fetch('/admin/deleted/dishes/load');
        if (!response.ok) {
            const errorData = await response.json();
            showUniversalToast('Ошибка', errorData.error || 'Не удалось загрузить удалённые блюда', 'danger');
            return;
        }
        const deletedDishes = await response.json();

        window.renderDeletedCards(deletedDishes, deletedDishesContainer);

    } catch (error) {
        showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
    }
};

//генерация удалённых карточек
window.renderDeletedCards = function(dishes, container) {
    container.innerHTML = '';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'btn btn-secondary mb-3';
    backButton.textContent = 'Назад';

    backButton.addEventListener('click', () => {
        renderButtonsAndFilters();
    });

    container.appendChild(backButton);

    if (!dishes || dishes.length === 0) {
        const noData = document.createElement('p');
        noData.textContent = 'Нет блюд для отображения';
        container.appendChild(noData);
        return;
    }

    const row = document.createElement('div');
    row.className = 'row row-cols-1 row-cols-md-3 g-4';
    container.appendChild(row);

    dishes.forEach(dish => {
        const col = document.createElement('div');
        col.className = 'col';
        const encodedImageUrl = dish.imageUrl;

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
                        <button type="button" class="btn btn-success btn-restore" data-dish-id="${dish.id}" style="flex: 1; margin-right: 5px;">
                            Восстановить
                        </button>
                        <button type="button" class="btn btn-danger btn-delete-permanent" data-dish-id="${dish.id}" style="flex: 1; margin-left: 5px;">
                            Удалить навсегда
                        </button>
                    </div>
                </div>
            </div>
        `;

        row.appendChild(col);
        attachDeletePermanentHandlers();
        attachRestoreHandlers();
    });
};

//удаление навсегда
function attachDeletePermanentHandlers() {
    document.querySelectorAll('.btn-delete-permanent').forEach(button => {
        button.addEventListener('click', async (e) => {
            const dishId = e.currentTarget.dataset.dishId;
            if (!dishId) return;

            const confirmed = confirm('Вы уверены, что хотите удалить блюдо навсегда? Это действие нельзя отменить.');
            if (!confirmed) return;

            try {
                const response = await fetch(`/admin/deleted/dishes/${dishId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showUniversalToast('Ошибка', errorData.error || 'Не удалось удалить блюдо', 'danger');
                    return;
                }

                showUniversalToast('Успех', 'Блюдо успешно удалено навсегда', 'success');

                const container = document.getElementById('deletedDishesContainer');
                if (container) {
                    await window.loadAndRenderDeletedDishes();
                }
            } catch (error) {
                showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
            }
        });
    });
}

//восстановление блюда из корзины
function attachRestoreHandlers() {
    document.querySelectorAll('.btn-restore').forEach(button => {
        button.addEventListener('click', async (e) => {
            const dishId = e.currentTarget.dataset.dishId;
            if (!dishId) return;

            try {
                const response = await fetch(`/admin/restore/${dishId}`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    showUniversalToast('Ошибка', errorData.error || 'Не удалось восстановить блюдо', 'danger');
                    return;
                }

                showUniversalToast('Успех', 'Блюдо успешно восстановлено', 'success');

                await window.loadAndRenderDeletedDishes();
            } catch (error) {
                showUniversalToast('Ошибка', 'Ошибка сети: ' + error.message, 'danger');
            }
        });
    });
}













