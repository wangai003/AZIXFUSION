const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Service = require("../models/Service");
const Review = require("../models/Review");
const ServiceRequest = require("../models/ServiceRequest");
const { db, convertDoc } = require('../database/firebase');
const { sendMail, sellerApplicationReceivedTemplate, sellerApplicationApprovedTemplate, sellerApplicationRejectedTemplate } = require('../utils/Emails');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sanitizeUser } = require('../utils/SanitizeUser');
const { generateToken } = require('../utils/GenerateToken');

exports.checkAuth = async (req, res) => {
  try {
    if (req.user) {
      // Get the user ID from Firebase auth (could be user_id or uid)
      const userId = req.user?.user_id || req.user?.uid || req.user?._id;
      
      if (!userId) {
        return res.sendStatus(401);
      }
      
      const userRef = db.collection('users').doc(userId);
      let userDoc = await userRef.get();
      
      let user;
      if (!userDoc.exists) {
        console.log('User document not found in checkAuth, creating new user document for ID:', userId);
        
        // Create a new user document with the data from Firebase auth
        const newUserData = {
          email: req.user.email,
          name: req.user.name || '',
          roles: ['user'],
          active: true,
          createdAt: new Date().toISOString(),
          // Add any other fields you want to store
        };
        
        await userRef.set(newUserData);
        console.log('New user document created in checkAuth');
        user = newUserData;
      } else {
        user = userDoc.data();
      }
      
      user._id = userDoc.id;
      console.log('checkAuth - User data before sanitize:', user);
      const sanitizedUser = sanitizeUser(user);
      console.log('checkAuth - Sanitized user data:', sanitizedUser);
      return res.status(200).json(sanitizedUser);
    }
    res.sendStatus(401);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });
    const user = userDoc.data();
    user._id = userDoc.id;
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error getting your details, please try again later' });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['name', 'email', 'roles', 'active'];
    const updateData = {};
    for (const key of allowedFields) {
      if (key in req.body) updateData[key] = req.body[key];
    }
    const userRef = db.collection('users').doc(id);
    await userRef.update(updateData);
    const updatedDoc = await userRef.get();
    const updated = updatedDoc.data();
    if (updated) delete updated.password;
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating user, please try again later' });
  }
};

