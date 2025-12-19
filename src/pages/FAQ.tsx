import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What services does Accurate Accounting Services provide?",
    answer: "We offer financial management, tax planning, bookkeeping, auditing, payroll management, and business advisory services tailored to your needs.",
  },
  {
    question: "How can I securely share my documents with AAS?",
    answer: "Our platform provides encrypted document sharing with multi-layer security, ensuring your financial data remains protected.",
  },
  {
    question: "Is my financial data safe with AAS?",
    answer: "Absolutely. We prioritize security with encrypted data storage, multi-factor authentication, and strict access controls.",
  },
  {
    question: "Can I track my financial reports through your platform?",
    answer: "Yes! Our platform allows real-time tracking of financial reports, tax filings, and other critical documents for better transparency.",
  },
  {
    question: "How can I book a consultation with AAS?",
    answer: "You can schedule a free consultation through our Contact page or by calling our support team.",
  },
  {
    question: "Does AAS assist with tax compliance and audits?",
    answer: "Yes, our experts handle tax compliance, audits, and government regulations to ensure your business stays compliant.",
  },
  {
    question: "What are your working hours?",
    answer: "Our team is available Monday to Friday, from 9 AM to 6 PM IST. You can also reach us via email anytime.",
  },
  {
    question: "How can I get in touch with your support team?",
    answer: "You can contact us through email, phone, or the Contact page on our website.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">Frequently Asked Questions</h1>
          <p className="mt-4 text-gray-600 text-lg">Have questions? We’ve got answers to help you out.</p>
        </div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full p-5 font-semibold text-blue-800 text-left rounded-t-xl focus:outline-none"
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-blue-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-blue-600" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-700 text-base bg-blue-50 rounded-b-xl animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;