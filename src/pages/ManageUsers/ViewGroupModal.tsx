import React, { useEffect, useState } from 'react';
import { X, Users, User as UserIcon } from 'lucide-react';
import API_BASE_URL from '../../config';

interface GroupMember {
    user_id: number;
    first_name: string;
    last_name: string;
    role: string;
    profile_pic?: string;
}

interface Group {
    group_id: number;
    group_name: string;
    created_at: string;
    message_count?: number;
}

interface ViewGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group;
}

export const ViewGroupModal = ({ isOpen, onClose, group }: ViewGroupModalProps) => {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && group) {
            setLoading(true);
            fetch(`${API_BASE_URL}/chats/groups/${group.group_id}/members`)
                .then(res => res.json())
                .then(data => setMembers(data))
                .catch(err => console.error("Error fetching members:", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, group]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{group.group_name}</h2>
                            <p className="text-xs text-gray-500">Created {new Date(group.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Group Members ({members.length})
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : members.length > 0 ? (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-all">
                                    <div className="flex items-center space-x-3">
                                        {member.profile_pic ? (
                                            <img
                                                src={member.profile_pic}
                                                alt={`${member.first_name} ${member.last_name}`}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium border-2 border-white shadow-sm">
                                                {member.first_name?.[0]}{member.last_name?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                                            <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    member.role === 'employee' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No members in this group</p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
