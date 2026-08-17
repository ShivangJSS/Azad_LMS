import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ViewSCQ() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL parameter for fetching SCQ data

  const [activeTab, setActiveTab] = useState('english');
  const languages = ['English', 'Hindi', 'Bangla', 'Tamil'];

  // Sample SCQ data (Replace with API fetch call)
  const scqData = {
    title: 'Which of the following is a common barrier to effective communication?',
    description: '',
    marks: '1.00',
    image: 'https://via.placeholder.com/200x120', // Replace with real image URL
    options: [
      { id: 1, text: 'Noise, language differences, or an unclear message', isCorrect: true },
      { id: 2, text: 'Speaking clearly and listening actively', isCorrect: false },
      { id: 3, text: 'Maintaining eye contact', isCorrect: false },
      { id: 4, text: 'Using simple, polite words', isCorrect: false },
    ],
  };

  return (
    <div className="p-6 bg-[#f4f6f9] min-h-screen text-gray-800">
      {/* Header & Breadcrumb */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">SCQ Translation</h1>
        <div className="text-sm text-gray-500">
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span> /{' '}
          <span className="hover:underline cursor-pointer" onClick={() => navigate('/scqs')}>SCQs</span> /{' '}
          <span className="text-[#701a5e] font-medium">Translation</span>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {/* Language Tabs */}
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

        {/* Form Fields */}
        <div className="space-y-5 max-w-5xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title
            </label>
            <input
              type="text"
              readOnly
              value={scqData.title}
              className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-300 rounded text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Description
            </label>
            <textarea
              readOnly
              rows={3}
              value={scqData.description}
              className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-300 rounded text-sm text-gray-700 focus:outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks
            </label>
            <input
              type="text"
              readOnly
              value={scqData.marks}
              className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-300 rounded text-sm text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="border border-gray-200 rounded p-1 inline-block bg-white">
              <img
                src={scqData.image}
                alt="Question Illustration"
                className="max-h-36 object-contain rounded"
              />
            </div>
          </div>

          {/* Options Display Section */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Options</h3>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-600">
                    <th className="py-2.5 px-4 font-medium w-20 text-center border-r border-gray-200">
                      Correct
                    </th>
                    <th className="py-2.5 px-4 font-medium">Option Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scqData.options.map((opt) => (
                    <tr key={opt.id}>
                      <td className="py-3 px-4 text-center border-r border-gray-200">
                        <input
                          type="radio"
                          disabled
                          checked={opt.isCorrect}
                          className="w-4 h-4 accent-[#701a5e] cursor-not-allowed"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-700">{opt.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <button
              onClick={() => navigate('/scqs')}
              className="px-4 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}