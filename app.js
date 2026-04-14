const DB = window.AIRPORT_DATA || {};

const state = {
  screen: "home",
  scenario: "departure",
  airportId: "vko",
  zoneId: "vko-dom",
  gate: "12A",
  foodMode: "delivery",
  search: "",
  toast: "",
  liveNearby: 37,
  liveFlights: 6,
  orders: [
    {
      kind: "Еда",
      title: "Irish Bar · Gate Combo",
      meta: "Доставка к выходу 12A",
      status: "Готовится",
      eta: "8 мин"
    },
    {
      kind: "Такси",
      title: "Comfort",
      meta: "Подача после прилета",
      status: "Водитель назначен",
      eta: "4 мин"
    }
  ]
};

const tg = window.Telegram?.WebApp || null;

function getAirports() {
  return DB.airports || [];
}

function getAirport() {
  return getAirports().find((a) => a.id === state.airportId);
}

function getZones() {
  return (DB.zones || []).filter((z) => z.airportId === state.airportId);
}

function getZone() {
  return (DB.zones || []).find((z) => z.id === state.zoneId);
}

function getVenues() {
  return (DB.venues || []).filter((v) => v.zoneId === state.zoneId);
}

function getFilteredVenues() {
  const q = state.search.trim().toLowerCase();
  return getVenues().filter((venue) => {
    const haystack = `${venue.name} ${venue.type} ${venue.gates}`.toLowerCase();
    return q ? haystack.includes(q) : true;
  });
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(text) {
  state.toast = text;
  render();
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    state.toast = "";
    render();
  }, 2000);
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

function setScenario(scenario) {
  state.scenario = scenario;
  render();
}

function setFoodMode(mode) {
  state.foodMode = mode;
  render();
}

function setSearch(value) {
  state.search = value;
  render();
}

function changeAirport(value) {
  state.airportId = value;
  const firstZone = getZones()[0];
  state.zoneId = firstZone?.id || "";
  render();
}

function changeZone(value) {
  state.zoneId = value;
  render();
}

function changeGate(value) {
  state.gate = value;
  render();
}

function scenarioLabel() {
  if (state.scenario === "departure") return "Я вылетаю";
  if (state.scenario === "arrival") return "Я прилетел";
  return "У меня пересадка";
}

function scenarioText() {
  const airport = getAirport();
  const zone = getZone();

  if (state.scenario === "departure") {
    return `До посадки достаточно времени. Показываем быстрые заказы, доставку к гейту и рестораны рядом в ${airport?.name || "аэропорту"} · ${zone?.name || "зоне"}.`;
  }

  if (state.scenario === "arrival") {
    return `После прилета приоритет на такси, гостиницы и сервисы багажа. Все варианты привязаны к ${airport?.name || "аэропорту"}.`;
  }

  return "Для длинной пересадки приоритет на еду, отдых, lounge, душ и короткое размещение между рейсами.";
}

function renderTopbar() {
  return `
    <div class="topbar">
      <div>
        <div class="brand-mini">airport super app</div>
        <h1 class="brand-title">К ВЗЛЕТУ</h1>
        <div class="brand-sub">Еда, такси, отели и сервисы аэропорта в одном стеклянном mini app.</div>
      </div>
      <button class="icon-btn" onclick="setScreen('services')">◎</button>
    </div>
  `;
}

