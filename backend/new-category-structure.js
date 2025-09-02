// New Comprehensive Category Structure
// This file defines the complete category hierarchy for the e-commerce platform

const NEW_CATEGORY_STRUCTURE = {
  "retail-consumer-goods": {
    name: "Retail & Consumer Goods",
    description: "Consumer products and retail goods for everyday use",
    icon: "shopping_cart",
    sortOrder: 1,
    subcategories: {
      "groceries": {
        name: "Groceries",
        description: "Fresh produce, dairy products, packaged foods, beverages, snacks, frozen foods, spices & condiments",
        icon: "local_grocery_store",
        sortOrder: 1,
        elements: [
          "fresh-produce",
          "dairy-products", 
          "packaged-foods",
          "beverages",
          "snacks",
          "frozen-foods",
          "spices-condiments"
        ]
      },
      "clothing-apparel": {
        name: "Clothing & Apparel",
        description: "Men's fashion, women's fashion, children's wear, footwear, accessories",
        icon: "checkroom",
        sortOrder: 2,
        elements: [
          "mens-fashion",
          "womens-fashion",
          "childrens-wear",
          "footwear",
          "accessories"
        ]
      },
      "electronics-gadgets": {
        name: "Electronics & Gadgets",
        description: "Smartphones, laptops, tablets, home entertainment, gaming consoles, accessories",
        icon: "devices",
        sortOrder: 3,
        elements: [
          "smartphones",
          "laptops",
          "tablets",
          "home-entertainment",
          "gaming-consoles",
          "accessories"
        ]
      },
      "home-appliances": {
        name: "Home Appliances",
        description: "Kitchen appliances, laundry machines, air conditioners, refrigerators, smart home devices",
        icon: "home",
        sortOrder: 4,
        elements: [
          "kitchen-appliances",
          "laundry-machines",
          "air-conditioners",
          "refrigerators",
          "smart-home-devices"
        ]
      },
      "beauty-personal-care": {
        name: "Beauty & Personal Care",
        description: "Skincare, haircare, grooming tools, cosmetics, perfumes, hygiene products",
        icon: "face",
        sortOrder: 5,
        elements: [
          "skincare",
          "haircare",
          "grooming-tools",
          "cosmetics",
          "perfumes",
          "hygiene-products"
        ]
      },
      "health-wellness": {
        name: "Health & Wellness",
        description: "Supplements, vitamins, medical devices, fitness equipment, alternative medicine",
        icon: "favorite",
        sortOrder: 6,
        elements: [
          "supplements",
          "vitamins",
          "medical-devices",
          "fitness-equipment",
          "alternative-medicine"
        ]
      }
    }
  },
  "agriculture": {
    name: "Agriculture",
    description: "Agricultural products, farming equipment, and livestock",
    icon: "agriculture",
    sortOrder: 2,
    subcategories: {
      "fresh-produce": {
        name: "Fresh Produce",
        description: "Fruits, vegetables, grains, herbs, organic produce",
        icon: "eco",
        sortOrder: 1,
        elements: [
          "fruits",
          "vegetables",
          "grains",
          "herbs",
          "organic-produce"
        ]
      },
      "livestock-poultry": {
        name: "Livestock & Poultry",
        description: "Cattle, sheep, goats, chickens, eggs, dairy products, beekeeping & honey production",
        icon: "pets",
        sortOrder: 2,
        elements: [
          "cattle",
          "sheep",
          "goats",
          "chickens",
          "eggs",
          "dairy-products",
          "beekeeping-honey"
        ]
      },
      "farming-tools-equipment": {
        name: "Farming Tools & Equipment",
        description: "Tractors, irrigation systems, hand tools, greenhouses, storage silos",
        icon: "build",
        sortOrder: 3,
        elements: [
          "tractors",
          "irrigation-systems",
          "hand-tools",
          "greenhouses",
          "storage-silos"
        ]
      },
      "fertilizers-pesticides": {
        name: "Fertilizers & Pesticides",
        description: "Organic fertilizers, chemical fertilizers, pest control products, soil enhancers",
        icon: "grass",
        sortOrder: 4,
        elements: [
          "organic-fertilizers",
          "chemical-fertilizers",
          "pest-control-products",
          "soil-enhancers"
        ]
      },
      "seeds-nurseries": {
        name: "Seeds & Nurseries",
        description: "Crop seeds, saplings, indoor gardening supplies, hydroponics",
        icon: "local_florist",
        sortOrder: 5,
        elements: [
          "crop-seeds",
          "saplings",
          "indoor-gardening-supplies",
          "hydroponics"
        ]
      }
    }
  },
  "artisanal-handicrafts": {
    name: "Artisanal & Handicrafts",
    description: "Handmade crafts, traditional artifacts, and cultural items",
    icon: "handyman",
    sortOrder: 3,
    subcategories: {
      "jewelry": {
        name: "Jewelry",
        description: "Handmade necklaces, bracelets, rings, earrings, beaded accessories",
        icon: "diamond",
        sortOrder: 1,
        elements: [
          "necklaces",
          "bracelets",
          "rings",
          "earrings",
          "beaded-accessories"
        ]
      },
      "textiles-fashion": {
        name: "Textiles & Fashion",
        description: "Traditional clothing, scarves, woven fabrics, hand-dyed textiles, leather goods",
        icon: "style",
        sortOrder: 2,
        elements: [
          "traditional-clothing",
          "scarves",
          "woven-fabrics",
          "hand-dyed-textiles",
          "leather-goods"
        ]
      },
      "pottery-ceramics": {
        name: "Pottery & Ceramics",
        description: "Decorative pottery, tableware, sculptures, clay home decor",
        icon: "ceramic",
        sortOrder: 3,
        elements: [
          "decorative-pottery",
          "tableware",
          "sculptures",
          "clay-home-decor"
        ]
      },
      "cultural-artifacts-home-decor": {
        name: "Cultural Artifacts & Home Decor",
        description: "African masks, wooden carvings, paintings, tapestries, woven baskets",
        icon: "museum",
        sortOrder: 4,
        elements: [
          "african-masks",
          "wooden-carvings",
          "paintings",
          "tapestries",
          "woven-baskets"
        ]
      },
      "handmade-furniture": {
        name: "Handmade Furniture",
        description: "Wooden chairs, tables, beds, handcrafted shelving units",
        icon: "chair",
        sortOrder: 5,
        elements: [
          "wooden-chairs",
          "tables",
          "beds",
          "handcrafted-shelving"
        ]
      }
    }
  },
  "food-beverage": {
    name: "Food & Beverage",
    description: "Local food vendors, bakeries, and beverage suppliers",
    icon: "restaurant",
    sortOrder: 4,
    subcategories: {
      "local-food-vendors": {
        name: "Local Food Vendors",
        description: "Street food, traditional dishes, catering services, fast food outlets",
        icon: "local_dining",
        sortOrder: 1,
        elements: [
          "street-food",
          "traditional-dishes",
          "catering-services",
          "fast-food-outlets"
        ]
      },
      "bakeries-confectionery": {
        name: "Bakeries & Confectionery",
        description: "Cakes, bread, pastries, sweets, biscuits, chocolates",
        icon: "cake",
        sortOrder: 2,
        elements: [
          "cakes",
          "bread",
          "pastries",
          "sweets",
          "biscuits",
          "chocolates"
        ]
      },
      "beverage-suppliers": {
        name: "Beverage Suppliers",
        description: "Tea, coffee, juice, soft drinks, alcoholic beverages, energy drinks",
        icon: "local_cafe",
        sortOrder: 3,
        elements: [
          "tea",
          "coffee",
          "juice",
          "soft-drinks",
          "alcoholic-beverages",
          "energy-drinks"
        ]
      },
      "packaged-processed-foods": {
        name: "Packaged & Processed Foods",
        description: "Canned goods, frozen meals, snacks, sauces & condiments",
        icon: "inventory",
        sortOrder: 4,
        elements: [
          "canned-goods",
          "frozen-meals",
          "snacks",
          "sauces-condiments"
        ]
      },
      "organic-specialty-foods": {
        name: "Organic & Specialty Foods",
        description: "Gluten-free, vegan, keto-friendly products",
        icon: "eco",
        sortOrder: 5,
        elements: [
          "gluten-free",
          "vegan",
          "keto-friendly",
          "organic-products"
        ]
      }
    }
  },
  "construction-building-materials": {
    name: "Construction & Building Materials",
    description: "Construction materials, tools, and equipment",
    icon: "construction",
    sortOrder: 5,
    subcategories: {
      "raw-materials": {
        name: "Raw Materials",
        description: "Sand, gravel, cement, bricks, tiles, limestone",
        icon: "layers",
        sortOrder: 1,
        elements: [
          "sand",
          "gravel",
          "cement",
          "bricks",
          "tiles",
          "limestone"
        ]
      },
      "structural-components": {
        name: "Structural Components",
        description: "Roofing sheets, steel rods, timber, insulation, prefabricated structures",
        icon: "architecture",
        sortOrder: 2,
        elements: [
          "roofing-sheets",
          "steel-rods",
          "timber",
          "insulation",
          "prefabricated-structures"
        ]
      },
      "finishing-materials": {
        name: "Finishing Materials",
        description: "Paint, adhesives, flooring, doors & windows, plumbing fixtures",
        icon: "brush",
        sortOrder: 3,
        elements: [
          "paint",
          "adhesives",
          "flooring",
          "doors-windows",
          "plumbing-fixtures"
        ]
      },
      "construction-tools-equipment": {
        name: "Construction Tools & Equipment",
        description: "Power tools, hand tools, scaffolding, safety gear, heavy machinery rentals",
        icon: "handyman",
        sortOrder: 4,
        elements: [
          "power-tools",
          "hand-tools",
          "scaffolding",
          "safety-gear",
          "heavy-machinery-rentals"
        ]
      }
    }
  },
  "education-learning": {
    name: "Education & Learning",
    description: "Educational materials, books, and learning resources",
    icon: "school",
    sortOrder: 6,
    subcategories: {
      "school-supplies": {
        name: "School Supplies",
        description: "Books, stationery, backpacks, uniforms, educational toys",
        icon: "book",
        sortOrder: 1,
        elements: [
          "books",
          "stationery",
          "backpacks",
          "uniforms",
          "educational-toys"
        ]
      },
      "libraries-bookstores": {
        name: "Libraries & Bookstores",
        description: "Textbooks, e-books, novels, research materials",
        icon: "local_library",
        sortOrder: 2,
        elements: [
          "textbooks",
          "e-books",
          "novels",
          "research-materials"
        ]
      }
    }
  },
  "automotive-transportation": {
    name: "Automotive & Transportation",
    description: "Vehicles, auto parts, and transportation services",
    icon: "directions_car",
    sortOrder: 7,
    subcategories: {
      "vehicles-motorcycles": {
        name: "Vehicles & Motorcycles",
        description: "New & used cars, motorcycles, scooters, electric vehicles",
        icon: "motorcycle",
        sortOrder: 1,
        elements: [
          "new-cars",
          "used-cars",
          "motorcycles",
          "scooters",
          "electric-vehicles"
        ]
      },
      "auto-parts-accessories": {
        name: "Auto Parts & Accessories",
        description: "Batteries, tires, car audio systems, GPS, car maintenance tools",
        icon: "build_circle",
        sortOrder: 2,
        elements: [
          "batteries",
          "tires",
          "car-audio-systems",
          "gps",
          "car-maintenance-tools"
        ]
      }
    }
  },
  "technology-software": {
    name: "Technology & Software",
    description: "Computers, software, and digital solutions",
    icon: "computer",
    sortOrder: 8,
    subcategories: {
      "computers-accessories": {
        name: "Computers & Accessories",
        description: "Laptops, desktops, storage devices, networking equipment",
        icon: "laptop",
        sortOrder: 1,
        elements: [
          "laptops",
          "desktops",
          "storage-devices",
          "networking-equipment"
        ]
      },
      "software-digital-solutions": {
        name: "Software & Digital Solutions",
        description: "Business software, antivirus, design software, cloud solutions",
        icon: "code",
        sortOrder: 2,
        elements: [
          "business-software",
          "antivirus",
          "design-software",
          "cloud-solutions"
        ]
      }
    }
  }
};

