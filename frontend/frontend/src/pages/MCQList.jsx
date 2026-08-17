import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Added useNavigate import
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';

const mcqData = [
  {
    id: 1,
    title: 'Which of the following are examples of communication mediums?',
    description: 'Which of the following are examples of communication mediums?',
    image: 'https://lms.azadfoundation.com/question-images/1709794101_medium.jpg',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
  {
    id: 2,
    title: 'What should you check before starting a car for the Permanent Licence (PL) test?',
    description: 'What should you check before starting a car for the Permanent Licence (PL) test?',
    image: 'https://lms.azadfoundation.com/question-images/1709794121_car.jpg',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Which of the following documents should a driver carry while driving?',
    description: 'Which of the following documents should a driver carry while driving?',
    image: 'https://lms.azadfoundation.com/question-images/1709794141_car.jpg',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
];

export default function MCQList() {
  const navigate = useNavigate(); // 2. Initialized navigate function
  const [activeTab, setActiveTab] = useState('english');
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Assessments', path: '#' },
    { label: 'MCQ' },
  ];

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <PageHeader title="MCQ List" breadcrumbs={breadcrumbs} />

      <div className="bg-white rounded border border-gray-200 mb-6 p-4">
        {/* Custom Tab component */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6">
          {/* Search Row */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              placeholder="Search By Question Title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#702359]"
            />
            <button className="bg-[#702359] hover:bg-[#5c1c49] text-white px-7 py-2 rounded text-sm font-medium transition-colors">
              Search
            </button>
            <button className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 px-7 py-2 rounded text-sm font-medium transition-colors">
              Reset
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-gray-800 text-sm">
              Total MCQ (s): <span className="text-[#702359]">{mcqData.length}</span>
            </div>
            <button className="bg-white border border-gray-400 text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium transition-colors">
              + Add MCQ
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#702359] text-white text-xs font-semibold">
                  <th className="py-2.5 px-3 border border-gray-300 text-center w-12">S. No.</th>
                  <th className="py-2.5 px-3 border border-gray-300 w-1/3">Question Title</th>
                  <th className="py-2.5 px-3 border border-gray-300 w-1/3">Description</th>
                  <th className="py-2.5 px-3 border border-gray-300 text-center">Image</th>
                  <th className="py-2.5 px-3 border border-gray-300 text-center">Marks</th>
                  <th className="py-2.5 px-3 border border-gray-300 text-center">Language</th>
                  <th className="py-2.5 px-3 border border-gray-300 text-center">Status</th>
                  <th className="py-2.5 px-3 border border-gray-300 text-center w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {mcqData.map((item, index) => (
                  <tr key={item.id} className="text-xs text-gray-600 hover:bg-gray-50">
                    <td className="py-3 px-3 text-center border border-gray-200">{index + 1}</td>
                    <td className="py-3 px-3 border border-gray-200">{item.title}</td>
                    <td className="py-3 px-3 border border-gray-200">{item.description}</td>
                    <td className="py-3 px-3 text-center border border-gray-200">
                      <img
                        src={item.image}
                        alt="Question"
                        className="w-12 h-10 object-cover rounded border border-gray-200 mx-auto"
                      />
                    </td>
                    <td className="py-3 px-3 text-center border border-gray-200">{item.marks}</td>
                    <td className="py-3 px-3 text-center border border-gray-200">{item.language}</td>
                    <td className="py-3 px-3 text-center border border-gray-200">{item.status}</td>

                    {/* Action Column */}
                    <td className="py-3 px-2 border border-gray-200">
                      <div className="flex flex-col gap-1 w-24 mx-auto">
                        <div className="flex gap-1">
                          {/* 3. Updated View Button */}
                          <button 
                            onClick={() => navigate(`/mcqs/view/${item.id}`)}
                            className="flex-1 py-1 px-1.5 border border-[#702359] text-[#702359] hover:bg-purple-50 text-[11px] font-semibold rounded"
                          >
                            View
                          </button>

                          {/* 4. Updated Edit Button */}
                          <button 
                            onClick={() => navigate(`/mcqs/edit/${item.id}`)}
                            className="flex-1 py-1 px-1.5 bg-[#702359] text-white hover:bg-[#5c1c49] text-[11px] font-semibold rounded"
                          >
                            Edit
                          </button>
                        </div>
                        <button className="w-full py-1 px-1.5 bg-[#d9534f] hover:bg-red-700 text-white text-[11px] font-semibold rounded">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Footer Controls */}
          <div className="flex justify-between items-center mt-4">
            <button className="flex items-center gap-1 bg-white border border-[#702359] text-[#702359] hover:bg-purple-50 px-3 py-1.5 rounded text-xs font-semibold">
              <Download className="w-3.5 h-3.5" /> Export
            </button>

            <div className="flex items-center border border-gray-300 rounded overflow-hidden text-xs text-gray-600">
              <button className="px-2 py-1.5 hover:bg-gray-100 border-r border-gray-300">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="px-3 py-1.5 bg-[#702359] text-white font-semibold">1</button>
              <button className="px-3 py-1.5 hover:bg-gray-100 border-l border-gray-300">2</button>
              <button className="px-2 py-1.5 hover:bg-gray-100 border-l border-gray-300">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}