import { useState } from 'react';
import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
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

export const ProfileMenu = () => {
  const { user } = useUser();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const toggleMenu = () => setProfileMenuOpen(!isProfileMenuOpen);

  return (
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
  );
};