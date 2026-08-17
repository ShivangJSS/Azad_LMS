import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function ViewDropBucket() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Drop Buckets', path: '/drop-buckets' },
    { label: 'Translation' },
  ];

  const languages = ['English', 'Hindi', 'Bangla', 'Tamil'];

  const questionData = {
    title: 'Put the following under Verbal and Non-Verbal Communication',
    description: '',
    marks: '1.00',
    image: 'https://via.placeholder.com/300x100',
    buckets: [
      { id: 1, name: 'Verbal Communication', image: 'https://via.placeholder.com/50', status: 'Active' },
      { id: 2, name: 'Non-Verbal Communication', image: 'https://via.placeholder.com/50', status: 'Active' },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Drop Bucket Translation" breadcrumbs={breadcrumbs} />

      {/* Language Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white pt-2 px-2 rounded-t-md">
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

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <div className="w-full px-3 py-2 bg-[#f0f4f9] border border-gray-300 rounded text-sm text-gray-800">
            {questionData.title}
          </div>
        </div>

        {/* Question Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Description
          </label>
          <div className="w-full min-h-[80px] p-3 bg-[#f0f4f9] border border-gray-300 rounded text-sm text-gray-800">
            {questionData.description || '\u00A0'}
          </div>
        </div>

        {/* Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marks
          </label>
          <div className="w-full px-3 py-2 bg-[#f0f4f9] border border-gray-300 rounded text-sm text-gray-800">
            {questionData.marks}
          </div>
        </div>

        {/* Question Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          <div className="inline-block border border-gray-200 rounded p-1 bg-white">
            <img
              src={questionData.image}
              alt="Question"
              className="h-20 object-contain rounded"
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Drop Buckets Section */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Drop Buckets
          </h3>

          <div className="space-y-4">
            {questionData.buckets.map((bucket, index) => (
              <div
                key={bucket.id}
                className="p-4 border border-gray-200 rounded-md bg-white flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="text-sm font-medium text-gray-500 w-8">
                  #{index + 1}
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bucket Name
                  </label>
                  <div className="w-full px-3 py-2 bg-[#f0f4f9] border border-gray-300 rounded text-sm text-gray-800">
                    {bucket.name}
                  </div>
                </div>

                <div className="w-auto">
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-center">
                    Image
                  </label>
                  <div className="p-1 border border-gray-200 rounded">
                    <img
                      src={bucket.image}
                      alt={bucket.name}
                      className="w-12 h-12 object-contain rounded mx-auto"
                    />
                  </div>
                </div>

                <div className="w-24 text-center">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className="inline-block px-3 py-1 bg-[#10b981] text-white text-xs font-medium rounded-full">
                    {bucket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/drop-buckets')}
            className="bg-white border border-gray-400 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded text-sm font-medium transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}