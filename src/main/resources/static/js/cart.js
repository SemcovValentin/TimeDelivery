allDishes = [];

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
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllDishes();
});