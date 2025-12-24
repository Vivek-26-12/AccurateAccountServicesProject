import React from 'react';
import { Users, Trash2, Edit, Eye } from 'lucide-react';

interface Group {
    group_id: number;
    group_name: string;
    created_at: string;
    message_count?: number;
}

interface GroupListProps {
    groups: Group[];
    onDeleteGroup: (groupId: number) => void;
    onEditGroup: (group: Group) => void;
    onViewGroup: (group: Group) => void;
}

export function GroupList({ groups, onDeleteGroup, onEditGroup, onViewGroup }: GroupListProps) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No groups found</h3>
                <p className="text-gray-500">Create a new group to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
                <div
                    key={group.group_id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onViewGroup(group)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Group"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onEditGroup(group)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Group"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDeleteGroup(group.group_id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Group"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {group.group_name}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
                        {/* <span>{group.message_count || 0} messages</span> */}
                    </div>
                </div>
            ))}
        </div>
    );
}
