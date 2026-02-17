import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Scale, Gavel } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
          <Gavel className="w-8 h-8" />
          NyayaFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1">AI Court Scheduler</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/intake" className={navClass}>
          <FileText size={20} />
          Case Intake
        </NavLink>
        <NavLink to="/schedule" className={navClass}>
          <Scale size={20} />
          Daily Schedule
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded p-3">
          <p className="text-xs text-slate-400">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Models Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;