import React, { useState, useMemo } from 'react';
import { User, X } from 'lucide-react';
import UserForm from './forms/UserForm';
import ClientForm from './forms/ClientForm';
import { GroupForm } from './forms/GroupForm';
import { NewUserForm } from './type/UserFormTypes';
import { NewClientForm } from './type/NewClientForm';



interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: 'User' | 'Client' | 'Group') => void;
  initialGroupData?: any;
  activeTab?: 'User' | 'Client' | 'Group' | 'Admin' | 'Employee'; // Allow parent to control/hint tab
  setActiveTab?: (tab: any) => void;
}

// @ts-ignore
const defaultUserData: NewUserForm = {
  username: '',
  password: '',
  role: 'employee',
  name: '',
  email: '',
  phone: '',
  profile_pic: ''
};

// @ts-ignore
const defaultClientData: NewClientForm = {
  username: '',
  password: '',
  role: 'client',
  company_name: '',
  contact_person: '',
  email: '',
  gstin: '',
  pan_number: '',
  profile_pic: '',
  contacts: []
};

export default function AddUserModal({ isOpen, onClose, onSubmit, initialGroupData, activeTab: propActiveTab }: AddUserModalProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'User' | 'Client' | 'Group'>('User');

  // Use prop if available, otherwise internal state. 
  // Map 'Admin'/'Employee' to 'User' for internal logic if needed, or just let 'User' handle it.
  // Actually, 'User' tab handles Admin/Employee via dropdowns usually?
  // Let's check tab buttons below. The tabs are 'User', 'Client', 'Group'.

  const activeTab = useMemo(() => {
    if (propActiveTab === 'Group') return 'Group';
    if (propActiveTab === 'Client') return 'Client';
    if (initialGroupData) return 'Group';
    return internalActiveTab;
  }, [propActiveTab, internalActiveTab, initialGroupData]);

  const [userData, setUserData] = useState<NewUserForm>(defaultUserData);
  const [clientData, setClientData] = useState<NewClientForm>(defaultClientData);

  // @ts-ignore
  const handleFormSubmit = (formData: any) => {
    onSubmit(formData, activeTab);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            {['User', 'Client', 'Group'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 text-center ${activeTab === tab
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setInternalActiveTab(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conditional Form Rendering */}
          {activeTab === 'User' && (
            <UserForm
              newUser={userData}
              setNewUser={setUserData}
              onSubmit={handleFormSubmit}
              onClose={onClose}
            />
          )}
          {activeTab === 'Client' && (
            <ClientForm
              newClient={clientData}
              setNewClient={setClientData}
              onSubmit={handleFormSubmit}
              onClose={onClose}
            />
          )}
          {activeTab === 'Group' && (
            <GroupForm
              onSubmit={handleFormSubmit}
              onClose={onClose}
              initialData={initialGroupData}
            />
          )}
        </div>
      </div>
    </div>
  );
}