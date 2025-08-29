import {
  Bell, 
  HelpCircle,
  Plus,
  Search,
  AlignJustify,
  Info,
  CircleCheck,
  House,
  Star,
  ExternalLink,
  UsersRound,
  BookOpen,
  ShoppingBag,
  Share,
  ArrowUp,
  Grid2X2,
  Sparkles,
  TableProperties,
  Ellipsis,
  Database,
  Trash2,
  User,
  Users,
  Languages,
  Palette,
  Mail,
  Link as LucideLink,
  Wrench,
  LogOut,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import Link from 'next/link';
export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  // const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const toggleMenu = () => setProfileMenuOpen(!isProfileMenuOpen);

  return(
    <main className='h-screen flex flex-col bg-white'>
      <header className="flex items-center justify-center bg-[#f0f6ff] border-b border-slate-200 px-9 py-3">
        <div className="flex items-center gap-1">
          <Info className="w-4.5 h-4.5 text-[#1b61c9] mr-1" />
          <p className="text-[13px] text-gray-700 underline cursor-pointer">Invite your friends and coworkers</p>
          <p className= "text-[13px] text-gray-700"> to earn account credit.</p>
        </div>
      </header>

      <section className="w-full flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <AlignJustify className="w-4.5 h-4.5 text-gray-400 hover:text-gray-700 cursor-pointer"/>
          <Link href="/home">
            <Image src="/Airtable-Logo.png" alt="Logo" width={110} height={40} />
          </Link>
        </div>

        <div className="relative flex items-center max-w-90 pl-2 pr-28 py-1.5 rounded-3xl border border-slate-200 transition duration-300 ease focus-within:border-slate-400 hover:border-slate-300 shadow-xs focus-within:shadow-sm cursor-pointer">
          <Search className="w-4 h-4 text-gray-800 mr-2 ml-2"/>
          <input
            className="w-full bg-transparent placeholder:text-slate-500 text-slate-700 text-[13px] pr-16 focus:outline-none"
            placeholder="Search..."
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">
            ctrl K
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center px-2.5 py-1 gap-1 text-[13px] text-gray-700 rounded-2xl hover:bg-gray-200 cursor-pointer"
                  title="Help Center">
            <HelpCircle className="w-4 h-4"></HelpCircle>
            <span>Help</span>
          </button>

          <button className="flex items-center justify-center h-7 w-7 rounded-full text-[13px] text-gray-700 border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  title="Notifications"
          >
            <Bell className="w-4 h-4"></Bell>
          </button>

          <div className='relative inline-block'>
            <button onClick={toggleMenu}>
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="User avatar"
                  className="rounded-full mt-2 ml-1 hover:ring-gray-100 hover:border-gray-100 cursor-pointer"
                  width={26}
                  height={26}
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white text-sm font-semibold">
                  {user?.firstName?.[0] ?? "A"}
                </div>
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 z-10 w-75 rounded-lg text-[13px] text-gray-800 bg-white shadow-lg border border-gray-300 ring-opacity-1">
                <div className='px-5 py-4'>
                  <p className='font-medium mb-0.5'>{user?.fullName}</p>
                  <p className=''>{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
  
                <div className='mx-4 border-b border-gray-100'/>
                
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <User className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Account</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-700"/>
                      <span>Manage Groups</span>
                    </div>
                    <span className="text-[11px] text-[#0f68a2] font-medium bg-[#c4ecff] rounded-xl px-2 py-0.5">
                      Business
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-gray-700" />
                      <span>Notification preferences</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-gray-700" />
                      <span>Language preferences</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-gray-700" />
                      <span>Appearance</span>
                      <span className="text-[11px] text-[#c1812d] font-medium bg-[#f9e192] rounded-xl px-2 py-0.5">Beta</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                <div className='mx-4 border-b border-gray-100'/>

                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Mail className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Contact sales</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Star className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Upgrade</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Mail className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Tell a friend</span>
                  </div>
                </div>

                <div className='mx-4 border-b border-gray-100'/>

                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <LucideLink className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Integrations</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Wrench className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Builder hub</span>
                  </div>
                </div>

                <div className='mx-4 border-b border-gray-100'/>

                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5 text-gray-700"/>
                    <span>Trash</span>
                  </div>
                  <SignOutButton redirectUrl="/">
                    <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <LogOut className="w-3.5 h-3.5" />
                      Log out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-12 bg-white border-r border-slate-200"></aside>

        {/* Main content */}
        <div className="flex-1 bg-gray-100 min-h-0 overflow-auto">
          {/* page content goes here */}
        </div>
      </section>
    </main>
  );
}