import React from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building, 
  CreditCard,
  Clock,
  Users,
  Contact,
  Globe,
  FileText,
  Hash
} from 'lucide-react';

interface ClientContact {
  contact_name: string;
  phone: string;
  email: string;
}

interface Client {
  client_id: number;
  auth_id: number;
  company_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  gstin?: string | null;
  pan_number?: string | null;
  profile_pic?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  contacts?: ClientContact[] | null;
}

interface ViewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DetailItem = ({ 
  icon, 
  label, 
  value,
  className = ''
}: { 
  icon: React.ReactNode, 
  label: string, 
  value?: string | null,
  className?: string 
}) => (
  <div className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900 font-medium break-words">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    </div>
  </div>
);

const ContactCard = ({ contact }: { contact: ClientContact }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow w-full">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
          <UserIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-3">{contact.contact_name}</h4>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <a 
                href={`mailto:${contact.email}`} 
                className="text-sm text-gray-700 hover:text-blue-600 hover:underline break-all"
                title={contact.email}
              >
                {contact.email}
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <a 
                href={`tel:${contact.phone}`} 
                className="text-sm text-gray-700 hover:text-blue-600 hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

export function ViewClientModal({ isOpen, onClose, client }: ViewClientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 relative">
              {client.profile_pic ? (
                <img
                  className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200"
                  src={client.profile_pic}
                  alt={client.company_name || 'Company'}
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center border-2 border-gray-200">
                  <Building className="h-10 w-10 text-orange-600" />
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-white bg-orange-500"></span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {client.company_name || 'Unknown Company'}
              </h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-900">
                  CLIENT
                </span>
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`} 
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-1" /> Contact
                  </a>
                )}
              </div>
              {client.contact_person && (
                <p className="text-sm text-gray-700 mt-2 flex items-center">
                  <Contact className="w-4 h-4 mr-1 text-gray-500" />
                  Primary Contact: {client.contact_person}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2 text-orange-500" />
              Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
              <DetailItem 
                icon={<Globe className="w-5 h-5 text-gray-600" />}
                label="Company Name"
                value={client.company_name}
                className="bg-white"
              />
              <DetailItem 
                icon={<Mail className="w-5 h-5 text-gray-600" />}
                label="Company Email"
                value={client.email}
                className="bg-white"
              />
              <DetailItem 
                icon={<Contact className="w-5 h-5 text-gray-600" />}
                label="Primary Contact"
                value={client.contact_person}
                className="bg-white"
              />
              <DetailItem 
                icon={<Calendar className="w-5 h-5 text-gray-600" />}
                label="Client Since"
                value={formatDate(client.created_at)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-orange-500" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
              <DetailItem 
                icon={<CreditCard className="w-5 h-5 text-gray-600" />}
                label="GSTIN"
                value={client.gstin}
                className="bg-white"
              />
              <DetailItem 
                icon={<FileText className="w-5 h-5 text-gray-600" />}
                label="PAN Number"
                value={client.pan_number}
                className="bg-white"
              />
              <DetailItem 
                icon={<Hash className="w-5 h-5 text-gray-600" />}
                label="Client ID"
                value={client.client_id.toString()}
                className="bg-white"
              />
              <DetailItem 
                icon={<Clock className="w-5 h-5 text-gray-600" />}
                label="Last Updated"
                value={formatDate(client.updated_at)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Additional Contacts */}
          {client.contacts && client.contacts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-500" />
                Additional Contacts
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  {client.contacts.length}
                </span>
              </h3>
              
              <div className="space-y-3"> {/* Changed from grid to vertical stack */}
                {client.contacts.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}