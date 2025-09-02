const Address = require('../models/Address');

exports.create = async (req, res) => {
    try {
        const created = await Address.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating address, please try again later' });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Address.find({ user: id });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching addresses, please try again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Address.updateById(id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating address, please try again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Address.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting address, please try again later' });
    }
};


