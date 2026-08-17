import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const initialMatchMakingData = [
  {
    id: 1,
    title: 'Match the communication process components',
    description: '',
    image: 'https://placehold.co/60x40',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Match the driving action with its purpose',
    description: '',
    image: 'https://placehold.co/60x40',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Match the defensive driving principle with its meaning',
    description: '',
    image: 'https://placehold.co/60x40',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
  {
    id: 4,
    title: 'Match the situation with the meaning it represents',
    description: 'Match the situation with the meaning it represents',
    image: 'https://placehold.co/60x40',
    marks: '1.00',
    language: 'English',
    status: 'Active',
  },
];

export default function MatchMakingList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('english');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchData, setMatchData] = useState(initialMatchMakingData);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Match Making Questions', path: '#' },
    { label: 'List' },
  ];

  const languages = ['English', 'Hindi', 'Bangla', 'Tamil'];

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setMatchData(matchData.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Match Making Question List" breadcrumbs={breadcrumbs} />

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

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search By Question Title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#701a5e]"
          />
          <button className="bg-[#701a5e] hover:bg-[#5b144d] text-white px-8 py-2 rounded text-sm font-medium transition-colors">
            Search
          </button>
          <button
            onClick={() => setSearchQuery('')}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Counter and Header Action */}
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-gray-800 text-sm">
            Total Match Making (s): <span className="text-[#701a5e]">{matchData.length}</span>
          </div>
          <button
            onClick={() => navigate('/match-making/add')}
            className="bg-white border border-gray-800 hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
          >
            +Add Match Making
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded border border-gray-300">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#701a5e] text-white">
                <th className="py-3 px-3 text-center font-semibold border-r border-purple-900/30 w-14">S. No.</th>
                <th className="py-3 px-4 font-semibold border-r border-purple-900/30">Question Title</th>
                <th className="py-3 px-4 font-semibold border-r border-purple-900/30">Question Description</th>
                <th className="py-3 px-3 text-center font-semibold border-r border-purple-900/30 w-24">Images</th>
                <th className="py-3 px-3 text-center font-semibold border-r border-purple-900/30 w-20">Marks</th>
                <th className="py-3 px-3 text-center font-semibold border-r border-purple-900/30 w-24">Language</th>
                <th className="py-3 px-3 text-center font-semibold border-r border-purple-900/30 w-20">Status</th>
                <th className="py-3 px-4 text-center font-semibold w-[340px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matchData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-3 text-center border-r border-gray-200 text-gray-700">{index + 1}</td>
                  <td className="py-3 px-4 border-r border-gray-200 text-gray-700">{item.title}</td>
                  <td className="py-3 px-4 border-r border-gray-200 text-gray-500">{item.description}</td>
                  <td className="py-3 px-3 text-center border-r border-gray-200">
                    <img
                      src={item.image}
                      alt="Question Thumbnail"
                      className="w-12 h-10 object-cover rounded mx-auto border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3 text-center border-r border-gray-200 text-gray-600">{item.marks}</td>
                  <td className="py-3 px-3 text-center border-r border-gray-200 text-gray-600">{item.language}</td>
                  <td className="py-3 px-3 text-center border-r border-gray-200 text-gray-600">{item.status}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col gap-1.5 items-center justify-center">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/match-making/view/${item.id}`)}
                          className="px-2.5 py-1 border border-[#701a5e] text-[#701a5e] hover:bg-purple-50 rounded text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/match-making/edit/${item.id}`)}
                          className="px-2.5 py-1 bg-[#701a5e] text-white hover:bg-[#5b144d] rounded text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/match-making/left-items/${item.id}`)}
                          className="px-2.5 py-1 border border-gray-400 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition-colors"
                        >
                          Left Items
                        </button>
                        <button
                          onClick={() => navigate(`/match-making/right-items/${item.id}`)}
                          className="px-2.5 py-1 border border-gray-400 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition-colors"
                        >
                          Right Items
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/match-making/correct-answers/${item.id}`)}
                          className="px-2.5 py-1 border border-[#701a5e] text-[#701a5e] hover:bg-purple-50 rounded text-xs font-medium transition-colors"
                        >
                          Correct Answers
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 bg-[#e55353] text-white hover:bg-red-600 rounded text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}