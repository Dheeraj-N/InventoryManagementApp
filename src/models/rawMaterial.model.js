const db = require("../config/db");

exports.getAll = async () => {
  const res = await db.query(
    "SELECT item_id, name, category, available_quantity, minimum_quantity,measured_unit,description, created_at, updated_at, need_alert FROM raw_material_inventory ORDER BY item_id",
  );
  return res.rows;
};

exports.getById = async (itemId) => {
  const res = await db.query(
    "SELECT item_id, name, category, available_quantity, minimum_quantity,measured_unit,description, created_at, updated_at, need_alert FROM raw_material_inventory WHERE item_id = $1",
    [itemId],
  );
  return res.rows[0];
};

exports.create = async (data) => {
  const {
    name,
    category,
    available_quantity,
    minimum_quantity,
    measured_unit,
    description,
    need_alert,
  } = data;
  const res = await db.query(
    `INSERT INTO raw_material_inventory
      (name, category, available_quantity, minimum_quantity, measured_unit, description, need_alert)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      name,
      category,
      available_quantity,
      minimum_quantity,
      measured_unit,
      description,
      need_alert,
    ],
  );
  return res.rows[0];
};

exports.update = async (itemId, data) => {
  const {
    name,
    category,
    available_quantity,
    minimum_quantity,
    measured_unit,
    description,
    need_alert,
  } = data;
  const res = await db.query(
    `UPDATE raw_material_inventory SET
      name=$1, category=$2, available_quantity=$3, minimum_quantity=$4,
      measured_unit=$5, description=$6, need_alert=$7, updated_at=NOW()
     WHERE item_id=$8 RETURNING *`,
    [
      name,
      category,
      available_quantity,
      minimum_quantity,
      measured_unit,
      description,
      need_alert,
      itemId,
    ],
  );
  return res.rows[0];
};

exports.delete = async (itemId) => {
  try {
    const res = await db.query(
      "DELETE FROM raw_material_inventory WHERE item_id = $1",
      [itemId],
    );

    if (res.rowCount === 0) {
      const error = new Error(`Raw material with ID ${itemId} not found.`);
      error.status = 404;
      throw error;
    }

    return { message: "Raw material deleted successfully." };
  } catch (err) {
    if (!err.status) {
      err.status = 500;
      err.message = "Failed to delete raw material.";
    }
    throw err; // Propagate to route handler
  }
};

exports.filterRawMaterials = async (filters) => {
  const conditions = [];
  const values = [];
  let i = 1;

  // Filters
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


  if (filters.need_alert !== undefined) {
    conditions.push(`need_alert = $${i++}`);
    values.push(filters.need_alert === 'true');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Pagination
  const limit = parseInt(filters.limit) || 10;
  const page = parseInt(filters.page) || 1;
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) FROM raw_material_inventory ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  const query = `
    SELECT item_id, name, category, available_quantity, minimum_quantity,measured_unit,description, created_at, updated_at, need_alert FROM raw_material_inventory
    ${whereClause}
    ORDER BY item_id DESC
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