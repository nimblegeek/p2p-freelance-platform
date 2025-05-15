'use client';

import { useState, useEffect } from 'react';
import { WaitlistStatus, UserType } from '@prisma/client';

interface WaitlistEntry {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  userType: UserType;
  interests: string | null;
  source: string | null;
  notes: string | null;
  status: WaitlistStatus;
  createdAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
}

interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export default function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    search: '',
    userType: '',
    status: '',
  });
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [pagination.currentPage, filters]);

  const fetchEntries = async () => {
    const queryParams = new URLSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.userType && { userType: filters.userType }),
      ...(filters.status && { status: filters.status }),
    });

    const response = await fetch(`/api/waitlist?${queryParams}`);
    const data = await response.json();
    setEntries(data.entries);
    setPagination(data.pagination);
  };

  const handleUpdateEntry = async (entry: WaitlistEntry) => {
    const response = await fetch('/api/waitlist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (response.ok) {
      fetchEntries();
      setSelectedEntry(null);
      setIsEditing(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const response = await fetch(`/api/waitlist?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchEntries();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Waitlist Management</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded p-2"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="border rounded p-2"
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="CLIENT">Client</option>
            <option value="FREELANCER">Freelancer</option>
          </select>
          <select
            className="border rounded p-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {Object.values(WaitlistStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.firstName} {entry.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.userType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    entry.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                    entry.status === 'RESPONDED' ? 'bg-green-100 text-green-800' :
                    entry.status === 'INVITED' ? 'bg-purple-100 text-purple-800' :
                    entry.status === 'JOINED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {entries.length} of {pagination.total} entries
        </div>
        <div className="flex gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPagination({ ...pagination, currentPage: i + 1 })}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  value={selectedEntry.status}
                  onChange={(e) =>
                    setSelectedEntry({
                      ...selectedEntry,
                      status: e.target.value as WaitlistStatus,
                    })
                  }
                >
                  {Object.values(WaitlistStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  value={selectedEntry.notes || ''}
                  onChange={(e) =>
                    setSelectedEntry({
                      ...selectedEntry,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateEntry(selectedEntry)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
