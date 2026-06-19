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
