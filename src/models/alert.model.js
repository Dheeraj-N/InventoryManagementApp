const db = require('../config/db');

exports.getStockAlerts = async () => {
  const query = `
     SELECT 
      'FILM' AS inventory_type,
      film_id AS item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      NULL AS need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM film_inventory
    WHERE available_quantity <= minimum_quantity

    UNION ALL

    SELECT 
      'RAW' AS inventory_type,
      item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM raw_material_inventory
    WHERE available_quantity <= minimum_quantity
      AND need_alert = true
  `;

  const res = await db.query(query);
  return res.rows;
};


exports.getLowStock = async () => {
      const query = `
     SELECT 
      'FILM' AS inventory_type,
      film_id AS item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      NULL AS need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM film_inventory
    WHERE available_quantity > 0 and available_quantity <= minimum_quantity 

    UNION ALL

    SELECT 
      'RAW' AS inventory_type,
      item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM raw_material_inventory
    WHERE available_quantity > 0 and available_quantity <= minimum_quantity
      AND need_alert = true
  `;

  const res = await db.query(query);
  return res.rows;
};


exports.getOutOfStock = async () => {
      const query = `
     SELECT 
      'FILM' AS inventory_type,
      film_id AS item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      NULL AS need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM film_inventory
    WHERE  available_quantity = 0 

    UNION ALL

    SELECT 
      'RAW' AS inventory_type,
      item_id,
      name,
      category,
      available_quantity,
      minimum_quantity,
      need_alert,
      CASE
        WHEN available_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN available_quantity <= minimum_quantity THEN 'LOW_STOCK'
        ELSE 'OK'
      END AS stock_status
    FROM raw_material_inventory
    WHERE  available_quantity = 0
      AND need_alert = true
  `;

  const res = await db.query(query);
  return res.rows;
};