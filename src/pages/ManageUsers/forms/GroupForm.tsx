import React, { useState, useEffect } from 'react';

interface Employee {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
}

interface GroupFormProps {
    onSubmit: (data: any) => void;
    onClose: () => void;
    initialData?: any; // For editing
}

export function GroupForm({ onSubmit, onClose, initialData }: GroupFormProps) {
    const [groupName, setGroupName] = useState(initialData?.group_name || '');
    const [users, setUsers] = useState<Employee[]>([]); // Renamed from employees to users
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Changed to string[]
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (initialData?.group_id) {
            // Fetch members for this group
            fetch(`http://localhost:3000/chats/groups/${initialData.group_id}/members`)
                .then(res => res.json())
                .then(data => {
                    // data is likely array of users. map to ids.
                    setSelectedMembers(data.map((m: any) => m.user_id.toString()));
                })
                .catch(err => console.error("Error fetching group members:", err));
        }
    }, [initialData]);

    useEffect(() => {
        // Fetch employees
        fetch('http://localhost:3000/users')
            .then(res => res.json())
            .then(data => {
                const emps = data.filter((u: any) => u.role === 'employee' || u.role === 'admin');
                setUsers(emps); // Use setUsers
            })
            .catch(err => console.error('Error fetching employees:', err));
    }, []); // Removed initialData from dependency array as it's handled by the new useEffect

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            group_name: groupName,
            members: selectedMembers.map(Number) // Convert back to numbers for submission if needed
        });
    };

    const toggleMember = (userId: number) => {
        const userIdStr = userId.toString(); // Convert to string for comparison
        setSelectedMembers(prev =>
            prev.includes(userIdStr)
                ? prev.filter(id => id !== userIdStr)
                : [...prev, userIdStr]
        );
    };

    const filteredEmployees = users.filter(emp => // Use users here
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                </label>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter group name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Members
                </label>
                <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredEmployees.map(emp => (
                        <div
                            key={emp.user_id}
                            onClick={() => toggleMember(emp.user_id)}
                            className={`flex items-center p-3 cursor-pointer transition-colors ${selectedMembers.includes(emp.user_id.toString()) ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedMembers.includes(emp.user_id.toString())}
                                readOnly
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">
                                {emp.first_name} {emp.last_name} <span className="text-xs text-gray-400">({emp.role})</span>
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedMembers.length} members
                </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {initialData ? 'Update Group' : 'Create Group'}
                </button>
            </div>
        </form>
    );
}
