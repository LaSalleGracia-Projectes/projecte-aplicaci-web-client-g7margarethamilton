"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Edit } from "lucide-react";
import Header from "@/components/ui/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Tarjeta de perfil */}
          <div className="bg-card rounded-lg shadow-sm border p-6 flex flex-col md:flex-row gap-6">
            {/* Sección izquierda - Avatar */}
            <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
              <Avatar className="h-32 w-32 border-2 border-primary">
                <AvatarImage 
                  src={user.avatar_url || "/default-avatar.png"} 
                  alt={user.nickname}
                />
                <AvatarFallback>
                  {user.nickname?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Cambiar foto
              </Button>
            </div>

            {/* Sección derecha - Datos */}
            <div className="w-full md:w-2/3 space-y-4">
              <h2 className="text-2xl font-bold">{user.nickname}</h2>
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registro:</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rol:</span>
                  <span className="font-medium">
                    {user.is_admin ? (
                      <span className="text-primary">Administrador</span>
                    ) : (
                      "Usuario"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">
                    {user.is_banned ? (
                      <span className="text-destructive">Baneado</span>
                    ) : (
                      <span className="text-green-500">Activo</span>
                    )}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex gap-4">
                <Button className="flex-1" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
                <Button className="flex-1" variant="outline">
                  Cambiar contraseña
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}