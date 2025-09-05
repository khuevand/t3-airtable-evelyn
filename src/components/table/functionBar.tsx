import {
  EyeOff,
  ListFilter,
  ArrowUpDown,
  X,
  Search,
  Menu,
  Grid3X3,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  PaintBucket,
  SquareArrowOutUpRight,
  Logs,
  Plus,
} from "lucide-react";

export default function FunctionBar(){
  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2.5">
      <div className="flex items-center gap-2 ml-3">
        <div className="px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <Menu className="w-3.5 h-3.5 text-gray-500 "/>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <Grid3X3 className="w-3.5 h-3.5 text-blue-500"/>
          <span className="text-[12.5px] font-semibold">Grid View</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500"/>
        </div>
      </div>

      <div className="flex items-center gap-2 mr-3">
        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <EyeOff className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Hide fields</span>
        </button>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <Logs className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Filter</span>
        </button>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <ListFilter className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Group</span>
        </button>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <ArrowUpDown className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Sort</span>
        </button>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <PaintBucket className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Color</span>
        </button>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <SquareArrowOutUpRight className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Share and sync</span>
        </button>

        <button className="flex items-center text-gray-600 px-1.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
          <Search className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  )
}