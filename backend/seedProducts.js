
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const imageUpdates = [
  // MEN
  {
    name: "Men Classic Casual Shirt",
    image: "/images/men-classic-casual-shirt.jpg",
  },
  {
    name: "Men Basic Black T-Shirt",
    image: "/images/men-basic-black-tshirt.jpg",
  },
  {
    name: "Men Slim Fit Blue Jeans",
    image: "/images/men-slim-fit-blue-jeans.jpg",
  },
  {
    name: "Men Beige Casual Trousers",
    image: "/images/men-beige-casual-trousers.jpg",
  },
  {
    name: "Men Printed Polo T-Shirt",
    image: "/images/men-printed-polo-tshirt.jpg",
  },

  // WOMEN
  // Women Floral Kurti intentionally skipped
  {
    name: "Women Elegant Summer Dress",
    image: "/images/women-elegant-summer-dress.jpg",
  },
  {
    name: "Women Casual Cotton Top",
    image: "/images/women-casual-cotton-top.jpg",
  },
  {
    name: "Women High Waist Jeans",
    image: "/images/women-high-waist-jeans.jpg",
  },
  {
    name: "Women Ethnic Anarkali Dress",
    image: "/images/women-ethnic-anarkali-dress.jpg",
  },

  // KIDS
  {
    name: "Kids Printed T-Shirt",
    image: "/images/kids-printed-tshirt.jpg",
  },
  {
    name: "Kids Casual Denim Jeans",
    image: "/images/kids-casual-denim-jeans.jpg",
  },
  {
    name: "Kids Floral Frock",
    image: "/images/kids-floral-frock.jpg",
  },
  {
    name: "Kids Hoodie",
    image: "/images/kids-hoodie.jpg",
  },
  {
    name: "Kids Two Piece Outfit",
    image: "/images/kids-two-piece-outfit.jpg",
  },

  // ACCESSORIES
  {
    name: "Classic Women's Handbag",
    image: "/images/classic-womens-handbag.jpg",
  },
  {
    name: "Classic Analog Watch",
    image: "/images/classic-analog-watch.jpg",
  },
  {
    name: "Fashion Sunglasses",
    image: "/images/fashion-sunglasses.jpg",
  },
  {
    name: "Women's Stylish Wallet",
    image: "/images/womens-stylish-wallet.jpg",
  },
  {
    name: "Fashion Shoulder Bag",
    image: "/images/fashion-shoulder-bag.jpg",
  },
];

const updateProductImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully!");

    let updatedCount = 0;

    for (const item of imageUpdates) {
      const result = await Product.updateOne(
        { name: item.name },
        { $set: { image: item.image } }
      );

      if (result.matchedCount > 0) {
        updatedCount++;
        console.log(`Updated: ${item.name}`);
      } else {
        console.log(`Product not found: ${item.name}`);
      }
    }

    console.log("--------------------------------");
    console.log(`${updatedCount} product images updated!`);
    console.log("Women Floral Kurti image was not changed.");
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

updateProductImages();
