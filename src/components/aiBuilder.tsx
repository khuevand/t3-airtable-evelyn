import { Sparkles, Shuffle } from "lucide-react";
export default function AiBuilderBox() {
  return (
    <div className="relative flex items-center justify-center bg-[#f7f8f1] py-15 overflow-hidden">
      <div className="relative z-10 py-7 max-w-3xl rounded-2xl bg-white shadow-xl flex flex-col justify-between min-h-[190px]" >
          <p className="text-[20px] font-base text-slate-800 min-h-[60px] transition-all text-left ml-5">
            Design a task manager app for our operations team to assign and monitor projects across the org
          </p>
          <div className="mt-11 flex justify-between items-center">
            <button className="flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 ml-3 text-base font-semibold hover:bg-slate-50">
              <Shuffle className="" /> New Suggestion
            </button>

            <button className="flex items-center gap-2 rounded-full bg-black px-6 py-3 mr-3 text-base font-semibold text-white hover:bg-gray-700">
              <Sparkles className="w-4 h-4" /> Build it now
            </button>
          </div>
      </div>
    </div>
  );
}