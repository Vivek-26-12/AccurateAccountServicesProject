import React, { useRef, useState } from 'react';
import { User, Mail, Phone, Shield, Key, UserPlus, Pencil } from 'lucide-react';
import { NewUserForm } from '../type/UserFormTypes';
import { uploadThumbnailToCloudinary } from '../../../cloudinaryUploads';
import { useData } from '../../../context/DataContext';
import API_BASE_URL from '../../../config';

const VALID_ROLES = ['employee'] as const;
type UserRole = typeof VALID_ROLES[number];

interface UserFormProps {
  newUser: NewUserForm;
  setNewUser: (user: NewUserForm) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

const defaultProfilePic = 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid';

export default function UserForm({ newUser, setNewUser, onSubmit, onClose }: UserFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { refreshUsers } = useData();
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');

  // Form validation states
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }>({});

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUser({ ...newUser, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);

      const cloudinaryUrl = await uploadThumbnailToCloudinary(file);
      setNewUser({ ...newUser, profileImage: cloudinaryUrl });
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image');
      setNewUser({ ...newUser, profileImage: defaultProfilePic });
    } finally {
      setUploadingImage(false);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: {
      username?: string;
      password?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    } = {};

    // Username validation
    if (!newUser.username) {
      newErrors.username = 'Username is required';
    } else if (newUser.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!newUser.password) {
      newErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newUser.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter and one number';
    }

    // First name validation
    if (!newUser.first_name) {
      newErrors.first_name = 'First name is required';
    } else if (newUser.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!newUser.last_name) {
      newErrors.last_name = 'Last name is required';
    } else if (newUser.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!newUser.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newUser.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!newUser.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(newUser.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate role
      if (!VALID_ROLES.includes(selectedRole)) {
        throw new Error('Invalid role selected');
      }

      // Prepare the user data
      const userData = {
        username: newUser.username,
        password: newUser.password,
        role: selectedRole,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        profile_pic: newUser.profileImage || defaultProfilePic
      };

      // console.log('Submitting user data:', userData);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      // // console.log('Success:', result);
      setNewUser({
        username: '',
        password: '',
        role: 'employee',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        profileImage: '',
      });
      refreshUsers();
      await onSubmit(e);
      onClose();
    } catch (err: any) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field: keyof NewUserForm, value: string) => {
    setNewUser({ ...newUser, [field]: value });

    // Clear the specific error when user starts typing again
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Upload */}
      <div className="flex justify-center relative w-full">
        <div className="relative group w-32 h-32 rounded-full overflow-hidden">
          <img
            src={newUser.profileImage || defaultProfilePic}
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
              required
              value={newUser.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.first_name ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.first_name) {
                  setErrors({ ...errors, first_name: 'First name is required' });
                } else if (newUser.first_name.length < 2) {
                  setErrors({ ...errors, first_name: 'First name must be at least 2 characters' });
                }
              }}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <UserPlus className="w-4 h-4 mr-2 text-gray-500" /> Last Name
            </label>
            <input
              type="text"
              required
              value={newUser.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.last_name ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.last_name) {
                  setErrors({ ...errors, last_name: 'Last name is required' });
                } else if (newUser.last_name.length < 2) {
                  setErrors({ ...errors, last_name: 'Last name must be at least 2 characters' });
                }
              }}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.email ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.email) {
                  setErrors({ ...errors, email: 'Email is required' });
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newUser.email)) {
                  setErrors({ ...errors, email: 'Please enter a valid email address' });
                }
              }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" /> Phone
            </label>
            <input
              type="tel"
              required
              value={newUser.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.phone ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.phone) {
                  setErrors({ ...errors, phone: 'Phone number is required' });
                } else if (!/^\d{10}$/.test(newUser.phone.replace(/[^0-9]/g, ''))) {
                  setErrors({ ...errors, phone: 'Please enter a valid 10-digit phone number' });
                }
              }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Authentication Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Authentication</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" /> Username
            </label>
            <input
              type="text"
              required
              value={newUser.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.username ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.username) {
                  setErrors({ ...errors, username: 'Username is required' });
                } else if (newUser.username.length < 3) {
                  setErrors({ ...errors, username: 'Username must be at least 3 characters' });
                }
              }}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Key className="w-4 h-4 mr-2 text-gray-500" /> Password
            </label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${errors.password ? 'border-red-500' : ''
                }`}
              onBlur={() => {
                if (!newUser.password) {
                  setErrors({ ...errors, password: 'Password is required' });
                } else if (newUser.password.length < 6) {
                  setErrors({ ...errors, password: 'Password must be at least 6 characters' });
                } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newUser.password)) {
                  setErrors({
                    ...errors,
                    password: 'Password must contain at least one uppercase letter and one number'
                  });
                }
              }}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-500" /> Role
            </label>
            <input
              type="text"
              value="Employee"
              disabled
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Submission Error */}
      {submitError && (
        <div className="text-red-500 text-sm text-center">{submitError}</div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Submitting...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}