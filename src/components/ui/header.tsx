"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/providers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-sm w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 gap-8">
        {/* Logo a la izquierda */}
        <Link href="/" className="font-bold text-xl shrink-0">
          Flow2Day!
        </Link>

        {/* Navegación centrada */}
        <div className="flex-1 flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-8">
              {[
                { href: "/about-us", label: "About us" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={
                      pathname === item.href
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.is_admin && (
                <Link href="/admin">
                  <Button variant="ghost" className="px-3 py-2">
                    Panel Admin ✨  
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-9 w-9">
                    <AvatarImage
                      src={`${user.avatar_url}${user.avatar_url.includes("?") ? "&" : "?"}cache=${Date.now()}`}
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      {user.nickname?.charAt(0).toUpperCase() || (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Perfil</Link>
                  </DropdownMenuItem>
                  {user.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={async () => {
                      const email = user?.email;
                      const token = localStorage.getItem("tokenWeb");

                      if (email && token) {
                        try {
                          await fetch(
                            "http://localhost:3000/api/v1/auth/web/logout",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                email,
                                password: "dummy_password_for_logout",
                              }),
                            }
                          );
                        } catch (err) {
                          console.warn(
                            "No se pudo limpiar el token en el servidor"
                          );
                        }
                      }

                      localStorage.removeItem("tokenWeb");
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }}
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="px-3 py-2">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="px-4 py-2">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}