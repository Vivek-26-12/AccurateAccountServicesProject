import React from "react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-6 py-16">
      <div className="max-w-7xl mx-auto text-center space-y-16">
        
        {/* Title Section */}
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-blue-800 tracking-wide">Accurate Accounting Services</h1>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
            At <strong>Accurate Accounting Services (AAS)</strong>, we provide precise and reliable 
            financial solutions to businesses of all sizes. With a commitment to accuracy, 
            efficiency, and transparency, we help organizations manage their finances with 
            confidence and ease.
          </p>
        </div>

        {/* Highlights Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: "Expert Accounting", description: "Our professionals ensure compliance with the latest financial regulations." },
            { title: "Secure & Confidential", description: "We prioritize data security, safeguarding your financial records with utmost care." },
            { title: "Client-Focused Approach", description: "Every business is unique. We tailor our services to meet your specific needs." }
          ].map((item, index) => (
            <div 
              key={index} 
              className="p-8 bg-white rounded-lg shadow-md border-t-4 border-blue-600 transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold text-blue-900">{item.title}</h3>
              <p className="mt-3 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Enhanced Mission Section */}
        <div className="py-14 bg-blue-50 rounded-lg shadow-md px-8 md:px-16">
          <h2 className="text-4xl font-bold text-blue-800 mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg max-w-4xl mx-auto leading-relaxed">
            We are committed to redefining financial management by offering transparent, efficient, and professional accounting services. 
            Our mission is to empower businesses with the right financial insights, enabling them to grow, scale, and succeed with confidence.
          </p>

          {/* Key Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { title: "Accuracy & Compliance", desc: "We ensure every financial record is precise and up to industry standards." },
              { title: "Innovation & Technology", desc: "Utilizing the latest tools to optimize and automate financial workflows." },
              { title: "Client Success First", desc: "Your growth is our priority—we tailor strategies that align with your goals." }
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="bg-blue-600 text-white rounded-full p-3 text-lg font-bold">{index + 1}</div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;