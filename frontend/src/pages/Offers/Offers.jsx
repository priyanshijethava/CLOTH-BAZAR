
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Offers() {
  const navigate = useNavigate();

  const offers = [
    {
      title: "STYLE10",
      discount: "10% OFF",
      description: "Get 10% off on your favourite fashion picks.",
      condition: "Use code STYLE10 at checkout",
      category: "All",
    },
    {
      title: "FASHION20",
      discount: "20% OFF",
      description: "Refresh your wardrobe with amazing savings.",
      condition: "Explore our collection",
      category: "Women",
    },
    {
      title: "KIDS15",
      discount: "15% OFF",
      description: "Special savings on little ones' fashion.",
      condition: "Shop Kids Collection",
      category: "Kids",
    },
  ];

  return (
    <div className="offers-page">
      <div className="offers-heading">
        <p>EXCLUSIVE DEALS FOR YOU</p>
        <h1>Special Offers</h1>
        <span>Discover amazing deals and give your style a new look.</span>
      </div>

      {/* Back Button */}
      <div className="offers-back-container">
        <button
          type="button"
          className="offers-back-button"
          onClick={() => navigate("/shop")}
        >
          <ArrowLeft size={19} />
          Back to Shop
        </button>
      </div>

      <div className="offers-banner">
        <p>THE BIG STYLE SALE</p>
        <h2>Fashion That Fits Your Budget</h2>
        <span>Explore your favourite styles at special prices.</span>
        <button onClick={() => navigate("/shop")}>
          SHOP NOW →
        </button>
      </div>

      <div className="offers-section">
        <h2>Our Best Deals</h2>
        <p className="offers-subtitle">
          Choose your favourite deal and start shopping.
        </p>

        <div className="offers-grid">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.title}>
              <span className="offer-discount">{offer.discount}</span>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <small>{offer.condition}</small>
              <button
                onClick={() =>
                  navigate(
                    offer.category === "All"
                      ? "/shop"
                      : `/shop?category=${offer.category}`
                  )
                }
              >
                EXPLORE NOW →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Offers;
