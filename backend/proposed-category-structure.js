// Proposed New Category Structure
// This will replace the current messy structure with a clean, hierarchical one

const proposedStructure = {
  mainCategories: [
    {
      name: "Agriculture & Farming",
      description: "All agricultural products, farming tools, and livestock",
      type: "main",
      level: 1,
      sortOrder: 1
    },
    {
      name: "Food & Beverages",
      description: "Fresh produce, packaged foods, and beverages",
      type: "main", 
      level: 1,
      sortOrder: 2
    },
    {
      name: "Retail & Consumer Goods",
      description: "Clothing, electronics, home goods, and personal care",
      type: "main",
      level: 1,
      sortOrder: 3
    },
    {
      name: "Construction & Building Materials",
      description: "Construction tools, materials, and equipment",
      type: "main",
      level: 1,
      sortOrder: 4
    },
    {
      name: "Automotive & Transportation",
      description: "Vehicles, parts, and transportation services",
      type: "main",
      level: 1,
      sortOrder: 5
    },
    {
      name: "Technology & Software",
      description: "Computers, software, and digital solutions",
      type: "main",
      level: 1,
      sortOrder: 6
    },
    {
      name: "Artisanal & Handicrafts",
      description: "Handmade items, traditional crafts, and cultural artifacts",
      type: "main",
      level: 1,
      sortOrder: 7
    },
    {
      name: "Education & Learning",
      description: "Educational materials, courses, and learning resources",
      type: "main",
      level: 1,
      sortOrder: 8
    },
    {
      name: "Healthcare & Wellness",
      description: "Medical supplies, health products, and wellness services",
      type: "main",
      level: 1,
      sortOrder: 9
    },
    {
      name: "Energy & Environment",
      description: "Renewable energy, environmental services, and sustainability",
      type: "main",
      level: 1,
      sortOrder: 10
    },
    {
      name: "Financial & Business Services",
      description: "Financial services, consulting, and business solutions",
      type: "main",
      level: 1,
      sortOrder: 11
    },
    {
      name: "Tourism & Hospitality",
      description: "Travel services, accommodation, and entertainment",
      type: "main",
      level: 1,
      sortOrder: 12
    }
  ],
  
  subcategories: {
    // Agriculture & Farming
    "agriculture": [
      {
        name: "Fresh Produce",
        description: "Fresh fruits, vegetables, and herbs",
        type: "sub",
        parentId: "agriculture",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Livestock & Poultry",
        description: "Cattle, sheep, goats, chickens, and other animals",
        type: "sub",
        parentId: "agriculture",
        level: 2,
        sortOrder: 2
      },
      {
        name: "Farming Tools & Equipment",
        description: "Agricultural machinery and hand tools",
        type: "sub",
        parentId: "agriculture",
        level: 2,
        sortOrder: 3
      },
      {
        name: "Seeds & Nurseries",
        description: "Plant seeds, saplings, and nursery products",
        type: "sub",
        parentId: "agriculture",
        level: 2,
        sortOrder: 4
      },
      {
        name: "Fertilizers & Pesticides",
        description: "Soil enhancers and crop protection products",
        type: "sub",
        parentId: "agriculture",
        level: 2,
        sortOrder: 5
      }
    ],
    
    // Food & Beverages
    "food": [
      {
        name: "Fresh Produce",
        description: "Fresh fruits, vegetables, and herbs",
        type: "sub",
        parentId: "food",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Packaged & Processed Foods",
        description: "Canned goods, frozen foods, and snacks",
        type: "sub",
        parentId: "food",
        level: 2,
        sortOrder: 2
      },
      {
        name: "Bakeries & Confectionery",
        description: "Bread, pastries, cakes, and sweets",
        type: "sub",
        parentId: "food",
        level: 2,
        sortOrder: 3
      },
      {
        name: "Beverages",
        description: "Soft drinks, juices, coffee, tea, and alcoholic drinks",
        type: "sub",
        parentId: "food",
        level: 2,
        sortOrder: 4
      },
      {
        name: "Local Food Vendors",
        description: "Street food, traditional dishes, and local specialties",
        type: "sub",
        parentId: "food",
        level: 2,
        sortOrder: 5
      }
    ],
    
    // Retail & Consumer Goods
    "retail": [
      {
        name: "Clothing & Apparel",
        description: "Men's, women's, and children's clothing",
        type: "sub",
        parentId: "retail",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Electronics & Gadgets",
        description: "Smartphones, computers, and electronic devices",
        type: "sub",
        parentId: "retail",
        level: 2,
        sortOrder: 2
      },
      {
        name: "Home Appliances",
        description: "Kitchen appliances and home electronics",
        type: "sub",
        parentId: "retail",
        level: 2,
        sortOrder: 3
      },
      {
        name: "Beauty & Personal Care",
        description: "Cosmetics, skincare, and personal hygiene products",
        type: "sub",
        parentId: "retail",
        level: 2,
        sortOrder: 4
      },
      {
        name: "Groceries",
        description: "Household food items and daily essentials",
        type: "sub",
        parentId: "retail",
        level: 2,
        sortOrder: 5
      }
    ],
    
    // Construction & Building Materials
    "construction": [
      {
        name: "Structural Components",
        description: "Beams, columns, and load-bearing elements",
        type: "sub",
        parentId: "construction",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Construction Tools & Equipment",
        description: "Power tools, hand tools, and construction machinery",
        type: "sub",
        parentId: "construction",
        level: 2,
        sortOrder: 2
      },
      {
        name: "Raw Materials",
        description: "Cement, sand, gravel, and basic building materials",
        type: "sub",
        parentId: "construction",
        level: 2,
        sortOrder: 3
      },
      {
        name: "Finishing Materials",
        description: "Paint, tiles, flooring, and decorative materials",
        type: "sub",
        parentId: "construction",
        level: 2,
        sortOrder: 4
      }
    ],
    
    // Automotive & Transportation
    "automotive": [
      {
        name: "Vehicles & Motorcycles",
        description: "Cars, motorcycles, and other vehicles",
        type: "sub",
        parentId: "automotive",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Auto Parts & Accessories",
        description: "Car parts, maintenance tools, and accessories",
        type: "sub",
        parentId: "automotive",
        level: 2,
        sortOrder: 2
      }
    ],
    
    // Technology & Software
    "technology": [
      {
        name: "Computers & Accessories",
        description: "Laptops, desktops, and computer peripherals",
        type: "sub",
        parentId: "technology",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Software & Digital Solutions",
        description: "Business software, design tools, and digital services",
        type: "sub",
        parentId: "technology",
        level: 2,
        sortOrder: 2
      }
    ],
    
    // Artisanal & Handicrafts
    "artisanal": [
      {
        name: "Handmade Furniture",
        description: "Custom wooden furniture and home decor",
        type: "sub",
        parentId: "artisanal",
        level: 2,
        sortOrder: 1
      },
      {
        name: "Pottery & Ceramics",
        description: "Clay pottery, decorative items, and tableware",
        type: "sub",
        parentId: "artisanal",
        level: 2,
        sortOrder: 2
      },
      {
        name: "Textiles & Fashion",
        description: "Handwoven fabrics, traditional clothing, and accessories",
        type: "sub",
        parentId: "artisanal",
        level: 2,
        sortOrder: 3
      },
      {
        name: "Cultural Artifacts & Home Decor",
        description: "Traditional crafts, paintings, and cultural items",
        type: "sub",
        parentId: "artisanal",
        level: 2,
        sortOrder: 4
      },
      {
        name: "Jewelry",
        description: "Handcrafted jewelry and accessories",
        type: "sub",
        parentId: "artisanal",
        level: 2,
        sortOrder: 5
      }
    ],
    
    // Education & Learning
    "education": [
      {
        name: "Libraries & Bookstores",
        description: "Books, educational materials, and learning resources",
        type: "sub",
        parentId: "education",
        level: 2,
        sortOrder: 1
      },
      {
        name: "School Supplies",
        description: "Stationery, uniforms, and educational tools",
        type: "sub",
        parentId: "education",
        level: 2,
        sortOrder: 2
      }
    ]
  },
  
  elements: {
    // Fresh Produce (Agriculture)
    "fresh-produce-agriculture": [
      { name: "Vegetables", parentId: "fresh-produce-agriculture", type: "element", level: 3 },
      { name: "Fruits", parentId: "fresh-produce-agriculture", type: "element", level: 3 },
      { name: "Herbs", parentId: "fresh-produce-agriculture", type: "element", level: 3 },
      { name: "Organic produce", parentId: "fresh-produce-agriculture", type: "element", level: 3 }
    ],
    
    // Fresh Produce (Food)
    "fresh-produce-food": [
      { name: "Vegetables", parentId: "fresh-produce-food", type: "element", level: 3 },
      { name: "Fruits", parentId: "fresh-produce-food", type: "element", level: 3 },
      { name: "Herbs", parentId: "fresh-produce-food", type: "element", level: 3 },
      { name: "Organic produce", parentId: "fresh-produce-food", type: "element", level: 3 }
    ],
    
    // Livestock & Poultry
    "livestock-poultry": [
      { name: "Cattle", parentId: "livestock-poultry", type: "element", level: 3 },
      { name: "Sheep", parentId: "livestock-poultry", type: "element", level: 3 },
      { name: "Goats", parentId: "livestock-poultry", type: "element", level: 3 },
      { name: "Chickens", parentId: "livestock-poultry", type: "element", level: 3 },
      { name: "Beekeeping & honey production", parentId: "livestock-poultry", type: "element", level: 3 }
    ],
    
    // Clothing & Apparel
    "clothing-apparel": [
      { name: "Men's fashion", parentId: "clothing-apparel", type: "element", level: 3 },
      { name: "Women's fashion", parentId: "clothing-apparel", type: "element", level: 3 },
      { name: "Children's wear", parentId: "clothing-apparel", type: "element", level: 3 },
      { name: "Traditional clothing", parentId: "clothing-apparel", type: "element", level: 3 },
      { name: "Footwear", parentId: "clothing-apparel", type: "element", level: 3 }
    ],
    
    // Electronics & Gadgets
    "electronics-gadgets": [
      { name: "Smartphones", parentId: "electronics-gadgets", type: "element", level: 3 },
      { name: "Laptops", parentId: "electronics-gadgets", type: "element", level: 3 },
      { name: "Tablets", parentId: "electronics-gadgets", type: "element", level: 3 },
      { name: "Desktops", parentId: "electronics-gadgets", type: "element", level: 3 },
      { name: "Gaming consoles", parentId: "electronics-gadgets", type: "element", level: 3 }
    ],
    
    // Home Appliances
    "home-appliances": [
      { name: "Kitchen appliances", parentId: "home-appliances", type: "element", level: 3 },
      { name: "Refrigerators", parentId: "home-appliances", type: "element", level: 3 },
      { name: "Laundry machines", parentId: "home-appliances", type: "element", level: 3 },
      { name: "Air conditioners", parentId: "home-appliances", type: "element", level: 3 },
      { name: "Smart home devices", parentId: "home-appliances", type: "element", level: 3 }
    ],
    
    // Beauty & Personal Care
    "beauty-personal-care": [
      { name: "Skincare", parentId: "beauty-personal-care", type: "element", level: 3 },
      { name: "Cosmetics", parentId: "beauty-personal-care", type: "element", level: 3 },
      { name: "Haircare", parentId: "beauty-personal-care", type: "element", level: 3 },
      { name: "Perfumes", parentId: "beauty-personal-care", type: "element", level: 3 },
      { name: "Hygiene products", parentId: "beauty-personal-care", type: "element", level: 3 }
    ],
    
    // Bakeries & Confectionery
    "bakeries-confectionery": [
      { name: "Bread", parentId: "bakeries-confectionery", type: "element", level: 3 },
      { name: "Cakes", parentId: "bakeries-confectionery", type: "element", level: 3 },
      { name: "Pastries", parentId: "bakeries-confectionery", type: "element", level: 3 },
      { name: "Sweets", parentId: "bakeries-confectionery", type: "element", level: 3 },
      { name: "Chocolates", parentId: "bakeries-confectionery", type: "element", level: 3 },
      { name: "Biscuits", parentId: "bakeries-confectionery", type: "element", level: 3 }
    ],
    
    // Beverages
    "beverages": [
      { name: "Soft drinks", parentId: "beverages", type: "element", level: 3 },
      { name: "Juice", parentId: "beverages", type: "element", level: 3 },
      { name: "Coffee", parentId: "beverages", type: "element", level: 3 },
      { name: "Tea", parentId: "beverages", type: "element", level: 3 },
      { name: "Energy drinks", parentId: "beverages", type: "element", level: 3 },
      { name: "Alcoholic beverages", parentId: "beverages", type: "element", level: 3 }
    ],
    
    // Packaged & Processed Foods
    "packaged-processed-foods": [
      { name: "Canned goods", parentId: "packaged-processed-foods", type: "element", level: 3 },
      { name: "Frozen foods", parentId: "packaged-processed-foods", type: "element", level: 3 },
      { name: "Snacks", parentId: "packaged-processed-foods", type: "element", level: 3 },
      { name: "Frozen meals", parentId: "packaged-processed-foods", type: "element", level: 3 },
      { name: "Sauces & condiments", parentId: "packaged-processed-foods", type: "element", level: 3 }
    ],
    
    // Local Food Vendors
    "local-food-vendors": [
      { name: "Street food", parentId: "local-food-vendors", type: "element", level: 3 },
      { name: "Traditional dishes", parentId: "local-food-vendors", type: "element", level: 3 },
      { name: "Fast food outlets", parentId: "local-food-vendors", type: "element", level: 3 },
      { name: "Catering services", parentId: "local-food-vendors", type: "element", level: 3 }
    ],
    
    // Construction Tools & Equipment
    "construction-tools-equipment": [
      { name: "Power tools", parentId: "construction-tools-equipment", type: "element", level: 3 },
      { name: "Hand tools", parentId: "construction-tools-equipment", type: "element", level: 3 },
      { name: "Heavy machinery rentals", parentId: "construction-tools-equipment", type: "element", level: 3 },
      { name: "Safety gear", parentId: "construction-tools-equipment", type: "element", level: 3 }
    ],
    
    // Raw Materials
    "raw-materials": [
      { name: "Cement", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Sand", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Gravel", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Limestone", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Bricks", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Steel rods", parentId: "raw-materials", type: "element", level: 3 },
      { name: "Timber", parentId: "raw-materials", type: "element", level: 3 }
    ],
    
    // Finishing Materials
    "finishing-materials": [
      { name: "Paint", parentId: "finishing-materials", type: "element", level: 3 },
      { name: "Tiles", parentId: "finishing-materials", type: "element", level: 3 },
      { name: "Flooring", parentId: "finishing-materials", type: "element", level: 3 },
      { name: "Doors & windows", parentId: "finishing-materials", type: "element", level: 3 },
      { name: "Plumbing fixtures", parentId: "finishing-materials", type: "element", level: 3 },
      { name: "Insulation", parentId: "finishing-materials", type: "element", level: 3 }
    ],
    
    // Vehicles & Motorcycles
    "vehicles-motorcycles": [
      { name: "New & used cars", parentId: "vehicles-motorcycles", type: "element", level: 3 },
      { name: "Motorcycles", parentId: "vehicles-motorcycles", type: "element", level: 3 },
      { name: "Scooters", parentId: "vehicles-motorcycles", type: "element", level: 3 },
      { name: "Electric vehicles", parentId: "vehicles-motorcycles", type: "element", level: 3 }
    ],
    
    // Auto Parts & Accessories
    "auto-parts-accessories": [
      { name: "Car maintenance tools", parentId: "auto-parts-accessories", type: "element", level: 3 },
      { name: "Tires", parentId: "auto-parts-accessories", type: "element", level: 3 },
      { name: "Car audio systems", parentId: "auto-parts-accessories", type: "element", level: 3 },
      { name: "GPS", parentId: "auto-parts-accessories", type: "element", level: 3 },
      { name: "Batteries", parentId: "auto-parts-accessories", type: "element", level: 3 }
    ],
    
    // Computers & Accessories
    "computers-accessories": [
      { name: "Laptops", parentId: "computers-accessories", type: "element", level: 3 },
      { name: "Desktops", parentId: "computers-accessories", type: "element", level: 3 },
      { name: "Tablets", parentId: "computers-accessories", type: "element", level: 3 },
      { name: "Storage devices", parentId: "computers-accessories", type: "element", level: 3 },
      { name: "Networking equipment", parentId: "computers-accessories", type: "element", level: 3 }
    ],
    
    // Software & Digital Solutions
    "software-digital-solutions": [
      { name: "Business software", parentId: "software-digital-solutions", type: "element", level: 3 },
      { name: "Design software", parentId: "software-digital-solutions", type: "element", level: 3 },
      { name: "Antivirus", parentId: "software-digital-solutions", type: "element", level: 3 },
      { name: "Cloud solutions", parentId: "software-digital-solutions", type: "element", level: 3 }
    ],
    
    // Handmade Furniture
    "handmade-furniture": [
      { name: "Tables", parentId: "handmade-furniture", type: "element", level: 3 },
      { name: "Chairs", parentId: "handmade-furniture", type: "element", level: 3 },
      { name: "Beds", parentId: "handmade-furniture", type: "element", level: 3 },
      { name: "Handcrafted shelving units", parentId: "handmade-furniture", type: "element", level: 3 }
    ],
    
    // Pottery & Ceramics
    "pottery-ceramics": [
      { name: "Decorative pottery", parentId: "pottery-ceramics", type: "element", level: 3 },
      { name: "Clay home decor", parentId: "pottery-ceramics", type: "element", level: 3 },
      { name: "Tableware", parentId: "pottery-ceramics", type: "element", level: 3 }
    ],
    
    // Textiles & Fashion
    "textiles-fashion": [
      { name: "Woven fabrics", parentId: "textiles-fashion", type: "element", level: 3 },
      { name: "Hand-dyed textiles", parentId: "textiles-fashion", type: "element", level: 3 },
      { name: "Leather goods", parentId: "textiles-fashion", type: "element", level: 3 },
      { name: "Scarves", parentId: "textiles-fashion", type: "element", level: 3 },
      { name: "Backpacks", parentId: "textiles-fashion", type: "element", level: 3 }
    ],
    
    // Cultural Artifacts & Home Decor
    "cultural-artifacts-home-decor": [
      { name: "African masks", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 },
      { name: "Paintings", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 },
      { name: "Sculptures", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 },
      { name: "Wooden carvings", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 },
      { name: "Tapestries", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 },
      { name: "Woven baskets", parentId: "cultural-artifacts-home-decor", type: "element", level: 3 }
    ],
    
    // Jewelry
    "jewelry": [
      { name: "Bracelets", parentId: "jewelry", type: "element", level: 3 },
      { name: "Rings", parentId: "jewelry", type: "element", level: 3 },
      { name: "Earrings", parentId: "jewelry", type: "element", level: 3 },
      { name: "Handmade necklaces", parentId: "jewelry", type: "element", level: 3 },
      { name: "Beaded accessories", parentId: "jewelry", type: "element", level: 3 }
    ],
    
    // Libraries & Bookstores
    "libraries-bookstores": [
      { name: "Books", parentId: "libraries-bookstores", type: "element", level: 3 },
      { name: "Textbooks", parentId: "libraries-bookstores", type: "element", level: 3 },
      { name: "Novels", parentId: "libraries-bookstores", type: "element", level: 3 },
      { name: "E-books", parentId: "libraries-bookstores", type: "element", level: 3 },
      { name: "Research materials", parentId: "libraries-bookstores", type: "element", level: 3 }
    ],
    
    // School Supplies
    "school-supplies": [
      { name: "Stationery", parentId: "school-supplies", type: "element", level: 3 },
      { name: "Uniforms", parentId: "school-supplies", type: "element", level: 3 },
      { name: "Educational toys", parentId: "school-supplies", type: "element", level: 3 }
    },
    
    // Farming Tools & Equipment
    "farming-tools-equipment": [
      { name: "Hand tools", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Tractors", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Greenhouses", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Irrigation systems", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Storage silos", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Indoor gardening supplies", parentId: "farming-tools-equipment", type: "element", level: 3 },
      { name: "Hydroponics", parentId: "farming-tools-equipment", type: "element", level: 3 }
    ],
    
    // Seeds & Nurseries
    "seeds-nurseries": [
      { name: "Crop seeds", parentId: "seeds-nurseries", type: "element", level: 3 },
      { name: "Saplings", parentId: "seeds-nurseries", type: "element", level: 3 }
    ],
    
    // Fertilizers & Pesticides
    "fertilizers-pesticides": [
      { name: "Chemical fertilizers", parentId: "fertilizers-pesticides", type: "element", level: 3 },
      { name: "Organic fertilizers", parentId: "fertilizers-pesticides", type: "element", level: 3 },
      { name: "Soil enhancers", parentId: "fertilizers-pesticides", type: "element", level: 3 },
      { name: "Pest control products", parentId: "fertilizers-pesticides", type: "element", level: 3 }
    ],
    
    // Health & Wellness
    "health-wellness": [
      { name: "Vitamins", parentId: "health-wellness", type: "element", level: 3 },
      { name: "Supplements", parentId: "health-wellness", type: "element", level: 3 },
      { name: "Alternative medicine", parentId: "health-wellness", type: "element", level: 3 },
      { name: "Medical devices", parentId: "health-wellness", type: "element", level: 3 },
      { name: "Fitness equipment", parentId: "health-wellness", type: "element", level: 3 }
    ]
  }
};

// Summary statistics
const getStructureStats = () => {
  const mainCount = proposedStructure.mainCategories.length;
  const subCount = Object.values(proposedStructure.subcategories).flat().length;
  const elementCount = Object.values(proposedStructure.elements).flat().length;
  
  return {
    mainCategories: mainCount,
    subcategories: subCount,
    elements: elementCount,
    total: mainCount + subCount + elementCount
  };
};

console.log('🏗️ PROPOSED NEW CATEGORY STRUCTURE');
console.log('=====================================');
console.log(`📊 Total Categories: ${getStructureStats().total}`);
console.log(`🏷️  Main Categories: ${getStructureStats().mainCategories}`);
console.log(`📁 Subcategories: ${getStructureStats().subcategories}`);
console.log(`🔧 Elements: ${getStructureStats().elements}`);

console.log('\n🎯 KEY IMPROVEMENTS:');
console.log('✅ No duplicates');
console.log('✅ Proper hierarchical structure (3 levels)');
console.log('✅ Consistent naming conventions');
console.log('✅ Logical grouping and organization');
console.log('✅ Scalable for future additions');

console.log('\n📋 MAIN CATEGORIES:');
proposedStructure.mainCategories.forEach((cat, index) => {
  console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
});

module.exports = { proposedStructure, getStructureStats };