exports.becomeSeller = async (req, res) => {
  try {
    console.log('becomeSeller called with:', { 
      body: req.body, 
      user: req.user,
      userId: req.user?._id,
      firebaseUserId: req.user?.user_id || req.user?.uid
    });

    // Get the user ID from Firebase auth (could be user_id or uid)
    const userId = req.user?.user_id || req.user?.uid || req.user?._id;
    
    if (!req.user || !userId) {
      console.log('No user or user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();
    
    let user;
    if (!userDoc.exists) {
      console.log('User document not found, creating new user document for ID:', userId);
      
      // Create a new user document with the data from Firebase auth
      const newUserData = {
        email: req.user.email,
        name: req.user.name || '',
        roles: ['user'],
        active: true,
        createdAt: new Date().toISOString(),
        // Add any other fields you want to store
      };
      
      await userRef.set(newUserData);
      console.log('New user document created');
      user = newUserData;
    } else {
      user = userDoc.data();
      console.log('Found existing user:', { email: user.email, roles: user.roles, sellerType: user.sellerType });
    }
    
    if (user.sellerType) {
      console.log('User already has seller type:', user.sellerType);
      return res.status(400).json({ error: 'Seller type already set and cannot be changed.' });
    }
    
    if (!req.body.sellerType) {
      console.log('No seller type provided in request body');
      return res.status(400).json({ error: 'Seller type is required.' });
    }

    // Get current roles and add appropriate role based on seller type
    const currentRoles = user.roles || ['user'];

    if (req.body.sellerType === 'exporter') {
      // For exporters, add both 'seller' and 'exporter' roles
      if (!currentRoles.includes('seller')) {
        currentRoles.push('seller');
      }
      if (!currentRoles.includes('exporter')) {
        currentRoles.push('exporter');
      }
    } else {
      // For regular sellers, add only 'seller' role
      if (!currentRoles.includes('seller')) {
        currentRoles.push('seller');
      }
    }

    // Accept all fields from the frontend form and automatically make them a seller
    const updateData = {
      sellerType: req.body.sellerType,
      roles: currentRoles,
      sellerVerificationStatus: 'pending', // New field for admin verification
      storeName: req.body.storeName || '',
      description: req.body.description || '',
      companyName: req.body.companyName || '',
      registrationNumber: req.body.registrationNumber || '',
      address: req.body.address || '',
      taxId: req.body.taxId || '',
      // Social media links (mandatory for sellers)
      socialMedia: {
        website: req.body.website || '',
        linkedin: req.body.linkedin || '',
        facebook: req.body.facebook || '',
        twitter: req.body.twitter || '',
        instagram: req.body.instagram || ''
      },

      // Export-specific information (for exporters only)
      ...(req.body.sellerType === 'exporter' && {
        exportDetails: {
          exportLicenseNumber: req.body.exportLicenseNumber,
          exportLicenseExpiry: req.body.exportLicenseExpiry,
          businessLicenseNumber: req.body.businessLicenseNumber,
          businessLicenseExpiry: req.body.businessLicenseExpiry,
          taxIdentificationNumber: req.body.taxIdentificationNumber,
          bankName: req.body.bankName,
          bankAccountNumber: req.body.bankAccountNumber,
          bankSwiftCode: req.body.bankSwiftCode,
          primaryExportMarkets: req.body.primaryExportMarkets || [],
          exportExperience: req.body.exportExperience,
          annualExportVolume: req.body.annualExportVolume,
          mainExportProducts: req.body.mainExportProducts,
          qualityCertifications: req.body.qualityCertifications || [],
          insuranceProvider: req.body.insuranceProvider,
          insurancePolicyNumber: req.body.insurancePolicyNumber,
          insuranceExpiry: req.body.insuranceExpiry,
          warehouseAddress: req.body.warehouseAddress,
          shippingMethods: req.body.shippingMethods || [],
          paymentTerms: req.body.paymentTerms || [],
          references: req.body.references || []
        }
      }),

      // logo: req.body.logo || null, // handle logo upload separately if needed
    };
    
    console.log('Updating user with data:', updateData);
    await userRef.update(updateData);
    console.log('User updated successfully');
    
    // Send welcome email to the new seller
    try {
      if (process.env.EMAIL && process.env.PASSWORD) {
        await sendMail(user.email, 'Welcome to MERN Marketplace!', sellerApplicationReceivedTemplate(user, req.body.sellerType));
        console.log('Welcome email sent successfully');
      } else {
        console.log('Email credentials not configured, skipping welcome email');
      }
    } catch (emailError) {
      console.log('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ success: true });
  } catch (err) {
    console.log('Error in becomeSeller:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.becomeVendor = async (req, res) => {
  try {
    const { sellerType } = req.body;
    if (!sellerType) return res.status(400).json({ error: 'Seller type is required.' });

    // For Firebase
    const user = await require('../models/User').findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.roles && user.roles.includes('seller')) {
      return res.status(400).json({ error: 'Already a vendor.' });
    }

    // Update user with new roles and seller type
    const updatedUser = await require('../models/User').updateById(req.user._id, {
      roles: [...(user.roles || []), 'seller'],
      sellerType: sellerType
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.becomeExperienceHost = async (req, res) => {
  try {
    console.log('becomeExperienceHost called with:', {
      body: req.body,
      user: req.user,
      userId: req.user?._id,
      firebaseUserId: req.user?.user_id || req.user?.uid
    });

    // Get the user ID from Firebase auth (could be user_id or uid)
    const userId = req.user?.user_id || req.user?.uid || req.user?._id;

    if (!req.user || !userId) {
      console.log('No user or user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();

    let user;
    if (!userDoc.exists) {
      console.log('User document not found, creating new user document for ID:', userId);

      // Create a new user document with the data from Firebase auth
      const newUserData = {
        email: req.user.email,
        name: req.user.name || '',
        roles: ['user'],
        active: true,
        createdAt: new Date().toISOString(),
        // Add any other fields you want to store
      };

      await userRef.set(newUserData);
      console.log('New user document created');
      user = newUserData;
    } else {
      user = userDoc.data();
      console.log('Found existing user:', { email: user.email, roles: user.roles, hostType: user.hostType });
    }

    if (user.hostType) {
      console.log('User already has host type:', user.hostType);
      return res.status(400).json({ error: 'Host type already set and cannot be changed.' });
    }

    // Get current roles and add host role if not already present
    const currentRoles = user.roles || ['user'];
    if (!currentRoles.includes('experience_host')) {
      currentRoles.push('experience_host');
    }

    // Accept all fields from the frontend form and automatically make them a host
    const updateData = {
      hostType: 'local_experience_host',
      roles: currentRoles,
      hostVerificationStatus: 'pending', // New field for admin verification
      hostProfile: {
        businessName: req.body.businessName || '',
        description: req.body.description || '',
        yearsOfExperience: req.body.yearsOfExperience || 0,
        specializations: req.body.specializations || [],
        languages: req.body.languages || ['English'],
        certifications: req.body.certifications || [],
        emergencyContact: req.body.emergencyContact || '',
        insuranceInfo: req.body.insuranceInfo || '',
        location: req.body.location || '',
        website: req.body.website || '',
        socialMedia: req.body.socialMedia || {}
      },
      // Store KYC/business registration details
      businessRegistration: {
        registrationNumber: req.body.registrationNumber || '',
        taxId: req.body.taxId || '',
        address: req.body.businessAddress || '',
        licenseType: req.body.licenseType || '',
        expiryDate: req.body.licenseExpiryDate || ''
      }
    };

    console.log('Updating user with host data:', updateData);
    await userRef.update(updateData);
    console.log('User updated successfully as experience host');

    // Send welcome email to the new host
    try {
      if (process.env.EMAIL && process.env.PASSWORD) {
        await sendMail(user.email, 'Welcome to AZIXFUSION as a Local Experience Host!', 'Congratulations! Your application to become a Local Experience Host has been received. Our team will review your application and verify your credentials within 2-3 business days. You will receive another email once your account is activated.');
        console.log('Welcome email sent successfully');
      } else {
        console.log('Email credentials not configured, skipping welcome email');
      }
    } catch (emailError) {
      console.log('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ success: true });
  } catch (err) {
    console.log('Error in becomeExperienceHost:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.applyExporter = async (req, res) => {
  try {
    console.log('applyExporter called with:', {
      body: req.body,
      user: req.user,
      userId: req.user?._id,
      firebaseUserId: req.user?.user_id || req.user?.uid
    });

    // Get the user ID from Firebase auth (could be user_id or uid)
    const userId = req.user?.user_id || req.user?.uid || req.user?._id;

    if (!req.user || !userId) {
      console.log('No user or user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();

    let user;
    if (!userDoc.exists) {
      console.log('User document not found, creating new user document for ID:', userId);

      // Create a new user document with the data from Firebase auth
      const newUserData = {
        email: req.user.email,
        name: req.user.name || '',
        roles: ['user'],
        active: true,
        createdAt: new Date().toISOString(),
        // Add any other fields you want to store
      };

      await userRef.set(newUserData);
      console.log('New user document created');
      user = newUserData;
    } else {
      user = userDoc.data();
      console.log('Found existing user:', { email: user.email, roles: user.roles, exporterType: user.exporterType });
    }

    if (user.exporterType) {
      console.log('User already has exporter type:', user.exporterType);
      return res.status(400).json({ error: 'Exporter type already set and cannot be changed.' });
    }

    // Get current roles and add exporter role if not already present
    const currentRoles = user.roles || ['user'];
    if (!currentRoles.includes('exporter')) {
      currentRoles.push('exporter');
    }

    // Accept all fields from the frontend form and automatically make them an exporter
    const updateData = {
      exporterType: 'african_export_vendor',
      roles: currentRoles,
      exporterVerificationStatus: 'pending', // New field for admin verification
      exporterProfile: {
        companyName: req.body.companyName || '',
        businessType: req.body.businessType || '',
        registrationNumber: req.body.registrationNumber || '',
        taxId: req.body.taxId || '',
        yearEstablished: req.body.yearEstablished || '',
        employeeCount: req.body.employeeCount || '',
        businessAddress: req.body.businessAddress || '',
        city: req.body.city || '',
        country: req.body.country || 'Kenya',
        postalCode: req.body.postalCode || '',
        businessPhone: req.body.businessPhone || '',
        businessEmail: req.body.businessEmail || '',
        exportExperience: req.body.exportExperience || '',
        mainMarkets: req.body.mainMarkets || [],
        exportCertifications: req.body.exportCertifications || [],
        annualExportValue: req.body.annualExportValue || '',
        primaryProducts: req.body.primaryProducts || '',
        website: req.body.website || '',
        linkedin: req.body.linkedin || '',
        facebook: req.body.facebook || '',
        twitter: req.body.twitter || '',
        instagram: req.body.instagram || '',
        businessDescription: req.body.businessDescription || '',
        exportStrategy: req.body.exportStrategy || '',
        references: req.body.references || ''
      }
    };

    console.log('Updating user with exporter data:', updateData);
    await userRef.update(updateData);
    console.log('User updated successfully as exporter');

    // Send welcome email to the new exporter
    try {
      if (process.env.EMAIL && process.env.PASSWORD) {
        await sendMail(user.email, 'Welcome to AZIXFUSION as an African Export Vendor!', 'Congratulations! Your application to become an African Export Vendor has been received. Our team will review your application and verify your credentials within 2-3 business days. You will receive another email once your account is activated.');
        console.log('Welcome email sent successfully');
      } else {
        console.log('Email credentials not configured, skipping welcome email');
      }
    } catch (emailError) {
      console.log('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ success: true });
  } catch (err) {
    console.log('Error in applyExporter:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getSellerDashboard = async (req, res) => {
  try {
    // Get the user ID from Firebase auth (could be user_id or uid)
    const userId = req.user?.user_id || req.user?.uid || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(403).json({ error: 'User not found' });
    const user = userDoc.data();
    
    // Check if user has seller role
    if (!user.roles || !user.roles.includes('seller')) {
      return res.status(403).json({ error: 'Not a seller' });
    }
    
    // You can add more Firestore queries here for products/services if needed
    res.json({
      totalSales: user.sellerProfile?.analytics?.totalSales || 0,
      totalEarnings: user.sellerProfile?.analytics?.totalEarnings || 0,
      activeProducts: user.activeProducts || 0,
      activeServices: user.activeServices || 0,
      kycStatus: user.sellerProfile?.kycStatus || null,
      verificationStatus: user.sellerVerificationStatus || 'pending'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminAnalytics = async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const totalUsers = usersSnap.size;
    let activeUsers = 0, sellers = 0, providers = 0, pendingVerification = 0, verifiedSellers = 0;
    usersSnap.forEach(doc => {
      const user = doc.data();
      if (user.active) activeUsers++;
      if (user.roles && user.roles.includes('seller')) {
        sellers++;
        if (user.sellerVerificationStatus === 'verified') {
          verifiedSellers++;
        } else if (user.sellerVerificationStatus === 'pending') {
          pendingVerification++;
        }
      }
      if (user.roles && user.roles.includes('service_provider')) providers++;
    });
    // Placeholder for other analytics
    res.json({
      totalUsers,
      activeUsers,
      sellers,
      providers,
      pendingVerification,
      verifiedSellers,
      totalOrders: 0,
      totalProducts: 0,
      totalServices: 0,
      flaggedItems: 0,
      salesVolumeChart: { labels: [], datasets: [] },
      orderTrendsChart: { labels: [], datasets: [] },
      topProductsChart: { labels: [], datasets: [] },
      topServicesChart: { labels: [], datasets: [] }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin approval/rejection logic (to be called from admin panel)
exports.approveSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        await userRef.update({ sellerVerificationStatus: 'verified' });
        const user = userDoc.data();
        await sendMail(user.email, 'Seller Application Approved', sellerApplicationApprovedTemplate(user));
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.rejectSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userRef = db.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        await userRef.update({ sellerVerificationStatus: 'rejected' });
        const user = userDoc.data();
        await sendMail(user.email, 'Seller Application Rejected', sellerApplicationRejectedTemplate(user, reason));
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.signup = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const existingUserSnap = await usersRef.where('email', '==', req.body.email).get();
    if (!existingUserSnap.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = {
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name || '',
      roles: ['user'],
      createdAt: new Date().toISOString(),
    };
    const userDoc = await usersRef.add(newUser);
    const userId = userDoc.id;
    const secureInfo = sanitizeUser({ ...newUser, _id: userId });
    const token = generateToken(secureInfo);
    res.cookie('token', token, {
      sameSite: process.env.PRODUCTION === 'true' ? 'None' : 'Lax',
      maxAge: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000)),
      httpOnly: true,
      secure: process.env.PRODUCTION === 'true',
    });
    res.status(201).json(secureInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error occurred during signup, please try again later' });
  }
};

exports.login = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const userSnap = await usersRef.where('email', '==', req.body.email).get();
    if (userSnap.empty) {
      res.clearCookie('token');
      return res.status(404).json({ message: 'Invalid Credentials' });
    }
    const userDoc = userSnap.docs[0];
    const user = userDoc.data();
    user._id = userDoc.id;
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      res.clearCookie('token');
      return res.status(404).json({ message: 'Invalid Credentials' });
    }
    const secureInfo = sanitizeUser(user);
    const token = generateToken(secureInfo);
    res.cookie('token', token, {
      sameSite: process.env.PRODUCTION === 'true' ? 'None' : 'Lax',
      maxAge: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000)),
      httpOnly: true,
      secure: process.env.PRODUCTION === 'true',
    });
    res.status(200).json(secureInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Some error occurred while logging in, please try again later' });
  }
};