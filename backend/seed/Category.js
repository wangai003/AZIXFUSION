const Category = require("../models/Category");

// Main categories with proper hierarchical structure
const mainCategories = [
  {
    name: "Retail & Consumer Goods",
    description: "Consumer products, electronics, clothing, and home goods",
    type: "main",
    level: 1,
    sortOrder: 1
  },
  {
    name: "Agriculture",
    description: "Farming, livestock, and agricultural products",
    type: "main",
    level: 1,
    sortOrder: 2
  },
  {
    name: "Artisanal & Handicrafts",
    description: "Handmade items, traditional crafts, and cultural artifacts",
    type: "main",
    level: 1,
    sortOrder: 3
  },
  {
    name: "Food & Beverage",
    description: "Food products, beverages, and culinary services",
    type: "main",
    level: 1,
    sortOrder: 4
  },
  {
    name: "Construction & Building Materials",
    description: "Construction tools, materials, and building supplies",
    type: "main",
    level: 1,
    sortOrder: 5
  },
  {
    name: "Education & Learning",
    description: "Educational materials, books, and learning resources",
    type: "main",
    level: 1,
    sortOrder: 6
  },
  {
    name: "Automotive & Transportation",
    description: "Vehicles, auto parts, and transportation services",
    type: "main",
    level: 1,
    sortOrder: 7
  },
  {
    name: "Technology & Software",
    description: "Computers, software, and digital solutions",
    type: "main",
    level: 1,
    sortOrder: 8
  }
];

