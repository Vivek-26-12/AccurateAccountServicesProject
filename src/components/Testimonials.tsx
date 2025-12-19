import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ankita Patel',
    role: 'CEO, TechStart Inc.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    quote: 'AAS transformed our financial operations. Their attention to detail and professional service is unmatched.',
  },
  {
    name: 'Milan Gajera',
    role: 'CFO, Growth Ventures',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    quote: 'The team at AAS has been instrumental in streamlining our accounting processes and ensuring compliance.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-800 mb-12">
          Trusted by Industry Leaders
        </h2>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white border border-gray-100 shadow-md rounded-2xl p-8 transition hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 stroke-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg text-gray-600 leading-relaxed italic">
                “{testimonial.quote}”
              </p>

              {/* Author Info */}
              <div className="mt-6 flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-14 w-14 rounded-full shadow-md object-cover"
                />
                <div className="ml-4">
                  <p className="text-base font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
