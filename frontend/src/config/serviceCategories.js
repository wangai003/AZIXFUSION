export const SERVICE_CATEGORIES = {
  'Home Services': {
    icon: '🏠',
    subcategories: [
      'Plumbing',
      'Electrical Work',
      'Carpentry',
      'Cleaning Services',
      'Painting',
      'Landscaping',
      'HVAC Services',
      'Roofing',
      'Flooring',
      'Security Systems'
    ]
  },
  'Transportation & Logistics': {
    icon: '🚗',
    subcategories: [
      'Ridesharing (Uber, Bolt)',
      'Private Taxi Services',
      'Courier Services',
      'Delivery Services',
      'Moving & Relocation',
      'Airport Transfers',
      'Car Rentals',
      'Heavy-Duty Vehicle Rentals',
      'Vehicle Leasing Options',
      'Intercity Bus Services',
      'Logistics Consulting',
      'Warehouse Management'
    ]
  },
  'Freelance & Digital Services': {
    icon: '💻',
    subcategories: [
      'Graphic Design',
      'Web Development',
      'Writing & Translation',
      'Social Media Management',
      'Digital Marketing',
      'Content Creation',
      'Video Editing',
      'Audio Production',
      'Data Analysis',
      'AI & Machine Learning',
      'Blockchain Development',
      'Mobile App Development'
    ]
  },
  'Event Services': {
    icon: '🎉',
    subcategories: [
      'Catering',
      'Photography',
      'Videography',
      'Event Planning',
      'Music & DJ Services',
      'Venue Management',
      'Decoration Services',
      'Sound & Lighting',
      'Entertainment',
      'Wedding Services',
      'Corporate Events',
      'Party Planning'
    ]
  },
  'Health & Wellness Services': {
    icon: '💪',
    subcategories: [
      'Personal Training',
      'Yoga Instructors',
      'Massage Therapy',
      'Diet & Nutrition Consulting',
      'Mental Health Services',
      'Physical Therapy',
      'Alternative Medicine',
      'Fitness Classes',
      'Wellness Coaching',
      'Rehabilitation Services',
      'Sports Medicine',
      'Holistic Health'
    ]
  },
  'Professional Services': {
    icon: '👔',
    subcategories: [
      'Contractors',
      'Engineers',
      'Architects',
      'Interior Designers',
      'Legal Services',
      'Accounting Services',
      'Consulting',
      'Project Management',
      'Quality Assurance',
      'Risk Management',
      'Business Strategy',
      'Market Research'
    ]
  },
  'Tutoring & Private Lessons': {
    icon: '📚',
    subcategories: [
      'Math Tutoring',
      'Science Tutoring',
      'Language Tutoring',
      'Test Preparation',
      'Music Lessons',
      'Art Classes',
      'Computer Skills',
      'Business Skills',
      'Life Skills',
      'Special Education',
      'Online Tutoring',
      'Group Classes'
    ]
  },
  'Vocational & Skill Training': {
    icon: '🔧',
    subcategories: [
      'Coding Bootcamps',
      'Artisan Workshops',
      'Farming Techniques',
      'Fashion Design Courses',
      'Culinary Training',
      'Technical Skills',
      'Trade Skills',
      'Professional Certifications',
      'Apprenticeship Programs',
      'Skill Assessment',
      'Career Counseling',
      'Industry Training'
    ]
  },
  'Online & E-Learning Platforms': {
    icon: '🌐',
    subcategories: [
      'Digital Courses',
      'Educational Apps',
      'Virtual Training',
      'Corporate Training Programs',
      'Language Learning',
      'Skill Development',
      'Certification Programs',
      'Interactive Learning',
      'Gamified Education',
      'Adaptive Learning',
      'Microlearning',
      'Blended Learning'
    ]
  },
  'Tech Services & Repairs': {
    icon: '🔧',
    subcategories: [
      'IT Support',
      'Gadget Repair',
      'Cybersecurity Consulting',
      'Network Setup',
      'Software Installation',
      'Data Recovery',
      'Cloud Services',
      'System Administration',
      'Tech Consulting',
      'Hardware Upgrades',
      'Virus Removal',
      'Performance Optimization'
    ]
  },
  'Banking & Financial Services': {
    icon: '💰',
    subcategories: [
      'Loans',
      'Insurance',
      'Savings Accounts',
      'Mobile Money Services',
      'Investment Advisory',
      'Tax Services',
      'Financial Planning',
      'Credit Counseling',
      'Debt Management',
      'Retirement Planning',
      'Estate Planning',
      'Business Finance'
    ]
  },
  'Business Consulting & Legal Services': {
    icon: '⚖️',
    subcategories: [
      'Business Registration',
      'Tax Consulting',
      'Trademark Registration',
      'Accounting Services',
      'Legal Consulting',
      'Contract Review',
      'Compliance Services',
      'Business Strategy',
      'Market Entry',
      'Risk Assessment',
      'Due Diligence',
      'Corporate Governance'
    ]
  },
  'Hotels & Accommodations': {
    icon: '🏨',
    subcategories: [
      'Hotels',
      'Guest Houses',
      'Airbnb Rentals',
      'Resorts',
      'Vacation Rentals',
      'Hostels',
      'Serviced Apartments',
      'Boutique Hotels',
      'Luxury Accommodations',
      'Business Hotels',
      'Family Hotels',
      'Extended Stay'
    ]
  },
  'Travel Agencies & Tour Operators': {
    icon: '✈️',
    subcategories: [
      'Safari Tours',
      'Flight Bookings',
      'Vacation Planning',
      'Adventure Tours',
      'Cultural Tours',
      'Business Travel',
      'Group Tours',
      'Custom Itineraries',
      'Travel Insurance',
      'Visa Services',
      'Car Rentals',
      'Cruise Bookings'
    ]
  }
};

