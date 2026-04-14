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
    { id: "vko-dom-sl", zoneId: "vko-dom", name: "SL", type: "кафе", gates: "рядом с выходами 10–11" },
    { id: "vko-dom-irish", zoneId: "vko-dom", name: "Irish Bar", type: "бар", gates: "рядом с выходами 12 и 12A" },
    { id: "vko-dom-bsb", zoneId: "vko-dom", name: "Black Star Burger", type: "бургерная", gates: "рядом с выходами 14–15" },
    { id: "vko-dom-sb", zoneId: "vko-dom", name: "SB", type: "кофейня", gates: "рядом с выходами 8–9" },
    { id: "vko-dom-ch1", zoneId: "vko-dom", name: "Чайхана №1", type: "ресторан", gates: "рядом с выходами 16–17" },

    { id: "vko-int-sl", zoneId: "vko-int", name: "SL", type: "лаундж", gates: "рядом с международной зоной" },
    { id: "vko-int-mobar", zoneId: "vko-int", name: "MoBar", type: "бар", gates: "рядом с gate 21" },
    { id: "vko-int-sib", zoneId: "vko-int", name: "Сибирские легенды", type: "ресторан", gates: "рядом с gate 24" },
    { id: "vko-int-irish", zoneId: "vko-int", name: "Irish Bar", type: "бар", gates: "рядом с gate 22" },
    { id: "vko-int-sb", zoneId: "vko-int", name: "SB", type: "кофейня", gates: "рядом с gate 20" },
    { id: "vko-int-smoky", zoneId: "vko-int", name: "Smoky Lounge", type: "лаундж", gates: "рядом с gate 23" },
    { id: "vko-int-bh", zoneId: "vko-int", name: "Burger Heroes", type: "бургерная", gates: "рядом с gate 25" },
    { id: "vko-int-st", zoneId: "vko-int", name: "Siberians Tales", type: "ресторан", gates: "рядом с gate 26" }
  ]
};
