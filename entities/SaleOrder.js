{
  "name": "SaleOrder",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string",
      "description": "Reference to customer"
    },
    "customer_name": {
      "type": "string"
    },
    "customer_phone": {
      "type": "string"
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "items": {
      "type": "array",
      "description": "List of ordered items",
      "items": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string"
          },
          "product_name": {
            "type": "string"
          },
          "packet_type": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "price_per_unit": {
            "type": "number"
          },
          "total": {
            "type": "number"
          }
        }
      }
    },
    "total_amount": {
      "type": "number"
    },
    "discount": {
      "type": "number"
    },
    "final_amount": {
      "type": "number"
    },
    "payment_method": {
      "type": "string"
    },
    "payment_status": {
      "type": "string"
    },
    "delivery_status": {
      "type": "string"
    }
  },
  "required": [
    "customer_name",
    "date",
    "items",
    "total_amount",
    "final_amount",
    "payment_method",
    "payment_status"
  ]
}
