const model = require("../models/rawMaterial.model");

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
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.name || !data.category) {
      return res.status(400).json({ message: "Name and category required" });
    }
    const newItem = await model.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await model.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Item not found" });
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

exports.filterRawMaterials = async (req, res, next) => {
  try {
    const result = await rawMaterialModel.filterRawMaterials(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
