import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function ViewMatchMaking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Match Making', path: '/match-making' },
    { label: 'Translation' },
  ];

  const languages = ['English', 'Hindi', 'Bangla', 'Tamil'];

  return (
    <div className="p-6 bg-[#f1f4f9] min-h-screen">
      <PageHeader title="Match Making Translation" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
        {/* Language Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 pb-2">
          {languages.map((lang) => {
            const isActive = activeTab === lang.toLowerCase();
            return (
              <button
                key={lang}
                onClick={() => setActiveTab(lang.toLowerCase())}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#701a5e] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* View Fields */}
        <div className="space-y-5 max-w-5xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Question Title
            </label>
            <div className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-200 rounded text-sm text-gray-800">
              Match the communication process components
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Question Description
            </label>
            <div className="w-full h-20 px-3 py-2 bg-[#edf2f7] border border-gray-200 rounded text-sm text-gray-800"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Marks
            </label>
            <div className="w-full px-3 py-2 bg-[#edf2f7] border border-gray-200 rounded text-sm text-gray-800">
              1.00
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image
            </label>
            <div className="w-28 h-28 border border-gray-300 rounded overflow-hidden bg-gray-50 p-1">
              <img
                src="https://placehold.co/100x100"
                alt="Question Preview"
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/match-making')}
            className="px-4 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}