function renderHome() {
  const airport = getAirport();
  const zone = getZone();
  const venues = getVenues();

  return `
    <section class="glass card hero">
      <div class="hero-glow"></div>

      <div class="status-pill">
        <span class="dot-live"></span>
        live context · ${airport?.name || "Аэропорт"} · ${zone?.name || ""}
      </div>

      <div class="hero-title">${scenarioLabel()}</div>
      <div class="hero-copy">${scenarioText()}</div>

      <div class="hero-row">
        <button class="quick-chip ${state.scenario === "departure" ? "active" : ""}" onclick="setScenario('departure')">Вылет</button>
        <button class="quick-chip ${state.scenario === "arrival" ? "active" : ""}" onclick="setScenario('arrival')">Прилет</button>
        <button class="quick-chip ${state.scenario === "transfer" ? "active" : ""}" onclick="setScenario('transfer')">Пересадка</button>
      </div>

      <div class="hero-row">
        <div class="status-pill">✈️ ${airport?.name || "—"} · ${zone?.name || "—"}</div>
        <div class="status-pill">🧭 Gate ${escapeHtml(state.gate)}</div>
      </div>
    </section>

    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Сейчас доступно</h3>
          <div class="section-sub">Быстрый обзор возможностей приложения</div>
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric-card highlight">
          <div class="metric-label">Ресторанов рядом</div>
          <div class="metric-value">${venues.length}</div>
          <div class="metric-sub">Точки из аналитики по текущей зоне</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Активных заказов</div>
          <div class="metric-value">${state.orders.length}</div>
          <div class="metric-sub">Еда, такси, гостиницы, сервисы</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Людей рядом</div>
          <div class="metric-value">${state.liveNearby}</div>
          <div class="metric-sub">Live трафик рядом с точками</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Ближайших рейсов</div>
          <div class="metric-value">${state.liveFlights}</div>
          <div class="metric-sub">Влияют на спрос в терминале</div>
        </div>
      </div>
    </section>

    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Быстрые действия</h3>
          <div class="section-sub">Основные сценарии super app</div>
        </div>
      </div>

      <div class="quick-row">
        <div class="quick-card">
          <div class="quick-icon">🍔</div>
          <h4>Еда к гейту</h4>
          <div class="quick-copy">Заказ в ресторан, доставка, самовывоз и быстрые сеты до посадки.</div>
          <div class="quick-meta">ETA от 7 мин</div>
          <div class="row-actions">
            <button class="primary-btn" onclick="setScreen('food')">Открыть</button>
          </div>
        </div>

        <div class="quick-card">
          <div class="quick-icon">🚕</div>
          <h4>Такси и трансфер</h4>
          <div class="quick-copy">Комфортная подача к зоне прилета или терминалу.</div>
          <div class="quick-meta">от 990 ₽</div>
          <div class="row-actions">
            <button class="primary-btn" onclick="setScreen('services')">Показать</button>
          </div>
        </div>

        <div class="quick-card">
          <div class="quick-icon">🏨</div>
          <h4>Гостиницы</h4>
          <div class="quick-copy">Почасовой отдых, капсулы и отели рядом с аэропортом.</div>
          <div class="quick-meta">для пересадки и ночи</div>
          <div class="row-actions">
            <button class="primary-btn" onclick="setScreen('services')">Показать</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFood() {
  const airport = getAirport();
  const zone = getZone();
  const venues = getFilteredVenues();

  return `
    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Еда и рестораны</h3>
          <div class="section-sub">Доставка, самовывоз, заказ в зале</div>
        </div>
      </div>

      <div class="search-wrap" style="margin-top:14px;">
        <span>🔎</span>
        <input
          type="text"
          value="${escapeHtml(state.search)}"
          placeholder="Поиск ресторана, кухни или локации"
          oninput="setSearch(this.value)"
        />
      </div>

      <div class="chips-row">
        <button class="mode-chip ${state.foodMode === "delivery" ? "active" : ""}" onclick="setFoodMode('delivery')">К гейту</button>
        <button class="mode-chip ${state.foodMode === "takeaway" ? "active" : ""}" onclick="setFoodMode('takeaway')">Самовывоз</button>
        <button class="mode-chip ${state.foodMode === "dinein" ? "active" : ""}" onclick="setFoodMode('dinein')">В ресторане</button>
      </div>
    </section>

    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Рестораны в зоне</h3>
          <div class="section-sub">${airport?.name || ""} · ${zone?.name || ""} · выход ${escapeHtml(state.gate)}</div>
        </div>
      </div>

      <div class="list" style="margin-top:14px;">
        ${
          venues.length
            ? venues.map((venue) => `
              <div class="restaurant-card">
                <div class="restaurant-head">
                  <div>
                    <div class="restaurant-name">${venue.name}</div>
                    <div class="restaurant-meta">${venue.type} · ${venue.gates}</div>
                  </div>
                  <div class="badge">${venue.badge}</div>
                </div>

                <div class="inline-stats">
                  <div class="stat-pill">⭐ ${venue.rating}</div>
                  <div class="stat-pill">ETA ${venue.eta} мин</div>
                  <div class="stat-pill">Средний чек ${venue.avgCheck} ₽</div>
                </div>

                <div class="row-actions">
                  <button class="secondary-btn" onclick="showToast('Меню ${venue.name}')">Меню</button>
                  <button class="primary-btn" onclick="showToast('Заказ из ${venue.name}')">Заказать</button>
                </div>
              </div>
            `).join("")
            : `
              <div class="empty-state">
                <div style="font-size:42px;">🍽️</div>
                <h3>В этой зоне пока нет точек</h3>
                <p>Сейчас реальный список ресторанов импортирован из аналитики по Внуково.</p>
              </div>
            `
        }
      </div>
    </section>
  `;
}

function renderServices() {
  return `
    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Такси и трансфер</h3>
          <div class="section-sub">После прилета, к терминалу или заранее</div>
        </div>
      </div>

      <div class="list" style="margin-top:14px;">
        ${(DB.taxiOptions || []).length
          ? (DB.taxiOptions || []).map((item) => `
            <div class="service-card">
              <div class="service-head">
                <div>
                  <h4 class="service-title">${item.title}</h4>
                  <div class="service-copy">${item.desc}</div>
                </div>
                <div class="badge price-pill">${item.price}</div>
              </div>

              <div class="inline-stats">
                <div class="stat-pill">ETA ${item.eta}</div>
              </div>

              <div class="row-actions">
                <button class="primary-btn" onclick="showToast('Такси ${item.title}')">Выбрать</button>
              </div>
            </div>
          `).join("")
          : `<div class="empty-state"><h3>Такси появится здесь</h3></div>`
        }
      </div>
    </section>

    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Гостиницы и сервисы</h3>
          <div class="section-sub">Для пересадки, ночи и отдыха</div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:14px;">
        <div class="spotlight-card">
          <div class="spotlight-top">
            <div class="badge">Short stay</div>
            <div class="badge price-pill">от 2 900 ₽</div>
          </div>
          <div class="service-copy">Почасовой отдых рядом с аэропортом.</div>
        </div>

        <div class="spotlight-card">
          <div class="spotlight-top">
            <div class="badge">Lounge</div>
            <div class="badge price-pill">от 1 900 ₽</div>
          </div>
          <div class="service-copy">Тихая зона, питание, душ и рабочие места.</div>
        </div>
      </div>
    </section>
  `;
}

function renderOrders() {
  return `
    <section class="glass card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Мои заказы</h3>
          <div class="section-sub">Единый список всех сервисов приложения</div>
        </div>
      </div>

      <div class="list" style="margin-top:14px;">
        ${
          state.orders.length
            ? state.orders.map((order) => `
              <div class="order-card">
                <div class="order-head">
                  <div>
                    <div class="badge">${order.kind}</div>
                    <h4 style="margin-top:10px;font-size:18px;">${order.title}</h4>
                    <div class="order-meta">${order.meta}</div>
                  </div>
                  <div class="badge">${order.eta}</div>
                </div>

                <div class="order-status">${order.status}</div>
              </div>
            `).join("")
            : `
              <div class="empty-state">
                <div style="font-size:42px;">📦</div>
                <h3>Пока нет заказов</h3>
                <p>Оформи еду, такси или услугу — и здесь появятся статусы.</p>
              </div>
            `
        }
      </div>
    </section>
  `;
}

function renderCurrentScreen() {
  if (state.screen === "food") return renderFood();
  if (state.screen === "services") return renderServices();
  if (state.screen === "orders") return renderOrders();
  return renderHome();
}

function renderBottomNav() {
  const items = [
    { id: "home", label: "Главная", icon: "✦" },
    { id: "food", label: "Еда", icon: "🍔" },
    { id: "services", label: "Сервисы", icon: "◎" },
    { id: "orders", label: "Заказы", icon: "◷" }
  ];

  return `
    <div class="bottom-nav">
      ${items.map((item) => `
        <button class="nav-btn ${state.screen === item.id ? "active" : ""}" onclick="setScreen('${item.id}')">
          <div class="nav-icon">${item.icon}</div>
          <div>${item.label}</div>
        </button>
      `).join("")}
    </div>
  `;
}

function renderToast() {
  return state.toast ? `<div class="toast">${state.toast}</div>` : "";
}

function syncTelegramUi() {
  if (!tg) return;

  tg.MainButton.hide();

  if (state.screen !== "home") {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="shell">
      ${renderTopbar()}

      <section class="glass card">
        <div class="field-grid">
          <div class="field">
            <div class="field-label">Аэропорт</div>
            <select class="select-control" onchange="changeAirport(this.value)">
              ${getAirports().map((airport) => `
                <option value="${airport.id}" ${airport.id === state.airportId ? "selected" : ""}>${airport.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="field">
            <div class="field-label">Зона</div>
            <select class="select-control" onchange="changeZone(this.value)">
              ${getZones().map((zone) => `
                <option value="${zone.id}" ${zone.id === state.zoneId ? "selected" : ""}>${zone.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="field">
            <div class="field-label">Gate / выход</div>
            <input
              class="text-control"
              type="text"
              value="${escapeHtml(state.gate)}"
              oninput="changeGate(this.value)"
              placeholder="например, 12A"
            />
          </div>
        </div>
      </section>

      ${renderCurrentScreen()}
      <div class="footer-space"></div>
    </div>

    ${renderBottomNav()}
    ${renderToast()}
  `;

  syncTelegramUi();
}

function startLiveSimulation() {
  clearInterval(window.__liveTimer);

  window.__liveTimer = setInterval(() => {
    state.liveNearby = Math.max(24, Math.min(61, state.liveNearby + (Math.floor(Math.random() * 5) - 2)));
    state.liveFlights = Math.max(3, Math.min(12, state.liveFlights + (Math.floor(Math.random() * 3) - 1)));
    render();
  }, 4500);
}

window.setScreen = setScreen;
window.setScenario = setScenario;
window.setFoodMode = setFoodMode;
window.setSearch = setSearch;
window.changeAirport = changeAirport;
window.changeZone = changeZone;
window.changeGate = changeGate;
window.showToast = showToast;

document.addEventListener("DOMContentLoaded", () => {
  if (tg) {
    tg.ready();
    tg.expand();
  }
  render();
  startLiveSimulation();
});
