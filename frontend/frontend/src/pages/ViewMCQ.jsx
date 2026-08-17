import React, { useState } from 'react';

export default function ViewMCQ() {
  const [activeTab, setActiveTab] = useState('english');

  const languages = ['English', 'Hindi', 'Bangla', 'Tamil'];

  // Sample data (Replace with API fetch data using useParams ID)
  const mcqData = {
    title: 'Which of the following are examples of communication mediums?',
    description: 'Which of the following are examples of communication mediums?',
    marks: '1.00',
    image: 'https://via.placeholder.com/150', // Replace with real image URL
    options: [
      { id: 1, text: 'Mobile Phone', isCorrect: true },
      { id: 2, text: 'Newspaper', isCorrect: true },
      { id: 3, text: 'Internet', isCorrect: true },
      { id: 4, text: 'Vehicle Indicator', isCorrect: true },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Page Title & Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">MCQ Translation</h1>
        <div className="text-sm text-gray-500">
          <span className="hover:underline cursor-pointer">Home</span> /{' '}
          <span className="hover:underline cursor-pointer">MCQs</span> /{' '}
          <span className="text-purple-900 font-medium">Translation</span>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {/* Language Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {languages.map((lang) => {
            const isActive = activeTab === lang.toLowerCase();
            return (
              <button
                key={lang}
                onClick={() => setActiveTab(lang.toLowerCase())}
                className={`relative px-6 py-2 text-sm font-medium border border-gray-300 -mr-px ${
                  isActive
                    ? 'bg-[#701a5e] text-white border-[#701a5e] z-10'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lang}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#701a5e]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Read-Only Form Fields */}
        <div className="space-y-4 max-w-5xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title
            </label>
            <input
              type="text"
              readOnly
              value={mcqData.title}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Description
            </label>
            <textarea
              readOnly
              rows={3}
              value={mcqData.description}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-gray-700 focus:outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks
            </label>
            <input
              type="text"
              readOnly
              value={mcqData.marks}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="border border-gray-200 rounded p-2 inline-block bg-white">
              <img
                src={mcqData.image}
                alt="Question Illustration"
                className="max-h-40 object-contain rounded"
              />
            </div>
          </div>

          {/* Options Display Section */}
          <div className="pt-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Options</h3>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-700">
                    <th className="py-2.5 px-4 font-medium w-20 text-center border-r border-gray-200">
                      Correct
                    </th>
                    <th className="py-2.5 px-4 font-medium">Option Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mcqData.options.map((opt) => (
                    <tr key={opt.id}>
                      <td className="py-3 px-4 text-center border-r border-gray-200">
                        <input
                          type="checkbox"
                          disabled
                          checked={opt.isCorrect}
                          className="w-4 h-4 text-[#701a5e] accent-[#701a5e] cursor-not-allowed"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-700">{opt.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6">
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2 border border-gray-800 text-gray-800 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}