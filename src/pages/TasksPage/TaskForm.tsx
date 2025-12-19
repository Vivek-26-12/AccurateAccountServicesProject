import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUser, FiUsers, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { useUserContext } from '../../Data/UserData';

export const TaskForm = ({ onClose, onSubmit }) => {
  const { users, currentUser } = useUserContext();
  const [formData, setFormData] = useState({
    task_name: '',
    assigned_type: 'user', // 'user' or 'group'
    assigned_to: '',
    assigned_to_id: '',
    assigned_to_name: '',
    group_id: '',
    status: 'Pending',
    priority: 'Medium',
    due_date: '',
  });

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch groups from server
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const response = await fetch('http://localhost:3000/chats/all-groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to load groups. Please try again.');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // Combine users with current user first
  const allUsers = currentUser
    ? [currentUser, ...users.filter(user => user.user_id !== currentUser.user_id)]
    : users;

  // Filter employees based on search
  const filteredEmployees = allUsers.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      fullName.includes(employeeSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  });

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.group_name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Check task name
    if (!formData.task_name.trim()) {
      errors.task_name = 'Task name is required';
    }
    
    // Check due date
    if (!formData.due_date) {
      errors.due_date = 'Due date is required';
    }
    
    // Check assigned person if user type is selected
    if (formData.assigned_type === 'user' && !formData.assigned_to_id) {
      errors.assigned_to = 'Please select a person to assign this task';
    }
    
    // Check group if group type is selected
    if (formData.assigned_type === 'group' && !formData.group_id) {
      errors.group_id = 'Please select a group to assign this task';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the task data based on assignment type
      const taskData = {
        task_name: formData.task_name,
        assigned_by: currentUser?.user_id || '',
        due_date: formData.due_date,
        status: formData.status,
        priority: formData.priority,
        assigned_to_id: formData.assigned_type === 'user' ? formData.assigned_to_id : null,
        group_id: formData.assigned_type === 'group' ? formData.group_id : null,
        assigned_to_name: formData.assigned_to_name
      };
  
      // Call the parent's onSubmit handler with the form data
      onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = (user) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: `${user.first_name} ${user.last_name}`,
      assigned_to_id: user.user_id,
      assigned_to_name: `${user.first_name} ${user.last_name}`,
      assigned_type: 'user'
    }));
    setShowEmployeeDropdown(false);
    setEmployeeSearch('');
    
    // Clear validation error when employee is selected
    if (validationErrors.assigned_to) {
      setValidationErrors(prev => ({
        ...prev,
        assigned_to: undefined
      }));
    }
  };

  const selectGroup = (group) => {
    setFormData(prev => ({
      ...prev,
      group_id: group.group_id,
      assigned_to_name: group.group_name,
      assigned_type: 'group'
    }));
    setShowGroupDropdown(false);
    setGroupSearch('');
    
    // Clear validation error when group is selected
    if (validationErrors.group_id) {
      setValidationErrors(prev => ({
        ...prev,
        group_id: undefined
      }));
    }
  };
  
  // Handle assignment type change
  const handleAssignmentTypeChange = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      assigned_type: type,
      // Clear the other type's data when switching
      ...(type === 'user' ? { group_id: '', } : { assigned_to: '', assigned_to_id: '' })
    }));
    
    // Clear validation errors when switching types
    setValidationErrors(prev => ({
      ...prev,
      assigned_to: undefined,
      group_id: undefined
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800">Create New Task</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Name*</label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border ${validationErrors.task_name ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              placeholder="Enter task name"
            />
            {validationErrors.task_name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.task_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To*</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleAssignmentTypeChange('user')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center ${
                    formData.assigned_type === 'user'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className="mr-1" /> Person
                </button>
                <button
                  type="button"
                  onClick={() => handleAssignmentTypeChange('group')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center ${
                    formData.assigned_type === 'group'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <FiUsers className="mr-1" /> Group
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority*</label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 appearance-none border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <FiChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {formData.assigned_type === 'user' ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Person*</label>
              <div className="relative">
                <div className={`flex items-center border ${validationErrors.assigned_to ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg overflow-hidden bg-white`}>
                  <span className="pl-3 text-gray-400">
                    <FiUser size={16} />
                  </span>
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    placeholder="Search employee..."
                    className="w-full px-3 py-2.5 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                  >
                    <FiSearch size={16} />
                  </button>
                </div>
                {validationErrors.assigned_to && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.assigned_to}</p>
                )}

                {showEmployeeDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto text-sm">
                    {filteredEmployees.map(user => (
                      <div
                        key={user.user_id}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors ${
                          user.user_id === currentUser?.user_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => selectEmployee(user)}
                      >
                        <div className={`rounded-full p-1.5 mr-3 ${
                          user.user_id === currentUser?.user_id 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <FiUser size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium flex items-center">
                            {user.first_name} {user.last_name}
                            {user.user_id === currentUser?.user_id && (
                              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.assigned_to && (
                <div className={`mt-2 flex items-center text-sm rounded-lg p-3 ${
                  formData.assigned_to_id === currentUser?.user_id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className={`rounded-full p-2 mr-3 ${
                    formData.assigned_to_id === currentUser?.user_id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <FiUser size={16} />
                  </div>
                  <div>
                    <p className="font-medium flex items-center">
                      {formData.assigned_to}
                      {formData.assigned_to_id === currentUser?.user_id && (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">Individual assignment</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Group*</label>
              <div className="relative">
                <div className={`flex items-center border ${validationErrors.group_id ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg overflow-hidden bg-white`}>
                  <span className="pl-3 text-gray-400">
                    <FiUsers size={16} />
                  </span>
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={(e) => {
                      setGroupSearch(e.target.value);
                      setShowGroupDropdown(true);
                    }}
                    onFocus={() => setShowGroupDropdown(true)}
                    placeholder="Search groups..."
                    className="w-full px-3 py-2.5 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  >
                    <FiSearch size={16} />
                  </button>
                </div>
                {validationErrors.group_id && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.group_id}</p>
                )}

                {showGroupDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto text-sm">
                    {isLoadingGroups ? (
                      <div className="px-4 py-3 text-gray-500 text-center">Loading groups...</div>
                    ) : filteredGroups.length > 0 ? (
                      filteredGroups.map(group => (
                        <div
                          key={group.group_id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors"
                          onClick={() => selectGroup(group)}
                        >
                          <div className="rounded-full p-1.5 mr-3 bg-purple-100 text-purple-600">
                            <FiUsers size={14} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{group.group_name}</p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(group.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">No groups found</div>
                    )}
                  </div>
                )}
              </div>

              {formData.group_id && (
                <div className="mt-2 flex items-center text-sm bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="rounded-full p-2 mr-3 bg-purple-100 text-purple-600">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="font-medium">{formData.assigned_to_name}</p>
                    <p className="text-xs text-gray-500">Group assignment</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date*</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiCalendar size={16} />
              </div>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 px-3 py-2.5 border ${validationErrors.due_date ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              />
              {validationErrors.due_date && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.due_date}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium flex items-center justify-center min-w-[100px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};