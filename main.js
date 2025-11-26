let coins = 0;
let power = 1;

const coinsEl = document.getElementById("coins");
const powerEl = document.getElementById("power");
const hamsterImg = document.getElementById("hamster-img");
const upgradeBtn = document.getElementById("upgrade-btn");
const saveBtn = document.getElementById("save-btn");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

const UPGRADE_COST = 100;

// загрузка прогресса
fetch("load.php")
    .then(r => r.json())
    .then(data => {
        if (typeof data.coins === "number") coins = data.coins;
        if (typeof data.power === "number") power = data.power;
        updateUI();
    })
    .catch(() => {
        // если ошибка — просто стартуем с нуля
        updateUI();
    });

function updateUI() {
    coinsEl.textContent = coins;
    powerEl.textContent = power;

    const modulo = coins % UPGRADE_COST;
    const percent = Math.min(100, (modulo / UPGRADE_COST) * 100);
    progressFill.style.width = percent + "%";
    progressText.textContent = `${modulo} / ${UPGRADE_COST}`;
}

function save() {
    fetch("save.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({coins, power})
    }).catch(() => {});
}

function createFloatingCoin(x, y, value) {
    const card = document.querySelector(".card");
    const rect = card.getBoundingClientRect();

    const span = document.createElement("span");
    span.className = "floating-coin";
    span.textContent = `+${value}`;

    span.style.left = (x - rect.left) + "px";
    span.style.top = (y - rect.top) + "px";

    card.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 700);
}

function handleTap(event) {
    coins += power;
    updateUI();

    // анимация картинки
    hamsterImg.classList.remove("bump");
    // чтобы анимация переигрывалась
    void hamsterImg.offsetWidth;
    hamsterImg.classList.add("bump");

    // координаты для вылетающей монеты
    let x, y;
    if (event && event.clientX != null) {
        x = event.clientX;
        y = event.clientY;
    } else {
        const imgRect = hamsterImg.getBoundingClientRect();
        x = imgRect.left + imgRect.width / 2;
        y = imgRect.top + imgRect.height / 2;
    }

    createFloatingCoin(x, y, power);

    // автосохранение "по чуть-чуть"
    if (coins % 10 === 0) {
        save();
    }
}

hamsterImg.addEventListener("click", handleTap);
hamsterImg.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleTap(e.touches[0]);
}, {passive: false});

upgradeBtn.addEventListener("click", () => {
    if (coins >= UPGRADE_COST) {
        coins -= UPGRADE_COST;
        power += 1;
        updateUI();
        save();
    } else {
        alert("Недостаточно монет для улучшения!");
    }
});

saveBtn.addEventListener("click", () => {
    save();
    saveBtn.textContent = "Сохранено ✓";
    setTimeout(() => {
        saveBtn.innerHTML = '<span class="icon">💾</span><span>Сохранить</span>';
    }, 1000);
});
