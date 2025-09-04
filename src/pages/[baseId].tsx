import {
  ChevronDown,
  HelpCircle,
  Bell,
  ArrowLeft,
  History,
  Dock,
  Plus,
  Search,
  Grid2X2
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { api } from "~/utils/api";
import { ProfileMenu } from "~/components/base/profileMenu";
import stringToColor from "~/components/base/encodeBaseColor";
import LoadingState from "~/components/loadingState";
export default function BasePage(){
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { baseId } = router.query;
  const baseIdString = Array.isArray(baseId) ? baseId[0] : baseId;
  const [isHomeIconHover, setHomeIconHover] = useState(false);

  const {data: baseData,
        isLoading: isBaseLoading,
  } = api.base.getBaseById.useQuery({baseId: baseIdString as string}, {enabled: !!baseId})

  if (!baseIdString){
    return <LoadingState text="Loading base"/>
  }

  return (
    <div className="flex h-screen">
      <aside className="w-13.5 p-4 flex flex-col bg-white border-r border-gray-200 gap-200">
        <div className="flex items-center text-gray-700 cursor-pointer"
              onMouseEnter={() => setHomeIconHover(true)}
              onMouseLeave={() => setHomeIconHover(false)}>
          {isHomeIconHover ? (
            <ArrowLeft className="w-4 h-4"
                        onClick={() => router.push("/home")}/>
          ) : (
            <Image src="/airtable.png" alt="Logo" width={22} height={22}/>
          )}
        </div>

        <div className="flex flex-col gap-2 items-center text-gray cursor-pointer">
          <button className="flex items-center px-1 py-1 gap-1 text-[13px] text-gray-700 rounded-2xl hover:bg-gray-200 cursor-pointer"
                  title="Help Center">
            <HelpCircle className="w-4 h-4"></HelpCircle>
          </button>

          <button className="flex items-center justify-center h-7 w-7 rounded-full text-[13px] text-gray-700 border border-white hover:bg-gray-200 cursor-pointer"
                  title="Notifications"
          >
            <Bell className="w-4 h-4"></Bell>
          </button>
          <div className="flex items-center justify-center h-6 w-6 mr-2">
            <ProfileMenu isBasePage={true}/>
          </div> 
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1 border border-gray-200 rounded-lg"
                  style={{ backgroundColor: stringToColor(baseIdString)}}>
              <Image src="/airtable.png" alt="Logo" width={22} height={22}/>
            </div>
            <span className="text-[17px] font-bold">{baseData?.name}</span>
            <ChevronDown className="text-gray-600 w-4 h-4"/>
          </div>

          <div className="flex items-center text-[13px] gap-4 font-medium">
            <span>Data</span>
            <span className="text-gray-600">Automations</span>
            <span className="text-gray-600">Interfaces</span>
            <span className="text-gray-600">Forms</span>
          </div>

          <div className="flex items-center text-[13px] gap-1.5">
            <div className="p-1 rounded-2xl border border-white hover:bg-gray-100 cursor-pointer">
              <History className="w-4 h-4 text-gray-600"/>
            </div>
            <div className="flex items-center px-3.5 py-1 gap-1 rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer">
              <Dock className="w-3 h-3"/>
              <span>Launch</span>
            </div>

            <div className="px-3.5 py-1 font-semibold rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer">
              <span>Share</span>
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200 py-4 bg-pink-100">

        </section>

        <section className="border-b border-gray-200 py-6 bg-white">

        </section>
        <main className="flex-1 min-h-0 flex">
          <div className="flex flex-col w-[280px] p-3 text-gray-900 border-r border-gray-200 gap-1">
            <div className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Plus className="w-4 h-4 text-gray-600"/>
              <span className="text-[12.5px]">Create new...</span>
            </div>

            <div className="flex items-center p-2 gap-2 text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Search className="w-4 h-4"/>
              <span className="text-[12.5px]">Find a view</span>
            </div>

            <div className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Grid2X2 className="w-4 h-4 text-blue-700"/>
              <span className="text-[12.5px] font-semibold">Grid view</span>
            </div>
          </div>

          <div className="flex-1 bg-slate-100">

          </div>
        </main>
      </div>
    </div>
  );
}