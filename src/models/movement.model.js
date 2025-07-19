const db = require("../config/db");

const toIntOrNull = (value) => {
    const n = parseInt(value);
    return isNaN(n) ? null : n;
  };

  const cleanDate = (val) => {
     return val && val.trim() !== '' ? val : null;
  };

 const validateItemExists = async (film_or_raw, item_name, item_category) => {
  const isFilm = film_or_raw.toUpperCase() === "FILM";
  const table = isFilm ? "film_inventory" : "raw_material_inventory";

  const res = await db.query(
    `SELECT 1 FROM ${table} WHERE name = $1 AND category = $2`,
    [item_name, item_category]
  );

  if (res.rowCount === 0) {
    throw new Error(`${table} item not found for ${item_name} (${item_category})`);
  }
};

const checkStockBeforeMovement = async (film_or_raw, item_name, item_category, rented_quantity, type_of_movement) => {
  const isFilm = film_or_raw.toUpperCase() === "FILM";
  const table = isFilm ? "film_inventory" : "raw_material_inventory";

  // Only check stock for OUT movements
  if (type_of_movement.toUpperCase().startsWith("OUT")) {
    const res = await db.query(
      `SELECT available_quantity FROM ${table} WHERE name = $1 AND category = $2`,
      [item_name, item_category]
    );

    if (res.rows.length === 0) {
      throw new Error(`${table} item not found for ${item_name} (${item_category})`);
    }

    const availableQty = res.rows[0].available_quantity;
    const neededQty = parseInt(rented_quantity) || 0;

    if (neededQty > availableQty) {
      throw new Error(
        `Not enough stock: Available = ${availableQty}, Requested = ${neededQty}`
      );
    }
  }
};



const adjustInventory = async (
  newMovement,
  prevMovement = null,
  isReverse = false,
) => {
  const {
    film_or_raw,
    item_name,
    item_category,
    rented_quantity = 0,
    returned_quantity = 0,
    type_of_movement,
  } = newMovement;

  const rentedQty = parseInt(rented_quantity) || 0;
  const returnedQty = parseInt(returned_quantity) || 0;

  const isFilm = film_or_raw.toUpperCase() === "FILM";
  const table = isFilm ? "film_inventory" : "raw_material_inventory";
  const isIn = type_of_movement.toUpperCase().startsWith("IN");

  let quantityDelta;

  if (isReverse) {
    // Reverse the original movement
    quantityDelta = isIn ? -(returnedQty || 0) : rentedQty || 0;
  } else if (prevMovement) {
    const prevQty = isIn
      ? parseInt(prevMovement.returned_quantity) || 0
      : parseInt(prevMovement.rented_quantity) || 0;
    const newQty = isIn ? returnedQty || 0 : rentedQty || 0;
    quantityDelta = isIn ? newQty - prevQty : prevQty - newQty;
  } else {
    quantityDelta = isIn ? returnedQty || 0 : -(rentedQty || 0);
  }

  const inventoryRes = await db.query(
    `SELECT available_quantity FROM ${table} WHERE name = $1 AND category = $2`,
    [item_name, item_category],
  );

  if (inventoryRes.rows.length === 0) {
    throw new Error(
      `${table} item not found for ${item_name} (${item_category})`,
    );
  }

  const currentQty = inventoryRes.rows[0].available_quantity;
  const updatedQty = currentQty + quantityDelta;

  if (updatedQty < 0) {
    throw new Error(
      `Inventory underflow: trying to apply delta ${quantityDelta}, only ${currentQty} available.`,
    );
  }

  await db.query(
    `UPDATE ${table}
       SET available_quantity = $1,
           updated_at = NOW()
       WHERE name = $2 AND category = $3`,
    [updatedQty, item_name, item_category],
  );
};

exports.adjustInventory = adjustInventory;
//module.exports = adjustInventory;

exports.getAll = async () => {
  const res = await db.query(
    "SELECT movement_id, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,job_card_number ,measured_unit ,description ,created_at ,updated_at  FROM inventory_movements ORDER BY movement_id",
  );
  return res.rows;
};

exports.getById = async (id) => {
  const res = await db.query(
    "SELECT movement_id, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,job_card_number ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements WHERE movement_id = $1",
    [id],
  );
  return res.rows[0];
};

exports.create = async (data) => {
  const {
    rented_person_name,
    film_or_raw,
    item_name,
    item_category,
    rented_quantity,
    rented_date,
    returned_quantity,
    returned_date,
    job_card_number,
    measured_unit,
    description,
    type_of_movement,
  } = data;

  await validateItemExists(film_or_raw, item_name, item_category);
   await checkStockBeforeMovement(film_or_raw, item_name, item_category, rented_quantity, type_of_movement);

  const res = await db.query(
    `INSERT INTO inventory_movements (
      rented_person_name, film_or_raw, item_name, item_category,
      rented_quantity, rented_date, returned_quantity, returned_date,
      job_card_number, measured_unit, description, type_of_movement
    ) VALUES (
      $1,$2,$3,UPPER($4),$5,$6,$7,$8,$9,$10,$11,$12
    ) RETURNING *`,
    [
      rented_person_name,
      film_or_raw,
      item_name,
      item_category,
      toIntOrNull(rented_quantity),
      cleanDate(rented_date),
      toIntOrNull(returned_quantity),
      cleanDate(returned_date),
      job_card_number,
      measured_unit,
      description,
      type_of_movement,
    ],
  );

  await adjustInventory(data); // inventory logic
  return res.rows[0];
};

