const model = require("../models/movement.model");

exports.getAll = async (req, res, next) => {
  try {
    const items = await model.getAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await model.getById(req.params.id);
    if (!item) return res.status(404).json({ message: "Movement not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const created = await model.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await model.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await model.delete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.filterMovements = async (req, res, next) => {
  try {
    const result = await movementModel.filterMovements(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};