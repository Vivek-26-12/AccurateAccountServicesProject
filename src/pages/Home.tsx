import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Data/AuthData'; // Auth context
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const role = user?.role;

      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'employee':
          navigate('/employee-dashboard');
          break;
        case 'client':
          navigate('/client-dashboard');
          break;
        default:
          break; // Stay on home if role is unknown or guest
      }
    }
  }, [user, navigate]);

  return (
    <>
      <Hero />
      <Testimonials />
    </>
  );
}

export default Home;
