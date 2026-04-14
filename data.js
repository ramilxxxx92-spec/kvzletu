window.AIRPORT_DATA = {
  airports: [
    { id: "vko", name: "Внуково" },
    { id: "svo", name: "Шереметьево" },
    { id: "dme", name: "Домодедово" }
  ],

  zones: [
    { id: "vko-dom", airportId: "vko", name: "ВВЛ" },
    { id: "vko-int", airportId: "vko", name: "МВЛ" },
    { id: "svo-dom", airportId: "svo", name: "ВВЛ" },
    { id: "svo-int", airportId: "svo", name: "МВЛ" },
    { id: "dme-dom", airportId: "dme", name: "ВВЛ" },
    { id: "dme-int", airportId: "dme", name: "МВЛ" }
  ],

  venues: [
    {
      id: "vko-dom-sl",
      zoneId: "vko-dom",
      name: "SL",
      type: "кафе",
      gates: "рядом с выходами 10–11",
      eta: 12,
      rating: 4.7,
      avgCheck: 890,
      badge: "быстро"
    },
    {
      id: "vko-dom-irish",
      zoneId: "vko-dom",
      name: "Irish Bar",
      type: "бар",
      gates: "рядом с выходами 12 и 12A",
      eta: 14,
      rating: 4.8,
      avgCheck: 1440,
      badge: "популярно"
    },
    {
      id: "vko-dom-bsb",
      zoneId: "vko-dom",
      name: "Black Star Burger",
      type: "бургерная",
      gates: "рядом с выходами 14–15",
      eta: 11,
      rating: 4.6,
      avgCheck: 990,
      badge: "топ-сеты"
    },
    {
      id: "vko-dom-sb",
      zoneId: "vko-dom",
      name: "SB",
      type: "кофейня",
      gates: "рядом с выходами 8–9",
      eta: 8,
      rating: 4.7,
      avgCheck: 620,
      badge: "кофе 5 мин"
    },
    {
      id: "vko-dom-ch1",
      zoneId: "vko-dom",
      name: "Чайхана №1",
      type: "ресторан",
      gates: "рядом с выходами 16–17",
      eta: 18,
      rating: 4.8,
      avgCheck: 1320,
      badge: "семейный"
    },

    {
      id: "vko-int-sl",
      zoneId: "vko-int",
      name: "SL",
      type: "лаундж",
      gates: "рядом с международной зоной",
      eta: 7,
      rating: 4.8,
      avgCheck: 1590,
      badge: "lounge"
    },
    {
      id: "vko-int-mobar",
      zoneId: "vko-int",
      name: "MoBar",
      type: "бар",
      gates: "рядом с gate 21",
      eta: 12,
      rating: 4.7,
      avgCheck: 1490,
      badge: "вечерний формат"
    },
    {
      id: "vko-int-sib",
      zoneId: "vko-int",
      name: "Сибирские легенды",
      type: "ресторан",
      gates: "рядом с gate 24",
      eta: 16,
      rating: 4.8,
      avgCheck: 1380,
      badge: "горячее"
    },
    {
      id: "vko-int-irish",
      zoneId: "vko-int",
      name: "Irish Bar",
      type: "бар",
      gates: "рядом с gate 22",
      eta: 13,
      rating: 4.8,
      avgCheck: 1510,
      badge: "бар"
    },
    {
      id: "vko-int-sb",
      zoneId: "vko-int",
      name: "SB",
      type: "кофейня",
      gates: "рядом с gate 20",
      eta: 7,
      rating: 4.7,
      avgCheck: 650,
      badge: "кофе"
    },
    {
      id: "vko-int-smoky",
      zoneId: "vko-int",
      name: "Smoky Lounge",
      type: "лаундж",
      gates: "рядом с gate 23",
      eta: 10,
      rating: 4.9,
      avgCheck: 1790,
      badge: "premium"
    },
    {
      id: "vko-int-bh",
      zoneId: "vko-int",
      name: "Burger Heroes",
      type: "бургерная",
      gates: "рядом с gate 25",
      eta: 11,
      rating: 4.7,
      avgCheck: 1040,
      badge: "бургеры"
    },
    {
      id: "vko-int-st",
      zoneId: "vko-int",
      name: "Siberians Tales",
      type: "ресторан",
      gates: "рядом с gate 26",
      eta: 17,
      rating: 4.8,
      avgCheck: 1420,
      badge: "signature"
    }
  ],

  menuByVenue: {
    "vko-dom-irish": [
      { id: "irish-1", name: "Gate Combo", desc: "бургер, картофель, соус", price: 690, eta: 12, tag: "хит" },
      { id: "irish-2", name: "Chicken Wings", desc: "крылья BBQ, 8 шт", price: 560, eta: 14, tag: "к бару" },
      { id: "irish-3", name: "Fish & Chips", desc: "треска, картофель, соус тартар", price: 820, eta: 16, tag: "горячее" },
      { id: "irish-4", name: "Lime Cola", desc: "0.4 л", price: 240, eta: 3, tag: "напиток" }
    ],
    "vko-dom-bsb": [
      { id: "bsb-1", name: "Classic Burger", desc: "говядина, сыр, соус", price: 640, eta: 11, tag: "быстро" },
      { id: "bsb-2", name: "Double Smash", desc: "двойная котлета, сыр чеддер", price: 790, eta: 13, tag: "топ" },
      { id: "bsb-3", name: "Fries XL", desc: "картофель с паприкой", price: 260, eta: 5, tag: "добавка" },
      { id: "bsb-4", name: "Shake Vanilla", desc: "ванильный милкшейк", price: 330, eta: 4, tag: "напиток" }
    ],
    "vko-dom-sb": [
      { id: "sb-1", name: "Flat White", desc: "двойной эспрессо, молоко", price: 290, eta: 4, tag: "кофе" },
      { id: "sb-2", name: "Croissant Ham & Cheese", desc: "горячий круассан", price: 340, eta: 7, tag: "с собой" },
      { id: "sb-3", name: "Matcha Tonic", desc: "айс напиток", price: 350, eta: 5, tag: "fresh" },
      { id: "sb-4", name: "Granola Cup", desc: "йогурт, гранола, ягоды", price: 390, eta: 4, tag: "легко" }
    ],
    "vko-dom-ch1": [
      { id: "ch1-1", name: "Плов", desc: "с говядиной и нутом", price: 720, eta: 16, tag: "сытно" },
      { id: "ch1-2", name: "Лагман", desc: "домашняя лапша", price: 680, eta: 15, tag: "горячее" },
      { id: "ch1-3", name: "Самса", desc: "с говядиной", price: 260, eta: 6, tag: "быстро" },
      { id: "ch1-4", name: "Чай с чабрецом", desc: "500 мл", price: 220, eta: 3, tag: "чай" }
    ],
    "vko-int-mobar": [
      { id: "mb-1", name: "Mediterranean Bowl", desc: "кус-кус, курица, овощи", price: 790, eta: 12, tag: "fresh" },
      { id: "mb-2", name: "Bruschetta Set", desc: "4 мини-брускетты", price: 520, eta: 8, tag: "закуска" },
      { id: "mb-3", name: "Sparkling Lemon", desc: "лимон, тоник, лед", price: 260, eta: 3, tag: "напиток" }
    ],
    "vko-int-bh": [
      { id: "bh-1", name: "Hero Burger", desc: "фирменный бургер", price: 740, eta: 11, tag: "топ" },
      { id: "bh-2", name: "Cheese Fries", desc: "картофель, соус чиз", price: 310, eta: 5, tag: "быстро" },
      { id: "bh-3", name: "Chicken Nuggets", desc: "с соусом BBQ", price: 430, eta: 7, tag: "с собой" }
    ],
    fallback: [
      { id: "fb-1", name: "Сэндвич путешественника", desc: "курица, салат, соус", price: 390, eta: 6, tag: "быстро" },
      { id: "fb-2", name: "Аэропорт-сет", desc: "основное блюдо + напиток", price: 690, eta: 12, tag: "сет" },
      { id: "fb-3", name: "Капучино", desc: "классический кофе", price: 250, eta: 4, tag: "кофе" }
    ]
  },

  taxiOptions: [
    {
      id: "comfort",
      title: "Comfort",
      eta: "4 мин",
      price: "от 990 ₽",
      desc: "Быстрая подача к зоне прилета или к входу в терминал."
    },
    {
      id: "business",
      title: "Business",
      eta: "7 мин",
      price: "от 1 890 ₽",
      desc: "Для деловых поездок и встречи клиентов."
    },
    {
      id: "van",
      title: "Van",
      eta: "9 мин",
      price: "от 2 290 ₽",
      desc: "Для семьи, багажа и группового трансфера."
    }
  ],

  hotels: [
    {
      id: "hotel-1",
      title: "Aero Rooms",
      type: "почасовое размещение",
      eta: "7 мин",
      price: "от 2 900 ₽",
      desc: "Подходит для пересадки 3–6 часов."
    },
    {
      id: "hotel-2",
      title: "Sky Rest Hotel",
      type: "ночь у аэропорта",
      eta: "12 мин",
      price: "от 5 900 ₽",
      desc: "Трансфер до терминала включен."
    },
    {
      id: "hotel-3",
      title: "Capsule Line",
      type: "капсулы и душ",
      eta: "5 мин",
      price: "от 1 490 ₽",
      desc: "Короткий отдых между рейсами."
    }
  ],

  airportServices: [
    {
      id: "lounge",
      title: "Lounge Access",
      price: "от 1 900 ₽",
      desc: "Тихая зона, питание, душ и рабочие места."
    },
    {
      id: "gym",
      title: "Fitness / Recovery",
      price: "от 1 200 ₽",
      desc: "Короткая тренировка, восстановление, массаж."
    },
    {
      id: "laundry",
      title: "Химчистка",
      price: "от 790 ₽",
      desc: "Экспресс-обработка одежды в аэропорту."
    },
    {
      id: "luggage",
      title: "Хранение багажа",
      price: "от 490 ₽",
      desc: "Оставь багаж и гуляй налегке."
    }
  ]
};
