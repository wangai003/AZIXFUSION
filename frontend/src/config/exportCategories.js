// Export categories and configurations for African Export Vendors

export const TARGET_MARKETS = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Canada',
  'Australia',
  'Japan',
  'China',
  'India',
  'South Africa',
  'Nigeria',
  'Ghana',
  'Kenya',
  'Tanzania',
  'Uganda',
  'Ethiopia',
  'Morocco',
  'Egypt',
  'Algeria',
  'Tunisia',
  'Other'
];

export const EXPORT_CERTIFICATIONS = [
  'ISO 9001',
  'ISO 14001',
  'HACCP',
  'Organic Certification',
  'Fair Trade',
  'Rainforest Alliance',
  'UTZ Certified',
  'GlobalGAP',
  'BRC Global Standard',
  'FSSC 22000',
  'Halal Certification',
  'Kosher Certification',
  'EU Organic',
  'USDA Organic',
  'Other'
];

export const SHIPPING_TERMS = [
  'FOB (Free on Board)',
  'CIF (Cost, Insurance and Freight)',
  'DDP (Delivered Duty Paid)',
  'EXW (Ex Works)',
  'FCA (Free Carrier)',
  'CPT (Carriage Paid To)',
  'CIP (Carriage and Insurance Paid to)',
  'DAT (Delivered at Terminal)',
  'DAP (Delivered at Place)',
  'DDU (Delivered Duty Unpaid)'
];

export const PAYMENT_TERMS = [
  'Cash in Advance',
  'Letter of Credit (LC)',
  'Documentary Collection',
  'Open Account',
  'Cash Against Documents (CAD)',
  'Cash on Delivery (COD)',
  'Bank Transfer',
  'PayPal',
  'Western Union',
  'Other'
];

export const EXPORT_PRODUCT_CATEGORIES = [
  {
    name: 'Agricultural Products',
    subcategories: [
      'Coffee & Tea',
      'Cocoa & Chocolate',
      'Nuts & Seeds',
      'Spices & Herbs',
      'Fruits & Vegetables',
      'Grains & Cereals',
      'Honey & Bee Products',
      'Essential Oils',
      'Other Agricultural'
    ]
  },
  {
    name: 'Minerals & Metals',
    subcategories: [
      'Gold',
      'Diamonds',
      'Copper',
      'Uranium',
      'Coltan',
      'Oil & Gas',
      'Other Minerals'
    ]
  },
  {
    name: 'Textiles & Apparel',
    subcategories: [
      'Cotton',
      'Casual Wear',
      'Traditional Clothing',
      'Home Textiles',
      'Leather Goods',
      'Other Textiles'
    ]
  },
  {
    name: 'Handicrafts & Art',
    subcategories: [
      'Wood Carvings',
      'Jewelry',
      'Pottery',
      'Baskets & Weaving',
      'Paintings',
      'Sculptures',
      'Other Handicrafts'
    ]
  },
  {
    name: 'Processed Foods',
    subcategories: [
      'Fruit Juices',
      'Vegetable Oils',
      'Canned Foods',
      'Dairy Products',
      'Confectionery',
      'Beverages',
      'Other Processed Foods'
    ]
  },
  {
    name: 'Machinery & Equipment',
    subcategories: [
      'Agricultural Machinery',
      'Construction Equipment',
      'Manufacturing Equipment',
      'Medical Equipment',
      'IT Equipment',
      'Other Machinery'
    ]
  },
  {
    name: 'Chemicals & Pharmaceuticals',
    subcategories: [
      'Industrial Chemicals',
      'Fertilizers',
      'Pesticides',
      'Pharmaceuticals',
      'Cosmetics',
      'Other Chemicals'
    ]
  },
  {
    name: 'Other Products',
    subcategories: [
      'Building Materials',
      'Furniture',
      'Electronics',
      'Automotive Parts',
      'Packaging Materials',
      'Other'
    ]
  }
];

export const EXPORT_REQUIREMENTS = {
  documentation: [
    'Commercial Invoice',
    'Packing List',
    'Certificate of Origin',
    'Bill of Lading',
    'Insurance Certificate',
    'Export License',
    'Quality Certificates',
    'Phytosanitary Certificate',
    'Health Certificate',
    'Customs Declaration'
  ],
  compliance: [
    'Export License Requirements',
    'Quality Standards',
    'Packaging Standards',
    'Labeling Requirements',
    'Environmental Regulations',
    'Trade Agreements',
    'Sanitary Standards',
    'Safety Standards'
  ]
};

export const EXPORT_MARKETS_INFO = {
  'United States': {
    requirements: ['FDA Approval', 'USDA Organic', 'Customs Entry'],
    popularProducts: ['Coffee', 'Cocoa', 'Nuts', 'Spices']
  },
  'European Union': {
    requirements: ['EU Organic', 'REACH Compliance', 'CE Marking'],
    popularProducts: ['Coffee', 'Tea', 'Cocoa', 'Essential Oils']
  },
  'China': {
    requirements: ['CIQ Inspection', 'Import License', 'Quality Standards'],
    popularProducts: ['Oilseeds', 'Cotton', 'Minerals', 'Timber']
  },
  'India': {
    requirements: ['BIS Standards', 'Import License', 'Quality Control'],
    popularProducts: ['Sesame', 'Cashews', 'Spices', 'Tea']
  }
};

// Legacy export for backward compatibility
export const EXPORT_CATEGORIES = EXPORT_PRODUCT_CATEGORIES;

// Helper function to get subcategories for a category
export const getExportSubcategories = (categoryName) => {
  const category = EXPORT_PRODUCT_CATEGORIES.find(cat => cat.name === categoryName);
  return category ? category.subcategories : [];
};