import React, { useState } from "react";

const Contact: React.FC = () => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState({
    guestName: "",
    guestEmail: "",
    message: "",
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      guestName: "",
      guestEmail: "",
      message: "",
    };

    if (!guestName.trim()) {
      newErrors.guestName = "Name is required";
      valid = false;
    } else if (guestName.trim().length < 2) {
      newErrors.guestName = "Name must be at least 2 characters";
      valid = false;
    }

    if (!guestEmail.trim()) {
      newErrors.guestEmail = "Email is required";
      valid = false;
    } else if (!validateEmail(guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email address";
      valid = false;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const body = {
      guest_name: guestName,
      guest_email: guestEmail,
      message: message,
    };

    try {
      const res = await fetch("http://localhost:3000/guest-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage("Message sent successfully!");
        setGuestName("");
        setGuestEmail("");
        setMessage("");
        setErrors({
          guestName: "",
          guestEmail: "",
          message: "",
        });
      } else {
        setResponseMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setResponseMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6 py-16">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 bg-white shadow-2xl rounded-2xl p-12">
        {/* Left Section - Contact Info */}
        <div className="flex flex-col justify-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Let's <span className="text-blue-600">Connect</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Have questions or need assistance? Contact <strong>Accurate Accounting Services</strong> today.
            Whether it's accounting, financial guidance, or consultancy, we're here to help.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="text-blue-600 text-3xl">📍</span>
              <p className="text-gray-700 text-lg">123 Finance Street, Ahmedabad, Gujarat</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-600 text-3xl">📞</span>
              <p className="text-gray-700 text-lg hover:text-blue-600 transition duration-300 cursor-pointer">
                ‪+91 98765 43210‬
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-600 text-3xl">📧</span>
              <p className="text-gray-700 text-lg hover:text-blue-600 transition duration-300 cursor-pointer">
                contact@accurateaccounting.com
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Contact Form */}
        <div className="bg-gray-50 p-10 rounded-xl shadow-md">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-6">Send a Message</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Your Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={`mt-2 p-4 bg-white border ${
                  errors.guestName ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300`}
                placeholder="Enter your name"
              />
              {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Your Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className={`mt-2 p-4 bg-white border ${
                  errors.guestEmail ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300`}
                placeholder="Enter your email"
              />
              {errors.guestEmail && <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Your Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`mt-2 p-4 bg-white border ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300`}
                placeholder="Write your message..."
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
            >
              Send Message
            </button>

            {responseMessage && (
              <p
                className={`text-center text-sm mt-2 ${
                  responseMessage.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {responseMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
