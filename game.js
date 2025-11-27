// ===== ПЕРЕМЕННЫЕ СОСТОЯНИЯ =====
let coins = 0;
let power = 1;
let level = 1;
let taps = 0;
let totalEarned = 0;

let critChance = 0;       // обычный крит
let abikaCritChance = 0;  // супер крит x10
let autoLevel = 0;
let rubleMultiplier = 1;  // множитель дохода

// уровни апгрейдов (для роста цены)
let powerLvl = 0;
let critLvl = 0;
let abikaLvl = 0;
let autoLvl = 0;
let multiLvl = 0;
let levelLvl = 0;

// ник + рекорды
let nickname = "";
let bestCoins = 0;

// серверный лидерборд
let leaderboard = [];

// уникальный id игрока для сервера
const USER_ID_KEY = "abikaKombatUserId";
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
    userId = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : (Date.now() + "-" + Math.random().toString(16).slice(2));
    localStorage.setItem(USER_ID_KEY, userId);
}

// базовые цены
const BASE_COST = {
    power: 100,
    crit: 250,
    abika: 800,
    auto: 500,
    multi: 600,
    level: 1000
};

// ссылки на элементы
const coinsEl = document.getElementById("coins");
const powerEl = document.getElementById("power");
const levelEl = document.getElementById("level");
const hero = document.getElementById("hero");

const costPowerEl = document.getElementById("costPower");
const costCritEl = document.getElementById("costCrit");
const costAbikaEl = document.getElementById("costAbika");
const costAutoEl = document.getElementById("costAuto");
const costMultiEl = document.getElementById("costMulti");
const costLevelEl = document.getElementById("costLevel");

const m1El = document.getElementById("m1progress");
const m2El = document.getElementById("m2progress");
const m3El = document.getElementById("m3progress");

const nickInput = document.getElementById("nickname");
const saveNickBtn = document.getElementById("saveNick");
const leaderboardList = document.getElementById("leaderboardList");

// миссии выполнены?
let m1Done = false;
let m2Done = false;
let m3Done = false;

// флаг, запущен ли интервал автотапа
let autoIntervalStarted = false;

// фразы для «абика-крита»
const abikaPhrases = [
    "АБИКА КРИТАНУЛ 💜",
    "КОМБО ОТ АБИКИ ⚡",
    "АБИКА РАЗНЕС 👊",
    "АБИКА В ДЕЛЕ 😈"
];

// ===== ПОЛЕЗНЫЕ ФУНКЦИИ =====

// стоимость с ростом
function calcCost(base, level) {
    return Math.floor(base * Math.pow(1.35, level));
}

// сохранение в localStorage (личный прогресс)
function save() {
    const data = {
        coins, power, level, taps, totalEarned,
        critChance, abikaCritChance, autoLevel, rubleMultiplier,
        powerLvl, critLvl, abikaLvl, autoLvl, multiLvl, levelLvl,
        nickname, bestCoins,
        m1Done, m2Done, m3Done
    };
    localStorage.setItem("abikaKombatSave", JSON.stringify(data));
}

// загрузка личного прогресса
function load() {
    const raw = localStorage.getItem("abikaKombatSave");
    if (!raw) return;

    try {
        const data = JSON.parse(raw);

        coins = data.coins ?? 0;
        power = data.power ?? 1;
        level = data.level ?? 1;
        taps  = data.taps ?? 0;
        totalEarned = data.totalEarned ?? 0;

        critChance = data.critChance ?? 0;
        abikaCritChance = data.abikaCritChance ?? 0;
        autoLevel = data.autoLevel ?? 0;
        rubleMultiplier = data.rubleMultiplier ?? 1;

        powerLvl = data.powerLvl ?? 0;
        critLvl = data.critLvl ?? 0;
        abikaLvl = data.abikaLvl ?? 0;
        autoLvl = data.autoLvl ?? 0;
        multiLvl = data.multiLvl ?? 0;
        levelLvl = data.levelLvl ?? 0;

        nickname = data.nickname ?? "";
        bestCoins = data.bestCoins ?? 0;

        m1Done = data.m1Done ?? false;
        m2Done = data.m2Done ?? false;
        m3Done = data.m3Done ?? false;
    } catch (e) {
        console.error("Ошибка загрузки сохранения:", e);
    }
}

