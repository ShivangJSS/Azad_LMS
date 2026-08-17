import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function EditDropBucket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    language: 'English',
    title: 'निम्नलिखित को सही बकेट में रखें - मौखिक संचार और गैर-मौखिक संचार',
    description: '',
    marks: '1.00',
    status: 'Active',
    imagePreview: 'https://via.placeholder.com/300x100',
  });

  const [buckets, setBuckets] = useState([]);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Drop Bucket Questions', path: '/drop-buckets' },
    { label: 'Edit' },
  ];

  const handleAddBucket = () => {
    setBuckets([
      ...buckets,
      { id: Date.now(), name: '', image: null, status: 'Active' },
    ]);
  };

  const handleRemoveBucket = (id) => {
    setBuckets(buckets.filter((b) => b.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Edit Drop Bucket Question" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-6">
          Edit Drop Bucket Question
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Language Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.language}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-gray-300 rounded text-sm text-gray-700"
            />
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            />
          </div>

          {/* Question Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            />
          </div>

          {/* Question Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded p-2 bg-white">
              <label className="cursor-pointer bg-[#2c3e50] hover:bg-[#1a252f] text-white px-4 py-1.5 rounded text-xs font-medium">
                Choose File
                <input type="file" className="hidden" />
              </label>
              <span className="text-xs text-gray-500">No file chosen</span>
            </div>
            {formData.imagePreview && (
              <div className="mt-2">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="h-16 object-contain border rounded p-1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Current image. Leave empty to keep existing.
                </p>
              </div>
            )}
          </div>

          {/* Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.marks}
              onChange={(e) =>
                setFormData({ ...formData, marks: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e] bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sub Section: Drop Buckets */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Drop Buckets <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={handleAddBucket}
                className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
              >
                + Add Bucket
              </button>
            </div>

            {buckets.length === 0 ? (
              <div className="bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] px-4 py-3 rounded text-sm">
                No buckets added yet. Click "Add Bucket" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {buckets.map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex flex-col md:flex-row items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50"
                  >
                    <input
                      type="text"
                      placeholder="Bucket Name"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                    />
                    <input type="file" className="text-xs text-gray-600" />
                    <button
                      type="button"
                      onClick={() => handleRemoveBucket(b.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/drop-buckets')}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => navigate('/drop-buckets')}
              className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              Update Drop Bucket Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}