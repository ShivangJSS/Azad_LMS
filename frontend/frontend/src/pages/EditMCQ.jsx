import React, { useState } from 'react';

export default function EditMCQ() {
  const [formData, setFormData] = useState({
    language: 'English',
    title: 'Which of the following are examples of communication mediums?',
    description: 'Which of the following are examples of communication mediums?',
    marks: '1.00',
    status: 'Active',
    imagePreview: 'https://via.placeholder.com/150',
  });

  const [options, setOptions] = useState([
    { id: 1, text: 'Mobile Phone', isCorrect: true },
    { id: 2, text: 'Newspaper', isCorrect: true },
    { id: 3, text: 'Internet', isCorrect: true },
    { id: 4, text: 'Vehicle Indicator', isCorrect: true },
  ]);

  // Handle Form Inputs Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Handle Options Text Change
  const handleOptionTextChange = (id, text) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  // Handle Option Checkbox Toggle
  const handleOptionCorrectToggle = (id) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt))
    );
  };

  // Add New Option Row
  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      text: '',
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  // Remove Option Row
  const handleDeleteOption = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated MCQ Payload:', { ...formData, options });
    alert('MCQ Updated successfully!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Edit MCQ Question</h1>
        <div className="text-sm text-gray-500">
          <span className="hover:underline cursor-pointer">Home</span> /{' '}
          <span className="hover:underline cursor-pointer">MCQs</span> /{' '}
          <span className="text-purple-900 font-medium">Edit MCQ</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
        {/* MCQ Details Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-3 mb-4">
            Edit MCQ
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
                className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-[#701a5e]"
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
                Question Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <label className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
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
                    alt="Preview"
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

            {/* Status */}
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

        {/* Dynamic MCQ Options Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-medium text-gray-800">
              MCQ Options <span className="text-red-500">*</span>
            </h2>
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
            >
              + Add Option
            </button>
          </div>

          {/* Options Table */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-700">
                  <th className="py-3 px-4 font-medium w-20 text-center border-r border-gray-200">
                    Correct
                  </th>
                  <th className="py-3 px-4 font-medium border-r border-gray-200">
                    Option Text <span className="text-red-500">*</span>
                  </th>
                  <th className="py-3 px-4 font-medium w-20 text-center">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {options.map((option) => (
                  <tr key={option.id}>
                    {/* Correct Checkbox */}
                    <td className="py-3 px-4 text-center border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={() => handleOptionCorrectToggle(option.id)}
                        className="w-4 h-4 accent-[#701a5e] cursor-pointer"
                      />
                    </td>

                    {/* Option Input */}
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

                    {/* Delete Button */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteOption(option.id)}
                        className="bg-[#e55353] hover:bg-red-600 text-white w-7 h-7 rounded text-xs font-bold transition-colors inline-flex items-center justify-center"
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

        {/* Bottom Form Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-6 py-2 rounded text-sm font-medium transition-colors shadow-sm"
          >
            Update MCQ
          </button>
        </div>
      </form>
    </div>
  );
}