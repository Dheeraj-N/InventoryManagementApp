const db = require('../config/db');

function getDateFilter(range) {
  switch (range) {
    case 'last_week':
      return "AND updated_at >= NOW() - INTERVAL '7 days'";
    case 'last_month':
      return "AND updated_at >= NOW() - INTERVAL '30 days'";
    case 'last_6_months':
      return "AND updated_at >= NOW() - INTERVAL '180 days'";
    case 'last_year':
      return "AND updated_at >= NOW() - INTERVAL '365 days'";
    default:
      return "";
  }
}

exports.getTopSellingFilms = async () => {
  //const dateFilter = getDateFilter(range);
  const query = `
    SELECT 
      item_name,
      item_category,
      SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
      ) AS net_sold
    FROM inventory_movements
    WHERE film_or_raw='Film' 
    GROUP BY item_name, item_category
    HAVING SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
    ) > 0
    ORDER BY net_sold DESC
    ;
  `;
  const result = await db.query(query);
  return result.rows;
};

exports.getTopUsedRawMaterials = async () => {
 // const dateFilter = getDateFilter(range);
  const query = `
    SELECT 
      item_name,
      item_category,
      SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
      ) AS net_used
    FROM inventory_movements
    WHERE film_or_raw='Raw' 
    GROUP BY item_name, item_category
    HAVING SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
    ) > 0
    ORDER BY net_used DESC
    ;
  `;
  const result = await db.query(query, );
  return result.rows;
};
