import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-full border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight">MediCore AI</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2">Hospital Management System</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Active Modules</h2>
          <ul className="space-y-1">
            <NavItem label="Dashboard" active />
            <NavItem label="Staff & Doctors" />
            <NavItem label="Patient Records" />
            <NavItem label="Accounting" />
            <NavItem label="Appointments" />
          </ul>
        </div>
        
        <div>
           <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">System Health</h2>
           <div className="px-2 py-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300">Server Status</span>
                <span className="text-[10px] text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Database</span>
                <span className="text-[10px] text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded">Connected</span>
              </div>
           </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">admin@hospital.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <li className={`flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${active ? 'bg-teal-500/10 text-teal-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${active ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
    {label}
  </li>
);

export default Sidebar;