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
import supabase from "@/lib/supabase";

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Flow2Day!
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex gap-6">
            {[
              { href: "/about-us", label: "About us" },
              { href: "/contact", label: "Contact" },
              { href: "/admin", label: "Panel" },
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

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="flex items-center gap-4">
            {user?.is_admin && (
              <Link href="/admin">
                <Button variant="ghost">Panel Admin</Button>
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={`${user.avatar_url}${user.avatar_url.includes("?") ? "&" : "?"}cache=${Date.now()}`}
                    alt="User avatar"
                    />
                    <AvatarFallback>
                      {user.nickname?.charAt(0).toUpperCase() || (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                      // Opcional: Llamada al backend para limpiar el token
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

                      // Elimina los datos del usuario y redirige
                      localStorage.removeItem("tokenWeb");
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }}
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
