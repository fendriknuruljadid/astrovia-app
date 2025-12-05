'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { ThemeContext } from '@/contexts/theme-context';
import { signOut } from "next-auth/react"
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from '@/app/components/ui/drawer';
// import { getWithSignature } from '@/utils/api';
import { toSlug } from '@/utils/slugify';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/app/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/app/components/ui/navigation-menu';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/app/components/ui/popover';
import { Moon, Sun, Menu, ChevronDown, Search } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';
import { toast } from 'sonner';
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  child?: NavItem[];
}

export function NavbarClient() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20); 
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
      
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center text-base font-semibold">
            <Image
              className='dark:hidden'
              src="/full-logo-light.svg"
              alt="Astrovia Logo"
              width={150}
              height={50}
            />
            <Image
              className='hidden dark:block'
              src="/full-logo-dark.svg"
              alt="Astrovia Logo"
              width={150}
              height={50}
            />
          </Link>
          {/* Theme toggle */}
          <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="bg-white rounded-full font-bold h-9 w-9 cursor-pointer">
              {theme === 'dark' ? <Sun className="h-4 w-4 " /> : <Moon className="h-4 w-4" />}
            </Button> */}
            <Button  onClick={() => signOut({ callbackUrl: "/" })}  variant="outline" type="button" className="bg-white px-4 rounded-lg pt-2 font-bold w-auto cursor-pointer">
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
