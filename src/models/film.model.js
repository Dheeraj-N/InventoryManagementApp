const db = require("../config/db");

exports.getAll = async () => {
  const res = await db.query(
    "SELECT film_id, name, category, available_quantity, minimum_quantity, description, created_at, updated_at FROM film_inventory ORDER BY film_id",
  );
  return res.rows;
};

exports.getById = async (id) => {
  const res = await db.query(
    "SELECT film_id, name, category, available_quantity, minimum_quantity, description, created_at, updated_at FROM film_inventory WHERE film_id = $1",
    [id],
  );
  return res.rows[0];
};

exports.create = async (data) => {
  const { name, category, available_quantity, minimum_quantity, description } =
    data;
  const res = await db.query(
    `INSERT INTO film_inventory (name, category, available_quantity, minimum_quantity, description)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, category, available_quantity, minimum_quantity, description],
  );
  return res.rows[0];
};

exports.update = async (id, data) => {
  const { name, category, available_quantity, minimum_quantity, description, } =
    data;
  const res = await db.query(
    `UPDATE film_inventory SET
       name=$1, category=$2, available_quantity=$3,
       minimum_quantity=$4, description=$5, updated_at=NOW()
     WHERE film_id=$6 RETURNING *`,
    [name, category, available_quantity, minimum_quantity, description,id],
  );
  return res.rows[0];
};

exports.delete = async (id) => {
  try {
    const res = await db.query(
      "DELETE FROM film_inventory WHERE film_id = $1",
      [id],
    );

    if (res.rowCount === 0) {
      const error = new Error(`Film with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    return { message: "Film deleted successfully." };
  } catch (err) {
    // Re-throw with HTTP status if not already set
    if (!err.status) {
      err.status = 500;
      err.message = "Internal Server Error while deleting film";
    }
    throw err;
  }
};


exports.filterFilms = async (filters) => {
  const conditions = [];
  const values = [];
  let i = 1;

  // Dynamic filters
  if (filters.name) {
    conditions.push(`name ILIKE $${i++}`);
    values.push(`%${filters.name}%`);
  }

  if (filters.category) {
    conditions.push(`category = $${i++}`);
    values.push(filters.category);
  }

  if (filters.min_qty) {
    conditions.push(`available_quantity >= $${i++}`);
    values.push(filters.min_qty);
  }

  if (filters.max_qty) {
    conditions.push(`available_quantity <= $${i++}`);
    values.push(filters.max_qty);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Pagination
  const limit = parseInt(filters.limit) || 10;
  const page = parseInt(filters.page) || 1;
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) FROM film_inventory ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  const query = `
    SELECT film_id, name, category, available_quantity, minimum_quantity, description, created_at, updated_at FROM film_inventory
    ${whereClause}
    ORDER BY film_id DESC
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
