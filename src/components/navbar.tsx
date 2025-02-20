"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <Link href="/" className="text-2xl font-bold text-flow-black dark:text-flow-white">
          FLOW2DAY
        </Link>
        <div className="flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="space-x-6">
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className="text-flow-grey hover:text-flow-blue dark:text-flow-light-grey dark:hover:text-flow-blue">
                    About Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className="text-flow-grey hover:text-flow-blue dark:text-flow-light-grey dark:hover:text-flow-blue">
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            variant="outline"
            className="text-flow-blue border-flow-blue hover:bg-flow-blue hover:text-flow-white"
          >
            Log In
          </Button>
          <Button className="bg-flow-blue text-flow-white hover:bg-flow-blue/90">Register</Button>
        </div>
      </div>
    </nav>
  )
}

