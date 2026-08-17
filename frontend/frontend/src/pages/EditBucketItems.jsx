import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function EditBucketItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([
    {
      id: 1,
      name: 'ग्राहक से बात करना',
      image: 'https://via.placeholder.com/40',
      status: 'Active',
    },
    {
      id: 2,
      name: 'संदेश लिखना',
      image: 'https://via.placeholder.com/40',
      status: 'Active',
    },
    {
      id: 3,
      name: 'मौखिक निर्देश देना',
      image: 'https://via.placeholder.com/40',
      status: 'Active',
    },
  ]);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Drop Bucket Masters', path: '/drop-buckets' },
    { label: 'Edit Items' },
  ];

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', image: '', status: 'Active' },
    ]);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Edit Drop Bucket Items" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {/* Sub Header / Action */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-[#701a5e]">☰</span> Bucket Items
          </h2>
          <button
            onClick={handleAddItem}
            className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Dynamic Bucket Item Cards */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-md bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              {/* Item Name */}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.id, 'name', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
                />
              </div>

              {/* Item Image Upload & Preview */}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Item Image
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center border border-gray-300 rounded bg-white">
                    <label className="cursor-pointer bg-[#2c3e50] hover:bg-[#1a252f] text-white px-3 py-2 text-xs font-medium rounded-l">
                      Choose File
                      <input type="file" className="hidden" />
                    </label>
                    <span className="px-2 text-xs text-gray-500 truncate">
                      No file chosen
                    </span>
                  </div>
                  {item.image && (
                    <div className="p-1 border border-gray-200 rounded shrink-0">
                      <img
                        src={item.image}
                        alt="Item"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleItemChange(item.id, 'status', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e] bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Delete Button */}
              <div className="md:col-span-2 flex items-end h-full">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-full mt-5 border border-red-300 text-red-500 hover:bg-red-50 py-2 rounded text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate('/drop-buckets')}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/drop-buckets')}
            className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Update Bucket Items
          </button>
        </div>
      </div>
    </div>
  );
}