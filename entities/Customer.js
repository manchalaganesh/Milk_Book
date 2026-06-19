{
  "name": "Customer",
    "type": "object",
      "properties": {
    "name": {
      "type": "string",
        "description": "Customer full name"
    },
    "phone": {
      "type": "string",
        "description": "Phone number"
    },
    "address": {
      "type": "string",
        "description": "Delivery address"
    },
    "milk_type": {
      "type": "string",
        "enum": [
          "cow",
          "buffalo",
          "mixed"
        ],
          "default": "cow",
            "description": "Type of milk"
    },
    "quantity_per_day": {
      "type": "number",
        "description": "Liters per day"
    },
    "price_per_liter": {
      "type": "number",
        "description": "Price per liter in rupees"
    },
    "delivery_slot": {
      "type": "string",
        "enum": [
          "morning",
          "evening",
          "both"
        ],
          "default": "morning",
            "description": "Preferred delivery time"
    },
    "status": {
      "type": "string",
        "enum": [
          "active",
          "inactive"
        ],
          "default": "active"
    },
    "pending_amount": {
      "type": "number",
        "default": 0,
          "description": "Outstanding payment amount"
    }
  },
  "required": [
    "name",
    "phone"
  ]
}