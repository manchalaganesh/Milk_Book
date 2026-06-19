{
  "name": "MilkOrder",
    "type": "object",
      "properties": {
    "customer_id": {
      "type": "string",
        "description": "Reference to customer"
    },
    "customer_name": {
      "type": "string",
        "description": "Customer name for quick access"
    },
    "date": {
      "type": "string",
        "format": "date",
          "description": "Delivery date"
    },
    "slot": {
      "type": "string",
        "enum": [
          "morning",
          "evening"
        ],
          "description": "Morning or evening delivery"
    },
    "milk_type": {
      "type": "string",
        "enum": [
          "cow",
          "buffalo",
          "mixed"
        ]
    },
    "quantity": {
      "type": "number",
        "description": "Liters delivered"
    },
    "price_per_liter": {
      "type": "number"
    },
    "total_price": {
      "type": "number",
        "description": "quantity * price_per_liter"
    },
    "delivery_status": {
      "type": "string",
        "enum": [
          "pending",
          "delivered",
          "skipped"
        ],
          "default": "pending"
    },
    "payment_status": {
      "type": "string",
        "enum": [
          "paid",
          "unpaid"
        ],
          "default": "unpaid"
    }
  },
  "required": [
    "customer_id",
    "customer_name",
    "date",
    "slot",
    "quantity",
    "price_per_liter",
    "total_price"
  ]
}