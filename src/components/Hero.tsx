import React from 'react';
import { TrendingUp, Shield, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-gray-100 py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-blue-100 opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Text */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            <span>Simplify your accounting,</span>
            <br />
            <span className="text-blue-600">maximize your accuracy</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Professional accounting services tailored to your business needs.
            Experience precision, reliability, and excellence in every transaction.
          </p>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white shadow-md border border-gray-100 rounded-2xl p-6 text-center transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex justify-center mb-4">
                <feature.icon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Financial Growth",
    description: "Strategic financial planning and analysis for sustainable growth",
    icon: TrendingUp,
  },
  {
    title: "Secure & Compliant",
    description: "Industry-leading security measures and regulatory compliance",
    icon: Shield,
  },
  {
    title: "Expert Team",
    description: "Dedicated professionals with years of industry experience",
    icon: Users,
  },
];