exports.update = async (id, data) => {
  // Step 1: Fetch previous movement
  const oldRes = await db.query(
    "SELECT * FROM inventory_movements WHERE movement_id = $1",
    [id],
  );
  const previousMovement = oldRes.rows[0];
  if (!previousMovement) throw new Error("Movement not found");

  //  Step 2: Prevent change to item_name or category
  if (
    data.item_name !== previousMovement.item_name ||
    data.item_category !== previousMovement.item_category ||
    data.type_of_movement !== previousMovement.type_of_movement 
  ) {
    const err = new Error("You cannot change item_name or item_category after creation.");
    err.status = 400;
    throw err;
  }

  // Step 2: Update movement
  const {
    rented_person_name,
    film_or_raw,
    rented_quantity,
    rented_date,
    returned_quantity,
    returned_date,
    job_card_number,
    measured_unit,
    description,
    type_of_movement,
  } = data;

  //await validateItemExists(film_or_raw, item_name, item_category);

  if (type_of_movement.toUpperCase().startsWith("OUT")) {
    const isFilm = film_or_raw.toUpperCase() === "FILM";
    const table = isFilm ? "film_inventory" : "raw_material_inventory";

    const res = await db.query(
      `SELECT available_quantity FROM ${table} WHERE name=$1 AND category=$2`,
      [previousMovement.item_name, previousMovement.item_category]
    );

    if (res.rows.length === 0) {
      throw new Error(`${table} item not found for ${previousMovement.item_name}`);
    }

    const availableQty = res.rows[0].available_quantity;
    const oldQty = parseInt(previousMovement.rented_quantity) || 0;
    const newQty = parseInt(rented_quantity) || 0;

    // effectively, after updating, we need extra (new - old)
    const extraNeeded = newQty - oldQty;

    if (extraNeeded > availableQty) {
      throw new Error(
        `Not enough stock: Available=${availableQty}, Extra Needed=${extraNeeded}`
      );
    }
  }


  const res = await db.query(
    `UPDATE inventory_movements SET
        rented_person_name=$1, film_or_raw=$2,
      rented_quantity=$3, rented_date=$4,
      returned_quantity=$5, returned_date=$6,
      job_card_number=$7, measured_unit=$8, description=$9,
      type_of_movement=$10, updated_at=NOW()
    WHERE movement_id=$11 RETURNING *`,
    [
      rented_person_name,
      film_or_raw,
      toIntOrNull(rented_quantity),
      cleanDate(rented_date),
      toIntOrNull(returned_quantity),
      cleanDate(returned_date),
      job_card_number,
      measured_unit,
      description,
      type_of_movement,
      id,
    ],
  );

  // Step 3: Adjust inventory (undo old + apply new)
  await adjustInventory(data, previousMovement);

  return res.rows[0];
};

exports.delete = async (id) => {
  try {
    // 1. Get the movement before deleting
    const res = await db.query(
      "SELECT * FROM inventory_movements WHERE movement_id = $1",
      [id]
    );
    const movement = res.rows[0];

    if (!movement) {
      const error = new Error(`Movement with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    // 2. Try reversing inventory adjustment
    try {
      await adjustInventory(movement, null, true); // reverse=true
    } catch (inventoryErr) {
      console.warn(
        `⚠️ Skipping inventory adjustment because item not found:`,
        inventoryErr.message
      );
      // We silently skip adjustment if item missing
    }

    // 3. Delete the movement anyway
    await db.query("DELETE FROM inventory_movements WHERE movement_id = $1", [
      id,
    ]);

    return {
      message:
        "Movement deleted. Inventory adjusted if item exists, otherwise skipped.",
    };
  } catch (err) {
    if (!err.status) {
      err.status = 500;
      err.message = err.message || "Failed to delete movement.";
    }
    throw err;
  }
};

exports.filterMovements = async (filters) => {
  const conditions = [];
  const values = [];
  let i = 1;

  // Dynamic WHERE clauses
  if (filters.film_or_raw) {
    conditions.push(`film_or_raw = $${i++}`);
    values.push(filters.film_or_raw);
  }

  if (filters.type_of_movement) {
    conditions.push(`type_of_movement = $${i++}`);
    values.push(filters.type_of_movement);
  }

  if (filters.job_card_number) {
    conditions.push(`job_card_number = $${i++}`);
    values.push(filters.job_card_number);
  }

  if (filters.item_name) {
    conditions.push(`item_name ILIKE $${i++}`);
    values.push(`%${filters.item_name}%`);
  }

  if (filters.item_category) {
    conditions.push(`item_category = $${i++}`);
    values.push(filters.item_category);
  }


  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Pagination
  const limit = parseInt(filters.limit) || 10;
  const page = parseInt(filters.page) || 1;
  const offset = (page - 1) * limit;

  // Count total for pagination
  const countQuery = `SELECT COUNT(*) FROM inventory_movements ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  // Final paginated query
  const query = `
    SELECT movement_id, type_of_movement ,rented_person_name ,film_or_raw ,item_name ,item_category ,rented_quantity ,rented_date, returned_quantity ,returned_date ,job_card_number ,measured_unit ,description ,created_at ,updated_at FROM inventory_movements
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
