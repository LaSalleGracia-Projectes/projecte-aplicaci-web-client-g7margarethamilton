"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Lock, Upload } from "lucide-react";
import Header from "@/components/ui/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState(user?.nickname || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función mejorada para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      let date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        date = new Date(dateString.replace(/-/g, '/').replace(/T/, ' '));
        
        if (isNaN(date.getTime())) {
          const parsed = Date.parse(dateString);
          date = isNaN(parsed) ? new Date() : new Date(parsed);
        }
      }
      
      return format(date, "PPP", { locale: es });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha no disponible";
    }
  };

  const handleSaveChanges = async () => {
    if (!tempNickname.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("tokenWeb");
      if (!token) throw new Error("No hay token de autenticación");

      const response = await fetch("http://localhost:3000/api/v1/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: tempNickname })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar");
      }

      const updatedUser = await response.json();
      
      // Actualizar el estado local y global
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload(); // Forzar actualización

    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Button variant="outline" className="gap-2 w-full">
                <Upload className="h-4 w-4" />
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
                    {formatDate(user.created_at)}
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
                <Button
                  onClick={() => {
                    setTempNickname(user.nickname || "");
                    setIsEditOpen(true);
                  }}
                  className="flex-1"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
                <Button className="flex-1" variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Cambiar contraseña
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                Nickname
              </Label>
              <Input
                id="nickname"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSubmitting || !tempNickname.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>   
        </DialogContent>
      </Dialog>
    </>
  );
}