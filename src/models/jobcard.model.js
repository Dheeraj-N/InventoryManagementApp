const db = require('../config/db');

// Get all unique job card numbers
exports.getAllJobCards = async () => {
  
  const res = await db.query(
    `SELECT movement_id, job_card_number, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements `
  );
  return res.rows;
};

// Get movements by job card number
exports.getMovementsByJobCard = async (jobCardNumber) => {
  const res = await db.query(
    `SELECT movement_id, job_card_number, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements WHERE job_card_number = $1`,
    [jobCardNumber]
  );
  return res.rows;
};

// Get sorted job cards with their movements
exports.getSortedJobCardsWithMovements = async (sort = 'asc') => {
  const order = sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const res = await db.query(
    `SELECT movement_id, job_card_number, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements ORDER BY job_card_number ${order}, movement_id DESC`
  );
  return res.rows;
};

exports.filterJobCards = async (filters) => {
  const conditions = [];
  const values = [];
  let i = 1;

  if (filters.job_card_number) {
    conditions.push(`job_card_number = $${i++}`);
    values.push(filters.job_card_number);
  }

  if (filters.film_or_raw) {
    conditions.push(`film_or_raw = $${i++}`);
    values.push(filters.film_or_raw);
  }

  if (filters.type_of_movement) {
    conditions.push(`type_of_movement = $${i++}`);
    values.push(filters.type_of_movement);
  }

  if (filters.item_name) {
    conditions.push(`item_name ILIKE $${i++}`);
    values.push(`%${filters.item_name}%`);
  }

  if (filters.item_category) {
    conditions.push(`item_category = $${i++}`);
    values.push(filters.item_category);
  }


  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Pagination
  const limit = parseInt(filters.limit) || 10;
  const page = parseInt(filters.page) || 1;
  const offset = (page - 1) * limit;

  // Total count
  const countQuery = `SELECT COUNT(*) FROM inventory_movements ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  const query = `
    SELECT movement_id, job_card_number, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements
    ${whereClause}
    ORDER BY movement_id DESC
    LIMIT $${i++} OFFSET $${i++}
  `;

  const result = await db.query(query, [...values, limit, offset]);

  return {
    data: result.rows,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit
    }
  };
};
