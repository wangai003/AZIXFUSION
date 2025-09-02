const Brand = require('../models/Brand');

exports.create = async (req, res) => {
    try {
        const created = await Brand.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating brand, please try again later' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching brands, please try again later' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findById(id);
        res.status(200).json(brand);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting brand details, please try again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Brand.updateById(id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating brand, please try again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Brand.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting brand, please try again later' });
    }
};