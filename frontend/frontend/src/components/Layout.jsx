import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, BookOpen, Layers, Users, Folder, Award, User, FileText, CheckSquare, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', path: '#' },
  { name: 'Courses', path: '#' },
  { name: 'Modules Management', path: '#' },
  { name: 'Centres', path: '#' },
  { name: 'Batch', path: '#' },
  { name: 'Master', path: '#' },
  { name: 'User Management', path: '#' },
  { name: 'Document Management', path: '#' },
  {
    name: 'Assessment',
    dropdown: true,
    items: [
      { name: 'MCQ Masters', path: '/mcq' },
      { name: 'SCQ Masters', path: '/scq' },
      { name: 'Drop Bucket Masters', path: '/drop-bucket' },
      { name: 'Match Making Masters', path: '/match-making' },
    ],
  },
];

export default function Layout() {
  const [assessmentOpen, setAssessmentOpen] = useState(true);
  const location = useLocation();

  const isAssessmentActive = location.pathname.includes('/mcq') || location.pathname.includes('/scq') || location.pathname.includes('/drop-bucket') || location.pathname.includes('/match-making');

  return (
    <div className="min-h-screen bg-[#edf2f9] flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-t-[3px] border-primary shadow-sm sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[60px]">
            <div className="flex items-center gap-4">
              <button className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-10 w-auto"
                  src="https://lms.azadfoundation.com/logo/azad-foundation-logo.png"
                  alt="Azad Foundation"
                />
              </div>
              <div className="hidden lg:block ml-4">
                <h1 className="text-xl font-bold text-[#2d3748]">LMS Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-gray-700">Super Admin</div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
              <div className="relative">
                <button className="flex items-center gap-2 focus:outline-none group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                    <img src="https://lms.azadfoundation.com/logo/avatar.png" alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="bg-primary hidden lg:block">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <ul className="flex">
              {navItems.map((item) => (
                <li key={item.name} className="relative group">
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => setAssessmentOpen(!assessmentOpen)}
                        className={`flex items-center gap-1 px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                          isAssessmentActive ? 'bg-primary-dark text-white' : 'text-white hover:bg-primary-dark'
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </button>
                      
                      <div className="absolute left-0 mt-0 w-[220px] rounded-b-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top translate-y-1 group-hover:translate-y-0">
                        <div className="py-2">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className={`block px-5 py-2.5 text-sm transition-colors ${
                                location.pathname === subItem.path
                                  ? 'bg-primary/5 text-primary font-bold'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={item.path}
                      className="flex items-center gap-1 px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark transition-colors"
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
