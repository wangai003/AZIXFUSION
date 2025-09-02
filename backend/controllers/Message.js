const Message = require('../models/Message');

exports.create = async (req, res) => {
    try {
        const created = await Message.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending message, please try again later' });
    }
};

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Message.find({ $or: [{ sender: id }, { receiver: id }] });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching messages, please try again later' });
    }
};

exports.getByOrderId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Message.find({ order: id });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching messages for order, please try again later' });
    }
};

exports.getByServiceId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Message.find({ service: id });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching messages for service, please try again later' });
    }
}; 