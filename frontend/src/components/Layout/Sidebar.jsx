import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Building2,
  BedDouble,
  CreditCard,
  UtensilsCrossed,
  LifeBuoy,
  ClipboardCheck,
  UserCheck,
  Bell,
  FileBarChart,
  Settings,
  User,
  KeyRound,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/students', label: 'Students', icon: Users },
          { to: '/admin/wardens', label: 'Wardens', icon: ShieldCheck },
          { to: '/admin/security', label: 'Security Staff', icon: ShieldAlert },
          { to: '/admin/rooms', label: 'Hostels & Rooms', icon: Building2 },
          { to: '/admin/allocations', label: 'Room Allocation', icon: BedDouble },
          { to: '/admin/fees', label: 'Fees & Payments', icon: CreditCard },
          { to: '/admin/food-menu', label: 'Food Menu', icon: UtensilsCrossed },
          { to: '/admin/complaints', label: 'Complaints', icon: LifeBuoy },
          { to: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
          { to: '/admin/visitors', label: 'Visitors', icon: UserCheck },
          { to: '/admin/notices', label: 'Notices', icon: Bell },
          { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
          { to: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      case 'WARDEN':
        return [
          { to: '/warden', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/warden/students', label: 'Students', icon: Users },
          { to: '/warden/allocations', label: 'Room Allocation', icon: BedDouble },
          { to: '/warden/attendance', label: 'Attendance', icon: ClipboardCheck },
          { to: '/warden/visitors', label: 'Visitors', icon: UserCheck },
          { to: '/warden/complaints', label: 'Complaints', icon: LifeBuoy },
          { to: '/warden/food-menu', label: 'Food Menu', icon: UtensilsCrossed },
          { to: '/warden/notices', label: 'Notices', icon: Bell },
          { to: '/warden/profile', label: 'Profile', icon: User },
        ];
      case 'STUDENT':
        return [
          { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/profile', label: 'My Profile', icon: User },
          { to: '/student/room', label: 'My Room', icon: BedDouble },
          { to: '/student/food-menu', label: 'Food Menu', icon: UtensilsCrossed },
          { to: '/student/complaints', label: 'My Complaints', icon: LifeBuoy },
          { to: '/student/fees', label: 'Fee Details', icon: CreditCard },
          { to: '/student/notices', label: 'Notices', icon: Bell },
        ];
      case 'SECURITY':
        return [
          { to: '/security', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/security/register', label: 'Register Visitor', icon: UserCheck },
          { to: '/security/visitors', label: 'Visitor Entry/Exit', icon: ShieldCheck },
          { to: '/security/history', label: 'Visitor History', icon: ClipboardCheck },
          { to: '/security/profile', label: 'Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">HostelMS</h1>
              <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Campus Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">Signed in as</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {role}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin' || item.to === '/warden' || item.to === '/student' || item.to === '/security'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center space-x-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-200">
              {user?.first_name ? user.first_name[0] : user?.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email || `@${user?.username}`}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
