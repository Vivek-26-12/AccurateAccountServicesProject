import React, { useRef, useState } from 'react';
import { User, Mail, Phone, Shield, Building, CreditCard, Pencil } from 'lucide-react';
import { uploadThumbnailToCloudinary } from '../../../cloudinaryUploads';
import { NewClientForm } from '../type/NewClientForm';
import { useData } from '../../../context/DataContext';
import API_BASE_URL from '../../../config';

interface ClientFormProps {
  newClient: NewClientForm;
  setNewClient: (client: NewClientForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

interface ValidationErrors {
  username?: string;
  password?: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  gstin?: string;
  pan_number?: string;
  contacts?: Array<{
    contact_name?: string;
    phone?: string;
    email?: string;
  }>;
}

const defaultProfilePic = 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid';

export default function ClientForm({ newClient, setNewClient, onSubmit, onClose }: ClientFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { refreshClients } = useData();

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateGSTIN = (gstin: string): boolean => {
    // Basic GSTIN format: 2 characters, 10 digits, 1 character, 1 digit, 1 character, 1 digit
    if (!gstin) return true; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validatePAN = (pan: string): boolean => {
    // PAN format: 5 characters, 4 digits, 1 character
    if (!pan) return true; // Optional field
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone format: 10 digits, may start with + and country code
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate authentication
    if (!newClient.username || newClient.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!newClient.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(newClient.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase and number';
    }

    // Validate company details
    if (!newClient.company_name || newClient.company_name.trim().length < 2) {
      errors.company_name = 'Company name is required';
    }

    if (!newClient.contact_person || newClient.contact_person.trim().length < 2) {
      errors.contact_person = 'Contact person is required';
    }

    if (!newClient.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(newClient.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (newClient.gstin && !validateGSTIN(newClient.gstin)) {
      errors.gstin = 'Please enter a valid GSTIN';
    }

    if (newClient.pan_number && !validatePAN(newClient.pan_number)) {
      errors.pan_number = 'Please enter a valid PAN number';
    }

    // Validate contacts
    if (newClient.contacts && newClient.contacts.length > 0) {
      const contactErrors = newClient.contacts.map(contact => {
        const contactError: { contact_name?: string; phone?: string; email?: string } = {};
        if (!contact.contact_name || contact.contact_name.trim().length < 2) {
          contactError.contact_name = 'Contact name is required';
        }

        if (!contact.phone) {
          contactError.phone = 'Phone is required';
        } else if (!validatePhone(contact.phone)) {
          contactError.phone = 'Please enter a valid phone number';
        }

        if (!contact.email) {
          contactError.email = 'Email is required';
        } else if (!validateEmail(contact.email)) {
          contactError.email = 'Please enter a valid email';
        }

        return contactError;
      });

      if (contactErrors.some(err => Object.keys(err).length > 0)) {
        errors.contacts = contactErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleContactBlur = (index: number, field: string) => {
    setTouched({ ...touched, [`contacts[${index}].${field}`]: true });
  };

  const getFieldError = (field: string): string | undefined => {
    return touched[field] ? formErrors[field as keyof ValidationErrors] as string | undefined : undefined;
  };

  const getContactFieldError = (index: number, field: string): string | undefined => {
    if (!touched[`contacts[${index}].${field}`] || !formErrors.contacts?.[index]) return undefined;
    return formErrors.contacts[index][field as keyof typeof formErrors.contacts[0]];
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size must be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        setNewClient({ ...newClient, profile_pic: reader.result as string });
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadThumbnailToCloudinary(file);
      setNewClient({ ...newClient, profile_pic: cloudinaryUrl });
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image');
      setNewClient({ ...newClient, profile_pic: defaultProfilePic });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation
    const allFields = [
      'username', 'password', 'company_name', 'contact_person', 'email',
      'gstin', 'pan_number'
    ];

    const touchedState: Record<string, boolean> = {};
    allFields.forEach(field => {
      touchedState[field] = true;
    });

    // Mark all contact fields as touched
    if (newClient.contacts) {
      newClient.contacts.forEach((_, index) => {
        touchedState[`contacts[${index}].contact_name`] = true;
        touchedState[`contacts[${index}].phone`] = true;
        touchedState[`contacts[${index}].email`] = true;
      });
    }

    setTouched(touchedState);

    // Validate form
    if (!validateForm()) {
      setSubmitError('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // console.log('Submitting form data:', newClient);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClient,
          profile_pic: newClient.profile_pic || defaultProfilePic,
          role: 'client'
        }),
      });

      // console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      // console.log('Success response:', result);
      refreshClients(); // Trigger refresh after successful creation
      onClose();
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Upload Section */}
      <div className="flex justify-center relative w-full">
        <div className="relative group w-32 h-32 rounded-full overflow-hidden">
          <img
            src={newClient.profile_pic || defaultProfilePic}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {!uploadingImage && (
            <div
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Pencil className="text-white w-6 h-6" />
            </div>
          )}
          {uploadingImage && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            disabled={uploadingImage}
          />
        </div>
      </div>

      {imageError && (
        <div className="text-center text-red-500 text-sm">
          {imageError}
        </div>
      )}

      {submitError && (
        <div className="text-center text-red-500 text-sm">
          {submitError}
        </div>
      )}

      {/* Authentication Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Authentication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              value={newClient.username}
              onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
              onBlur={() => handleBlur('username')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('username') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('username') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('username')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-500" />
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={newClient.password}
              onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
              onBlur={() => handleBlur('password')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('password') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('password') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('password')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 flex items-center">
              <Building className="w-4 h-4 mr-2 text-gray-500" />
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              required
              value={newClient.company_name}
              onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
              onBlur={() => handleBlur('company_name')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('company_name') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('company_name') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('company_name')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              required
              value={newClient.contact_person}
              onChange={(e) => setNewClient({ ...newClient, contact_person: e.target.value })}
              onBlur={() => handleBlur('contact_person')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('contact_person') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('contact_person') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('contact_person')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('email') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('email') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
              GSTIN
            </label>
            <input
              type="text"
              id="gstin"
              value={newClient.gstin || ''}
              onChange={(e) => setNewClient({ ...newClient, gstin: e.target.value })}
              onBlur={() => handleBlur('gstin')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('gstin') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('gstin') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('gstin')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="pan" className="block text-sm font-medium text-gray-700 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
              PAN Number
            </label>
            <input
              type="text"
              id="pan"
              value={newClient.pan_number || ''}
              onChange={(e) => setNewClient({ ...newClient, pan_number: e.target.value })}
              onBlur={() => handleBlur('pan_number')}
              className={`mt-1 block w-full rounded-lg border ${getFieldError('pan_number') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
            />
            {getFieldError('pan_number') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('pan_number')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Contacts */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Contacts</h3>
        {newClient.contacts?.map((contact, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-4 mb-4">
            <div className="space-y-1">
              <label htmlFor={`contactName-${index}`} className="block text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Contact Name
              </label>
              <input
                type="text"
                id={`contactName-${index}`}
                required
                value={contact.contact_name}
                onChange={(e) => {
                  const updatedContacts = [...newClient.contacts];
                  updatedContacts[index].contact_name = e.target.value;
                  setNewClient({ ...newClient, contacts: updatedContacts });
                }}
                onBlur={() => handleContactBlur(index, 'contact_name')}
                className={`mt-1 block w-full rounded-lg border ${getContactFieldError(index, 'contact_name') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
              />
              {getContactFieldError(index, 'contact_name') && (
                <p className="text-red-500 text-xs mt-1">{getContactFieldError(index, 'contact_name')}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor={`contactPhone-${index}`} className="block text-sm font-medium text-gray-700 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                Phone Number
              </label>
              <input
                type="tel"
                id={`contactPhone-${index}`}
                required
                value={contact.phone}
                onChange={(e) => {
                  const updatedContacts = [...newClient.contacts];
                  updatedContacts[index].phone = e.target.value;
                  setNewClient({ ...newClient, contacts: updatedContacts });
                }}
                onBlur={() => handleContactBlur(index, 'phone')}
                className={`mt-1 block w-full rounded-lg border ${getContactFieldError(index, 'phone') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
              />
              {getContactFieldError(index, 'phone') && (
                <p className="text-red-500 text-xs mt-1">{getContactFieldError(index, 'phone')}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor={`contactEmail-${index}`} className="block text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                Email Address
              </label>
              <input
                type="email"
                id={`contactEmail-${index}`}
                required
                value={contact.email}
                onChange={(e) => {
                  const updatedContacts = [...newClient.contacts];
                  updatedContacts[index].email = e.target.value;
                  setNewClient({ ...newClient, contacts: updatedContacts });
                }}
                onBlur={() => handleContactBlur(index, 'email')}
                className={`mt-1 block w-full rounded-lg border ${getContactFieldError(index, 'email') ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3`}
              />
              {getContactFieldError(index, 'email') && (
                <p className="text-red-500 text-xs mt-1">{getContactFieldError(index, 'email')}</p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            setNewClient({
              ...newClient,
              contacts: [
                ...(newClient.contacts || []),
                { contact_name: '', phone: '', email: '' }
              ]
            });
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          + Add Another Contact
        </button>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          disabled={uploadingImage || isSubmitting}
        >
          {uploadingImage ? 'Uploading Image...' :
            isSubmitting ? 'Submitting...' : 'Add Client'}
        </button>
      </div>
    </form>
  );
}