// обновляем UI
function updateUI() {
    coinsEl.textContent = coins;
    powerEl.textContent = power;
    levelEl.textContent = level;

    // прогресс миссий
    m1El.textContent = (m1Done ? "✔ Выполнено" : `${taps} / 50`);
    m2El.textContent = (m2Done ? "✔ Выполнено" : `${totalEarned} / 1000`);
    m3El.textContent = (m3Done ? "✔ Выполнено" : `${power} / 10`);

    // цены апгрейдов
    costPowerEl.textContent = calcCost(BASE_COST.power, powerLvl);
    costCritEl.textContent = calcCost(BASE_COST.crit, critLvl);
    costAbikaEl.textContent = calcCost(BASE_COST.abika, abikaLvl);
    costAutoEl.textContent = calcCost(BASE_COST.auto, autoLvl);
    costMultiEl.textContent = calcCost(BASE_COST.multi, multiLvl);
    costLevelEl.textContent = calcCost(BASE_COST.level, levelLvl);

    // ник в инпуте
    nickInput.value = nickname;

    // миссии + награды
    checkMissions();

    // сохраняем личный прогресс
    save();
}

// вылетающий текст
function spawnText(text, offsetX = 0, offsetY = 0) {
    const elem = document.createElement("div");
    elem.className = "float";
    elem.textContent = text;
    document.body.appendChild(elem);

    elem.style.left = (window.innerWidth / 2 - 20 + offsetX) + "px";
    elem.style.top  = (window.innerHeight / 2 - 20 + offsetY) + "px";

    setTimeout(() => elem.remove(), 900);
}

// фраза от абики
function spawnAbikaPhrase() {
    const phrase = abikaPhrases[Math.floor(Math.random() * abikaPhrases.length)];
    spawnText(phrase, 0, -60);
}

// проверяем миссии и выдаём награды
function checkMissions() {
    // миссия 1: 50 тапов
    if (!m1Done && taps >= 50) {
        m1Done = true;
        coins += 200;
        spawnText("+200 ₽ за миссию 👆");
    }

    // миссия 2: заработать 1000 ₽ (totalEarned)
    if (!m2Done && totalEarned >= 1000) {
        m2Done = true;
        coins += 500;
        spawnText("+500 ₽ за миссию 💰", 0, -40);
    }

    // миссия 3: сила клика >= 10
    if (!m3Done && power >= 10) {
        m3Done = true;
        coins += 700;
        spawnText("+700 ₽ за миссию 🔥", 0, -40);
    }
}

// ===== ЛИДЕРБОРД НА СЕРВЕРЕ =====

function updateLeaderboardUI() {
    leaderboardList.innerHTML = "";

    leaderboard
        .filter(item => item.name && item.name.trim() !== "")
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10)
        .forEach((item, idx) => {
            const li = document.createElement("li");
            li.textContent = `${idx + 1}. ${item.name} — ${item.score} ₽`;
            leaderboardList.appendChild(li);
        });
}

async function loadLeaderboardFromServer() {
    try {
        const r = await fetch("load_leaderboard.php", {cache: "no-store"});
        const data = await r.json();
        if (Array.isArray(data)) {
            leaderboard = data;
        } else {
            leaderboard = [];
        }
    } catch (e) {
        console.error("Ошибка загрузки лидерборда:", e);
        leaderboard = [];
    }
    updateLeaderboardUI();
}

