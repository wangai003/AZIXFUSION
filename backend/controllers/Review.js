const Review = require("../models/Review");
const { db, convertDoc } = require('../database/firebase');

exports.create = async (req, res) => {
    try {
        const created = await Review.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error posting review, please trying again later' });
    }
};

exports.getByProductId = async (req, res) => {
    try {
        const { id } = req.params;
        let skip = 0;
        let limit = 0;
        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }
        const totalDocs = await Review.countDocuments({ product: id });
        const result = await Review.find({ product: id }, {}, limit, skip);
        res.set("X-total-Count", totalDocs);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting reviews for this product, please try again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Review.updateById(id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating review, please try again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Review.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting review, please try again later' });
    }
};

exports.getByServiceId = async (req, res) => {
    try {
        const { id } = req.params;
        let query = db.collection('reviews').where('service', '==', id);
        const snapshot = await query.get();
        const result = snapshot.docs.map(convertDoc);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting reviews for this service, please try again later' });
    }
};

exports.getByRevieweeId = async (req, res) => {
    try {
        const { id } = req.params;
        let skip = 0;
        let limit = 0;
        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }
        const totalDocs = await Review.countDocuments({ reviewee: id });
        const result = await Review.find({ reviewee: id }, {}, limit, skip);
        res.set("X-total-Count", totalDocs);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting reviews for this user, please try again later' });
    }
};