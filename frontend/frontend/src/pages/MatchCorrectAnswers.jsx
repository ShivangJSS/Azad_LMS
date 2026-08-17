import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function MatchCorrectAnswers() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Match Making Questions', path: '/match-making' },
    { label: 'Correct Answers' },
  ];

  const pairs = [
    { id: 1, leftItem: 'Sender', rightItem: 'Person sending the message' },
    { id: 2, leftItem: 'Message', rightItem: 'Information being communicated' },
    { id: 3, leftItem: 'Medium', rightItem: 'Channel used to communicate' },
    { id: 4, leftItem: 'Receiver', rightItem: 'Person receiving the message' },
  ];

  return (
    <div className="p-6 bg-[#f1f4f9] min-h-screen">
      <PageHeader title="Match Correct Answers" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
        {/* Action Header Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <button className="px-3 py-1.5 bg-[#701a5e] hover:bg-[#5b144d] text-white rounded text-sm font-medium transition-colors">
            Edit Correct Answers
          </button>
          <button className="px-4 py-1.5 bg-[#e55353] hover:bg-red-600 text-white rounded text-sm font-medium transition-colors">
            Delete
          </button>
        </div>

        {/* Table Controls */}
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

        {/* Data Table */}
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#701a5e] text-white">
                <th className="py-2.5 px-4 font-medium border-r border-purple-900/40 w-16 text-center">
                  # <span className="text-xs opacity-70">↑↓</span>
                </th>
                <th className="py-2.5 px-4 font-medium border-r border-purple-900/40 w-1/3">
                  Left Item <span className="text-xs opacity-70">↑↓</span>
                </th>
                <th className="py-2.5 px-4 font-medium">
                  Right Item <span className="text-xs opacity-70">↑↓</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {pairs.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-center border-r border-gray-200">{item.id}</td>
                  <td className="py-3 px-4 border-r border-gray-200">{item.leftItem}</td>
                  <td className="py-3 px-4">{item.rightItem}</td>
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