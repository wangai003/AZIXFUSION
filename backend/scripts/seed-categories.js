const Category = require('../models/Category');

const categoriesData = [
  {
    name: "Retail & Consumer Goods",
    description: "Consumer products and retail goods",
    type: "main",
    level: 1,
    sortOrder: 1,
    subcategories: [
      {
        name: "Groceries",
        description: "Food and grocery items",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Fresh produce", type: "element", level: 3, sortOrder: 1 },
          { name: "Dairy products", type: "element", level: 3, sortOrder: 2 },
          { name: "Packaged foods", type: "element", level: 3, sortOrder: 3 },
          { name: "Beverages", type: "element", level: 3, sortOrder: 4 },
          { name: "Snacks", type: "element", level: 3, sortOrder: 5 },
          { name: "Frozen foods", type: "element", level: 3, sortOrder: 6 },
          { name: "Spices & condiments", type: "element", level: 3, sortOrder: 7 }
        ]
      },
      {
        name: "Clothing & Apparel",
        description: "Fashion and clothing items",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Men's fashion", type: "element", level: 3, sortOrder: 1 },
          { name: "Women's fashion", type: "element", level: 3, sortOrder: 2 },
          { name: "Children's wear", type: "element", level: 3, sortOrder: 3 },
          { name: "Footwear", type: "element", level: 3, sortOrder: 4 },
          { name: "Accessories", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Electronics & Gadgets",
        description: "Electronic devices and accessories",
        type: "sub",
        level: 2,
        sortOrder: 3,
        elements: [
          { name: "Smartphones", type: "element", level: 3, sortOrder: 1 },
          { name: "Laptops", type: "element", level: 3, sortOrder: 2 },
          { name: "Tablets", type: "element", level: 3, sortOrder: 3 },
          { name: "Home entertainment", type: "element", level: 3, sortOrder: 4 },
          { name: "Gaming consoles", type: "element", level: 3, sortOrder: 5 },
          { name: "Accessories", type: "element", level: 3, sortOrder: 6 }
        ]
      },
      {
        name: "Home Appliances",
        description: "Household appliances and devices",
        type: "sub",
        level: 2,
        sortOrder: 4,
        elements: [
          { name: "Kitchen appliances", type: "element", level: 3, sortOrder: 1 },
          { name: "Laundry machines", type: "element", level: 3, sortOrder: 2 },
          { name: "Air conditioners", type: "element", level: 3, sortOrder: 3 },
          { name: "Refrigerators", type: "element", level: 3, sortOrder: 4 },
          { name: "Smart home devices", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Beauty & Personal Care",
        description: "Beauty and personal care products",
        type: "sub",
        level: 2,
        sortOrder: 5,
        elements: [
          { name: "Skincare", type: "element", level: 3, sortOrder: 1 },
          { name: "Haircare", type: "element", level: 3, sortOrder: 2 },
          { name: "Grooming tools", type: "element", level: 3, sortOrder: 3 },
          { name: "Cosmetics", type: "element", level: 3, sortOrder: 4 },
          { name: "Perfumes", type: "element", level: 3, sortOrder: 5 },
          { name: "Hygiene products", type: "element", level: 3, sortOrder: 6 }
        ]
      },
      {
        name: "Health & Wellness",
        description: "Health and wellness products",
        type: "sub",
        level: 2,
        sortOrder: 6,
        elements: [
          { name: "Supplements", type: "element", level: 3, sortOrder: 1 },
          { name: "Vitamins", type: "element", level: 3, sortOrder: 2 },
          { name: "Medical devices", type: "element", level: 3, sortOrder: 3 },
          { name: "Fitness equipment", type: "element", level: 3, sortOrder: 4 },
          { name: "Alternative medicine", type: "element", level: 3, sortOrder: 5 }
        ]
      }
    ]
  },
  {
    name: "Agriculture",
    description: "Agricultural products and farming supplies",
    type: "main",
    level: 1,
    sortOrder: 2,
    subcategories: [
      {
        name: "Fresh Produce",
        description: "Fresh agricultural products",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Fruits", type: "element", level: 3, sortOrder: 1 },
          { name: "Vegetables", type: "element", level: 3, sortOrder: 2 },
          { name: "Grains", type: "element", level: 3, sortOrder: 3 },
          { name: "Herbs", type: "element", level: 3, sortOrder: 4 },
          { name: "Organic produce", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Livestock & Poultry",
        description: "Animal products and livestock",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Cattle", type: "element", level: 3, sortOrder: 1 },
          { name: "Sheep", type: "element", level: 3, sortOrder: 2 },
          { name: "Goats", type: "element", level: 3, sortOrder: 3 },
          { name: "Chickens", type: "element", level: 3, sortOrder: 4 },
          { name: "Eggs", type: "element", level: 3, sortOrder: 5 },
          { name: "Dairy products", type: "element", level: 3, sortOrder: 6 },
          { name: "Beekeeping & honey production", type: "element", level: 3, sortOrder: 7 }
        ]
      },
      {
        name: "Farming Tools & Equipment",
        description: "Agricultural tools and machinery",
        type: "sub",
        level: 2,
        sortOrder: 3,
        elements: [
          { name: "Tractors", type: "element", level: 3, sortOrder: 1 },
          { name: "Irrigation systems", type: "element", level: 3, sortOrder: 2 },
          { name: "Hand tools", type: "element", level: 3, sortOrder: 3 },
          { name: "Greenhouses", type: "element", level: 3, sortOrder: 4 },
          { name: "Storage silos", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Fertilizers & Pesticides",
        description: "Soil enhancement and pest control products",
        type: "sub",
        level: 2,
        sortOrder: 4,
        elements: [
          { name: "Organic fertilizers", type: "element", level: 3, sortOrder: 1 },
          { name: "Chemical fertilizers", type: "element", level: 3, sortOrder: 2 },
          { name: "Pest control products", type: "element", level: 3, sortOrder: 3 },
          { name: "Soil enhancers", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Seeds & Nurseries",
        description: "Planting materials and supplies",
        type: "sub",
        level: 2,
        sortOrder: 5,
        elements: [
          { name: "Crop seeds", type: "element", level: 3, sortOrder: 1 },
          { name: "Saplings", type: "element", level: 3, sortOrder: 2 },
          { name: "Indoor gardening supplies", type: "element", level: 3, sortOrder: 3 },
          { name: "Hydroponics", type: "element", level: 3, sortOrder: 4 }
        ]
      }
    ]
  },
  {
    name: "Artisanal & Handicrafts",
    description: "Handmade and traditional crafts",
    type: "main",
    level: 1,
    sortOrder: 3,
    subcategories: [
      {
        name: "Jewelry",
        description: "Handmade jewelry and accessories",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Handmade necklaces", type: "element", level: 3, sortOrder: 1 },
          { name: "Bracelets", type: "element", level: 3, sortOrder: 2 },
          { name: "Rings", type: "element", level: 3, sortOrder: 3 },
          { name: "Earrings", type: "element", level: 3, sortOrder: 4 },
          { name: "Beaded accessories", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Textiles & Fashion",
        description: "Traditional textiles and fashion items",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Traditional clothing", type: "element", level: 3, sortOrder: 1 },
          { name: "Scarves", type: "element", level: 3, sortOrder: 2 },
          { name: "Woven fabrics", type: "element", level: 3, sortOrder: 3 },
          { name: "Hand-dyed textiles", type: "element", level: 3, sortOrder: 4 },
          { name: "Leather goods", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Pottery & Ceramics",
        description: "Clay and ceramic products",
        type: "sub",
        level: 2,
        sortOrder: 3,
        elements: [
          { name: "Decorative pottery", type: "element", level: 3, sortOrder: 1 },
          { name: "Tableware", type: "element", level: 3, sortOrder: 2 },
          { name: "Sculptures", type: "element", level: 3, sortOrder: 3 },
          { name: "Clay home decor", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Cultural Artifacts & Home Decor",
        description: "Cultural and decorative items",
        type: "sub",
        level: 2,
        sortOrder: 4,
        elements: [
          { name: "African masks", type: "element", level: 3, sortOrder: 1 },
          { name: "Wooden carvings", type: "element", level: 3, sortOrder: 2 },
          { name: "Paintings", type: "element", level: 3, sortOrder: 3 },
          { name: "Tapestries", type: "element", level: 3, sortOrder: 4 },
          { name: "Woven baskets", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Handmade Furniture",
        description: "Custom and handcrafted furniture",
        type: "sub",
        level: 2,
        sortOrder: 5,
        elements: [
          { name: "Wooden chairs", type: "element", level: 3, sortOrder: 1 },
          { name: "Tables", type: "element", level: 3, sortOrder: 2 },
          { name: "Beds", type: "element", level: 3, sortOrder: 3 },
          { name: "Handcrafted shelving units", type: "element", level: 3, sortOrder: 4 }
        ]
      }
    ]
  },
  {
    name: "Food & Beverage",
    description: "Food and beverage products and services",
    type: "main",
    level: 1,
    sortOrder: 4,
    subcategories: [
      {
        name: "Local Food Vendors",
        description: "Local food services and vendors",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Street food", type: "element", level: 3, sortOrder: 1 },
          { name: "Traditional dishes", type: "element", level: 3, sortOrder: 2 },
          { name: "Catering services", type: "element", level: 3, sortOrder: 3 },
          { name: "Fast food outlets", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Bakeries & Confectionery",
        description: "Baked goods and sweets",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Cakes", type: "element", level: 3, sortOrder: 1 },
          { name: "Bread", type: "element", level: 3, sortOrder: 2 },
          { name: "Pastries", type: "element", level: 3, sortOrder: 3 },
          { name: "Sweets", type: "element", level: 3, sortOrder: 4 },
          { name: "Biscuits", type: "element", level: 3, sortOrder: 5 },
          { name: "Chocolates", type: "element", level: 3, sortOrder: 6 }
        ]
      },
      {
        name: "Beverage Suppliers",
        description: "Drinks and beverage products",
        type: "sub",
        level: 2,
        sortOrder: 3,
        elements: [
          { name: "Tea", type: "element", level: 3, sortOrder: 1 },
          { name: "Coffee", type: "element", level: 3, sortOrder: 2 },
          { name: "Juice", type: "element", level: 3, sortOrder: 3 },
          { name: "Soft drinks", type: "element", level: 3, sortOrder: 4 },
          { name: "Alcoholic beverages", type: "element", level: 3, sortOrder: 5 },
          { name: "Energy drinks", type: "element", level: 3, sortOrder: 6 }
        ]
      },
      {
        name: "Packaged & Processed Foods",
        description: "Processed and packaged food products",
        type: "sub",
        level: 2,
        sortOrder: 4,
        elements: [
          { name: "Canned goods", type: "element", level: 3, sortOrder: 1 },
          { name: "Frozen meals", type: "element", level: 3, sortOrder: 2 },
          { name: "Snacks", type: "element", level: 3, sortOrder: 3 },
          { name: "Sauces & condiments", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Organic & Specialty Foods",
        description: "Special dietary and organic foods",
        type: "sub",
        level: 2,
        sortOrder: 5,
        elements: [
          { name: "Gluten-free", type: "element", level: 3, sortOrder: 1 },
          { name: "Vegan", type: "element", level: 3, sortOrder: 2 },
          { name: "Keto-friendly products", type: "element", level: 3, sortOrder: 3 }
        ]
      }
    ]
  },
  {
    name: "Construction & Building Materials",
    description: "Construction materials and building supplies",
    type: "main",
    level: 1,
    sortOrder: 5,
    subcategories: [
      {
        name: "Raw Materials",
        description: "Basic construction materials",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Sand", type: "element", level: 3, sortOrder: 1 },
          { name: "Gravel", type: "element", level: 3, sortOrder: 2 },
          { name: "Cement", type: "element", level: 3, sortOrder: 3 },
          { name: "Bricks", type: "element", level: 3, sortOrder: 4 },
          { name: "Tiles", type: "element", level: 3, sortOrder: 5 },
          { name: "Limestone", type: "element", level: 3, sortOrder: 6 }
        ]
      },
      {
        name: "Structural Components",
        description: "Building structural elements",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Roofing sheets", type: "element", level: 3, sortOrder: 1 },
          { name: "Steel rods", type: "element", level: 3, sortOrder: 2 },
          { name: "Timber", type: "element", level: 3, sortOrder: 3 },
          { name: "Insulation", type: "element", level: 3, sortOrder: 4 },
          { name: "Prefabricated structures", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Finishing Materials",
        description: "Final construction materials",
        type: "sub",
        level: 2,
        sortOrder: 3,
        elements: [
          { name: "Paint", type: "element", level: 3, sortOrder: 1 },
          { name: "Adhesives", type: "element", level: 3, sortOrder: 2 },
          { name: "Flooring", type: "element", level: 3, sortOrder: 3 },
          { name: "Doors & windows", type: "element", level: 3, sortOrder: 4 },
          { name: "Plumbing fixtures", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Construction Tools & Equipment",
        description: "Tools and equipment for construction",
        type: "sub",
        level: 2,
        sortOrder: 4,
        elements: [
          { name: "Power tools", type: "element", level: 3, sortOrder: 1 },
          { name: "Hand tools", type: "element", level: 3, sortOrder: 2 },
          { name: "Scaffolding", type: "element", level: 3, sortOrder: 3 },
          { name: "Safety gear", type: "element", level: 3, sortOrder: 4 },
          { name: "Heavy machinery rentals", type: "element", level: 3, sortOrder: 5 }
        ]
      }
    ]
  },
  {
    name: "Education & Learning",
    description: "Educational materials and learning resources",
    type: "main",
    level: 1,
    sortOrder: 6,
    subcategories: [
      {
        name: "School Supplies",
        description: "Basic school and learning materials",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Books", type: "element", level: 3, sortOrder: 1 },
          { name: "Stationery", type: "element", level: 3, sortOrder: 2 },
          { name: "Backpacks", type: "element", level: 3, sortOrder: 3 },
          { name: "Uniforms", type: "element", level: 3, sortOrder: 4 },
          { name: "Educational toys", type: "element", level: 3, sortOrder: 5 }
        ]
      },
      {
        name: "Libraries & Bookstores",
        description: "Reading materials and books",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Textbooks", type: "element", level: 3, sortOrder: 1 },
          { name: "E-books", type: "element", level: 3, sortOrder: 2 },
          { name: "Novels", type: "element", level: 3, sortOrder: 3 },
          { name: "Research materials", type: "element", level: 3, sortOrder: 4 }
        ]
      }
    ]
  },
  {
    name: "Automotive & Transportation",
    description: "Vehicles and automotive products",
    type: "main",
    level: 1,
    sortOrder: 7,
    subcategories: [
      {
        name: "Vehicles & Motorcycles",
        description: "Motor vehicles and transportation",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "New & used cars", type: "element", level: 3, sortOrder: 1 },
          { name: "Motorcycles", type: "element", level: 3, sortOrder: 2 },
          { name: "Scooters", type: "element", level: 3, sortOrder: 3 },
          { name: "Electric vehicles", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Auto Parts & Accessories",
        description: "Automotive parts and accessories",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Batteries", type: "element", level: 3, sortOrder: 1 },
          { name: "Tires", type: "element", level: 3, sortOrder: 2 },
          { name: "Car audio systems", type: "element", level: 3, sortOrder: 3 },
          { name: "GPS", type: "element", level: 3, sortOrder: 4 },
          { name: "Car maintenance tools", type: "element", level: 3, sortOrder: 5 }
        ]
      }
    ]
  },
  {
    name: "Technology & Software",
    description: "Technology products and software solutions",
    type: "main",
    level: 1,
    sortOrder: 8,
    subcategories: [
      {
        name: "Computers & Accessories",
        description: "Computing devices and accessories",
        type: "sub",
        level: 2,
        sortOrder: 1,
        elements: [
          { name: "Laptops", type: "element", level: 3, sortOrder: 1 },
          { name: "Desktops", type: "element", level: 3, sortOrder: 2 },
          { name: "Storage devices", type: "element", level: 3, sortOrder: 3 },
          { name: "Networking equipment", type: "element", level: 3, sortOrder: 4 }
        ]
      },
      {
        name: "Software & Digital Solutions",
        description: "Software and digital services",
        type: "sub",
        level: 2,
        sortOrder: 2,
        elements: [
          { name: "Business software", type: "element", level: 3, sortOrder: 1 },
          { name: "Antivirus", type: "element", level: 3, sortOrder: 2 },
          { name: "Design software", type: "element", level: 3, sortOrder: 3 },
          { name: "Cloud solutions", type: "element", level: 3, sortOrder: 4 }
        ]
      }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('Starting category seeding...');
    
    for (const mainCategory of categoriesData) {
      console.log(`Creating main category: ${mainCategory.name}`);
      
      // Create main category
      const mainCat = await Category.create({
        name: mainCategory.name,
        description: mainCategory.description,
        type: mainCategory.type,
        level: mainCategory.level,
        sortOrder: mainCategory.sortOrder
      });
      
      console.log(`Created main category: ${mainCat._id}`);
      
      // Create subcategories
      for (const subCategory of mainCategory.subcategories) {
        console.log(`Creating subcategory: ${subCategory.name}`);
        
        const subCat = await Category.create({
          name: subCategory.name,
          description: subCategory.description,
          type: subCategory.type,
          level: subCategory.level,
          sortOrder: subCategory.sortOrder,
          parentId: mainCat._id
        });
        
        console.log(`Created subcategory: ${subCat._id}`);
        
        // Create elements
        for (const element of subCategory.elements) {
          console.log(`Creating element: ${element.name}`);
          
          await Category.create({
            name: element.name,
            type: element.type,
            level: element.level,
            sortOrder: element.sortOrder,
            parentId: subCat._id
          });
        }
      }
    }
    
    console.log('Category seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedCategories();
