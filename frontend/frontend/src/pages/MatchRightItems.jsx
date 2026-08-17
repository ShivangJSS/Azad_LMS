import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function MatchRightItems() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Match Making Questions', path: '/match-making' },
    { label: 'Right Items' },
  ];

  const rightItems = [
    { id: 1, text: 'Person receiving the message', sortOrder: 'asc' },
    { id: 2, text: 'Information being communicated', sortOrder: 'asc' },
    { id: 3, text: 'Person sending the message', sortOrder: 'asc' },
    { id: 4, text: 'Channel used to communicate', sortOrder: 'asc' },
  ];

  return (
    <div className="p-6 bg-[#f1f4f9] min-h-screen">
      <PageHeader title="Match Right Items" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
        {/* Action Header Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <button className="px-3 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors">
            + Add Right Items
          </button>
          <button className="px-4 py-1.5 bg-[#e55353] hover:bg-red-600 text-white rounded text-sm font-medium transition-colors">
            Delete
          </button>
        </div>

        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            Show
            <select className="border border-gray-300 rounded px-2 py-1 focus:outline-none">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            entries
          </div>
          <div className="flex items-center gap-2">
            Search:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#701a5e] text-white">
                <th className="py-2.5 px-4 font-medium border-r border-purple-900/40 w-16 text-center">
                  # <span className="text-xs opacity-70">↑↓</span>
                </th>
                <th className="py-2.5 px-4 font-medium border-r border-purple-900/40">
                  Right Item Text <span className="text-xs opacity-70">↑↓</span>
                </th>
                <th className="py-2.5 px-4 font-medium w-48">
                  Sort Order <span className="text-xs opacity-70">↑↓</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {rightItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-center border-r border-gray-200">{item.id}</td>
                  <td className="py-3 px-4 border-r border-gray-200">{item.text}</td>
                  <td className="py-3 px-4">{item.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-500 gap-3">
          <div>Showing 1 to 4 of 4 entries</div>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-50 border-r border-gray-300">
              Previous
            </button>
            <button className="px-3 py-1 bg-[#701a5e] text-white font-medium">1</button>
            <button className="px-3 py-1 text-gray-500 hover:bg-gray-50 border-l border-gray-300">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}