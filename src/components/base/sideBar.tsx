import {
  Plus,
  House,
  Star,
  ExternalLink,
  UsersRound,
  BookOpen,
  ShoppingBag,
  Share,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isHovering: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Sidebar({ 
  isOpen, 
  isHovering, 
  onMouseEnter, 
  onMouseLeave 
}: SidebarProps) {
  const sidebarExpanded = isOpen || isHovering;

  return (
    <aside
      className={`transition-all duration-300 ${
        sidebarExpanded ? "w-72 gap-120" : "w-12 gap-128"
      } bg-white border-r border-gray-200 p-2 flex flex-col`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
        <div className="space-y-1">
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
  );
}