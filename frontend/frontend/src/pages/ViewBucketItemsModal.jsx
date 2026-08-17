import React from 'react';

export default function ViewBucketItemsModal({ isOpen, onClose, items = [] }) {
  if (!isOpen) return null;

  // Sample fallback items if none provided
  const displayItems = items.length > 0 ? items : [
    {
      id: 1,
      bucketName: 'मौखिक संचार',
      itemName: 'ग्राहक से बात करना',
      itemImage: 'https://via.placeholder.com/40',
      status: 'Active',
      createdDate: '6/25/2026',
    },
    {
      id: 2,
      bucketName: 'मौखिक संचार',
      itemName: 'संदेश लिखना',
      itemImage: 'https://via.placeholder.com/40',
      status: 'Active',
      createdDate: '6/25/2026',
    },
    {
      id: 3,
      bucketName: 'मौखिक संचार',
      itemName: 'मौखिक निर्देश देना',
      itemImage: 'https://via.placeholder.com/40',
      status: 'Active',
      createdDate: '6/25/2026',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-[#701a5e] text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold">View Bucket Items</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Body / Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-[#701a5e] text-white">
                <th className="py-3 px-4 font-semibold border border-purple-900/40 text-center w-20">
                  Item No
                </th>
                <th className="py-3 px-4 font-semibold border border-purple-900/40">
                  Bucket Name
                </th>
                <th className="py-3 px-4 font-semibold border border-purple-900/40">
                  Item Name
                </th>
                <th className="py-3 px-4 font-semibold border border-purple-900/40 text-center">
                  Item Image
                </th>
                <th className="py-3 px-4 font-semibold border border-purple-900/40 text-center">
                  Status
                </th>
                <th className="py-3 px-4 font-semibold border border-purple-900/40 text-center">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border border-gray-200 text-center text-gray-700">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 text-gray-800">
                    {item.bucketName}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 text-gray-800">
                    {item.itemName}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 text-center">
                    <img
                      src={item.itemImage}
                      alt={item.itemName}
                      className="w-10 h-10 object-contain rounded border border-gray-200 mx-auto"
                    />
                  </td>
                  <td className="py-3 px-4 border border-gray-200 text-center text-gray-600">
                    {item.status}
                  </td>
                  <td className="py-3 px-4 border border-gray-200 text-center text-gray-600">
                    {item.createdDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}