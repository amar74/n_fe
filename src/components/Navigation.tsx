import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { 
  TrendingUp, Users, FileText, Package, FileSignature, 
  FolderKanban, DollarSign, ShoppingCart, BarChart3, 
  Bell, ChevronDown, LogOut, User, Settings, Building2 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/useToast';

const menuItems = [
  { icon: TrendingUp, label: 'Opportunities', path: '/module/opportunities' },
  { icon: Users, label: 'Accounts', path: '/module/accounts' },
  { icon: FileText, label: 'Proposals', path: '/module/proposals' },
  { icon: Package, label: 'Resources', path: '/module/resources' },
  { icon: FileSignature, label: 'Contracts', path: '/module/contracts' },
  { icon: FolderKanban, label: 'Projects', path: '/module/projects' },
  { icon: DollarSign, label: 'Finance', path: '/module/finance' },
  { icon: ShoppingCart, label: 'Procurements', path: '/module/procurement' },
  { icon: BarChart3, label: "KPI's", path: '/module/kpis' },
];

// will optimize later - guddy.tech
export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      setIsUserDropdownOpen(false);

      toast.info('Signing out...', {
        description: 'Please wait while we sign you out.',
        duration: 2000,
      });

      const { error } = await signOut();

      if (error) {
        toast.error('Sign Out Failed', {
          description: error.message,
          duration: 4000,
        });
        setIsSigningOut(false);
      } else {
        toast.success('Signed out successfully', {
          description: 'You have been signed out of your account.',
          duration: 3000,
        });
        navigate('/auth/login', { replace: true });
      }
    } catch (err) {
      toast.error('Sign Out Failed', {
        description: 'An unexpected error occurred while signing out.',
        duration: 4000,
      });
      setIsSigningOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (isSigningOut) return 'Signing out...';
    const metadata = user?.user_metadata as Record<string, any> | undefined;
    if (metadata?.name) return metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const shouldExpand = isSidebarCollapsed ? isHovering : true;

  return (
    <div className="h-screen flex bg-white">
      
      <aside 
        className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col flex-shrink-0 transition-all duration-300 shadow-2xl ${
          shouldExpand ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col h-full py-6 gap-12 overflow-hidden" style={{ 
          paddingLeft: shouldExpand ? '20px' : '12px',
          paddingRight: shouldExpand ? '20px' : '12px'
        }}>
            
            <div className="flex flex-col gap-8">
              
              <div className="flex items-center gap-3 overflow-hidden px-1">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1234_1155)">
                      <path d="M7.08764 6.87988H6.05859V7.94044H7.08764V6.87988Z" fill="#FFFFFF"/>
                      <path d="M5.8104 10.9994L1.53752 15.4031C0.24615 12.6261 0.249671 9.36911 1.53752 6.5957L5.8104 10.9994Z" fill="#E0E0E0"/>
                      <path d="M10.4816 6.18488L5.80999 10.9996L1.53711 6.59585C2.00894 5.57703 2.6533 4.62353 3.47284 3.7789C4.29239 2.93427 5.2202 2.26746 6.20876 1.78027L10.4816 6.18397V6.18488Z" fill="#FFFFFF"/>
                      <path d="M10.4816 15.8147L6.20876 20.2184C5.2202 19.7321 4.29239 19.0644 3.47285 18.2206C2.6533 17.376 2.00894 16.4225 1.53711 15.4037L5.80999 11L10.4816 15.8147Z" fill="#FFFFFF"/>
                      <path d="M16.6866 8.7136C15.411 9.61109 14.2324 9.61109 12.6576 8.7136L10 5.89244L14.2729 1.57097C15.2614 2.05721 16.1857 2.7214 17.0053 3.56597C17.8248 4.41055 18.4718 5.3669 18.9445 6.38565L16.6857 8.7136C16.6857 8.7136 17.9622 7.81611 16.6866 8.7136Z" fill="#FFFFFF"/>
                      <path d="M17.1671 13.0755C15.8915 12.1779 14.7129 12.1779 13.138 13.0755L10.4805 15.8144L14.7533 20.2181C15.7419 19.7318 16.6662 19.0677 17.4857 18.2231C18.3053 17.3785 18.9523 16.4222 19.425 15.4034L17.1662 13.0755C17.1662 13.0755 18.4427 13.973 17.1671 13.0755Z" fill="#FFFFFF"/>
                      <path d="M14.7547 1.78062L10.3923 6.28516L6.20898 1.78062C8.90704 0.453337 12.0637 0.453337 14.7547 1.78062Z" fill="#E0E0E0"/>
                      <path d="M14.7547 20.2182C12.0637 21.5454 8.90616 21.5454 6.20898 20.2182L10.4819 15.8145L14.7547 20.2182Z" fill="#E0E0E0"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_1234_1155">
                        <rect width="18.8571" height="20.4286" fill="white" transform="translate(0.570312 0.785156)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                {shouldExpand && (
                  <div className="flex flex-col justify-center whitespace-nowrap">
                    <div className="text-white text-lg font-bold font-poppins tracking-tight">Megapolis</div>
                    <div className="text-slate-400 text-xs font-medium font-poppins tracking-wide">Advisory</div>
                  </div>
                )}
              </div>

              
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  {shouldExpand && (
                    <div className="text-slate-500 text-[11px] font-semibold font-outfit uppercase tracking-wider px-1">Navigation</div>
                  )}
                  <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`relative rounded-xl flex items-center transition-all duration-200 overflow-hidden group ${
                            shouldExpand ? 'px-4 py-3 gap-3' : 'p-3 justify-center'
                          } ${
                            active
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                              : 'hover:bg-slate-800/60 hover:scale-[1.02]'
                          }`}
                          title={!shouldExpand ? item.label : undefined}
                        >
                          
                          {active && shouldExpand && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                          )}
                          
                          <Icon 
                            className={`flex-shrink-0 transition-all duration-200 ${
                              shouldExpand ? 'w-5 h-5' : 'w-6 h-6'
                            } ${
                              active 
                                ? 'text-white' 
                                : 'text-slate-400 group-hover:text-white'
                            }`} 
                            strokeWidth={active ? 2.5 : 2}
                          />
                          {shouldExpand && (
                            <span className={`flex-1 text-sm font-semibold font-outfit leading-tight whitespace-nowrap transition-colors duration-200 ${
                              active 
                                ? 'text-white' 
                                : 'text-slate-300 group-hover:text-white'
                            }`}>
                              {item.label}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={`bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-center items-center hover:bg-red-600/20 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 overflow-hidden group ${
                shouldExpand ? 'px-4 py-3.5 gap-3' : 'p-3.5'
              }`}
              title={!shouldExpand ? 'Log-out' : undefined}
            >
              <LogOut className={`${shouldExpand ? 'w-5 h-5' : 'w-6 h-6'} text-slate-400 group-hover:text-red-400 transition-colors`} strokeWidth={2} />
              {shouldExpand && (
                <span className="text-slate-300 text-sm font-semibold font-outfit leading-tight whitespace-nowrap group-hover:text-red-400 transition-colors">
                  {isSigningOut ? 'Signing out...' : 'Log-out'}
                </span>
              )}
            </button>
          </div>
      </aside>

      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-11 h-11 p-1 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.666 14.25C17.0802 14.25 17.416 14.5858 17.416 15C17.416 15.4142 17.0802 15.75 16.666 15.75H3.33301C2.91894 15.7498 2.58301 15.4141 2.58301 15C2.58301 14.5859 2.91894 14.2502 3.33301 14.25H16.666ZM10 9.25C10.4141 9.25018 10.75 9.5859 10.75 10C10.75 10.4141 10.4141 10.7498 10 10.75H3.33301C2.91894 10.7498 2.58301 10.4141 2.58301 10C2.58301 9.5859 2.91894 9.25018 3.33301 9.25H10ZM16.666 4.25C17.0802 4.25 17.416 4.58579 17.416 5C17.416 5.41421 17.0802 5.75 16.666 5.75H3.33301C2.91894 5.74982 2.58301 5.41411 2.58301 5C2.58301 4.5859 2.91894 4.25018 3.33301 4.25H16.666Z" fill="#667085"/>
              </svg>
            </button>
          </div>

          
          <div className="flex items-center gap-4">
            
            <div className="flex items-start gap-3">
              <button className="relative p-3 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="absolute top-[3px] right-[9px]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="5" fill="#FD853A" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
              </button>
            </div>

            
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-3"
              >
                <Avatar className="w-11 h-11">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <div className="text-[#344054] text-sm font-medium font-outfit leading-tight">
                    {getUserDisplayName()}
                  </div>
                  <div className="pt-0.5 flex items-center">
                    <ChevronDown className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
                  </div>
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                  <div className="py-1">
                    
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500" />
                        Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/profile/settings');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                        Profile Setting
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          navigate('/organization/settings');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Building2 className="h-4 w-4 mr-3 text-gray-500" />
                        Organization Setting
                      </button>
                    </div>
                    
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isUserDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
          )}
        </header>

        
        <main className="flex-1 overflow-auto bg-[#F5F3F2]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
