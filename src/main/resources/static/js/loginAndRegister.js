document.addEventListener('DOMContentLoaded', () => {
    const authModalEl = document.getElementById('authRequiredModal');
    if (authModalEl) {
        authModalEl.addEventListener('hide.bs.modal', () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });
    }
});

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


document.getElementById('authModalLoginBtn').addEventListener('click', () => {
    // Закрываем модальное окно авторизации
    const authModalEl = document.getElementById('authRequiredModal');
    const authModalInstance = bootstrap.Modal.getInstance(authModalEl);
    if (authModalInstance) {
        authModalInstance.hide();
    }
    // Закрываем модальное окно корзины, если открыто
    const cartModalEl = document.getElementById('cartModal');
    const cartModalInstance = bootstrap.Modal.getInstance(cartModalEl);
    if (cartModalInstance) {
        cartModalInstance.hide();
    }

});
