import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
          {/* About AAS */}
          <div>
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About AAS</h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-400">
              Professional accounting services delivering accuracy and excellence since 1995.
              Trusted by hundreds of businesses for reliable and transparent financial solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition duration-200"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition duration-200"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/faq')}
                  className="hover:text-white transition duration-200"
                >
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>Shree Mahavir, E-207/208</li>
              <li>Near New Cloth Market, Sarangpur</li>
              <li>Ahmedabad, Gujarat - 380002</li>
              <li className="mt-2">
                Email: <span className="text-blue-400">accurateaccountsservices@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 sm:mt-12 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} <span className="text-white font-semibold">Accurate Accounting Services</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
