import Image from "next/image";
import Navbar from "@/app/components/layout/landing/navbar";
import DashboardPage from "./dashboard";
import AutoLogout from "../autologout";
export default function Home() {
  return (
    <>
      <AutoLogout>
        <Navbar />
        <div className="min-h-screen dark:bg-gray-800 scroll-smooth overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="pt-[80px] h-auto font-sans grid grid-rows-[20px_1fr_20px] items-start justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <DashboardPage />
          </div>
        </div>
      </AutoLogout>
      
    </>
   
    
  );
}
