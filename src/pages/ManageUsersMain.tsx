import React, { useState, useMemo } from 'react';
import { NewUserForm, User } from '../Data';
import API_BASE_URL from '../config';
import { Header } from './ManageUsers/Header';
import { UserTable } from './ManageUsers/UserTable';
// import { AddUserModal } from './ManageUsers/AddUserModal';
import { ViewUserModal } from './ManageUsers/ViewUserModal';
import { initialUsers } from '../Data/initialUsers';
import AddUserModal from './ManageUsers/AddUserModal';
import { GroupList } from './ManageUsers/GroupList';
import { useUserContext } from '../Data/UserData';



function ManageUsersMain() {
  const { currentUser } = useUserContext();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Admin' | 'Employee' | 'Client' | 'Group'>('Employee');
  // Group State
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    department: '',
    adminLevel: '',
    designation: '',
    employeeId: '',
    joiningDate: '',
    companyName: '',
    gstin: '',
    pan: '',
    address: '',
  });

  const filteredUsers = useMemo(() => {
    if (activeTab === 'Group') return []; // Users filter doesn't apply to groups directly here
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMap: Record<string, string> = { 'Admin': 'Admin', 'Employee': 'Employee', 'Client': 'Client' };
      const matchesRole = user.role === roleMap[activeTab]; // Simplified as activeTab cannot be 'All'
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, activeTab]);

  // Fetch groups when tab is Group
  React.useEffect(() => {
    if (activeTab === 'Group') {
      fetch(`${API_BASE_URL}/chats/groups/all`)
        .then(res => res.json())
        .then(data => setGroups(data))
        .catch(err => console.error('Error fetching groups:', err));
    }
  }, [activeTab]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    let user: User;

    switch (activeTab) {
      case 'Admin':
        user = {
          ...baseUser,
          role: 'Admin',
          department: newUser.department,
          adminLevel: newUser.adminLevel,
        };
        break;
      case 'Employee':
        user = {
          ...baseUser,
          role: 'Employee',
          designation: newUser.designation,
          employeeId: newUser.employeeId,
          joiningDate: newUser.joiningDate,
        };
        break;
      case 'Client':
        user = {
          ...baseUser,
          role: 'Client',
          companyName: newUser.companyName,
          gstin: newUser.gstin,
          pan: newUser.pan,
          address: newUser.address,
        };
        break;
    }

    // Handle Group Create/Update - API call moved to AddUserModal onSubmit for clarity or keep here?
    // Kept inside onSubmit prop of AddUserModal to have access to type 'Group'.
    // Removing this block to avoid duplication or confusion, as logic is now in onSubmit prop.

    setUsers([...users, user]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      status: 'Active',
      department: '',
      adminLevel: '',
      designation: '',
      employeeId: '',
      joiningDate: '',
      companyName: '',
      gstin: '',
      pan: '',
      address: '',
    });
    setActiveTab('Employee');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab === 'Group' ? 'groups' : activeTab === 'Client' ? 'clients' : 'users'}
        setActiveTab={(tab) => {
          if (tab === 'groups') setActiveTab('Group');
          else if (tab === 'clients') setActiveTab('Client');
          else setActiveTab('Employee');
        }}
        onAddUser={() => {
          setSelectedGroup(null);
          setIsModalOpen(true);
        }}
      />

      {activeTab === 'Group' ? (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <GroupList
            groups={groups}
            onDeleteGroup={(id) => { }}
            onEditGroup={(group) => {
              setSelectedGroup(group);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <UserTable
          currentTab={activeTab === 'Client' ? 'clients' : 'users'}
        />
      )}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubmit={(data, type) => {
          if (type === 'Group') {
            console.log("Submitting Group Form. SelectedGroup:", selectedGroup);
            console.log("Form Data:", data);
            console.log("Current User:", currentUser);

            if (selectedGroup) {
              // UPDATE
              console.log("Updating group...");
              fetch(`${API_BASE_URL}/chats/groups/${selectedGroup.group_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  group_name: data.group_name,
                  members: data.members // Array of user_ids
                })
              })
                .then(() => {
                  fetch(`${API_BASE_URL}/chats/groups/all`).then(r => r.json()).then(setGroups);
                  setIsModalOpen(false);
                })
                .catch(err => console.error("Error updating group:", err));
            } else {
              // CREATE
              const payload = {
                group_name: data.group_name,
                members: data.members,
                creator_id: currentUser?.user_id
              };
              console.log("Creating group with payload:", payload);

              fetch(`${API_BASE_URL}/chats/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              })
                .then(async (res) => {
                  const responseText = await res.text();
                  console.log("Create Group Response:", res.status, responseText);
                  if (!res.ok) throw new Error(responseText);
                  return JSON.parse(responseText);
                })
                .then(() => {
                  fetch(`${API_BASE_URL}/chats/groups/all`).then(r => r.json()).then(setGroups);
                  setIsModalOpen(false);
                })
                .catch(err => {
                  console.error("Error creating group:", err);
                  alert("Failed to create group: " + err.message);
                });
            }
            return;
          }
          handleAddUser(data as any);
        }}
        initialGroupData={selectedGroup} // Pass the selected group
      />

      {selectedUser && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
}

export default ManageUsersMain;