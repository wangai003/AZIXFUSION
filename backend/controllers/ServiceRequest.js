const ServiceRequest = require('../models/ServiceRequest');
const Application = require('../models/Application');

exports.create = async (req, res) => {
    try {
        const created = await ServiceRequest.create(req.body);
        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating service request, please try again later' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.buyer) filter.buyer = req.query.buyer;
        const requests = await ServiceRequest.find(filter);
        res.status(200).json(requests);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching service requests, please try again later' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ServiceRequest.findById(id);
        res.status(200).json(request);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting service request details, please try again later' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ServiceRequest.updateById(id, req.body);
        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating service request, please try again later' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ServiceRequest.deleteById(id);
        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting service request, please try again later' });
    }
};

// Applications
exports.createApplication = async (req, res) => {
  try {
    const application = await Application.create({ ...req.body, provider: req.user._id });
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.serviceRequest) filter.serviceRequest = req.query.serviceRequest;
    if (req.query.provider) filter.provider = req.query.provider;
    const applications = await Application.find(filter).populate('provider').populate('serviceRequest');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    await Application.updateById(req.params.id, req.body);
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Not found' });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 