export const SERVICE_TEMPLATES = {
  'Graphic Design': {
    packages: [
      {
        name: 'Basic',
        price: 50,
        description: 'Simple design with basic revisions',
        deliveryTime: 3,
        revisions: 2,
        features: ['1 Design Concept', 'Basic Revisions', 'Source Files', '3 Day Delivery']
      },
      {
        name: 'Standard',
        price: 150,
        description: 'Professional design with multiple concepts',
        deliveryTime: 5,
        revisions: 3,
        features: ['3 Design Concepts', 'Premium Revisions', 'Source Files', '5 Day Delivery', 'Commercial License']
      },
      {
        name: 'Premium',
        price: 300,
        description: 'Premium design with unlimited revisions',
        deliveryTime: 7,
        revisions: -1,
        features: ['5 Design Concepts', 'Unlimited Revisions', 'Source Files', '7 Day Delivery', 'Commercial License', 'Priority Support']
      }
    ],
    requirements: [
      'Project description and goals',
      'Target audience information',
      'Brand guidelines (if applicable)',
      'Reference examples or inspiration',
      'Preferred color scheme',
      'File format requirements'
    ]
  },
  'Web Development': {
    packages: [
      {
        name: 'Basic',
        price: 500,
        description: 'Simple website with basic functionality',
        deliveryTime: 14,
        revisions: 2,
        features: ['Responsive Design', 'Basic SEO', 'Contact Form', '14 Day Delivery']
      },
      {
        name: 'Standard',
        price: 1500,
        description: 'Professional website with advanced features',
        deliveryTime: 21,
        revisions: 3,
        features: ['Responsive Design', 'Advanced SEO', 'CMS Integration', '21 Day Delivery', 'Training Session']
      },
      {
        name: 'Premium',
        price: 3000,
        description: 'Full-featured website with maintenance',
        deliveryTime: 30,
        revisions: -1,
        features: ['Responsive Design', 'Premium SEO', 'E-commerce Integration', '30 Day Delivery', '3 Months Maintenance', 'Priority Support']
      }
    ],
    requirements: [
      'Project scope and requirements',
      'Design preferences and mockups',
      'Content and copy',
      'Hosting and domain information',
      'Third-party integrations needed',
      'Performance requirements'
    ]
  }
};

export const DELIVERY_TIME_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' }
];

export const PRICING_MODELS = [
  { value: 'fixed', label: 'Fixed Price', description: 'One-time payment for the entire project' },
  { value: 'hourly', label: 'Hourly Rate', description: 'Pay per hour of work' },
  { value: 'recurring', label: 'Recurring', description: 'Monthly or weekly subscription' },
  { value: 'milestone', label: 'Milestone-based', description: 'Pay at project milestones' }
];

export const SERVICE_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Essential service with standard quality' },
  { value: 'standard', label: 'Standard', description: 'Professional service with good quality' },
  { value: 'premium', label: 'Premium', description: 'High-quality service with extra features' },
  { value: 'enterprise', label: 'Enterprise', description: 'Custom solution for large organizations' }
];
