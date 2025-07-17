const Film = require("../models/film.model");

exports.getAll = async (req, res, next) => {
  try {
    res.json(await Film.getAll());
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const f = await Film.getById(req.params.id);
    return f
      ? res.json(f)
      : res.status(404).json({ message: "Item Not Found" });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.name || !data.category) {
      return res.status(400).json({ message: "Name and category required" });
    }

    const created = await Film.create(data);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Film.update(req.params.id, req.body);
    return updated
      ? res.json(updated)
      : res.status(404).json({ message: "Not found" });
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Film.delete(req.params.id);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

exports.filterFilms = async (req, res, next) => {
  try {
    const result = await filmModel.filterFilms(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

