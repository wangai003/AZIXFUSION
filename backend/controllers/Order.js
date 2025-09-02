const { db, convertDoc } = require('../database/firebase');
const Order = require("../models/Order");

const ORDERS_COLLECTION = 'orders';

exports.create = async (req, res) => {
    try {
        const data = req.body;
        const docRef = await db.collection(ORDERS_COLLECTION).add(data);
        const doc = await docRef.get();
        res.status(201).json(convertDoc(doc));
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating an order, please try again later' });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await Order.find({ user: id });
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching orders, please trying again later' });
    }
};

exports.getAll = async (req, res) => {
    try {
        let skip = 0;
        let limit = 0;
        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }
        let filter = {};
        if (req.query.seller) {
            filter['sellers'] = req.query.seller;
        }
        if (req.query.buyer) {
            filter['user'] = req.query.buyer;
        }
        const totalDocs = await Order.countDocuments(filter);
        const results = await Order.find(filter, {}, limit, skip);
        res.header("X-Total-Count", totalDocs);
        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching orders, please try again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Order.updateById(id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating order, please try again later' });
    }
};
