import React, { useRef, useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Building, CreditCard, Pencil, Save, X, AlertCircle } from 'lucide-react';
import { NewClientForm } from '../type/NewClientForm';

const defaultProfilePic = 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid';

interface ClientEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: NewClientForm;
  onSave: (updatedClient: NewClientForm) => Promise<void>;
}

interface ValidationErrors {
  username?: string;
  password?: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  gstin?: string;
  pan_number?: string;
  contacts?: {
    [index: number]: {
      contact_name?: string;
      phone?: string;
      email?: string;
    }
  };
}

export function ClientEditForm({ isOpen, onClose, client, onSave }: ClientEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<NewClientForm>({ ...client });
  const [originalData, setOriginalData] = useState<NewClientForm>({ ...client });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData({ ...client });
    setOriginalData({ ...client });
    setHasChanges(false);
    setValidationErrors({});
    setTouchedFields({});
  }, [client]);

  useEffect(() => {
    const changesDetected = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changesDetected);
  }, [formData, originalData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size should be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_pic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    markFieldAsTouched(name);
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: updatedContacts }));
    validateContactField(index, field, value);
    markFieldAsTouched(`contacts.${index}.${field}`);
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        break;
      case 'password':
        if (value && value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'company_name':
        if (!value.trim()) error = 'Company name is required';
        break;
      case 'contact_person':
        if (!value.trim()) error = 'Contact person is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'gstin':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          error = 'Invalid GSTIN format';
        }
        break;
      case 'pan_number':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          error = 'Invalid PAN format';
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));

    return !error;
  };

  const validateContactField = (index: number, field: string, value: string) => {
    let error = '';

    switch (field) {
      case 'contact_name':
        if (!value.trim()) error = 'Contact name is required';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone is required';
        else if (!/^[0-9]{10}$/.test(value.replace(/[^0-9]/g, ''))) {
          error = 'Invalid phone format';
        }
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [index]: {
          ...(prev.contacts?.[index] || {}),
          [field]: error || undefined
        }
      }
    }));

    return !error;
  };

  const validateForm = () => {
    // Mark all fields as touched for validation
    const allFields = ['username', 'company_name', 'contact_person', 'email'];
    const newTouchedFields = { ...touchedFields };
    
    allFields.forEach(field => {
      newTouchedFields[field] = true;
      validateField(field, formData[field as keyof NewClientForm] as string);
    });

    // Validate all contacts
    formData.contacts.forEach((contact, index) => {
      Object.entries(contact).forEach(([field, value]) => {
        newTouchedFields[`contacts.${index}.${field}`] = true;
        validateContactField(index, field, value as string);
      });
    });
    
    setTouchedFields(newTouchedFields);

    // Check if there are any validation errors
    const hasErrors = [
      validationErrors.username,
      validationErrors.company_name,
      validationErrors.contact_person,
      validationErrors.email,
      ...(formData.password ? [validationErrors.password] : []),
      ...(formData.gstin ? [validationErrors.gstin] : []),
      ...(formData.pan_number ? [validationErrors.pan_number] : [])
    ].some(error => !!error);

    // Check contact validation errors
    const contactErrors = validationErrors.contacts || {};
    const hasContactErrors = Object.values(contactErrors).some(
      contactError => Object.values(contactError || {}).some(error => !!error)
    );

    return !hasErrors && !hasContactErrors;
  };

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { contact_name: '', phone: '', email: '' }]
    }));
  };

  const handleRemoveContact = (index: number) => {
    if (formData.contacts.length > 1) {
      const updatedContacts = [...formData.contacts];
      updatedContacts.splice(index, 1);
      setFormData(prev => ({ ...prev, contacts: updatedContacts }));
      
      // Remove validation errors for this contact
      if (validationErrors.contacts) {
        const updatedContactErrors = { ...validationErrors.contacts };
        delete updatedContactErrors[index];
        
        // Reindex the remaining errors
        const reindexedErrors: ValidationErrors['contacts'] = {};
        Object.keys(updatedContactErrors).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            reindexedErrors[keyIndex - 1] = updatedContactErrors[keyIndex];
          } else {
            reindexedErrors[keyIndex] = updatedContactErrors[keyIndex];
          }
        });
        
        setValidationErrors(prev => ({
          ...prev,
          contacts: reindexedErrors
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please fix validation errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the complete client data to send to server
      const dataToSave = {
        auth_id: formData.auth_id,
        client_id: formData.client_id,
        username: formData.username,
        password: formData.password, // Plain text password
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        gstin: formData.gstin || null,
        pan_number: formData.pan_number || null,
        profile_pic: formData.profile_pic || defaultProfilePic,
        contacts: formData.contacts
      };

      // console.log('Sending client data to server:', dataToSave);
      await onSave(dataToSave);
      
      setOriginalData(formData);
      setHasChanges(false);
      onClose();
    } catch (err: any) {
      console.error('Error saving client:', err);
      setSubmitError(err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setHasChanges(false);
    setValidationErrors({});
    setTouchedFields({});
  };

  const getInputClassName = (fieldName: string, contactIndex?: number, contactField?: string) => {
    let hasError = false;
    
    if (contactIndex !== undefined && contactField) {
      hasError = !!(touchedFields[`contacts.${contactIndex}.${contactField}`] && 
                    validationErrors.contacts?.[contactIndex]?.[contactField]);
    } else {
      hasError = !!(touchedFields[fieldName] && validationErrors[fieldName as keyof ValidationErrors]);
    }
    
    return `mt-1 block w-full rounded-lg shadow-sm p-3 border ${
      hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
    }`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Client</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex justify-center relative w-full">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden">
              <img
                src={formData.profile_pic || defaultProfilePic}
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
          {imageError && <div className="text-center text-red-500 text-sm">{imageError}</div>}

          {/* Authentication */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Authentication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" /> Username
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={getInputClassName('username')}
                />
                {touchedFields.username && validationErrors.username && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.username}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={getInputClassName('password')}
                />
                {touchedFields.password && validationErrors.password && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.password}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-500" /> Company Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={getInputClassName('company_name')}
                />
                {touchedFields.company_name && validationErrors.company_name && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.company_name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" /> Contact Person
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className={getInputClassName('contact_person')}
                />
                {touchedFields.contact_person && validationErrors.contact_person && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.contact_person}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                />
                {touchedFields.email && validationErrors.email && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> GSTIN
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin || ''}
                  onChange={handleChange}
                  className={getInputClassName('gstin')}
                />
                {touchedFields.gstin && validationErrors.gstin && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.gstin}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> PAN Number
                </label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number || ''}
                  onChange={handleChange}
                  className={getInputClassName('pan_number')}
                />
                {touchedFields.pan_number && validationErrors.pan_number && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.pan_number}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Contacts */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Contacts</h3>
            {formData.contacts.map((contact, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" /> Contact Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.contact_name}
                    onChange={(e) => handleContactChange(index, 'contact_name', e.target.value)}
                    className={getInputClassName('contacts', index, 'contact_name')}
                  />
                  {touchedFields[`contacts.${index}.contact_name`] && 
                   validationErrors.contacts?.[index]?.contact_name && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.contacts[index].contact_name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" /> Phone
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    className={getInputClassName('contacts', index, 'phone')}
                  />
                  {touchedFields[`contacts.${index}.phone`] && 
                   validationErrors.contacts?.[index]?.phone && (
                    <div className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {validationErrors.contacts[index].phone}
                    </div>
                  )}
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                      className={getInputClassName('contacts', index, 'email')}
                    />
                    {touchedFields[`contacts.${index}.email`] && 
                     validationErrors.contacts?.[index]?.email && (
                      <div className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {validationErrors.contacts[index].email}
                      </div>
                    )}
                  </div>
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="mb-1 p-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddContact}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Add Another Contact
            </button>
          </div>

          {/* Required Fields Notice */}
          <div className="text-gray-500 text-xs flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Fields marked with <span className="text-red-500 mx-1">*</span> are required
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">
              {submitError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Reset
              </button>
            )}
            <button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className={`px-6 py-2 rounded-lg text-sm flex items-center ${
                hasChanges 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}