window.AIRPORT_DATA = {
  airports: [
    { id: "vko", name: "Внуково" },
    { id: "svo", name: "Шереметьево" },
    { id: "dme", name: "Домодедово" }
  ],

  zones: [
    { id: "vko-dom", airportId: "vko", name: "ВВЛ" },
    { id: "vko-int", airportId: "vko", name: "МВЛ" }
  ],

  venues: [
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
    }
  ],

  menuByVenue: {
    "vko-dom-irish": [
      {
        id: "irish-1",
        name: "Gate Combo",
        desc: "бургер, картофель, соус",
        price: 690,
        eta: 12,
        tag: "хит"
      }
    ],
    fallback: []
  },

  taxiOptions: [],
  hotels: [],
  airportServices: []
};
