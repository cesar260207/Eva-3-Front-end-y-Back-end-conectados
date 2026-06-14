const routineService = require('../services/routine.service');

const getAll = async (req, res) => {
  const routines = await routineService.getAllRoutines();
  res.status(200).json({ data: routines });
};

const create = async (req, res) => {
  const newRoutine = await routineService.createRoutine(req.body);
  res.status(201).json({ data: newRoutine });
};

const update = async (req, res) => {
  await routineService.updateRoutine(req.params.id, req.body);
  res.status(200).json({ message: "Rutina actualizada" });
};

const remove = async (req, res) => {
  await routineService.deleteRoutine(req.params.id);
  res.status(200).json({ message: "Rutina eliminada" });
};

module.exports = { getAll, create, update, remove };