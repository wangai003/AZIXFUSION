const Category = require("../models/Category");

// Service categories - separate from product/auction categories
const mainCategories = [
  {
    name: "Home Services",
    description: "Plumbing, electrical work, carpentry, cleaning services, painting",
    type: "main",
    level: 1,
    sortOrder: 1
  },
  {
    name: "Transportation & Logistics",
    description: "Ridesharing, private taxi services, courier, delivery, moving & relocation, airport transfers, car rentals, heavy-duty vehicle rentals, vehicle leasing options, intercity bus services",
    type: "main",
    level: 1,
    sortOrder: 2
  },
  {
    name: "Freelance & Digital Services",
    description: "Graphic design, web development, writing, social media management, translation services",
    type: "main",
    level: 1,
    sortOrder: 3
  },
  {
    name: "Event Services",
    description: "Catering, photography, videography, event planning, music & DJ services",
    type: "main",
    level: 1,
    sortOrder: 4
  },
  {
    name: "Health & Wellness Services",
    description: "Personal training, yoga instructors, massage therapy, diet & nutrition consulting",
    type: "main",
    level: 1,
    sortOrder: 5
  },
  {
    name: "Professional Services",
    description: "Contractors, engineers, architects, interior designers",
    type: "main",
    level: 1,
    sortOrder: 6
  },
  {
    name: "Tutoring & Private Lessons",
    description: "Math, science, language tutoring, test prep, music lessons",
    type: "main",
    level: 1,
    sortOrder: 7
  },
  {
    name: "Vocational & Skill Training",
    description: "Coding bootcamps, artisan workshops, farming techniques, fashion design courses",
    type: "main",
    level: 1,
    sortOrder: 8
  },
  {
    name: "Online & E-Learning Platforms",
    description: "Digital courses, educational apps, virtual training, corporate training programs",
    type: "main",
    level: 1,
    sortOrder: 9
  },
  {
    name: "Tech Services & Repairs",
    description: "IT support, gadget repair, cybersecurity consulting",
    type: "main",
    level: 1,
    sortOrder: 10
  },
  {
    name: "Banking & Financial Services",
    description: "Loans, insurance, savings accounts, mobile money services",
    type: "main",
    level: 1,
    sortOrder: 11
  },
  {
    name: "Business Consulting & Legal Services",
    description: "Business registration, tax consulting, trademark registration, accounting services",
    type: "main",
    level: 1,
    sortOrder: 12
  },
  {
    name: "Hotels & Accommodations",
    description: "Hotels, guest houses, Airbnb rentals",
    type: "main",
    level: 1,
    sortOrder: 13
  },
  {
    name: "Travel Agencies & Tour Operators",
    description: "Safari tours, flight bookings, vacation planning",
    type: "main",
    level: 1,
    sortOrder: 14
  }
];