// Subcategories for each main category
const subcategories = {
  "Retail & Consumer Goods": [
    {
      name: "Groceries",
      description: "Fresh produce, dairy products, packaged foods, beverages, snacks, frozen foods, spices & condiments",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Clothing & Apparel",
      description: "Men's fashion, women's fashion, children's wear, footwear, accessories (belts, bags, hats)",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Electronics & Gadgets",
      description: "Smartphones, laptops, tablets, home entertainment, gaming consoles, accessories (chargers, cases, headphones)",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Home Appliances",
      description: "Kitchen appliances, laundry machines, air conditioners, refrigerators, smart home devices",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Beauty & Personal Care",
      description: "Skincare, haircare, grooming tools, cosmetics, perfumes, hygiene products",
      type: "sub",
      level: 2,
      sortOrder: 5
    },
    {
      name: "Health & Wellness",
      description: "Supplements, vitamins, medical devices, fitness equipment, alternative medicine",
      type: "sub",
      level: 2,
      sortOrder: 6
    }
  ],
  "Agriculture": [
    {
      name: "Fresh Produce",
      description: "Fruits, vegetables, grains, herbs, organic produce",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Livestock & Poultry",
      description: "Cattle, sheep, goats, chickens, eggs, dairy products, beekeeping & honey production",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Farming Tools & Equipment",
      description: "Tractors, irrigation systems, hand tools, greenhouses, storage silos",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Fertilizers & Pesticides",
      description: "Organic fertilizers, chemical fertilizers, pest control products, soil enhancers",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Seeds & Nurseries",
      description: "Crop seeds, saplings, indoor gardening supplies, hydroponics",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Artisanal & Handicrafts": [
    {
      name: "Jewelry",
      description: "Handmade necklaces, bracelets, rings, earrings, beaded accessories",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Textiles & Fashion",
      description: "Traditional clothing, scarves, woven fabrics, hand-dyed textiles, leather goods",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Pottery & Ceramics",
      description: "Decorative pottery, tableware, sculptures, clay home decor",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Cultural Artifacts & Home Decor",
      description: "African masks, wooden carvings, paintings, tapestries, woven baskets",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Handmade Furniture",
      description: "Wooden chairs, tables, beds, handcrafted shelving units",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Food & Beverage": [
    {
      name: "Local Food Vendors",
      description: "Street food, traditional dishes, catering services, fast food outlets",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Bakeries & Confectionery",
      description: "Cakes, bread, pastries, sweets, biscuits, chocolates",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Beverage Suppliers",
      description: "Tea, coffee, juice, soft drinks, alcoholic beverages, energy drinks",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Packaged & Processed Foods",
      description: "Canned goods, frozen meals, snacks, sauces & condiments",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Organic & Specialty Foods",
      description: "Gluten-free, vegan, keto-friendly products",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Construction & Building Materials": [
    {
      name: "Raw Materials",
      description: "Sand, gravel, cement, bricks, tiles, limestone",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Structural Components",
      description: "Roofing sheets, steel rods, timber, insulation, prefabricated structures",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Finishing Materials",
      description: "Paint, adhesives, flooring, doors & windows, plumbing fixtures",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Construction Tools & Equipment",
      description: "Power tools, hand tools, scaffolding, safety gear, heavy machinery rentals",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Education & Learning": [
    {
      name: "School Supplies",
      description: "Books, stationery, backpacks, uniforms, educational toys",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Libraries & Bookstores",
      description: "Textbooks, e-books, novels, research materials",
      type: "sub",
      level: 2,
      sortOrder: 2
    }
  ],
  "Automotive & Transportation": [
    {
      name: "Vehicles & Motorcycles",
      description: "New & used cars, motorcycles, scooters, electric vehicles",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Auto Parts & Accessories",
      description: "Batteries, tires, car audio systems, GPS, car maintenance tools",
      type: "sub",
      level: 2,
      sortOrder: 2
    }
  ],
  "Technology & Software": [
    {
      name: "Computers & Accessories",
      description: "Laptops, desktops, storage devices, networking equipment",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Software & Digital Solutions",
      description: "Business software, antivirus, design software, cloud solutions",
      type: "sub",
      level: 2,
      sortOrder: 2
    }
  ]
};

// Elements (Level 3) for each subcategory
const elements = {
  "Groceries": [
    { name: "Fresh produce", type: "element", level: 3 },
    { name: "Dairy products", type: "element", level: 3 },
    { name: "Packaged foods", type: "element", level: 3 },
    { name: "Beverages", type: "element", level: 3 },
    { name: "Snacks", type: "element", level: 3 },
    { name: "Frozen foods", type: "element", level: 3 },
    { name: "Spices & condiments", type: "element", level: 3 }
  ],
  "Clothing & Apparel": [
    { name: "Men's fashion", type: "element", level: 3 },
    { name: "Women's fashion", type: "element", level: 3 },
    { name: "Children's wear", type: "element", level: 3 },
    { name: "Footwear", type: "element", level: 3 },
    { name: "Accessories (belts, bags, hats)", type: "element", level: 3 }
  ],
  "Electronics & Gadgets": [
    { name: "Smartphones", type: "element", level: 3 },
    { name: "Laptops", type: "element", level: 3 },
    { name: "Tablets", type: "element", level: 3 },
    { name: "Home entertainment", type: "element", level: 3 },
    { name: "Gaming consoles", type: "element", level: 3 },
    { name: "Accessories (chargers, cases, headphones)", type: "element", level: 3 }
  ],
  "Home Appliances": [
    { name: "Kitchen appliances", type: "element", level: 3 },
    { name: "Laundry machines", type: "element", level: 3 },
    { name: "Air conditioners", type: "element", level: 3 },
    { name: "Refrigerators", type: "element", level: 3 },
    { name: "Smart home devices", type: "element", level: 3 }
  ],
  "Beauty & Personal Care": [
    { name: "Skincare", type: "element", level: 3 },
    { name: "Haircare", type: "element", level: 3 },
    { name: "Grooming tools", type: "element", level: 3 },
    { name: "Cosmetics", type: "element", level: 3 },
    { name: "Perfumes", type: "element", level: 3 },
    { name: "Hygiene products", type: "element", level: 3 }
  ],
  "Health & Wellness": [
    { name: "Supplements", type: "element", level: 3 },
    { name: "Vitamins", type: "element", level: 3 },
    { name: "Medical devices", type: "element", level: 3 },
    { name: "Fitness equipment", type: "element", level: 3 },
    { name: "Alternative medicine", type: "element", level: 3 }
  ],
  "Fresh Produce": [
    { name: "Fruits", type: "element", level: 3 },
    { name: "Vegetables", type: "element", level: 3 },
    { name: "Grains", type: "element", level: 3 },
    { name: "Herbs", type: "element", level: 3 },
    { name: "Organic produce", type: "element", level: 3 }
  ],
  "Livestock & Poultry": [
    { name: "Cattle", type: "element", level: 3 },
    { name: "Sheep", type: "element", level: 3 },
    { name: "Goats", type: "element", level: 3 },
    { name: "Chickens", type: "element", level: 3 },
    { name: "Eggs", type: "element", level: 3 },
    { name: "Dairy products", type: "element", level: 3 },
    { name: "Beekeeping & honey production", type: "element", level: 3 }
  ],
  "Farming Tools & Equipment": [
    { name: "Tractors", type: "element", level: 3 },
    { name: "Irrigation systems", type: "element", level: 3 },
    { name: "Hand tools", type: "element", level: 3 },
    { name: "Greenhouses", type: "element", level: 3 },
    { name: "Storage silos", type: "element", level: 3 }
  ],
  "Fertilizers & Pesticides": [
    { name: "Organic fertilizers", type: "element", level: 3 },
    { name: "Chemical fertilizers", type: "element", level: 3 },
    { name: "Pest control products", type: "element", level: 3 },
    { name: "Soil enhancers", type: "element", level: 3 }
  ],
  "Seeds & Nurseries": [
    { name: "Crop seeds", type: "element", level: 3 },
    { name: "Saplings", type: "element", level: 3 },
    { name: "Indoor gardening supplies", type: "element", level: 3 },
    { name: "Hydroponics", type: "element", level: 3 }
  ],
  "Jewelry": [
    { name: "Handmade necklaces", type: "element", level: 3 },
    { name: "Bracelets", type: "element", level: 3 },
    { name: "Rings", type: "element", level: 3 },
    { name: "Earrings", type: "element", level: 3 },
    { name: "Beaded accessories", type: "element", level: 3 }
  ],
  "Textiles & Fashion": [
    { name: "Traditional clothing", type: "element", level: 3 },
    { name: "Scarves", type: "element", level: 3 },
    { name: "Woven fabrics", type: "element", level: 3 },
    { name: "Hand-dyed textiles", type: "element", level: 3 },
    { name: "Leather goods", type: "element", level: 3 }
  ],
  "Pottery & Ceramics": [
    { name: "Decorative pottery", type: "element", level: 3 },
    { name: "Tableware", type: "element", level: 3 },
    { name: "Sculptures", type: "element", level: 3 },
    { name: "Clay home decor", type: "element", level: 3 }
  ],
  "Cultural Artifacts & Home Decor": [
    { name: "African masks", type: "element", level: 3 },
    { name: "Wooden carvings", type: "element", level: 3 },
    { name: "Paintings", type: "element", level: 3 },
    { name: "Tapestries", type: "element", level: 3 },
    { name: "Woven baskets", type: "element", level: 3 }
  ],
  "Handmade Furniture": [
    { name: "Wooden chairs", type: "element", level: 3 },
    { name: "Tables", type: "element", level: 3 },
    { name: "Beds", type: "element", level: 3 },
    { name: "Handcrafted shelving units", type: "element", level: 3 }
  ],
  "Local Food Vendors": [
    { name: "Street food", type: "element", level: 3 },
    { name: "Traditional dishes", type: "element", level: 3 },
    { name: "Catering services", type: "element", level: 3 },
    { name: "Fast food outlets", type: "element", level: 3 }
  ],
  "Bakeries & Confectionery": [
    { name: "Cakes", type: "element", level: 3 },
    { name: "Bread", type: "element", level: 3 },
    { name: "Pastries", type: "element", level: 3 },
    { name: "Sweets", type: "element", level: 3 },
    { name: "Biscuits", type: "element", level: 3 },
    { name: "Chocolates", type: "element", level: 3 }
  ],
  "Beverage Suppliers": [
    { name: "Tea", type: "element", level: 3 },
    { name: "Coffee", type: "element", level: 3 },
    { name: "Juice", type: "element", level: 3 },
    { name: "Soft drinks", type: "element", level: 3 },
    { name: "Alcoholic beverages", type: "element", level: 3 },
    { name: "Energy drinks", type: "element", level: 3 }
  ],
  "Packaged & Processed Foods": [
    { name: "Canned goods", type: "element", level: 3 },
    { name: "Frozen meals", type: "element", level: 3 },
    { name: "Snacks", type: "element", level: 3 },
    { name: "Sauces & condiments", type: "element", level: 3 }
  ],
  "Organic & Specialty Foods": [
    { name: "Gluten-free", type: "element", level: 3 },
    { name: "Vegan", type: "element", level: 3 },
    { name: "Keto-friendly products", type: "element", level: 3 }
  ],
  "Raw Materials": [
    { name: "Sand", type: "element", level: 3 },
    { name: "Gravel", type: "element", level: 3 },
    { name: "Cement", type: "element", level: 3 },
    { name: "Bricks", type: "element", level: 3 },
    { name: "Tiles", type: "element", level: 3 },
    { name: "Limestone", type: "element", level: 3 }
  ],
  "Structural Components": [
    { name: "Roofing sheets", type: "element", level: 3 },
    { name: "Steel rods", type: "element", level: 3 },
    { name: "Timber", type: "element", level: 3 },
    { name: "Insulation", type: "element", level: 3 },
    { name: "Prefabricated structures", type: "element", level: 3 }
  ],
  "Finishing Materials": [
    { name: "Paint", type: "element", level: 3 },
    { name: "Adhesives", type: "element", level: 3 },
    { name: "Flooring", type: "element", level: 3 },
    { name: "Doors & windows", type: "element", level: 3 },
    { name: "Plumbing fixtures", type: "element", level: 3 }
  ],
  "Construction Tools & Equipment": [
    { name: "Power tools", type: "element", level: 3 },
    { name: "Hand tools", type: "element", level: 3 },
    { name: "Scaffolding", type: "element", level: 3 },
    { name: "Safety gear", type: "element", level: 3 },
    { name: "Heavy machinery rentals", type: "element", level: 3 }
  ],
  "School Supplies": [
    { name: "Books", type: "element", level: 3 },
    { name: "Stationery", type: "element", level: 3 },
    { name: "Backpacks", type: "element", level: 3 },
    { name: "Uniforms", type: "element", level: 3 },
    { name: "Educational toys", type: "element", level: 3 }
  ],
  "Libraries & Bookstores": [
    { name: "Textbooks", type: "element", level: 3 },
    { name: "E-books", type: "element", level: 3 },
    { name: "Novels", type: "element", level: 3 },
    { name: "Research materials", type: "element", level: 3 }
  ],
  "Vehicles & Motorcycles": [
    { name: "New & used cars", type: "element", level: 3 },
    { name: "Motorcycles", type: "element", level: 3 },
    { name: "Scooters", type: "element", level: 3 },
    { name: "Electric vehicles", type: "element", level: 3 }
  ],
  "Auto Parts & Accessories": [
    { name: "Batteries", type: "element", level: 3 },
    { name: "Tires", type: "element", level: 3 },
    { name: "Car audio systems", type: "element", level: 3 },
    { name: "GPS", type: "element", level: 3 },
    { name: "Car maintenance tools", type: "element", level: 3 }
  ],
  "Computers & Accessories": [
    { name: "Laptops", type: "element", level: 3 },
    { name: "Desktops", type: "element", level: 3 },
    { name: "Storage devices", type: "element", level: 3 },
    { name: "Networking equipment", type: "element", level: 3 }
  ],
  "Software & Digital Solutions": [
    { name: "Business software", type: "element", level: 3 },
    { name: "Antivirus", type: "element", level: 3 },
    { name: "Design software", type: "element", level: 3 },
    { name: "Cloud solutions", type: "element", level: 3 }
  ]
};

exports.seedCategory = async () => {
  try {
    console.log("🌱 Starting category seeding...");
    
    // Clear existing categories
    const existingCategories = await Category.find({});
    if (existingCategories.length > 0) {
      console.log(`🗑️  Clearing ${existingCategories.length} existing categories...`);
      for (const category of existingCategories) {
        await Category.deleteById(category._id);
      }
      console.log("✅ Existing categories cleared");
    }

    // Create main categories
    console.log("🏷️  Creating main categories...");
    const createdMainCategories = {};
    for (const mainCat of mainCategories) {
      const created = await Category.create(mainCat);
      createdMainCategories[mainCat.name] = created;
      console.log(`✅ Created main category: ${mainCat.name}`);
    }

    // Create subcategories
    console.log("📁 Creating subcategories...");
    const createdSubcategories = {};
    for (const [mainCatName, subcats] of Object.entries(subcategories)) {
      const mainCat = createdMainCategories[mainCatName];
      if (!mainCat) continue;

      for (const subcat of subcats) {
        const subcatData = {
          ...subcat,
          parentId: mainCat._id
        };
        const created = await Category.create(subcatData);
        createdSubcategories[subcat.name] = created;
        console.log(`✅ Created subcategory: ${subcat.name} under ${mainCatName}`);
      }
    }

    // Create elements
    console.log("🔧 Creating elements...");
    for (const [subcatName, elementList] of Object.entries(elements)) {
      const subcat = createdSubcategories[subcatName];
      if (!subcat) continue;

      for (const element of elementList) {
        const elementData = {
          ...element,
          parentId: subcat._id
        };
        await Category.create(elementData);
        console.log(`✅ Created element: ${element.name} under ${subcatName}`);
      }
    }

    console.log("🎉 Category seeding completed successfully!");
    
    // Display summary
    const finalCategories = await Category.find({});
    const mainCount = finalCategories.filter(c => c.type === 'main').length;
    const subCount = finalCategories.filter(c => c.type === 'sub').length;
    const elementCount = finalCategories.filter(c => c.type === 'element').length;
    
    console.log(`\n📊 FINAL CATEGORY COUNT:`);
    console.log(`🏷️  Main Categories: ${mainCount}`);
    console.log(`📁 Subcategories: ${subCount}`);
    console.log(`🔧 Elements: ${elementCount}`);
    console.log(`📈 Total: ${finalCategories.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};
