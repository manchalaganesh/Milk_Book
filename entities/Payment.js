{
  "name": "Payment",
    "type": "object",
      "properties": {
    "customer_id": {
      "type": "string",
        "description": "Reference to customer"
    },
    "customer_name": {
      "type": "string"
    },
    "amount": {
      "type": "number",
        "description": "Payment amount in rupees"
    },
    "date": {
      "type": "string",
        "format": "date"
    },
    "method": {
      "type": "string",
        "enum": [
          "cash",
          "upi",
          "bank_transfer",
          "other"
        ],
          "default": "cash"
    },
    "note": {
      "type": "string",
        "description": "Optional payment note"
    }
  },
  "required": [
    "customer_id",
    "customer_name",
    "amount",
    "date"
  ]
}