// Helper function to generate category data for seeding
function generateCategoryData() {
  const categories = [];
  let sortOrder = 1;

  // Generate main categories
  Object.entries(NEW_CATEGORY_STRUCTURE).forEach(([slug, mainCat]) => {
    const mainCategory = {
      slug: slug,
      name: mainCat.name,
      description: mainCat.description,
      icon: mainCat.icon,
      type: 'main',
      level: 1,
      sortOrder: mainCat.sortOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    categories.push(mainCategory);
    const mainCategoryId = `main_${slug}`; // Temporary ID for reference
    
    // Generate subcategories
    Object.entries(mainCat.subcategories).forEach(([subSlug, subCat]) => {
      const subcategory = {
        slug: subSlug,
        name: subCat.name,
        description: subCat.description,
        icon: subCat.icon,
        type: 'sub',
        level: 2,
        parentId: mainCategoryId,
        sortOrder: subCat.sortOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      categories.push(subcategory);
      const subcategoryId = `sub_${subSlug}`; // Temporary ID for reference
      
      // Generate elements
      subCat.elements.forEach((elementSlug, index) => {
        const element = {
          slug: elementSlug,
          name: elementSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: `Products and services related to ${elementSlug.split('-').join(' ')}`,
          icon: 'category',
          type: 'element',
          level: 3,
          parentId: subcategoryId,
          sortOrder: index + 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        categories.push(element);
      });
    });
  });

  return categories;
}

// Helper function to get category by slug
function getCategoryBySlug(slug, type = 'main') {
  if (type === 'main') {
    return NEW_CATEGORY_STRUCTURE[slug];
  }
  
  // Search through all categories for subcategories or elements
  for (const [mainSlug, mainCat] of Object.entries(NEW_CATEGORY_STRUCTURE)) {
    if (type === 'sub') {
      if (mainCat.subcategories[slug]) {
        return { ...mainCat.subcategories[slug], mainCategory: mainSlug };
      }
    } else if (type === 'element') {
      for (const [subSlug, subCat] of Object.entries(mainCat.subcategories)) {
        if (subCat.elements.includes(slug)) {
          return { 
            name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            mainCategory: mainSlug,
            subcategory: subSlug 
          };
        }
      }
    }
  }
  
  return null;
}

// Helper function to get breadcrumb path
function getCategoryPath(slug, type = 'main') {
  const path = [];
  
  if (type === 'main') {
    const mainCat = NEW_CATEGORY_STRUCTURE[slug];
    if (mainCat) {
      path.push({ slug, name: mainCat.name, type: 'main' });
    }
  } else if (type === 'sub') {
    for (const [mainSlug, mainCat] of Object.entries(NEW_CATEGORY_STRUCTURE)) {
      if (mainCat.subcategories[slug]) {
        path.push({ slug: mainSlug, name: mainCat.name, type: 'main' });
        path.push({ slug, name: mainCat.subcategories[slug].name, type: 'sub' });
        break;
      }
    }
  } else if (type === 'element') {
    for (const [mainSlug, mainCat] of Object.entries(NEW_CATEGORY_STRUCTURE)) {
      for (const [subSlug, subCat] of Object.entries(mainCat.subcategories)) {
        if (subCat.elements.includes(slug)) {
          path.push({ slug: mainSlug, name: mainCat.name, type: 'main' });
          path.push({ slug: subSlug, name: subCat.name, type: 'sub' });
          path.push({ 
            slug, 
            name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
            type: 'element' 
          });
          break;
        }
      }
    }
  }
  
  return path;
}

module.exports = {
  NEW_CATEGORY_STRUCTURE,
  generateCategoryData,
  getCategoryBySlug,
  getCategoryPath
};
