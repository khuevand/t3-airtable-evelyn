import {
  Bell, 
  HelpCircle,
  Search,
  AlignJustify,
  Info,
  CircleCheck,
  ArrowUp,
  Grid2X2,
  Sparkles,
  TableProperties,
  Database,
  Star,
  Ellipsis,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import { ProfileMenu } from "~/components/base/profileMenu";
import { Sidebar } from "~/components/base/sideBar";
import LoadingState from "~/components/loadingState";
import stringToColor from "~/components/base/encodeBaseColor";
import { BaseDropdown } from "~/components/base/baseCardDropDown";
import { formatDistanceToNowStrict  } from 'date-fns';
import { api } from "~/utils/api";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isSideBarOpen, setSideBarOpen] = useState(false);
  const [isSideBarOpenHover, setSideBarOpenHover] = useState(false);
  const [isbaseTimeSelection, setBaseTimeSelection] = useState(false);
  const [isBaseDropDownMenu, setBaseDropDownMenu] = useState(false);
  const [confirmActiveBaseId, setActiveBaseId] = useState<string | null>(null);
  const [confirmDeleteBaseId, setDeleteBaseId] = useState<string | null>(null);

  const utils = api.useUtils();
  const router = useRouter();

  const {data: bases = [],
         isLoading: isBaseLoading,
  } = api.base.getBaseByUserId.useQuery(undefined, {enabled: isLoaded && !!user?.id})

  const createBase = api.base.createBase.useMutation({
    onMutate: async() => {
      await utils.base.getBaseByUserId.cancel();
      const prevBase = utils.base.getBaseByUserId.getData();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const optimisticBase = {
        id: uuidv4(),
        name: "Untitled Base",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id,
      }

      utils.base.getBaseByUserId.setData(undefined, (old) => {
        if (!old) return [optimisticBase];
        return [optimisticBase, ...old];
      });
      return {prevBase, optimisticBase};
    },

    onError: (_error, _variables, ctx) => {
      if (ctx?.prevBase){
        utils.base.getBaseByUserId.setData(undefined, ctx.prevBase);
      }
      void router.push("/");
      toast.error("Failed to create base. Please try again");
    },

    onSuccess: (data, _variables, ctx) => {
      // if the old array of base is empty, return empty lip & append the new base
      utils.base.getBaseByUserId.setData(undefined, (old) => {
        if (!old) return [];

        return old.map((base) => {
          if(ctx?.optimisticBase && base.id === ctx.optimisticBase.id){
            return{
              id: data.base.id,
              name: "Untitled Base",
              userId: user?.id ?? "",
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          return base;
        })
      });
      if (ctx.optimisticBase.id !== data.base.id){
      }
      toast.success("Create base successfully!");
    },

    onSettled: () => {
      void utils.base.getBaseByUserId.invalidate();
    }
  })

  const deleteBase = api.base.deleteBase.useMutation({
    onMutate: async({baseId}) => {
      await utils.base.getBaseByUserId.cancel();
      const prevBase = utils.base.getBaseByUserId.getData();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      utils.base.getBaseByUserId.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((oldBase) => oldBase.id != baseId);
      })
      setDeleteBaseId(null);

      return {prevBase};
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prevBase) {
        utils.base.getBaseByUserId.setData(undefined, ctx.prevBase);
      }
      toast.error("Something went wrong while deleting.");
    },

    onSuccess: () => {
      toast.success("Base moved to trash.");
    },

    onSettled: async () => {
      await utils.base.getBaseByUserId.invalidate();
    },
  })

  const renameBase = api.base.renameBase.useMutation({
    onMutate: async({baseId, baseName}) => {
      await utils.base.getBaseByUserId.cancel();
      const prevBase = utils.base.getBaseByUserId.getData()
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      utils.base.getBaseByUserId.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((b) => {
          if (b.id === baseId) {
            return { ...b, name: baseName };
          }
          return b;
        });
      });
      return {prevBase};
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prevBase) {
        utils.base.getBaseByUserId.setData(undefined, ctx.prevBase);
      }
      toast.error("Error in renaming");
    },

    onSuccess: () => {
      toast.success("Rename succeed!");
    },

    onSettled: async () => {
      await utils.base.getBaseByUserId.invalidate();
    },
  })

  const handleCreateBase = () => {
    createBase.mutate({name: "Untitled Base"});
  }

  const handleDeleteBase = (baseId: string) => {
    setDeleteBaseId(baseId);
    deleteBase.mutate({ baseId });
  };

  const handleRenameBase = (baseId: string, baseName: string) => {
    renameBase.mutate({baseId, baseName});
  }

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

        <div className="relative flex items-center max-w-90 pl-2 pr-28 py-1.5 rounded-3xl border border-slate-200 transition duration-100 ease focus-within:border-slate-400 hover:border-slate-300 shadow-xs focus-within:shadow-sm cursor-pointer">
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
        <Sidebar
          isOpen={isSideBarOpen}
          isHovering={isSideBarOpenHover}
          onMouseEnter={() => setSideBarOpenHover(true)}
          onMouseLeave={() => setSideBarOpenHover(false)}
        />

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

              <button onClick={() => handleCreateBase()}
                      className="flex flex-col h-19 w-110 bg-white border px-4 py-3 gap-1.5 text-[15.5px] border-gray-300 shadow-xs rounded-lg hover:shadow-lg cursor-pointer">
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


              {!isLoaded || isBaseLoading ? (
                <div className="flex flex-1 items-center justify-center min-h-[400px]">
                  <LoadingState text="Loading your base"/>
                </div>
              ) : (
                bases.length === 0 ? (
                  <div className="flex flex-1 items-center jusitfy-center text-[13px] min-h-[400px]">
                    <div className="mt-42 flex flex-col w-full items-center gap-1.5">
                      <h2 className="text-[21px] text-gray-900 font-normal">You haven&apos;t opened anything recently</h2>
                      <p className=" text-gray-600">Apps that you have recently opened will appear here.</p>
                      <button className="mt-4 px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg hover:shadow-lg cursor-pointer">
                        Go to all workspaces
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 ">
                    {bases.map((base) => (
                      <button
                        key={base.id}
                        className="relative flex flex-row items-center mt-5 w-85 h-24 bg-white border p-3 gap-5 text-[15.5px] border-gray-300 box-shadow shadow-xs rounded-md hover:shadow-lg cursor-pointer"
                        onClick={() => router.push(`/${base.id}`)}
                        onMouseEnter={() => {setActiveBaseId(base.id);
                                            if (confirmActiveBaseId !== base.id) {
                                              setBaseDropDownMenu(false);
                                            }
                        }}
                        onMouseLeave={() => setActiveBaseId(null)}
                      >
                        <div className="flex items-center justify-center w-14 h-14 ml-2 rounded-xl text-[20px] text-white font-bold"
                              style={{ backgroundColor: stringToColor(base.id) }}> 
                          {base.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-gray-600 text-left gap-1">
                          <p className="text-[12.5px] font-semibold">{base.name}</p>
                          {confirmActiveBaseId === base.id ? (
                            <div className="flex items-center text-[11px] gap-1.5">
                              <Database className="w-3 h-3 " />
                              <span>Database</span>
                            </div>
                          ) : (
                            <div className="text-[11px]">
                              {new Date(base.updatedAt).getTime() > Date.now() - 60000
                                ? 'Opened just now' 
                                : `Opened ${formatDistanceToNowStrict(new Date(base.updatedAt))} ago`
                              }
                            </div>  
                          )}
                        </div>
                        {confirmActiveBaseId === base.id && (
                          <div className="absolute top-4.5 right-3 flex items-center text-gray-700 space-x-1">
                            <div className="p-1.5 border border-gray-300 rounded-lg bg-white">
                              <Star className="w-3.5 h-3.5 text-gray-700 font-light"/>
                            </div>
                            <div className="relative">
                              <button className="p-1.5 rounded-lg border border-gray-300 bg-white cursor-pointer"
                                      onClick={(e) => {e.stopPropagation();
                                                    setBaseDropDownMenu(!isBaseDropDownMenu)}}>
                                <Ellipsis className="w-3.5 h-3.5 text-gray-700 font-light"/>
                              </button>
                              {isBaseDropDownMenu && (
                                <BaseDropdown
                                  baseId={base.id}
                                  onDelete={handleDeleteBase}
                                  onRename={handleRenameBase}
                                  onClose={() => setBaseDropDownMenu(false)}
                                />
                              )}
                            </div>
    
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}

            </div>
          </div>
        </main>
      </section>
    </div>
  );
}