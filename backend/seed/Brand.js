const Brand = require("../models/Brand");

const brands = [
  { _id: "65a7e20102e12c44f5994427", name: "Generic" },
];

exports.seedBrand = async () => {
  try {
    await Brand.insertMany(brands);
    console.log('Brand seeded successfully');
  } catch (error) {
    console.log(error);
  }
};
