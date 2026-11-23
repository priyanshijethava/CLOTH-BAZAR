
import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Men",
      description: "Explore Men's Fashion",
      image: "/images/men-classic-casual-shirt.jpg",
    },
    {
      name: "Women",
      description: "Discover Women's Style",
      image: "/images/women-elegant-summer-dress.jpg",
    },
    {
      name: "Kids",
      description: "Fashion for Little Ones",
      image: "/images/kids-floral-frock.jpg",
    },
    {
      name: "Accessories",
      description: "Complete Your Look",
      image: "/images/classic-womens-handbag.jpg",
    },
  ];

  return (
    <div className="categories-page">
      <div className="categories-heading">
        <p>EXPLORE OUR COLLECTION</p>
        <h1>Shop By Category</h1>
        <span>Find your perfect style from our collections.</span>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div
            className="category-card"
            key={category.name}
            onClick={() =>
              navigate(`/shop?category=${category.name}`)
            }
          >
            <img src={category.image} alt={category.name} />

            <div className="category-overlay">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <button>EXPLORE NOW →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
