
import { useEffect, useState } from "react";
import {
  Mail,
  Trash2,
  RefreshCw,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "../../services/api";

function AdminContacts() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");

      const currentToken = localStorage.getItem("token");
      setToken(currentToken);

      if (!currentToken) {
        throw new Error("Please login again as Admin.");
      }

      const response = await fetch(`${API_URL}/contacts/admin/all`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load messages");
      }

      setContacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const currentToken = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/contacts/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete message");
      }

      setContacts((previous) =>
        previous.filter((contact) => contact._id !== id)
      );

      alert("Message deleted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page contacts-admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Contact Messages</h1>
          <p>View and manage messages submitted by customers.</p>
        </div>

        <button
          onClick={fetchContacts}
          className="admin-action-btn"
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <Mail size={25} />
          <div>
            <h3>{contacts.length}</h3>
            <p>Total Messages</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">
          <RefreshCw size={30} />
          <h3>Loading Messages</h3>
          <p>Please wait while we fetch customer messages.</p>
        </div>
      ) : error ? (
        <div className="admin-empty-state">
          <AlertCircle size={40} />
          <h3>Unable to Load Messages</h3>
          <p>{error}</p>
          <button onClick={fetchContacts} className="admin-action-btn">
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="admin-empty-state">
          <Mail size={40} />
          <h3>No Contact Messages</h3>
          <p>Customer messages will appear here when submitted.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    <div className="contact-customer-info">
                      <User size={16} />
                      <span>{contact.name}</span>
                    </div>
                  </td>

                  <td>{contact.email}</td>

                  <td>{contact.subject}</td>

                  <td>
                    <div className="contact-message-text">
                      <MessageSquare size={15} />
                      <span>{contact.message}</span>
                    </div>
                  </td>

                  <td>
                    <div className="contact-date">
                      <Calendar size={15} />
                      {new Date(contact.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="admin-delete-btn"
                      title="Delete Message"
                      disabled={deletingId === contact._id}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminContacts;
