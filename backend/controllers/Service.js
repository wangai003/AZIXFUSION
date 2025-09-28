const { db, convertDoc } = require('../database/firebase');

const SERVICES_COLLECTION = 'services';

exports.create = async (req, res) => {
    try {
        console.log('Enhanced service creation request received:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });

        const data = req.body;
        
        // Enhanced validation for required fields
        if (!data.title || !data.description || !data.category || !data.subcategory || !data.provider) {
            console.log('Missing required fields:', { 
                title: !!data.title, 
                description: !!data.description, 
                category: !!data.category, 
                subcategory: !!data.subcategory,
                provider: !!data.provider 
            });
            return res.status(400).json({ 
                message: 'Missing required fields: title, description, category, subcategory, and provider are required' 
            });
        }

        // Validate packages structure
        if (!data.packages || !Array.isArray(data.packages) || data.packages.length === 0) {
            return res.status(400).json({ 
                message: 'At least one service package is required' 
            });
        }

        // Validate packages have required fields
        for (let i = 0; i < data.packages.length; i++) {
            const pkg = data.packages[i];
            if (!pkg.name || !pkg.price || !pkg.description || !pkg.deliveryTime) {
                return res.status(400).json({ 
                    message: `Package ${i + 1} is missing required fields: name, price, description, or delivery time` 
                });
            }
        }

        // Validate requirements structure
        if (!data.requirements || !Array.isArray(data.requirements) || data.requirements.length === 0) {
            return res.status(400).json({ 
                message: 'At least one client requirement is required' 
            });
        }

        // Add enhanced metadata
        const serviceData = {
            ...data,
            // Basic service info
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category.trim(),
            subcategory: data.subcategory.trim(),
            
            // Enhanced fields
            pricingModel: data.pricingModel || 'fixed',
            serviceLevel: data.serviceLevel || 'standard',
            tags: Array.isArray(data.tags) ? data.tags : [],
            seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords : [],
            
            // Packages and requirements
            packages: data.packages.map(pkg => ({
                ...pkg,
                name: pkg.name.trim(),
                description: pkg.description.trim(),
                price: parseFloat(pkg.price) || 0,
                deliveryTime: parseInt(pkg.deliveryTime) || 1,
                revisions: parseInt(pkg.revisions) || 0,
                features: Array.isArray(pkg.features) ? pkg.features.filter(f => f.trim()) : [],
                isPopular: !!pkg.isPopular,
                isRecommended: !!pkg.isRecommended
            })),
            
            requirements: data.requirements.map(req => ({
                ...req,
                question: req.question.trim(),
                description: req.description?.trim() || '',
                type: req.type || 'text',
                required: !!req.required,
                placeholder: req.placeholder?.trim() || '',
                options: Array.isArray(req.options) ? req.options.filter(o => o.trim()) : [],
                validation: req.validation?.trim() || ''
            })),
            
            // FAQ and media
            faq: Array.isArray(data.faq) ? data.faq.filter(item => 
                item.question?.trim() && item.answer?.trim()
            ).map(item => ({
                ...item,
                question: item.question.trim(),
                answer: item.answer.trim(),
                category: item.category || 'general'
            })) : [],
            
            media: Array.isArray(data.media) ? data.media.map(item => ({
                ...item,
                title: item.title?.trim() || '',
                description: item.description?.trim() || '',
                altText: item.altText?.trim() || '',
                type: item.type || 'image',
                isPortfolio: !!item.isPortfolio,
                isFeatured: !!item.isFeatured,
                order: parseInt(item.order) || 0
            })) : [],
            
            portfolio: Array.isArray(data.portfolio) ? data.portfolio.map(item => ({
                ...item,
                title: item.title?.trim() || '',
                description: item.description?.trim() || '',
                category: item.category?.trim() || '',
                tags: Array.isArray(item.tags) ? item.tags.filter(t => t.trim()) : [],
                client: item.client?.trim() || '',
                completionDate: item.completionDate || '',
                isPublic: !!item.isPublic
            })) : [],
            
            // Service settings
            isActive: data.isActive !== undefined ? data.isActive : true,
            isFeatured: !!data.isFeatured,
            isUrgent: !!data.isUrgent,
            hasExpressDelivery: !!data.hasExpressDelivery,
            expressDeliveryFee: parseFloat(data.expressDeliveryFee) || 0,
            expressDeliveryTime: parseInt(data.expressDeliveryTime) || 1,
            
            // Policies
            cancellationPolicy: data.cancellationPolicy || 'flexible',
            refundPolicy: data.refundPolicy || 'standard',
            
            // SEO fields
            seoTitle: data.seoTitle?.trim() || data.title.trim(),
            seoDescription: data.seoDescription?.trim() || data.description.substring(0, 160),
            
            // Timestamps
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            
            // Provider info
            provider: data.provider,
            providerName: data.providerName || 'Unknown Provider'
        };

        console.log('Creating enhanced service with data:', serviceData);

        const docRef = await db.collection(SERVICES_COLLECTION).add(serviceData);
        const doc = await docRef.get();
        
        const createdService = convertDoc(doc);
        console.log('Enhanced service created successfully:', createdService);
        
        res.status(201).json(createdService);
    } catch (error) {
        console.error('Error creating enhanced service:', error);
        return res.status(500).json({ 
            message: 'Error creating service, please try again later',
            error: error.message 
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        console.log('Fetching all services from services collection');

        // Simple query - just get all documents from services collection
        const snapshot = await db.collection(SERVICES_COLLECTION).get();
        const services = snapshot.docs.map(convertDoc);

        console.log(`Found ${services.length} services in services collection`);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            message: 'Error fetching services, please try again later',
            error: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching enhanced service by ID:', id);
        
        const doc = await db.collection(SERVICES_COLLECTION).doc(id).get();
        if (!doc.exists) {
            console.log('Service not found:', id);
            return res.status(404).json({ message: 'Service not found' });
        }
        
        const service = convertDoc(doc);
        console.log('Enhanced service found:', service);
        res.status(200).json(service);
    } catch (error) {
        console.error('Error getting enhanced service by ID:', error);
        res.status(500).json({ 
            message: 'Error getting service details, please try again later',
            error: error.message 
        });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating enhanced service:', id, 'with data:', req.body);
        
        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        // Validate update data
        if (updateData.packages && Array.isArray(updateData.packages)) {
            for (let i = 0; i < updateData.packages.length; i++) {
                const pkg = updateData.packages[i];
                if (!pkg.name || !pkg.price || !pkg.description || !pkg.deliveryTime) {
                    return res.status(400).json({ 
                        message: `Package ${i + 1} is missing required fields` 
                    });
                }
            }
        }
        
        if (updateData.requirements && Array.isArray(updateData.requirements)) {
            for (let i = 0; i < updateData.requirements.length; i++) {
                const req = updateData.requirements[i];
                if (!req.question) {
                    return res.status(400).json({ 
                        message: `Requirement ${i + 1} is missing question field` 
                    });
                }
            }
        }
        
        await db.collection(SERVICES_COLLECTION).doc(id).update(updateData);
        const updatedDoc = await db.collection(SERVICES_COLLECTION).doc(id).get();
        
        const updatedService = convertDoc(updatedDoc);
        console.log('Enhanced service updated successfully:', updatedService);
        
        res.status(200).json(updatedService);
    } catch (error) {
        console.error('Error updating enhanced service:', error);
        res.status(500).json({ 
            message: 'Error updating service, please try again later',
            error: error.message 
        });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting enhanced service:', id);
        
        await db.collection(SERVICES_COLLECTION).doc(id).delete();
        console.log('Enhanced service deleted successfully:', id);
        
        res.status(200).json({ _id: id, deleted: true });
    } catch (error) {
        console.error('Error deleting enhanced service:', error);
        res.status(500).json({ 
            message: 'Error deleting service, please try again later',
            error: error.message 
        });
    }
};

// New method to get services by category with enhanced filtering
exports.getByCategory = async (req, res) => {
    try {
        const { category, subcategory } = req.params;
        console.log('Fetching services by category:', category, subcategory);
        
        let query = db.collection(SERVICES_COLLECTION)
            .where('category', '==', category)
            .where('isActive', '==', true);
            
        if (subcategory) {
            query = query.where('subcategory', '==', subcategory);
        }
        
        const snapshot = await query.get();
        const services = snapshot.docs.map(convertDoc);
        
        console.log(`Found ${services.length} services in category ${category}${subcategory ? ` > ${subcategory}` : ''}`);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services by category:', error);
        res.status(500).json({ 
            message: 'Error fetching services by category, please try again later',
            error: error.message 
        });
    }
};

// New method to get featured services
exports.getFeatured = async (req, res) => {
    try {
        console.log('Fetching featured services');
        
        const snapshot = await db.collection(SERVICES_COLLECTION)
            .where('isFeatured', '==', true)
            .where('isActive', '==', true)
            .limit(20)
            .get();
            
        const services = snapshot.docs.map(convertDoc);
        
        console.log(`Found ${services.length} featured services`);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching featured services:', error);
        res.status(500).json({ 
            message: 'Error fetching featured services, please try again later',
            error: error.message 
        });
    }
};

// New method to search services with enhanced criteria
exports.search = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, serviceLevel, pricingModel } = req.query;
        console.log('Searching services with criteria:', req.query);
        
        let query = db.collection(SERVICES_COLLECTION).where('isActive', '==', true);
        
        // Apply filters
        if (category) query = query.where('category', '==', category);
        if (serviceLevel) query = query.where('serviceLevel', '==', serviceLevel);
        if (pricingModel) query = query.where('pricingModel', '==', pricingModel);
        
        const snapshot = await query.get();
        let services = snapshot.docs.map(convertDoc);
        
        // Apply text search if query provided
        if (q) {
            const searchTerm = q.toLowerCase();
            services = services.filter(service => 
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply price filtering
        if (minPrice || maxPrice) {
            services = services.filter(service => {
                const minPackagePrice = Math.min(...service.packages.map(p => p.price));
                if (minPrice && minPackagePrice < parseFloat(minPrice)) return false;
                if (maxPrice && minPackagePrice > parseFloat(maxPrice)) return false;
                return true;
            });
        }
        
        console.log(`Search returned ${services.length} services`);
        res.status(200).json(services);
    } catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({ 
            message: 'Error searching services, please try again later',
            error: error.message 
        });
    }
}; 