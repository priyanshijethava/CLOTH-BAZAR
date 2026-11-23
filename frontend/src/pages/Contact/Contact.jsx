
import { useState } from "react";
import { API_URL } from "../../services/api";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitted(false);
    setError("");

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit your message");
      }

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact Form Error:", error);
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-heading">
        <p>WE WOULD LOVE TO HEAR FROM YOU</p>
        <h1>Get In Touch</h1>
        <span>
          Have a question or need help? We're always here for you.
        </span>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <p className="contact-small-heading">CONTACT US</p>
          <h2>Let's Talk About Fashion</h2>
          <p className="contact-description">
            Whether you have a question about products, orders or anything
            else, our team is ready to help.
          </p>

          <div className="contact-info-item">
            <h3>Email</h3>
            <p>support@clothbazar.com</p>
          </div>

          <div className="contact-info-item">
            <h3>Phone</h3>
            <p>+91 98765 43210</p>
          </div>

          <div className="contact-info-item">
            <h3>Address</h3>
            <p>Gujarat, India</p>
          </div>

          <div className="contact-note">
            <p>MONDAY – SATURDAY</p>
            <span>10:00 AM – 6:00 PM</span>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <h2>Send Us A Message</h2>
          <p>Fill out the form below and we'll be happy to assist you.</p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-input-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-input-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-input-group">
              <label>Your Message</label>
              <textarea
                name="message"
                placeholder="Write your message here..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "SENDING..." : "SEND MESSAGE →"}
            </button>

            {submitted && (
              <div className="contact-success">
                Thank you! Your message has been submitted successfully.
              </div>
            )}

            {error && (
              <div className="contact-error">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;

