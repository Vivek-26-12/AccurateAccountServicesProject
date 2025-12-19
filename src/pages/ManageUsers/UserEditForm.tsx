import React, { useRef, useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Key, Pencil, Save, X, AlertCircle } from 'lucide-react';

interface UserData {
  id: number;
  auth_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  profile_pic?: string;
}

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
}

interface UserEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  entity: UserData;
  onSave: (updatedUser: UserData) => Promise<void>;
}

const defaultProfilePic = 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid';

export function UserEditForm({ isOpen, onClose, entity, onSave }: UserEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<UserData>({ ...entity });
  const [originalData, setOriginalData] = useState<UserData>({ ...entity });
  const [password, setPassword] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData({ ...entity });
    setOriginalData({ ...entity });
    setPassword('');
    setHasChanges(false);
    setValidationErrors({});
    setTouched({});
  }, [entity]);

  useEffect(() => {
    const changesDetected = 
      Object.keys(formData).some(key => {
        return formData[key as keyof UserData] !== originalData[key as keyof UserData];
      }) || 
      password !== '';
    setHasChanges(changesDetected);
  }, [formData, originalData, password]);

  const validateField = (name: string, value: string): string | undefined => {
    switch(name) {
      case 'first_name':
      case 'last_name':
        return value.trim().length < 2 ? 'Must be at least 2 characters' : undefined;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Invalid email format' : undefined;
        
      case 'phone':
        const phoneRegex = /^\+?[\d\s()-]{10,15}$/;
        return !phoneRegex.test(value) ? 'Invalid phone format' : undefined;
        
      case 'username':
        return value.trim().length < 3 ? 'Username must be at least 3 characters' : undefined;
        
      case 'password':
        if (value === '') return undefined; // Password can be empty (no change)
        return value.length < 8 ? 'Password must be at least 8 characters' : undefined;
        
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate each field
    const fields: Array<keyof ValidationErrors> = ['first_name', 'last_name', 'email', 'phone', 'username'];
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
    
    // Validate password only if it's being changed
    if (password) {
      const passwordError = validateField('password', password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Set field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on change
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Set password as touched
    setTouched(prev => ({ ...prev, password: true }));
    
    // Validate password
    if (value) {
      const error = validateField('password', value);
      setValidationErrors(prev => ({
        ...prev,
        password: error
      }));
    } else {
      // Clear error if password field is empty
      setValidationErrors(prev => ({
        ...prev,
        password: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allFields = ['first_name', 'last_name', 'email', 'phone', 'username', 'password'];
    const touchedAll = allFields.reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouched(touchedAll);
    
    // Validate all fields
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    
    setShowConfirmation(true);
  };

  const confirmSave = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const dataToSave = {
        ...formData,
        password: password,
        profile_pic: formData.profile_pic || defaultProfilePic,
      };

      await onSave(dataToSave);
      setOriginalData(formData);
      setPassword('');
      setHasChanges(false);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setPassword('');
    setHasChanges(false);
    setValidationErrors({});
    setTouched({});
  };

  if (!isOpen) return null;

  const getInputClassName = (fieldName: string) => {
    const hasError = touched[fieldName] && validationErrors[fieldName as keyof ValidationErrors];
    return `mt-1 block w-full rounded-lg border ${
      hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    } shadow-sm p-3`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ease-out">
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02] border border-blue-200/50 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-1 -left-1 w-full h-full rounded-2xl border-2 border-blue-400 opacity-20 animate-pulse pointer-events-none" />

            <div className="flex items-center justify-center mb-5">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-inner">
                <Save className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-3">
              Confirm Changes
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to save these changes?
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Confirm Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
          {imageError && (
            <div className="text-center text-red-500 text-sm flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {imageError}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" /> First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('first_name')}
                  required
                />
                {touched.first_name && validationErrors.first_name && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.first_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" /> Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('last_name')}
                  required
                />
                {touched.last_name && validationErrors.last_name && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.last_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('email')}
                  required
                />
                {touched.email && validationErrors.email && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" /> Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('phone')}
                  required
                />
                {touched.phone && validationErrors.phone && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName('username')}
                  required
                />
                {touched.username && validationErrors.username && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.username}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Key className="w-4 h-4 mr-2 text-gray-500" /> New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  placeholder="Leave blank to keep current"
                  className={getInputClassName('password')}
                />
                {touched.password && validationErrors.password && (
                  <div className="mt-1 text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" /> Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border bg-white"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="text-red-500 text-sm text-center flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
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
              disabled={!hasChanges || isSubmitting || Object.keys(validationErrors).some(key => !!validationErrors[key as keyof ValidationErrors])}
              className={`px-6 py-2 rounded-lg text-sm flex items-center ${
                hasChanges && !Object.keys(validationErrors).some(key => !!validationErrors[key as keyof ValidationErrors]) 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
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