import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Data/AuthData';
import LoginPopup from "./LoginPopup";
import ProfileUser from "./ProfileUser";
import ClientDocument from '../pages/ClientDocument';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileClient from './ProfileClient';
import { Menu } from 'lucide-react'; // Removed X icon since we're not using it anymore

const defaultProfilePic = "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isClientDocOpen, setIsClientDocOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userRole = user?.role || 'guest';

  const navLinks = {
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Documents', path: '/documents' },
      { label: 'Manage Users', path: '/manageusers' },
    ],
    employee: [
      { label: 'Dashboard', path: '/employee-dashboard' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Documents', path: '/documents' },
      { label: 'Manage Clients', path: '/manageusers' },
    ],
    client: [
      { label: 'Home', path: '/client-dashboard' },
      { label: 'Documents', path: '#' },
      { label: 'About', path: '/about' },
    ],
    guest: [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
  };

  const links = navLinks[userRole] || navLinks.guest;

  const handleLinkClick = (link: { label: string; path: string }) => {
    if (userRole === 'client' && link.label === 'Documents') {
      setIsClientDocOpen(true);
    } else {
      navigate(link.path);
    }
    setIsMobileMenuOpen(false); // Close mobile menu on click
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-white/90 backdrop-blur-sm py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <Menu className="w-6 h-6 text-blue-600" />
                </button>
              </div>

              <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
                <span className="bg-blue-600 text-white px-2 py-1 rounded mr-2">AAS</span>
                <span className="hidden sm:inline">Accurate Accounts Services</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {links.map((link) => (
                <button
                  key={link.label}
                  className={`relative px-1 py-2 text-sm font-medium transition-colors ${location.pathname === link.path
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                    }`}
                  onClick={() => handleLinkClick(link)}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}

              {user ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <img
                    src={user?.profilePic || defaultProfilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-500 object-cover shadow-md"
                    onClick={() => setIsProfileOpen(true)}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Login
                </motion.button>
              )}
            </div>

            {/* Mobile Profile Button - Now on the right side */}
            <div className="md:hidden">
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <img
                    src={user?.profilePic || defaultProfilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-500 object-cover shadow-md"
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Login
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sliding Menu - Simplified without close button */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-lg p-6 flex flex-col gap-4 pt-20 md:hidden"
          >
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link)}
                className="text-gray-700 hover:text-blue-600 text-base font-medium text-left"
              >
                {link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close menu when clicking outside */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <AnimatePresence>
        {isLoginOpen && <LoginPopup onClose={() => setIsLoginOpen(false)} />}
        {isClientDocOpen && <ClientDocument isOpen={isClientDocOpen} onClose={() => setIsClientDocOpen(false)} />}
        {isProfileOpen && (
          userRole === 'client'
            ? <ProfileClient isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            : <ProfileUser isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}