// Subcategories for each main service category
const subcategories = {
  "Home Services": [
    {
      name: "Plumbing Services",
      description: "Pipe repairs, installations, leak detection, drainage systems",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Electrical Services",
      description: "Wiring, outlet installation, electrical repairs, lighting fixtures",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Carpentry & Woodwork",
      description: "Furniture repair, custom woodwork, installations, renovations",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Cleaning Services",
      description: "House cleaning, deep cleaning, office cleaning, post-construction cleanup",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Painting Services",
      description: "Interior painting, exterior painting, wallpapering, surface preparation",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Transportation & Logistics": [
    {
      name: "Ridesharing & Taxi Services",
      description: "Private taxi, ridesharing, airport transfers, chauffeur services",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Courier & Delivery Services",
      description: "Package delivery, same-day delivery, express shipping, logistics",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Moving & Relocation Services",
      description: "House moving, office relocation, packing services, storage solutions",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Vehicle Rentals",
      description: "Car rentals, truck rentals, motorcycle rentals, equipment rentals",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Bus & Intercity Services",
      description: "Intercity bus services, shuttle services, group transportation",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Freelance & Digital Services": [
    {
      name: "Graphic Design",
      description: "Logo design, branding, marketing materials, web graphics",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Web Development",
      description: "Website development, e-commerce sites, web applications, maintenance",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Content Writing",
      description: "Blog writing, copywriting, technical writing, SEO content",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Social Media Management",
      description: "Social media strategy, content creation, community management, advertising",
      type: "sub",
      level: 2,
      sortOrder: 4
    },
    {
      name: "Translation Services",
      description: "Document translation, website localization, interpretation services",
      type: "sub",
      level: 2,
      sortOrder: 5
    }
  ],
  "Event Services": [
    {
      name: "Catering Services",
      description: "Event catering, food service, beverage service, dietary accommodations",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Photography & Videography",
      description: "Event photography, videography, photo editing, video production",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Event Planning",
      description: "Wedding planning, corporate events, party planning, coordination",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Music & Entertainment",
      description: "DJ services, live music, entertainment booking, sound systems",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Health & Wellness Services": [
    {
      name: "Personal Training",
      description: "Fitness training, strength training, sports conditioning, nutrition guidance",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Yoga & Meditation",
      description: "Yoga classes, meditation sessions, mindfulness training, wellness coaching",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Massage Therapy",
      description: "Therapeutic massage, sports massage, relaxation massage, spa treatments",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Nutrition Consulting",
      description: "Diet planning, nutritional counseling, meal planning, health coaching",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Professional Services": [
    {
      name: "Construction Contractors",
      description: "Building construction, renovations, home improvements, project management",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Engineering Services",
      description: "Structural engineering, electrical engineering, mechanical engineering, consulting",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Architecture & Design",
      description: "Architectural design, interior design, landscape design, 3D modeling",
      type: "sub",
      level: 2,
      sortOrder: 3
    }
  ],
  "Tutoring & Private Lessons": [
    {
      name: "Academic Tutoring",
      description: "Math tutoring, science tutoring, language arts, test preparation",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Language Lessons",
      description: "English lessons, foreign language instruction, conversation practice",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Music Lessons",
      description: "Piano lessons, guitar lessons, vocal training, music theory",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Test Preparation",
      description: "SAT prep, ACT prep, GRE prep, professional certification prep",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Vocational & Skill Training": [
    {
      name: "Coding & Programming",
      description: "Web development bootcamps, mobile app development, software engineering",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Artisan Workshops",
      description: "Woodworking, metalworking, jewelry making, traditional crafts",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Business Skills",
      description: "Entrepreneurship training, marketing skills, sales training",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Fashion & Design",
      description: "Fashion design courses, pattern making, sewing techniques",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Online & E-Learning Platforms": [
    {
      name: "Digital Courses",
      description: "Online courses, video tutorials, skill development programs",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Educational Apps",
      description: "Learning apps, educational software, interactive learning tools",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Virtual Training",
      description: "Remote training sessions, webinars, virtual classrooms",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Corporate Training",
      description: "Employee training programs, professional development, compliance training",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Tech Services & Repairs": [
    {
      name: "IT Support",
      description: "Computer repair, network setup, software installation, troubleshooting",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Gadget Repair",
      description: "Phone repair, laptop repair, tablet repair, electronics servicing",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Cybersecurity Consulting",
      description: "Security audits, data protection, network security, compliance",
      type: "sub",
      level: 2,
      sortOrder: 3
    }
  ],
  "Banking & Financial Services": [
    {
      name: "Loan Services",
      description: "Personal loans, business loans, mortgage consulting, loan processing",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Insurance Services",
      description: "Life insurance, health insurance, property insurance, auto insurance",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Financial Planning",
      description: "Investment planning, retirement planning, tax planning, wealth management",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Mobile Money Services",
      description: "Mobile banking, money transfers, bill payments, financial transactions",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Business Consulting & Legal Services": [
    {
      name: "Business Registration",
      description: "Company registration, legal documentation, business licensing",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Tax Consulting",
      description: "Tax preparation, tax planning, tax compliance, audit support",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Legal Services",
      description: "Trademark registration, contract drafting, legal consultation",
      type: "sub",
      level: 2,
      sortOrder: 3
    },
    {
      name: "Accounting Services",
      description: "Bookkeeping, financial reporting, payroll services, audit preparation",
      type: "sub",
      level: 2,
      sortOrder: 4
    }
  ],
  "Hotels & Accommodations": [
    {
      name: "Hotel Bookings",
      description: "Hotel reservations, room bookings, accommodation packages",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Guest Houses",
      description: "Bed and breakfast, guest house bookings, short-term rentals",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Vacation Rentals",
      description: "Airbnb management, vacation home rentals, property listings",
      type: "sub",
      level: 2,
      sortOrder: 3
    }
  ],
  "Travel Agencies & Tour Operators": [
    {
      name: "Safari Tours",
      description: "Wildlife safaris, guided tours, adventure travel, eco-tourism",
      type: "sub",
      level: 2,
      sortOrder: 1
    },
    {
      name: "Flight Bookings",
      description: "Airline tickets, flight reservations, travel itineraries",
      type: "sub",
      level: 2,
      sortOrder: 2
    },
    {
      name: "Vacation Planning",
      description: "Travel planning, itinerary creation, destination guidance",
      type: "sub",
      level: 2,
      sortOrder: 3
    }
  ]
};

// Elements (Level 3) for each service subcategory
const elements = {
  "Plumbing Services": [
    { name: "Pipe repairs", type: "element", level: 3 },
    { name: "Installations", type: "element", level: 3 },
    { name: "Leak detection", type: "element", level: 3 },
    { name: "Drainage systems", type: "element", level: 3 }
  ],
  "Electrical Services": [
    { name: "Wiring repairs", type: "element", level: 3 },
    { name: "Outlet installation", type: "element", level: 3 },
    { name: "Electrical repairs", type: "element", level: 3 },
    { name: "Lighting fixtures", type: "element", level: 3 }
  ],
  "Carpentry & Woodwork": [
    { name: "Furniture repair", type: "element", level: 3 },
    { name: "Custom woodwork", type: "element", level: 3 },
    { name: "Installations", type: "element", level: 3 },
    { name: "Renovations", type: "element", level: 3 }
  ],
  "Cleaning Services": [
    { name: "House cleaning", type: "element", level: 3 },
    { name: "Deep cleaning", type: "element", level: 3 },
    { name: "Office cleaning", type: "element", level: 3 },
    { name: "Post-construction cleanup", type: "element", level: 3 }
  ],
  "Painting Services": [
    { name: "Interior painting", type: "element", level: 3 },
    { name: "Exterior painting", type: "element", level: 3 },
    { name: "Wallpapering", type: "element", level: 3 },
    { name: "Surface preparation", type: "element", level: 3 }
  ],
  "Ridesharing & Taxi Services": [
    { name: "Private taxi", type: "element", level: 3 },
    { name: "Ridesharing", type: "element", level: 3 },
    { name: "Airport transfers", type: "element", level: 3 },
    { name: "Chauffeur services", type: "element", level: 3 }
  ],
  "Courier & Delivery Services": [
    { name: "Package delivery", type: "element", level: 3 },
    { name: "Same-day delivery", type: "element", level: 3 },
    { name: "Express shipping", type: "element", level: 3 },
    { name: "Logistics", type: "element", level: 3 }
  ],
  "Moving & Relocation Services": [
    { name: "House moving", type: "element", level: 3 },
    { name: "Office relocation", type: "element", level: 3 },
    { name: "Packing services", type: "element", level: 3 },
    { name: "Storage solutions", type: "element", level: 3 }
  ],
  "Vehicle Rentals": [
    { name: "Car rentals", type: "element", level: 3 },
    { name: "Truck rentals", type: "element", level: 3 },
    { name: "Motorcycle rentals", type: "element", level: 3 },
    { name: "Equipment rentals", type: "element", level: 3 }
  ],
  "Bus & Intercity Services": [
    { name: "Intercity bus services", type: "element", level: 3 },
    { name: "Shuttle services", type: "element", level: 3 },
    { name: "Group transportation", type: "element", level: 3 }
  ],
  "Graphic Design": [
    { name: "Logo design", type: "element", level: 3 },
    { name: "Branding", type: "element", level: 3 },
    { name: "Marketing materials", type: "element", level: 3 },
    { name: "Web graphics", type: "element", level: 3 }
  ],
  "Web Development": [
    { name: "Website development", type: "element", level: 3 },
    { name: "E-commerce sites", type: "element", level: 3 },
    { name: "Web applications", type: "element", level: 3 },
    { name: "Maintenance", type: "element", level: 3 }
  ],
  "Content Writing": [
    { name: "Blog writing", type: "element", level: 3 },
    { name: "Copywriting", type: "element", level: 3 },
    { name: "Technical writing", type: "element", level: 3 },
    { name: "SEO content", type: "element", level: 3 }
  ],
  "Social Media Management": [
    { name: "Social media strategy", type: "element", level: 3 },
    { name: "Content creation", type: "element", level: 3 },
    { name: "Community management", type: "element", level: 3 },
    { name: "Advertising", type: "element", level: 3 }
  ],
  "Translation Services": [
    { name: "Document translation", type: "element", level: 3 },
    { name: "Website localization", type: "element", level: 3 },
    { name: "Interpretation services", type: "element", level: 3 }
  ],
  "Catering Services": [
    { name: "Event catering", type: "element", level: 3 },
    { name: "Food service", type: "element", level: 3 },
    { name: "Beverage service", type: "element", level: 3 },
    { name: "Dietary accommodations", type: "element", level: 3 }
  ],
  "Photography & Videography": [
    { name: "Event photography", type: "element", level: 3 },
    { name: "Videography", type: "element", level: 3 },
    { name: "Photo editing", type: "element", level: 3 },
    { name: "Video production", type: "element", level: 3 }
  ],
  "Event Planning": [
    { name: "Wedding planning", type: "element", level: 3 },
    { name: "Corporate events", type: "element", level: 3 },
    { name: "Party planning", type: "element", level: 3 },
    { name: "Coordination", type: "element", level: 3 }
  ],
  "Music & Entertainment": [
    { name: "DJ services", type: "element", level: 3 },
    { name: "Live music", type: "element", level: 3 },
    { name: "Entertainment booking", type: "element", level: 3 },
    { name: "Sound systems", type: "element", level: 3 }
  ],
  "Personal Training": [
    { name: "Fitness training", type: "element", level: 3 },
    { name: "Strength training", type: "element", level: 3 },
    { name: "Sports conditioning", type: "element", level: 3 },
    { name: "Nutrition guidance", type: "element", level: 3 }
  ],
  "Yoga & Meditation": [
    { name: "Yoga classes", type: "element", level: 3 },
    { name: "Meditation sessions", type: "element", level: 3 },
    { name: "Mindfulness training", type: "element", level: 3 },
    { name: "Wellness coaching", type: "element", level: 3 }
  ],
  "Massage Therapy": [
    { name: "Therapeutic massage", type: "element", level: 3 },
    { name: "Sports massage", type: "element", level: 3 },
    { name: "Relaxation massage", type: "element", level: 3 },
    { name: "Spa treatments", type: "element", level: 3 }
  ],
  "Nutrition Consulting": [
    { name: "Diet planning", type: "element", level: 3 },
    { name: "Nutritional counseling", type: "element", level: 3 },
    { name: "Meal planning", type: "element", level: 3 },
    { name: "Health coaching", type: "element", level: 3 }
  ],
  "Construction Contractors": [
    { name: "Building construction", type: "element", level: 3 },
    { name: "Renovations", type: "element", level: 3 },
    { name: "Home improvements", type: "element", level: 3 },
    { name: "Project management", type: "element", level: 3 }
  ],
  "Engineering Services": [
    { name: "Structural engineering", type: "element", level: 3 },
    { name: "Electrical engineering", type: "element", level: 3 },
    { name: "Mechanical engineering", type: "element", level: 3 },
    { name: "Consulting", type: "element", level: 3 }
  ],
  "Architecture & Design": [
    { name: "Architectural design", type: "element", level: 3 },
    { name: "Interior design", type: "element", level: 3 },
    { name: "Landscape design", type: "element", level: 3 },
    { name: "3D modeling", type: "element", level: 3 }
  ],
  "Academic Tutoring": [
    { name: "Math tutoring", type: "element", level: 3 },
    { name: "Science tutoring", type: "element", level: 3 },
    { name: "Language arts", type: "element", level: 3 },
    { name: "Test preparation", type: "element", level: 3 }
  ],
  "Language Lessons": [
    { name: "English lessons", type: "element", level: 3 },
    { name: "Foreign language instruction", type: "element", level: 3 },
    { name: "Conversation practice", type: "element", level: 3 }
  ],
  "Music Lessons": [
    { name: "Piano lessons", type: "element", level: 3 },
    { name: "Guitar lessons", type: "element", level: 3 },
    { name: "Vocal training", type: "element", level: 3 },
    { name: "Music theory", type: "element", level: 3 }
  ],
  "Test Preparation": [
    { name: "SAT prep", type: "element", level: 3 },
    { name: "ACT prep", type: "element", level: 3 },
    { name: "GRE prep", type: "element", level: 3 },
    { name: "Professional certification prep", type: "element", level: 3 }
  ],
  "Coding & Programming": [
    { name: "Web development bootcamps", type: "element", level: 3 },
    { name: "Mobile app development", type: "element", level: 3 },
    { name: "Software engineering", type: "element", level: 3 }
  ],
  "Artisan Workshops": [
    { name: "Woodworking", type: "element", level: 3 },
    { name: "Metalworking", type: "element", level: 3 },
    { name: "Jewelry making", type: "element", level: 3 },
    { name: "Traditional crafts", type: "element", level: 3 }
  ],
  "Business Skills": [
    { name: "Entrepreneurship training", type: "element", level: 3 },
    { name: "Marketing skills", type: "element", level: 3 },
    { name: "Sales training", type: "element", level: 3 }
  ],
  "Fashion & Design": [
    { name: "Fashion design courses", type: "element", level: 3 },
    { name: "Pattern making", type: "element", level: 3 },
    { name: "Sewing techniques", type: "element", level: 3 }
  ],
  "Digital Courses": [
    { name: "Online courses", type: "element", level: 3 },
    { name: "Video tutorials", type: "element", level: 3 },
    { name: "Skill development programs", type: "element", level: 3 }
  ],
  "Educational Apps": [
    { name: "Learning apps", type: "element", level: 3 },
    { name: "Educational software", type: "element", level: 3 },
    { name: "Interactive learning tools", type: "element", level: 3 }
  ],
  "Virtual Training": [
    { name: "Remote training sessions", type: "element", level: 3 },
    { name: "Webinars", type: "element", level: 3 },
    { name: "Virtual classrooms", type: "element", level: 3 }
  ],
  "Corporate Training": [
    { name: "Employee training programs", type: "element", level: 3 },
    { name: "Professional development", type: "element", level: 3 },
    { name: "Compliance training", type: "element", level: 3 }
  ],
  "IT Support": [
    { name: "Computer repair", type: "element", level: 3 },
    { name: "Network setup", type: "element", level: 3 },
    { name: "Software installation", type: "element", level: 3 },
    { name: "Troubleshooting", type: "element", level: 3 }
  ],
  "Gadget Repair": [
    { name: "Phone repair", type: "element", level: 3 },
    { name: "Laptop repair", type: "element", level: 3 },
    { name: "Tablet repair", type: "element", level: 3 },
    { name: "Electronics servicing", type: "element", level: 3 }
  ],
  "Cybersecurity Consulting": [
    { name: "Security audits", type: "element", level: 3 },
    { name: "Data protection", type: "element", level: 3 },
    { name: "Network security", type: "element", level: 3 },
    { name: "Compliance", type: "element", level: 3 }
  ],
  "Loan Services": [
    { name: "Personal loans", type: "element", level: 3 },
    { name: "Business loans", type: "element", level: 3 },
    { name: "Mortgage consulting", type: "element", level: 3 },
    { name: "Loan processing", type: "element", level: 3 }
  ],
  "Insurance Services": [
    { name: "Life insurance", type: "element", level: 3 },
    { name: "Health insurance", type: "element", level: 3 },
    { name: "Property insurance", type: "element", level: 3 },
    { name: "Auto insurance", type: "element", level: 3 }
  ],
  "Financial Planning": [
    { name: "Investment planning", type: "element", level: 3 },
    { name: "Retirement planning", type: "element", level: 3 },
    { name: "Tax planning", type: "element", level: 3 },
    { name: "Wealth management", type: "element", level: 3 }
  ],
  "Mobile Money Services": [
    { name: "Mobile banking", type: "element", level: 3 },
    { name: "Money transfers", type: "element", level: 3 },
    { name: "Bill payments", type: "element", level: 3 },
    { name: "Financial transactions", type: "element", level: 3 }
  ],
  "Business Registration": [
    { name: "Company registration", type: "element", level: 3 },
    { name: "Legal documentation", type: "element", level: 3 },
    { name: "Business licensing", type: "element", level: 3 }
  ],
  "Tax Consulting": [
    { name: "Tax preparation", type: "element", level: 3 },
    { name: "Tax planning", type: "element", level: 3 },
    { name: "Tax compliance", type: "element", level: 3 },
    { name: "Audit support", type: "element", level: 3 }
  ],
  "Legal Services": [
    { name: "Trademark registration", type: "element", level: 3 },
    { name: "Contract drafting", type: "element", level: 3 },
    { name: "Legal consultation", type: "element", level: 3 }
  ],
  "Accounting Services": [
    { name: "Bookkeeping", type: "element", level: 3 },
    { name: "Financial reporting", type: "element", level: 3 },
    { name: "Payroll services", type: "element", level: 3 },
    { name: "Audit preparation", type: "element", level: 3 }
  ],
  "Hotel Bookings": [
    { name: "Hotel reservations", type: "element", level: 3 },
    { name: "Room bookings", type: "element", level: 3 },
    { name: "Accommodation packages", type: "element", level: 3 }
  ],
  "Guest Houses": [
    { name: "Bed and breakfast", type: "element", level: 3 },
    { name: "Guest house bookings", type: "element", level: 3 },
    { name: "Short-term rentals", type: "element", level: 3 }
  ],
  "Vacation Rentals": [
    { name: "Airbnb management", type: "element", level: 3 },
    { name: "Vacation home rentals", type: "element", level: 3 },
    { name: "Property listings", type: "element", level: 3 }
  ],
  "Safari Tours": [
    { name: "Wildlife safaris", type: "element", level: 3 },
    { name: "Guided tours", type: "element", level: 3 },
    { name: "Adventure travel", type: "element", level: 3 },
    { name: "Eco-tourism", type: "element", level: 3 }
  ],
  "Flight Bookings": [
    { name: "Airline tickets", type: "element", level: 3 },
    { name: "Flight reservations", type: "element", level: 3 },
    { name: "Travel itineraries", type: "element", level: 3 }
  ],
  "Vacation Planning": [
    { name: "Travel planning", type: "element", level: 3 },
    { name: "Itinerary creation", type: "element", level: 3 },
    { name: "Destination guidance", type: "element", level: 3 }
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
