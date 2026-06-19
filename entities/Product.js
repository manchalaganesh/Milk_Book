{
  "name": "Product",
    "type": "object",
      "properties": {
    "name": {
      "type": "string",
        "description": "Product name (e.g. Cow Milk, Buffalo Milk, Curd)"
    },
    "category": {
      "type": "string",
        "enum": [
          "milk",
          "curd",
          "ghee",
          "butter",
          "paneer",
          "other"
        ],
          "default": "milk",
            "description": "Product category"
    },
    "packet_type": {
      "type": "string",
        "enum": [
          "500ml",
          "1_liter",
          "2_liter",
          "small_packet",
          "medium_packet",
          "large_packet",
          "kg",
          "loose"
        ],
          "default": "1_liter",
            "description": "Packet size/type"
    },
    "price": {
      "type": "number",
        "description": "Price per unit in rupees"
    },
