import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditSCQ() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    language: 'English',
    title: 'Which of the following is a common barrier to effective communication?',
    description: '',
    marks: '1.00',
    status: 'Active',
    imagePreview: 'https://via.placeholder.com/200x120',
  });

  const [options, setOptions] = useState([
    { id: 1, text: 'Noise, language differences, or an unclear message', isCorrect: true },
    { id: 2, text: 'Speaking clearly and listening actively', isCorrect: false },
    { id: 3, text: 'Maintaining eye contact', isCorrect: false },
    { id: 4, text: 'Using simple, polite words', isCorrect: false },
  ]);

  // Handle Form Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Select Single Correct Answer (Radio Behavior)
  const handleSelectCorrectOption = (id) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id, // Sets selected option to true, others to false
      }))
    );
  };

  // Handle Option Text Change
  const handleOptionTextChange = (id, text) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  // Add Option Row
  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      text: '',
      isCorrect: options.length === 0, // First added option defaults to true if empty
    };
    setOptions([...options, newOption]);
  };

  // Remove Option Row
  const handleDeleteOption = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, options };
    console.log('Updated SCQ Data:', payload);
    alert('SCQ Updated successfully!');
    navigate('/scqs');
  };

  return (
    <div className="p-6 bg-[#f4f6f9] min-h-screen text-gray-800">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Edit SCQ Question</h1>
        <div className="text-sm text-gray-500">
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span> /{' '}
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/scqs')}>SCQs</span> /{' '}
          <span className="text-[#701a5e] font-medium">Edit SCQ</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
        {/* Card 1: Question Details */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-5">
            Edit SCQ
          </h2>

          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-300 rounded text-sm text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Question Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-[#701a5e]"
                required
              />
            </div>

            {/* Question Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-[#701a5e] resize-y"
              />
            </div>

            {/* Question Image Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Image
              </label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <label className="bg-[#2d3748] hover:bg-[#1a202c] text-white px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="px-3 text-sm text-gray-500">
                  {formData.imagePreview ? 'File selected' : 'No file chosen'}
                </span>
              </div>

              {/* Image Preview */}
              {formData.imagePreview && (
                <div className="mt-3">
                  <img
                    src={formData.imagePreview}
                    alt="SCQ Attachment"
                    className="max-h-36 object-contain rounded border border-gray-200 p-1"
                  />
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
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-[#701a5e]"
                required
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-[#701a5e] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: SCQ Options Table */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              SCQ Options <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              + Add Option
            </button>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-600">
                  <th className="py-2.5 px-4 font-medium w-20 text-center border-r border-gray-200">
                    Correct
                  </th>
                  <th className="py-2.5 px-4 font-medium border-r border-gray-200">
                    Option Text
                  </th>
                  <th className="py-2.5 px-4 font-medium w-24 text-center">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {options.map((option) => (
                  <tr key={option.id}>
                    {/* Correct Radio Input */}
                    <td className="py-3 px-4 text-center border-r border-gray-200">
                      <input
                        type="radio"
                        name="scq-correct-option"
                        checked={option.isCorrect}
                        onChange={() => handleSelectCorrectOption(option.id)}
                        className="w-4 h-4 accent-[#701a5e] cursor-pointer"
                      />
                    </td>

                    {/* Option Text Input */}
                    <td className="py-2.5 px-4 border-r border-gray-200">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          handleOptionTextChange(option.id, e.target.value)
                        }
                        placeholder="Enter option text"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-[#701a5e]"
                        required
                      />
                    </td>

                    {/* Delete Option Button */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                        className="bg-[#d9534f] hover:bg-red-600 text-white w-7 h-7 rounded text-xs font-bold transition-colors inline-flex items-center justify-center"
                        title="Delete option"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/scqs')}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-5 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
          >
            Update SCQ
          </button>
        </div>
      </form>
    </div>
  );
}