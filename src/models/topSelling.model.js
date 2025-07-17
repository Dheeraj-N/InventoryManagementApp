const db = require('../config/db');

function getDateFilter(range) {
  switch (range) {
    case 'last_week':
      return "AND created_at >= NOW() - INTERVAL '7 days'";
    case 'last_month':
      return "AND created_at >= NOW() - INTERVAL '30 days'";
    case 'last_6_months':
      return "AND created_at >= NOW() - INTERVAL '180 days'";
    case 'last_year':
      return "AND created_at >= NOW() - INTERVAL '365 days'";
    default:
      return "";
  }
}

exports.getTopSellingFilms = async (limit, offset, range) => {
  const dateFilter = getDateFilter(range);
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
    WHERE film_or_raw='FILM' ${dateFilter}
    GROUP BY item_name, item_category
    HAVING SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
    ) > 0
    ORDER BY net_sold DESC
    LIMIT $1 OFFSET $2;
  `;
  const result = await db.query(query, [limit, offset]);
  return result.rows;
};

exports.getTopUsedRawMaterials = async (limit, offset, range) => {
  const dateFilter = getDateFilter(range);
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
    WHERE film_or_raw='RAW' ${dateFilter}
    GROUP BY item_name, item_category
    HAVING SUM(
        CASE 
          WHEN type_of_movement = 'OUT' THEN rented_quantity
          WHEN type_of_movement = 'IN' THEN -returned_quantity
          ELSE 0
        END
    ) > 0
    ORDER BY net_used DESC
    LIMIT $1 OFFSET $2;
  `;
  const result = await db.query(query, [limit, offset]);
  return result.rows;
};