async function saveLeaderboardToServer() {
    const payload = {
        id: userId,
        name: nickname || "",
        score: bestCoins
    };

    try {
        await fetch("save_leaderboard.php", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        await loadLeaderboardFromServer();
    } catch (e) {
        console.error("Ошибка сохранения лидерборда:", e);
    }
}

// обновляем лучший результат и шлём на сервер
function updateBestScoreAndSync() {
    if (coins > bestCoins) {
        bestCoins = coins;
        save();                 // локально
        saveLeaderboardToServer(); // на сервер
    }
}

// логика автотапа
function startAutoTapInterval() {
    if (autoIntervalStarted) return;
    autoIntervalStarted = true;

    setInterval(() => {
        if (autoLevel > 0) {
            for (let i = 0; i < autoLevel; i++) {
                tap(true); // авто-тап
            }
        }
    }, 1000);
}

// ===== ЛОГИКА ТАПА =====

function tap(isAuto = false) {
    taps++;

    let gain = power;

    // сначала проверяем абика-крит
    if (abikaCritChance > 0 && Math.random() * 100 < abikaCritChance) {
        gain *= 10;
        gain = Math.floor(gain * rubleMultiplier);
        coins += gain;
        totalEarned += gain;
        spawnText(`💜 АБИКА КРИТ +${gain} ₽`);
        spawnAbikaPhrase();
    } else if (critChance > 0 && Math.random() * 100 < critChance) {
        // обычный крит
        gain *= 3;
        gain = Math.floor(gain * rubleMultiplier);
        coins += gain;
        totalEarned += gain;
        spawnText(`💥 +${gain} ₽`);
    } else {
        gain = Math.floor(gain * rubleMultiplier);
        coins += gain;
        totalEarned += gain;
        spawnText(`+${gain} ₽`);
    }

    updateUI();
    updateBestScoreAndSync();
}

// клик по абике
hero.addEventListener("click", () => tap(false));

// запрет перетаскивания и контекстного меню на картинке
hero.addEventListener("dragstart", (e) => e.preventDefault());
hero.addEventListener("contextmenu", (e) => e.preventDefault());

// ===== ОБРАБОТКА АПГРЕЙДОВ =====

document.getElementById("upgradePower").onclick = () => {
    const cost = calcCost(BASE_COST.power, powerLvl);
    if (coins >= cost) {
        coins -= cost;
        power += 1;
        powerLvl++;
        updateUI();
    }
};

document.getElementById("upgradeCritical").onclick = () => {
    const cost = calcCost(BASE_COST.crit, critLvl);
    if (coins >= cost) {
        coins -= cost;
        critChance += 5;
        critLvl++;
        spawnText("💥 Крит шанс +5%");
        updateUI();
    }
};

document.getElementById("upgradeAbikaCrit").onclick = () => {
    const cost = calcCost(BASE_COST.abika, abikaLvl);
    if (coins >= cost) {
        coins -= cost;
        abikaCritChance += 2;
        abikaLvl++;
        spawnText("💜 Abika-крит +2%");
        updateUI();
    }
};

document.getElementById("upgradeAuto").onclick = () => {
    const cost = calcCost(BASE_COST.auto, autoLvl);
    if (coins >= cost) {
        coins -= cost;
        autoLevel++;
        autoLvl++;
        spawnText("🤖 Автотап +" + autoLevel + "/сек");
        startAutoTapInterval();
        updateUI();
    }
};

document.getElementById("upgradeMulti").onclick = () => {
    const cost = calcCost(BASE_COST.multi, multiLvl);
    if (coins >= cost) {
        coins -= cost;
        rubleMultiplier += 0.1;
        multiLvl++;
        spawnText("📈 Множитель +" + Math.round(rubleMultiplier * 10) / 10 + "x");
        updateUI();
    }
};

document.getElementById("upgradeLevel").onclick = () => {
    const cost = calcCost(BASE_COST.level, levelLvl);
    if (coins >= cost) {
        coins -= cost;
        level++;
        power += 2;
        levelLvl++;
        spawnText("🧪 Новый уровень!");
        updateUI();
    }
};

// ===== НИК + ЛИДЕРБОРД =====

saveNickBtn.addEventListener("click", () => {
    const val = nickInput.value.trim();
    nickname = val; // если пустой — просто будет "", и запись на сервере удалим

    save(); // локально сохраняем ник
    saveLeaderboardToServer(); // обновим имя / удалим запись, если ник пустой
});

// ===== ОТКЛЮЧЕНИЕ ДВОЙНОГО ЗУМА НА МОБИЛКЕ =====

let lastTouchEnd = 0;
document.addEventListener("touchend", function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// иногда на iOS срабатывают gesture-* события
["gesturestart", "gesturechange", "gestureend"].forEach(evt => {
    document.addEventListener(evt, (e) => e.preventDefault());
});

// ===== СТАРТ ИГРЫ =====

async function init() {
    load(); // локальный прогресс
    if (autoLevel > 0) startAutoTapInterval();
    await loadLeaderboardFromServer(); // публичный лидерборд
    updateUI();
}

init();
