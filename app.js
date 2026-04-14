const DB = window.AIRPORT_DATA || {};

const App = {
  state: {
    screen: "home",
    scenario: "departure",
    airportId: "vko",
    zoneId: "vko-dom",
    gate: "12A",
    foodMode: "delivery",
    search: "",
    selectedVenueId: "vko-dom-irish",
    sheet: null,
    toast: "",
    liveNearby: 37,
    liveFlights: 6,
    cart: [],
    orders: [
      {
        id: "seed-food",
        kind: "Еда",
        title: "Irish Bar · Gate Combo",
        meta: "Доставка к выходу 12A",
        status: "Готовится",
        eta: "8 мин",
        stage: 2,
        stages: ["Принят", "Готовится", "Курьер в пути", "Доставлен"]
      },
      {
        id: "seed-taxi",
        kind: "Такси",
        title: "Comfort",
        meta: "Подача после прилета",
        status: "Водитель назначен",
        eta: "4 мин",
        stage: 2,
        stages: ["Поиск", "Водитель назначен", "Прибыл", "Поездка"]
      }
    ]
  },

  tg: null,
  root: null,
  toastTimer: null,
  liveTimer: null,
  mainButtonBound: false,
  backButtonBound: false,

  init() {
    this.root = document.getElementById("app");
    this.tg = window.Telegram?.WebApp || null;

    if (this.tg) {
      this.tg.ready();
      this.tg.expand();
      try {
        this.tg.setHeaderColor?.("#07111f");
        this.tg.setBackgroundColor?.("#07111f");
      } catch (e) {}
    }

    this.normalizeState();
    this.bindTelegram();
    this.render();
    this.startLiveSimulation();
  },

  bindTelegram() {
    if (!this.tg) return;

    if (!this.mainButtonBound) {
      this.tg.MainButton.onClick(() => {
        if (this.state.cart.length) this.openCheckout();
      });
      this.mainButtonBound = true;
    }

    if (!this.backButtonBound) {
      this.tg.BackButton.onClick(() => {
        if (this.state.sheet) {
          this.closeSheet();
          return;
        }

        if (this.state.screen !== "home") {
          this.setScreen("home");
        }
      });
      this.backButtonBound = true;
    }
  },

  normalizeState() {
    const airportExists = this.getAirports().some((a) => a.id === this.state.airportId);
    if (!airportExists) this.state.airportId = this.getAirports()[0]?.id || "";

    const zones = this.getZones();
    const zoneExists = zones.some((z) => z.id === this.state.zoneId);
    if (!zoneExists) this.state.zoneId = zones[0]?.id || "";

    const venues = this.getVenuesByCurrentZone();
    const venueExists = venues.some((v) => v.id === this.state.selectedVenueId);
    if (!venueExists) this.state.selectedVenueId = venues[0]?.id || "";
  },

  haptic(type = "light") {
    try {
      this.tg?.HapticFeedback?.impactOccurred?.(type);
    } catch (e) {}
  },

  getAirports() {
    return DB.airports || [];
  },

  getAirport() {
    return this.getAirports().find((a) => a.id === this.state.airportId);
  },

  getZones() {
    return (DB.zones || []).filter((z) => z.airportId === this.state.airportId);
  },

  getZone() {
    return (DB.zones || []).find((z) => z.id === this.state.zoneId);
  },

  getVenuesByCurrentZone() {
    return (DB.venues || []).filter((v) => v.zoneId === this.state.zoneId);
  },

  getFilteredVenues() {
    const q = this.state.search.trim().toLowerCase();

    return this.getVenuesByCurrentZone().filter((venue) => {
      const haystack = `${venue.name} ${venue.type} ${venue.gates}`.toLowerCase();
      return q ? haystack.includes(q) : true;
    });
  },

  getVenue(id) {
    return (DB.venues || []).find((v) => v.id === id);
  },

  getMenu(venueId) {
    return DB.menuByVenue?.[venueId] || DB.menuByVenue?.fallback || [];
  },

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.qty, 0);
  },

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  formatPrice(value) {
    return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
  },

  scenarioLabel(scenario) {
    return {
      departure: "Я вылетаю",
      arrival: "Я прилетел",
      transfer: "У меня пересадка"
    }[scenario] || "Сценарий";
  },

  scenarioText() {
    const airport = this.getAirport();
    const zone = this.getZone();

    if (this.state.scenario === "departure") {
      return `До посадки достаточно времени. Показываем быстрые заказы, доставку к гейту и рестораны рядом в ${airport?.name || "аэропорту"} · ${zone?.name || "зоне"}.`;
    }

    if (this.state.scenario === "arrival") {
      return `После прилета приоритет на такси, гостиницы и сервисы багажа. Все варианты привязаны к ${airport?.name || "аэропорту"}.`;
    }

    return "Для длинной пересадки приоритет на еду, отдых, lounge, душ и короткое размещение между рейсами.";
  },

  homeRecommendation() {
    if (this.state.scenario === "departure") {
      return {
        title: `До выхода ${this.state.gate} можно успеть заказать самовывоз за 8–12 минут`,
        tag: "умная рекомендация"
      };
    }

    if (this.state.scenario === "arrival") {
      return {
        title: "После прилета быстрее всего сработает такси Comfort и short stay hotel",
        tag: "после прилета"
      };
    }

    return {
      title: "При пересадке 4–6 часов выгоднее комбинировать lounge, душ и почасовой отель",
      tag: "пересадка"
    };
  },

  showToast(text) {
    this.state.toast = text;
    this.render();

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.state.toast = "";
      this.render();
    }, 2200);
  },

  setScreen(screen) {
    this.state.screen = screen;
    this.state.sheet = null;
    this.haptic("light");
    this.render();
  },

  setScenario(scenario) {
    this.state.scenario = scenario;
    this.haptic("light");
    this.render();
  },

  setFoodMode(mode) {
    this.state.foodMode = mode;
    this.haptic("light");
    this.render();
  },

  setSearch(value) {
    this.state.search = value;
    this.render();
  },

  openFilters() {
    this.state.sheet = { type: "filters" };
    this.haptic("medium");
    this.render();
  },

  openVenue(venueId) {
    this.state.selectedVenueId = venueId;
    this.state.sheet = { type: "venue", venueId };
    this.haptic("medium");
    this.render();
  },

  openService(serviceType, id) {
    this.state.sheet = { type: "service", serviceType, id };
    this.haptic("medium");
    this.render();
  },

  openCheckout() {
    if (!this.state.cart.length) return;
    this.state.sheet = { type: "checkout" };
    this.haptic("medium");
    this.render();
  },

  closeSheet() {
    this.state.sheet = null;
    this.render();
  },

  changeAirport(airportId) {
    this.state.airportId = airportId;
    const firstZone = (DB.zones || []).find((z) => z.airportId === airportId);
    this.state.zoneId = firstZone?.id || "";
    const firstVenue = (DB.venues || []).find((v) => v.zoneId === this.state.zoneId);
    this.state.selectedVenueId = firstVenue?.id || "";
    this.render();
  },

  changeZone(zoneId) {
    this.state.zoneId = zoneId;
    const firstVenue = (DB.venues || []).find((v) => v.zoneId === zoneId);
    this.state.selectedVenueId = firstVenue?.id || "";
    this.render();
  },

  changeGate(value) {
    this.state.gate = value;
    this.render();
  },

  addToCart(venueId, itemId) {
    const venue = this.getVenue(venueId);
    const item = this.getMenu(venueId).find((m) => m.id === itemId);

    if (!item || !venue) return;

    const existing = this.state.cart.find(
      (x) => x.venueId === venueId && x.itemId === itemId
    );

    if (existing) {
      existing.qty += 1;
    } else {
      this.state.cart.push({
        venueId,
        itemId,
        venueName: venue.name,
        name: item.name,
        price: item.price,
        eta: item.eta,
        qty: 1
      });
    }

    this.haptic("light");
    this.showToast(`${item.name} добавлен в корзину`);
  },

  removeFromCart(venueId, itemId) {
    this.state.cart = this.state.cart
      .map((item) => {
        if (item.venueId === venueId && item.itemId === itemId) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      })
      .filter((item) => item.qty > 0);

    this.render();
  },

  confirmCheckout() {
    if (!this.state.cart.length) return;

    const first = this.state.cart[0];
    const title =
      this.state.cart.length > 1
        ? `${first.venueName} · ${first.name} + ещё ${this.state.cart.length - 1}`
        : `${first.venueName} · ${first.name}`;

    const meta =
      this.state.foodMode === "delivery"
        ? `Доставка к выходу ${this.state.gate}`
        : this.state.foodMode === "takeaway"
        ? "Самовывоз"
        : "Заказ в ресторане";

    const maxEta = Math.max(...this.state.cart.map((x) => x.eta || 6), 6);

    this.state.orders.unshift({
      id: `ord-${Date.now()}`,
      kind: "Еда",
      title,
      meta,
      status: "Заказ принят",
      eta: `${maxEta} мин`,
      stage: 1,
      stages: ["Принят", "Готовится", "Курьер в пути", "Доставлен"]
    });

    try {
      this.tg?.sendData?.(
        JSON.stringify({
          type: "food_order",
          mode: this.state.foodMode,
          gate: this.state.gate,
          total: this.getCartTotal(),
          items: this.state.cart
        })
      );
    } catch (e) {}

    this.state.cart = [];
    this.state.sheet = null;
    this.state.screen = "orders";
    this.showToast("Заказ отправлен в бота");
    this.render();
  },

  quickBook(type, id) {
    if (type === "taxi") {
      const option = (DB.taxiOptions || []).find((x) => x.id === id);
      if (!option) return;

      this.state.orders.unshift({
        id: `taxi-${Date.now()}`,
        kind: "Такси",
        title: option.title,
        meta: "Точка посадки будет указана в чате",
        status: "Поиск машины",
        eta: option.eta,
        stage: 1,
        stages: ["Поиск", "Водитель назначен", "Прибыл", "Поездка"]
      });

      try {
        this.tg?.sendData?.(JSON.stringify({ type: "taxi", option: option.title }));
      } catch (e) {}

      this.state.sheet = null;
      this.state.screen = "orders";
      this.showToast(`Такси ${option.title} создано`);
      this.render();
      return;
    }

    if (type === "hotel") {
      const option = (DB.hotels || []).find((x) => x.id === id);
      if (!option) return;

      this.state.orders.unshift({
        id: `hotel-${Date.now()}`,
        kind: "Гостиница",
        title: option.title,
        meta: option.type,
        status: "Бронь подтверждается",
        eta: option.eta,
        stage: 1,
        stages: ["Заявка", "Подтверждение", "Бронь активна", "Заселение"]
      });

      try {
        this.tg?.sendData?.(JSON.stringify({ type: "hotel", option: option.title }));
      } catch (e) {}

      this.state.sheet = null;
      this.state.screen = "orders";
      this.showToast(`Заявка в ${option.title} отправлена`);
      this.render();
      return;
    }

    if (type === "service") {
      const option = (DB.airportServices || []).find((x) => x.id === id);
      if (!option) return;

      this.state.orders.unshift({
        id: `service-${Date.now()}`,
        kind: "Сервис",
        title: option.title,
        meta: option.desc,
        status: "Заявка принята",
        eta: "10 мин",
        stage: 1,
        stages: ["Заявка", "Подтверждение", "Активно", "Завершено"]
      });

      try {
        this.tg?.sendData?.(JSON.stringify({ type: "service", option: option.title }));
      } catch (e) {}

      this.state.sheet = null;
      this.state.screen = "orders";
      this.showToast(`${option.title}: заявка принята`);
      this.render();
    }
  },

  sendSnapshot() {
    const airport = this.getAirport();
    const zone = this.getZone();

    try {
      this.tg?.sendData?.(
        JSON.stringify({
          type: "kvzletu_snapshot",
          scenario: this.state.scenario,
          airport: airport?.name,
          zone: zone?.name,
          gate: this.state.gate,
          screen: this.state.screen,
          activeOrders: this.state.orders.length
        })
      );
      this.showToast("Снимок состояния отправлен в бота");
    } catch (e) {
      this.showToast("Demo: снимок состояния сохранен локально");
    }
  },

  render() {
    if (!this.root) return;

    this.root.innerHTML = `
      <div class="shell">
        ${this.renderTopbar()}
        ${this.renderCurrentScreen()}
        <div class="footer-space"></div>
      </div>

      ${this.renderBottomNav()}
      ${this.renderSheet()}
      ${this.renderToast()}
    `;

    this.syncTelegramUi();
  },

  syncTelegramUi() {
    if (!this.tg) return;

    if (this.state.cart.length) {
      this.tg.MainButton.setText(\`Оформить · \${this.formatPrice(this.getCartTotal())}\`);
      this.tg.MainButton.show();
    } else {
      this.tg.MainButton.hide();
    }

    if (this.state.sheet || this.state.screen !== "home") {
      this.tg.BackButton.show();
    } else {
      this.tg.BackButton.hide();
    }
  },

  renderTopbar() {
    return `
      <div class="topbar">
        <div>
          <div class="brand-mini">airport super app</div>
          <h1 class="brand-title">К ВЗЛЕТУ</h1>
          <div class="brand-sub">Еда, такси, отели и сервисы аэропорта в одном стеклянном mini app.</div>
        </div>
        <button class="icon-btn" onclick="App.openFilters()">⚙️</button>
      </div>
    `;
  },

  renderCurrentScreen() {
    if (this.state.screen === "food") return this.renderFoodScreen();
    if (this.state.screen === "services") return this.renderServicesScreen();
    if (this.state.screen === "orders") return this.renderOrdersScreen();
    return this.renderHomeScreen();
  },

  renderHomeScreen() {
    const airport = this.getAirport();
    const zone = this.getZone();
    const venues = this.getVenuesByCurrentZone();
    const reco = this.homeRecommendation();

    return `
      <section class="glass card hero">
        <div class="hero-glow"></div>
        <div class="status-pill">
          <span class="dot-live"></span>
          live context · ${airport?.name || "Аэропорт"} · ${zone?.name || ""}
        </div>

        <div class="hero-title">${this.scenarioLabel(this.state.scenario)}</div>
        <div class="hero-copy">${this.scenarioText()}</div>

        <div class="hero-row">
          <button class="quick-chip ${this.state.scenario === "departure" ? "active" : ""}" onclick="App.setScenario('departure')">Вылет</button>
          <button class="quick-chip ${this.state.scenario === "arrival" ? "active" : ""}" onclick="App.setScenario('arrival')">Прилет</button>
          <button class="quick-chip ${this.state.scenario === "transfer" ? "active" : ""}" onclick="App.setScenario('transfer')">Пересадка</button>
        </div>

        <div class="hero-row">
          <div class="status-pill">✈️ ${airport?.name || "—"} · ${zone?.name || "—"}</div>
          <div class="status-pill">🧭 Gate ${this.escapeHtml(this.state.gate)}</div>
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
            <div class="metric-value">${this.state.orders.length}</div>
            <div class="metric-sub">Еда, такси, гостиницы, сервисы</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Людей рядом</div>
            <div class="metric-value">${this.state.liveNearby}</div>
            <div class="metric-sub">Live трафик рядом с точками</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Ближайших рейсов</div>
            <div class="metric-value">${this.state.liveFlights}</div>
            <div class="metric-sub">Влияют на спрос в терминале</div>
          </div>
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Быстрые действия</h3>
            <div class="section-sub">Максимально показываем возможности super app</div>
          </div>
        </div>

        <div class="quick-row">
          <div class="quick-card">
            <div class="quick-icon">🍔</div>
            <h4>Еда к гейту</h4>
            <div class="quick-copy">Заказ в ресторан, доставка, самовывоз и быстрые сеты до посадки.</div>
            <div class="quick-meta">ETA от 7 мин</div>
            <div class="row-actions">
              <button class="primary-btn" onclick="App.setScreen('food')">Открыть</button>
            </div>
          </div>

          <div class="quick-card">
            <div class="quick-icon">🚕</div>
            <h4>Такси и трансфер</h4>
            <div class="quick-copy">Comfort, Business и Van. Подача к выходу, привязка к прилету.</div>
            <div class="quick-meta">от 990 ₽</div>
            <div class="row-actions">
              <button class="primary-btn" onclick="App.openService('taxi', 'comfort')">Показать</button>
            </div>
          </div>

          <div class="quick-card">
            <div class="quick-icon">🏨</div>
            <h4>Гостиницы</h4>
            <div class="quick-copy">Почасовой отдых, капсулы и полноценные отели рядом с аэропортом.</div>
            <div class="quick-meta">для пересадки и ночи</div>
            <div class="row-actions">
              <button class="primary-btn" onclick="App.openService('hotel', 'hotel-1')">Показать</button>
            </div>
          </div>

          <div class="quick-card">
            <div class="quick-icon">🧳</div>
            <h4>Сервисы аэропорта</h4>
            <div class="quick-copy">Lounge, химчистка, багаж, душ, фитнес и дополнительные услуги.</div>
            <div class="quick-meta">в одном интерфейсе</div>
            <div class="row-actions">
              <button class="primary-btn" onclick="App.setScreen('services')">Показать</button>
            </div>
          </div>
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Умная рекомендация</h3>
            <div class="section-sub">${reco.tag}</div>
          </div>
        </div>

        <div class="note-card">
          <div class="note-title">${reco.title}</div>
          <div class="note-copy">
            Контекст учитывает сценарий пользователя, выбранную зону, список реальных точек из аналитики
            и формат услуги: доставка, самовывоз, такси или short stay.
          </div>
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Избранные точки</h3>
            <div class="section-sub">Импортировано из аналитики ресторанов</div>
          </div>
          <button class="mini-btn" onclick="App.setScreen('food')">Все</button>
        </div>

        <div class="list">
          ${
            venues.length
              ? venues.slice(0, 3).map((venue) => this.renderVenueCard(venue)).join("")
              : this.renderEmptyVenues()
          }
        </div>
      </section>
    `;
  },

  renderFoodScreen() {
    const venues = this.getFilteredVenues();

    return `
      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Еда и рестораны</h3>
            <div class="section-sub">Доставка, самовывоз, заказ в зале</div>
          </div>
          <button class="mini-btn" onclick="App.openFilters()">Фильтр</button>
        </div>

        <div class="search-wrap" style="margin-top: 14px;">
          <span>🔎</span>
          <input
            type="text"
            value="${this.escapeHtml(this.state.search)}"
            placeholder="Поиск ресторана, типа кухни или локации"
            oninput="App.setSearch(this.value)"
          />
        </div>

        <div class="chips-row">
          <button class="mode-chip ${this.state.foodMode === "delivery" ? "active" : ""}" onclick="App.setFoodMode('delivery')">К гейту</button>
          <button class="mode-chip ${this.state.foodMode === "takeaway" ? "active" : ""}" onclick="App.setFoodMode('takeaway')">Самовывоз</button>
          <button class="mode-chip ${this.state.foodMode === "dinein" ? "active" : ""}" onclick="App.setFoodMode('dinein')">В ресторане</button>
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Рестораны в зоне</h3>
            <div class="section-sub">${this.getAirport()?.name || ""} · ${this.getZone()?.name || ""} · выход ${this.escapeHtml(this.state.gate)}</div>
          </div>
        </div>

        <div class="list" style="margin-top: 14px;">
          ${
            venues.length
              ? venues.map((venue) => this.renderVenueCard(venue)).join("")
              : this.renderEmptyVenues()
          }
        </div>
      </section>
    `;
  },

  renderServicesScreen() {
    return `
      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Такси и трансфер</h3>
            <div class="section-sub">После прилета, к терминалу или заранее</div>
          </div>
        </div>

        <div class="list" style="margin-top: 14px;">
          ${(DB.taxiOptions || []).map((item) => `
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
                <div class="stat-pill">Telegram mini app</div>
              </div>

              <div class="row-actions">
                <button class="primary-btn" onclick="App.openService('taxi', '${item.id}')">Открыть</button>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Гостиницы и short stay</h3>
            <div class="section-sub">Для ночи, пересадки и восстановления</div>
          </div>
        </div>

        <div class="list" style="margin-top: 14px;">
          ${(DB.hotels || []).map((item) => `
            <div class="service-card">
              <div class="service-head">
                <div>
                  <h4 class="service-title">${item.title}</h4>
                  <div class="service-copy">${item.type} · ${item.desc}</div>
                </div>
                <div class="badge price-pill">${item.price}</div>
              </div>

              <div class="inline-stats">
                <div class="stat-pill">ETA ${item.eta}</div>
                <div class="stat-pill">Трансфер / бронь</div>
              </div>

              <div class="row-actions">
                <button class="primary-btn" onclick="App.openService('hotel', '${item.id}')">Забронировать</button>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Сервисы аэропорта</h3>
            <div class="section-sub">Lounge, химчистка, фитнес, багаж</div>
          </div>
        </div>

        <div class="grid-2" style="margin-top: 14px;">
          ${(DB.airportServices || []).map((item) => `
            <div class="spotlight-card">
              <div class="spotlight-top">
                <div class="badge">${item.title}</div>
                <div class="badge price-pill">${item.price}</div>
              </div>
              <div class="service-copy">${item.desc}</div>
              <div class="row-actions">
                <button class="primary-btn" onclick="App.openService('service', '${item.id}')">Заказать</button>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  renderOrdersScreen() {
    return `
      <section class="glass card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Мои заказы</h3>
            <div class="section-sub">Единый список всех сервисов приложения</div>
          </div>
          <button class="mini-btn" onclick="App.sendSnapshot()">В бота</button>
        </div>

        <div class="list" style="margin-top: 14px;">
          ${
            this.state.orders.length
              ? this.state.orders.map((order) => this.renderOrderCard(order)).join("")
              : `
                <div class="empty-state">
                  <div style="font-size: 42px;">📦</div>
                  <h3>Пока нет заказов</h3>
                  <p>Оформи еду, такси или услугу — и здесь появятся статусы в одном месте.</p>
                </div>
              `
          }
        </div>
      </section>
    `;
  },

  renderVenueCard(venue) {
    return `
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
          <button class="secondary-btn" onclick="App.openVenue('${venue.id}')">Меню</button>
          <button class="primary-btn" onclick="App.openVenue('${venue.id}')">Заказать</button>
        </div>
      </div>
    `;
  },

  renderOrderCard(order) {
    return `
      <div class="order-card">
        <div class="order-head">
          <div>
            <div class="badge">${order.kind}</div>
            <h4 style="margin-top: 10px; font-size: 18px;">${order.title}</h4>
            <div class="order-meta">${order.meta}</div>
          </div>
          <div class="badge">${order.eta}</div>
        </div>

        <div class="order-status">${order.status}</div>
        <div class="timeline">
          ${order.stages.map((_, index) => `
            <div class="timeline-step ${index < order.stage ? "active" : ""}"></div>
          `).join("")}
        </div>
      </div>
    `;
  },

  renderEmptyVenues() {
    return `
      <div class="empty-state">
        <div style="font-size: 42px;">🍽️</div>
        <h3>В этой зоне пока нет точек</h3>
        <p>Сейчас реальный список ресторанов импортирован из аналитики по Внуково. Для остальных аэропортов можно оставить демо-режим.</p>
      </div>
    `;
  },

  renderBottomNav() {
    const items = [
      { id: "home", label: "Главная", icon: "✦" },
      { id: "food", label: "Еда", icon: "🍔" },
      { id: "services", label: "Сервисы", icon: "◎" },
      { id: "orders", label: "Заказы", icon: "◷" }
    ];

    return `
      <div class="bottom-nav">
        ${items.map((item) => `
          <button class="nav-btn ${this.state.screen === item.id ? "active" : ""}" onclick="App.setScreen('${item.id}')">
            <div class="nav-icon">${item.icon}</div>
            <div>${item.label}</div>
          </button>
        `).join("")}
      </div>
    `;
  },

  renderSheet() {
    if (!this.state.sheet) {
      return `
        <div class="sheet-overlay"></div>
        <div class="sheet"></div>
      `;
    }

    const sheet = this.state.sheet;
    let content = "";

    if (sheet.type === "filters") {
      const zones = this.getZones();

      content = `
        <div class="sheet-handle"></div>
        <div class="sheet-top">
          <div>
            <div class="sheet-title">Контекст полета</div>
            <div class="sheet-copy">Аэропорт, зона, сценарий и gate влияют на еду, такси, отели и рекомендации.</div>
          </div>
          <button class="close-btn" onclick="App.closeSheet()">✕</button>
        </div>

        <div class="field-grid">
          <div class="field">
            <div class="field-label">Сценарий</div>
            <div class="chips-row" style="margin-top: 0;">
              <button class="mode-chip ${this.state.scenario === "departure" ? "active" : ""}" onclick="App.setScenario('departure')">Вылет</button>
              <button class="mode-chip ${this.state.scenario === "arrival" ? "active" : ""}" onclick="App.setScenario('arrival')">Прилет</button>
              <button class="mode-chip ${this.state.scenario === "transfer" ? "active" : ""}" onclick="App.setScenario('transfer')">Пересадка</button>
            </div>
          </div>

          <div class="field">
            <div class="field-label">Аэропорт</div>
            <select class="select-control" onchange="App.changeAirport(this.value)">
              ${this.getAirports().map((airport) => `
                <option value="${airport.id}" ${airport.id === this.state.airportId ? "selected" : ""}>${airport.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="field">
            <div class="field-label">Зона</div>
            <select class="select-control" onchange="App.changeZone(this.value)">
              ${zones.map((zone) => `
                <option value="${zone.id}" ${zone.id === this.state.zoneId ? "selected" : ""}>${zone.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="field">
            <div class="field-label">Gate / выход</div>
            <input
              class="text-control"
              type="text"
              value="${this.escapeHtml(this.state.gate)}"
              oninput="App.changeGate(this.value)"
              placeholder="например, 12A"
            />
          </div>

          <button class="primary-btn" onclick="App.closeSheet()">Готово</button>
        </div>
      `;
    }

    if (sheet.type === "venue") {
      const venue = this.getVenue(sheet.venueId);
      const menu = this.getMenu(sheet.venueId);

      content = `
        <div class="sheet-handle"></div>
        <div class="sheet-top">
          <div>
            <div class="sheet-title">${venue?.name || "Ресторан"}</div>
            <div class="sheet-copy">${venue?.type || ""} · ${venue?.gates || ""}</div>
          </div>
          <button class="close-btn" onclick="App.closeSheet()">✕</button>
        </div>

        <div class="inline-stats" style="margin-top: 0; margin-bottom: 14px;">
          <div class="stat-pill">⭐ ${venue?.rating || 4.7}</div>
          <div class="stat-pill">ETA ${venue?.eta || 10} мин</div>
          <div class="stat-pill">Gate ${this.escapeHtml(this.state.gate)}</div>
          <div class="stat-pill">${
            this.state.foodMode === "delivery"
              ? "Доставка"
              : this.state.foodMode === "takeaway"
              ? "Самовывоз"
              : "В зале"
          }</div>
        </div>

        <div class="menu-list">
          ${menu.map((item) => `
            <div class="menu-item">
              <div class="menu-item-head">
                <div>
                  <div class="menu-name">${item.name}</div>
                  <div class="label-line">${item.desc}</div>
                </div>
                <div class="price">${this.formatPrice(item.price)}</div>
              </div>

              <div class="inline-stats">
                <div class="stat-pill">${item.tag}</div>
                <div class="stat-pill">${item.eta} мин</div>
              </div>

              <div class="row-actions">
                <button class="primary-btn" onclick="App.addToCart('${sheet.venueId}', '${item.id}')">В корзину</button>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="cart-total">
          <span>В корзине</span>
          <strong>${this.getCartCount()} поз. · ${this.formatPrice(this.getCartTotal())}</strong>
        </div>

        <div class="row-actions">
          <button class="secondary-btn" onclick="App.closeSheet()">Продолжить выбор</button>
          <button class="primary-btn" onclick="App.openCheckout()">Оформить</button>
        </div>
      `;
    }

    if (sheet.type === "checkout") {
      content = `
        <div class="sheet-handle"></div>
        <div class="sheet-top">
          <div>
            <div class="sheet-title">Оформление заказа</div>
            <div class="sheet-copy">Подтверждение еды, доставки к выходу и отправка статуса в Telegram-бот.</div>
          </div>
          <button class="close-btn" onclick="App.closeSheet()">✕</button>
        </div>

        ${
          this.state.cart.length
            ? `
              <div class="cart-list">
                ${this.state.cart.map((item) => `
                  <div class="cart-row">
                    <div>
                      <div class="cart-name">${item.name} × ${item.qty}</div>
                      <div class="label-line">${item.venueName} · ${item.eta} мин</div>
                    </div>
                    <div style="text-align: right;">
                      <div class="price">${this.formatPrice(item.price * item.qty)}</div>
                      <button class="mini-btn" style="margin-top: 8px;" onclick="App.removeFromCart('${item.venueId}', '${item.itemId}')">Убрать</button>
                    </div>
                  </div>
                `).join("")}
              </div>

              <div class="field-grid" style="margin-top: 14px;">
                <div class="field">
                  <div class="field-label">Формат</div>
                  <div class="label-line">${
                    this.state.foodMode === "delivery"
                      ? `Доставка к gate ${this.escapeHtml(this.state.gate)}`
                      : this.state.foodMode === "takeaway"
                      ? "Самовывоз"
                      : "Заказ в ресторане"
                  }</div>
                </div>

                <div class="field">
                  <div class="field-label">Итого</div>
                  <div style="font-size: 26px; font-weight: 800;">${this.formatPrice(this.getCartTotal())}</div>
                </div>

                <button class="primary-btn" onclick="App.confirmCheckout()">Подтвердить заказ</button>
              </div>
            `
            : `
              <div class="empty-state">
                <div style="font-size: 42px;">🛒</div>
                <h3>Корзина пуста</h3>
                <p>Добавь блюда из ресторана, и здесь появится оформление заказа.</p>
              </div>
            `
        }
      `;
    }

    if (sheet.type === "service") {
      let title = "";
      let copy = "";
      let price = "";
      let action = "";

      if (sheet.serviceType === "taxi") {
        const item = (DB.taxiOptions || []).find((x) => x.id === sheet.id);
        title = item?.title || "Такси";
        copy = item?.desc || "";
        price = item?.price || "";
        action = `<button class="primary-btn" onclick="App.quickBook('taxi', '${sheet.id}')">Заказать такси</button>`;
      }

      if (sheet.serviceType === "hotel") {
        const item = (DB.hotels || []).find((x) => x.id === sheet.id);
        title = item?.title || "Гостиница";
        copy = `${item?.type || ""} · ${item?.desc || ""}`;
        price = item?.price || "";
        action = `<button class="primary-btn" onclick="App.quickBook('hotel', '${sheet.id}')">Отправить заявку</button>`;
      }

      if (sheet.serviceType === "service") {
        const item = (DB.airportServices || []).find((x) => x.id === sheet.id);
        title = item?.title || "Сервис";
        copy = item?.desc || "";
        price = item?.price || "";
        action = `<button class="primary-btn" onclick="App.quickBook('service', '${sheet.id}')">Оформить</button>`;
      }

      content = `
        <div class="sheet-handle"></div>
        <div class="sheet-top">
          <div>
            <div class="sheet-title">${title}</div>
            <div class="sheet-copy">${copy}</div>
          </div>
          <button class="close-btn" onclick="App.closeSheet()">✕</button>
        </div>

        <div class="field-grid">
          <div class="field">
            <div class="field-label">Стоимость</div>
            <div style="font-size: 26px; font-weight: 800;">${price}</div>
          </div>

          <div class="field">
            <div class="field-label">Контекст</div>
            <div class="label-line">${this.getAirport()?.name || ""} · ${this.getZone()?.name || ""} · сценарий: ${this.scenarioLabel(this.state.scenario)}</div>
          </div>

          <div class="note-card">
            <div class="note-title">Что показывает этот экран</div>
            <div class="note-copy">
              Через mini app можно открывать карточки сервисов, бронировать, отправлять payload в бот,
              а затем объединять все статусы в разделе «Мои заказы».
            </div>
          </div>

          ${action}
        </div>
      `;
    }

    return `
      <div class="sheet-overlay open" onclick="App.closeSheet()"></div>
      <div class="sheet open">${content}</div>
    `;
  },

  renderToast() {
    return this.state.toast ? `<div class="toast">${this.state.toast}</div>` : "";
  },

  escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  startLiveSimulation() {
    clearInterval(this.liveTimer);

    this.liveTimer = setInterval(() => {
      this.state.liveNearby = Math.max(
        24,
        Math.min(61, this.state.liveNearby + (Math.floor(Math.random() * 5) - 2))
      );

      this.state.liveFlights = Math.max(
        3,
        Math.min(12, this.state.liveFlights + (Math.floor(Math.random() * 3) - 1))
      );

      const firstOrder = this.state.orders[0];
      if (firstOrder && Math.random() > 0.65 && firstOrder.stage < firstOrder.stages.length) {
        firstOrder.stage += 1;
        firstOrder.status =
          firstOrder.stages[Math.min(firstOrder.stage - 1, firstOrder.stages.length - 1)];
      }

      if (!this.state.sheet) {
        this.render();
      }
    }, 4500);
  }
};

window.App = App;
document.addEventListener("DOMContentLoaded", () => App.init());
