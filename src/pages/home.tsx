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
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import Link from 'next/link';
import { ProfileMenu } from "~/components/profileMenu";
export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [isSideBarOpenHover, setSideBarOpenHover] = useState(false);
  const [isbaseTimeSelection, setBaseTimeSelection] = useState(false);
  const sidebarExpanded = isSideBarOpen || isSideBarOpenHover;

  return(
    <div className='h-screen flex flex-col bg-white'>
      <header className="flex items-center justify-center bg-[#f0f6ff] border-b border-slate-200 px-9 py-3">
        <div className="flex items-center gap-1">
          <Info className="w-4.5 h-4.5 text-[#1b61c9] mr-1" />
          <p className="text-[13px] text-gray-700 underline cursor-pointer">Invite your friends and coworkers</p>
          <p className= "text-[13px] text-gray-700"> to earn account credit.</p>
        </div>
      </header>

      <section className="w-full flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSideBarOpen(prev => !prev)}
            title="Extend sidebar">
            <AlignJustify className="w-4.5 h-4.5 text-gray-400 hover:text-gray-700 cursor-pointer"/>
          </button>
          
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
          <ProfileMenu/>
        </div>
      </section>

      <section className="flex-1 flex min-h-0">
        <aside
          className={`transition-all duration-300 ${
            sidebarExpanded ? "w-72 gap-120" : "w-12 gap-128"
          } bg-white border-r border-gray-200 p-2 flex flex-col`}
          onMouseEnter={() => setSideBarOpenHover(true)}
          onMouseLeave={() => setSideBarOpenHover(false)}
        >
          <div className="flex flex-col text-gray-700 text-[15.5px]">
            <div className="flex items-center gap-3 px-1.5 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer w-full">
              <House className="w-4.5 h-4.5 flex-shrink-0" />
              {sidebarExpanded && <span className="font-semibold truncate">Home</span>}
            </div>

            <div className="flex items-center gap-2 px-1.5 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer w-full">
              <Star className="w-4.5 h-4.5 flex-shrink-0" />
              {sidebarExpanded && <span className="font-semibold truncate">Starred</span>}
            </div>

            <div className="flex items-center gap-2 px-1.5 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer w-full">
              <ExternalLink className="w-4.5 h-4.5 flex-shrink-0" />
              {sidebarExpanded && <span className="font-semibold truncate">Shared</span>}
            </div>

            <div className="flex items-center gap-2 px-1.5 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer w-full">
              <UsersRound className="w-4.5 h-4.5 flex-shrink-0" />
              {sidebarExpanded && <span className="font-semibold truncate">Workspaces</span>}
            </div>
            <div className={`${!sidebarExpanded && "mx-1 mt-2 border-b border-gray-200"} `}/>
          </div>
        
          <div className="flex flex-col text-gray-700 text-[13px]">
            <div className={`mt-3 mb-3 ${sidebarExpanded ? "mx-4" : "mx-0"} border-b border-gray-200`}/>
            <div className=" space-y-1">
              <div className="flex items-center gap-3 px-1.5 py-2 rounded-md hover:bg-gray-100 cursor-pointer w-full">
                <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${sidebarExpanded ? "text-gray-800" : "text-gray-400"}`}/>
                {sidebarExpanded && <span className="font-normal truncate">Templates and apps</span>}
              </div>

              <div className="flex items-center gap-3 px-1.5 py-2 rounded-md hover:bg-gray-100 cursor-pointer w-full">
                <ShoppingBag className={`w-3.5 h-3.5 flex-shrink-0 ${sidebarExpanded ? "text-gray-800" : "text-gray-400"}`}/>
                {sidebarExpanded && <span className="font-normal truncate">Marketplace</span>}
              </div>
              
              <div className="flex items-center gap-3 px-1.5 py-2 rounded-md hover:bg-gray-100 cursor-pointer w-full">
                <Share className={`w-3.5 h-3.5 flex-shrink-0 ${sidebarExpanded ? "text-gray-800" : "text-gray-400"}`}/>
                {sidebarExpanded && <span className="font-normal truncate">Import</span>}
              </div>
              
              <button className={`flex items-center justify-center gap-3 px-1.5 py-2 w-full rounded-md cursor-pointer transition-colors ${sidebarExpanded ? "bg-[#1b61c9] text-[#f0f6ff]" : "bg-white hover:bg-gray-100"}`}>
                <Plus className={`w-3.5 h-3.5 flex-shrink-0 ${sidebarExpanded ? "text-white" : "text-gray-400"}`}/>
                {sidebarExpanded && <span className="font-normal truncate">Create</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-[#f9fafb] min-h-0 overflow-auto">
          <div className="flex items-center justify-center bg-[#e6fce8] text-[13px] py-2.5 gap-2">
            <CircleCheck className="w-[18px] h-[18px] text-[#048a0e]" />
            <div className="flex items-center justify-center gap-1">
              <p className="font-medium">Welcome to the improved Home.</p>
              <p className= "text-gray-700"> Find, navigate to, and manage your apps more easily.</p>
            </div>
            <button className="border border-gray-300 bg-white px-2.5 py-1.5 rounded-lg shadow-xs hover:shadow-sm cursor-pointer">
              <span>See what&apos;s new</span>
            </button>
          </div>
          
          <div className="flex flex-col px-11 py-7">
            <h1 className="text-gray-800 text-[27px] font-bold">Home</h1>
            <div className="flex items-center justify-between space-x-2 mt-7">
              <button className="flex flex-col h-19 w-105 bg-white border px-4 py-3 gap-1.5 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#dc64c1]" />
                  <p className="font-medium">Start with Omni</p>
                </div>
                <p className="text-left font-normal text-gray-500 text-[12.5px] mb-2">Use AI to build a custom app tailored to your workflow</p>
              </button>

              <button className="flex flex-col h-19 w-110 bg-white border px-4 py-3 gap-1.5 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Grid2X2 className="w-4 h-4 text-[#6a5292]"/>
                  <p className="font-medium">Start with templates</p>
                </div>
                <p className="text-left font-normal text-gray-500 text-[12.5px] mb-2">Select a template to get started and customize as you go.</p>
              </button>

              <button className="flex flex-col h-19 w-110 bg-white border px-4 py-3 gap-1.5 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="w-4 h-4 text-[#1f8881]"/>
                  <p className="font-medium">Quickly upload</p>
                </div>
                <p className="text-left font-normal text-gray-500 text-[12.5px] mb-2">Easily migrate existing projects in just a few minutes.</p>
              </button>

              <button className="flex flex-col h-19 w-110 bg-white border px-4 py-3 gap-1.5 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <TableProperties className="w-4 h-4 text-[#3b66a3]" />
                  <p className="font-medium">Build an app on your own</p>
                </div>
                <p className="text-left font-normal text-gray-500 text-[12.5px] mb-2">Start with a blank app and build your ideal workflow.</p>
              </button>
            </div>
                      
            <div className="flex flex-col mt-7">
              <div className="flex justify-between">
                <div className="relative space-y-2">
                  <button
                    onClick={() => setBaseTimeSelection(!isbaseTimeSelection)}
                    className="flex items-center text-[15px] text-gray-500 hover:text-black gap-1">
                    <span>Opened anytime</span>
                    <ChevronDown className="w-3.5 h=3.5"></ChevronDown>
                  </button>
                  {isbaseTimeSelection && (
                    <div className="absolute z-10 w-60 rounded-lg text-[13px] text-gray-800 bg-white shadow-lg border border-gray-300 ring-opacity-1">
                        <div className="flex flex-col text-left p-2 gap-0.5">
                          <span className="p-2 rounded-md hover:bg-gray-100">Today</span>
                          <span className="p-2 rounded-md hover:bg-gray-100">In past 7 days</span>
                          <span className="p-2 rounded-md hover:bg-gray-100">In past 30 days</span>
                          <span className="p-2 rounded-md hover:bg-gray-100">Anytime</span>
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-1 rounded-full" title="View items in list">
                    <AlignJustify className="w-4.5 h-4.5 text-gray-500 hover:text-gray-600 cursor-pointer" />
                  </button>
                  <button className="px-1 py-1 rounded-full bg-gray-200" title="View items in grid">
                    <Grid2X2 className="w-4.5 h-4.5 text-gray-600" />
                  </button>
                </div>
              </div>

            <button className="flex items-center justify-center h-15 w-60 bg-white border px-4 py-3 mt-7 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
              <p className="font-normal">Base placeholder</p>
            </button>

            </div>
          </div>
        </main>
      </section>
    </div>
  );
}