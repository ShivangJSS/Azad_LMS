export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'bangla', label: 'Bangla' },
    { id: 'tamil', label: 'Tamil' },
  ];

  return (
    <div className="flex items-center gap-1 bg-white p-2 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2 text-sm font-medium transition-colors rounded-t-sm ${
              isActive
                ? 'bg-[#702359] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {/* Downward triangle arrow indicator for active tab */}
            {isActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-[#702359]" />
            )}
          </button>
        );
      })}
    </div>
  );
}