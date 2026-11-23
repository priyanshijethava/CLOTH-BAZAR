
function FAQ() {
  const faqs = [
    {
      question: "How can I place an order?",
      answer:
        "Browse our products, select your favourite item, choose your size and add it to your cart. Then proceed to checkout and complete your order details.",
    },
    {
      question: "Do I need an account to shop?",
      answer:
        "You can browse products without an account. You can register or log in to access your account features.",
    },
    {
      question: "What payment methods are available?",
      answer:
        "Payment options depend on the checkout methods currently enabled on CLOTH BAZAR.",
    },
    {
      question: "How can I track my order?",
      answer:
        "You can visit the My Orders section in your account to check your order details and status.",
    },
    {
      question: "Can I return a product?",
      answer:
        "Please read our Return Policy page for information about returns and eligibility.",
    },
    {
      question: "How can I contact CLOTH BAZAR?",
      answer:
        "Visit our Contact Us page and send us your question through the contact form.",
    },
  ];

  return (
    <div className="policy-page">
      <div className="policy-heading">
        <p>WE ARE HERE TO HELP</p>
        <h1>Frequently Asked Questions</h1>
        <span>Find answers to common questions about shopping with us.</span>
      </div>

      <div className="policy-content">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <h2>{faq.question}</h2>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
