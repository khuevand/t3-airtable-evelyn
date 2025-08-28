// import Head from "next/head";
import { SignInButton,
          // SignOutButton,
          // SignedIn,
          SignedOut,
          useUser} from '@clerk/nextjs'
// import { api } from "~/utils/api";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageLoading from "~/components/pageLoading";
import AiBuilderBox from "~/components/aiBuilder";

export default function Home() {
  const router = useRouter();
  const {isLoaded, isSignedIn} = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded && router.pathname === "/"){
      <PageLoading/>
    }
    if (isSignedIn && router.pathname === "/"){
      void router.push("/home");
    }
  }, [isLoaded, isSignedIn, router]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [])

  return (
    <>
      <main className="min-h-screen bg-white text-black">
        <header className="flex items-center justify-center bg-[#f0f6ff] border-b border-slate-100 px-9 py-2">
          <div className="flex items-center gap-2">
            <p className="text-[15px] text-gray-700">Meet Omni, your AI collaborator for building custom apps</p>
            <Link
              href="/"
              className="flex items-center text-[15px] font-medium text-[#1b61c9] hover:underline hover:text-[#8bace4] cursor-pointer gap-1 ">
              <span>See what&apos;s possible.</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <section className="flex items-center justify-between border-b border-slate-100 bg-[#f7f8f1] hover:bg-[#fdfdfa] px-9 py-4">
          <div className="flex items-center gap-13">
            <Link href="/" className="flex item-center gap-1 px-1">
              <Image src="/airtable.png" alt="Logo" width={40} height={20} />
              <p className="text-[24px] font-bold text-gray-800">Airtable</p>
            </Link>

            <nav className="hidden md:flex items-center text-[16px] font-[600] text-gray-900 gap-5">
              <Link href="/" className="flex items-center gap-1 hover:text-[#1b61c9] cursor-pointer">
                <span>Platform</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="#" className="flex items-center gap-1 hover:text-[#1b61c9] cursor-pointer">
                <span>Solutions</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="#" className="flex items-center gap-1 hover:text-[#1b61c9] cursor-pointer">
                <span>Resources</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="#" className="flex items-center gap-1 hover:text-[#1b61c9] cursor-pointer">
                <span>Enterprise</span>
              </Link>
              <Link href="#" className="flex items-center gap-1 hover:text-[#1b61c9] cursor-pointer">
                <span>Pricing</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[17px] font-medium rounded-xl border border-black px-5 py-3.5 hover:bg-[#fdfdfa] hover:text-gray-700 cursor-pointer">
              Book Demo
            </button>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-[17px] text-white font-medium rounded-xl px-6 py-4 bg-black hover:bg-gray-400 hover:text-white cursor-pointer">
                  Sign up for free
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="text-[17px] font-medium hover:text-[#1b61c9] cursor-pointer">
                  Log in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>

        <section className="text-center py-20 bg-[#f7f8f1] font-sans">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <PageLoading/>
            </div>
          ) : (
            <>
              <h1 className="max-w-3xl mx-auto text-[48px] font-[490] text-gray-800 leading-[1.1]">
                From idea to app in an instant
              </h1>
              <p className="mt-1 max-w-3xl mx-auto text-[48px] font-[490] leading-[1.1] text-gray-800">
                Build with AI that means business
              </p>
              <AiBuilderBox/>
            </>
          )}
        </section>

        <section className="relative ml-35 px-10 bg-white">
          <h1 className="mt-30 max-w-3xl text-left subpixel-antialiased text-[48px] font-[450] leading-[1.1] text-gray-800">
            See what others are building
          </h1>
          <div className="flex justify-between mt-11 mb-10 mr-30">
            <p className="max-w-5xl text-[25px] leading-[1.1]">
              Skip the code. Transform your data into custom interfaces, automations, and agents with Airtable&apos;s AI-native app platform.
            </p>

            <div className="flex justify-center gap-2">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border px-3 py-3 bg-black text-white font-semibold hover:bg-slate-700 cursor-pointer">
                  <ArrowLeft className="w-4 h-4 cursor-pointer" />
              </button>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border px-3 py-3 bg-black text-white font-semibold hover:bg-slate-700 cursor-pointer">
                  <ArrowRight className="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
