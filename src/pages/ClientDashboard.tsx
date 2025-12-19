import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import FeedbackForm from "../components/FeedbackForm";

// Office images for the slider
const officeImages = [
  "https://t4.ftcdn.net/jpg/03/84/55/29/360_F_384552930_zPoe9zgmCF7qgt8fqSedcyJ6C6Ye3dFs.jpg",
  "https://cdn.sanity.io/images/uqxwe2qj/production/4ee9fb18bdc214aefebf7859557a6611125c3841-760x426.png?q=80&auto=format&fit=clip&w=760",
  "https://media.istockphoto.com/id/1096860416/photo/accountant-working-with-us-tax-forms.jpg?s=612x612&w=0&k=20&c=iTeEa7-FrsAdM2DGPxnx_T7dyoW9MKK_4hauIEFNTAo=",
];

export default function ClientDashboard() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Auto-slide images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % officeImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ✅ Modernized Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome to <span className="text-yellow-400">AAS Organization</span>
          </h1>
          <p className="mt-3 text-lg opacity-90">
            Your trusted partner in professional accounting and financial services.
          </p>
        </div>
      </div>

      {/* ✅ Enhanced Image Slider */}
      <div className="relative w-full max-w-4xl mx-auto mt-12 px-6">
        <div className="overflow-hidden rounded-xl shadow-xl border border-gray-200">
          <img
            src={officeImages[currentImage]}
            alt="Office"
            className="w-full h-[400px] object-cover transition-all duration-700 ease-in-out"
          />
        </div>

        {/* Navigation Buttons */}
        <button
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 p-3 rounded-full text-white hover:bg-opacity-80 transition"
          onClick={() => setCurrentImage((prev) => (prev - 1 + officeImages.length) % officeImages.length)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gray-800 bg-opacity-60 p-3 rounded-full text-white hover:bg-opacity-80 transition"
          onClick={() => setCurrentImage((prev) => (prev + 1) % officeImages.length)}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* ✅ About AAS Section with Better Styling */}
      <div className="max-w-5xl mx-auto mt-16 text-center px-6">
        <h2 className="text-3xl font-bold text-gray-800">About AAS Organization</h2>
        <p className="mt-4 text-lg text-gray-700 leading-relaxed">
          AAS Organization is a premier accounting and financial services firm specializing in tax advisory,
          audit services, and corporate finance. Our mission is to provide tailored solutions that drive
          businesses toward financial success.
        </p>
      </div>

      {/* ✅ Modernized Why Choose Us Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 mt-16">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose AAS?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-700">Expert Team</h3>
              <p className="text-gray-700 mt-2">
                Our team consists of highly skilled professionals with deep experience in accounting and finance.
              </p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-700">Reliable Services</h3>
              <p className="text-gray-700 mt-2">
                We ensure accuracy, compliance, and efficiency in every financial service we provide.
              </p>
            </div>
            <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-700">Client Satisfaction</h3>
              <p className="text-gray-700 mt-2">
                Our goal is to build long-term relationships by offering the best client experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Feedback Form Popup */}
      {isFeedbackOpen && <FeedbackForm onClose={() => setIsFeedbackOpen(false)} />}

      {/* ✅ Upgraded Floating Feedback Button */}
      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-5 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center space-x-2"
        onClick={() => setIsFeedbackOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden md:inline text-sm font-medium">Feedback</span>
      </button>
    </div>
  );
}
