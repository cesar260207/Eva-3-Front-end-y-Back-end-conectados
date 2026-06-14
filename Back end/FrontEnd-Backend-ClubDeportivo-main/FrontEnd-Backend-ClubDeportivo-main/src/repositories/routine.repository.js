const Routine = require('../models/Routine');

const findAll = async () => {
    return await Routine.findAll();
};

const create = async (data) => {
    return await Routine.create(data);
};

const update = async (id, data) => {
    return await Routine.update(data, { where: { id } });
};

const remove = async (id) => {
    return await Routine.destroy({ where: { id } });
};

module.exports = { findAll, create, update, remove };