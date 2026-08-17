import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function EditMatchMaking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    language: 'English',
    title: isEdit ? 'संचार प्रक्रिया के घटकों को मिलाइए' : '',
    description: '',
    marks: '1.00',
    status: 'Active',
    image: null,
  });

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Match Making Questions', path: '/match-making' },
    { label: isEdit ? 'Edit' : 'Add' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Question ${isEdit ? 'updated' : 'added'} successfully!`);
    navigate('/match-making');
  };

  return (
    <div className="p-6 bg-[#f1f4f9] min-h-screen">
      <PageHeader
        title={isEdit ? 'Edit Match Making Question' : 'Add Match Making Question'}
        breadcrumbs={breadcrumbs}
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Match Making Question' : 'Add Match Making Question'}
          </h2>
        </div>

        <div className="p-6 space-y-5 max-w-5xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.language}
              readOnly
              className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-300 rounded text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image
            </label>
            <div className="border border-gray-300 rounded p-1 flex items-center bg-white mb-2">
              <label className="bg-[#2d3748] hover:bg-gray-800 text-white px-3 py-1 rounded text-xs cursor-pointer transition-colors">
                Choose File
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
              </label>
              <span className="ml-3 text-xs text-gray-500">
                {formData.image ? formData.image.name : 'No file chosen'}
              </span>
            </div>

            <div className="w-24 h-24 border border-gray-300 rounded overflow-hidden p-1 bg-gray-50">
              <img
                src="https://placehold.co/100x100"
                alt="Thumbnail"
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/match-making')}
            className="px-4 py-1.5 bg-white border border-gray-400 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#701a5e] hover:bg-[#5b144d] text-white rounded text-sm font-medium transition-colors"
          >
            Update Match Making Question
          </button>
        </div>
      </form>
    </div>
  );
}