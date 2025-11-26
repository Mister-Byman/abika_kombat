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
let nickname = "Гость";
let bestCoins = 0;
let leaderboard = [];

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
    // экспоненциальный рост
    return Math.floor(base * Math.pow(1.35, level));
}

// сохранение в localStorage
function save() {
    const data = {
        coins, power, level, taps, totalEarned,
        critChance, abikaCritChance, autoLevel, rubleMultiplier,
        powerLvl, critLvl, abikaLvl, autoLvl, multiLvl, levelLvl,
        nickname, bestCoins, leaderboard,
        m1Done, m2Done, m3Done
    };
    localStorage.setItem("abikaKombatSave", JSON.stringify(data));
}

// загрузка
function load() {
    const data = JSON.parse(localStorage.getItem("abikaKombatSave"));
    if (!data) return;

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

    nickname = data.nickname ?? "Гость";
    bestCoins = data.bestCoins ?? 0;
    leaderboard = data.leaderboard ?? [];

    m1Done = data.m1Done ?? false;
    m2Done = data.m2Done ?? false;
    m3Done = data.m3Done ?? false;
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

    // ник
    nickInput.value = nickname;

    // миссии + награды
    checkMissions();

    // лидерборд
    updateLeaderboard();

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

// обновление лидерборда (локального)
function updateLeaderboard() {
    if (!nickname) return;

    // обновляем лучший результат
    if (coins > bestCoins) {
        bestCoins = coins;
    }

    // обновляем список
    let list = leaderboard.filter(e => e.name !== nickname);
    list.push({ name: nickname, score: bestCoins });
    list.sort((a, b) => b.score - a.score);
    leaderboard = list.slice(0, 10);

    // рендер
    leaderboardList.innerHTML = "";
    leaderboard.forEach((item, idx) => {
        const li = document.createElement("li");
        li.textContent = `${idx + 1}. ${item.name} — ${item.score} ₽`;
        leaderboardList.appendChild(li);
    });
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
}

hero.addEventListener("click", () => tap(false));

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
    nickname = val || "БезНика";
    updateUI();
});

// ===== СТАРТ ИГРЫ =====

load();
if (autoLevel > 0) startAutoTapInterval();
updateUI();
