const routineRepository = require('../repositories/routine.repository');

const getAllRoutines = async () => {
    return await routineRepository.findAll();
};

const createRoutine = async (data) => {
    return await routineRepository.create(data);
};

const updateRoutine = async (id, data) => {
    return await routineRepository.update(id, data);
};

const deleteRoutine = async (id) => {
    return await routineRepository.remove(id);
};

module.exports = { getAllRoutines, createRoutine, updateRoutine, deleteRoutine };