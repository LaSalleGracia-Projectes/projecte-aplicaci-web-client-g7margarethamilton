"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import Header from "@/components/ui/header";
import { Loader2, Edit, Trash2, Ban, CheckCircle, PlusCircle, AlertTriangle } from "lucide-react";

// Componentes de shadcn
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", nickname: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Estados para los diálogos de confirmación
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToBan, setUserToBan] = useState<{email: string, isBanned: boolean} | null>(null);

  // Función optimizada para hacer peticiones
  const makeRequest = async (endpoint: string, method: string, body: any = {}) => {
    const token = localStorage.getItem("tokenWeb");
  
    if (!token) {
      const error = new Error("No se encontró token de autenticación");
      console.error(error.message);
      throw error;
    }
  
    const fullBody = {
      ...body,
      userId: user?.email // Solo este campo es obligatorio en el cuerpo
    };
  
    try {
      const response = await fetch(`http://localhost:3000/api/v1/user${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: method !== "GET" ? JSON.stringify(fullBody) : undefined,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }
  
      return data;
    } catch (error: any) {
      console.error("Error en la petición:", error);
      throw error;
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const data = await makeRequest("", "GET");
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  // Validar acceso al panel
  useEffect(() => {
    console.log("Usuario actual:", {
      email: user?.email,
      isAdmin: user?.is_admin,
      token: localStorage.getItem("tokenWeb")?.slice(0, 10) + "..."
    });
    
    if (!authLoading && (!user || !user.is_admin)) {
      router.push("/");
      return;
    }
    loadUsers();
  }, [user, authLoading]);
  

  // Validación de contraseña
  const validatePassword = (password: string) => {
    const regex = /^(?=(.*\d){3,})(?=(.*[a-z]){3,})(?=(.*[A-Z]){3,}).{9,}$/;
    return regex.test(password);
  };

  // Crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(newUser.password)) {
      setError("La contraseña debe tener al menos 9 caracteres, incluyendo 3 mayúsculas, 3 minúsculas y 3 números.");
      return;
    }

    try {
      await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      setNewUser({ email: "", password: "", nickname: "" });
      setDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Eliminar usuario (con confirmación)
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await makeRequest(
        `/${userToDelete}`,
        "DELETE",
        {}
      );
      setUsers(users.filter(u => u.email !== userToDelete));
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Editar usuario
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    nickname: "",
    is_admin: false,
    is_banned: false
  });

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({
      nickname: user.nickname,
      is_admin: user.is_admin,
      is_banned: user.is_banned
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
  
    try {
      await makeRequest(
        `/${editingUser.email}`,
        "PUT",
        {
          nickname: editForm.nickname,
          is_admin: editForm.is_admin,
          is_banned: editForm.is_banned,
          avatar_url: editingUser.avatar_url,
        }
      );
      await loadUsers();
      setEditingUser(null);
    } catch (err: any) {
      setError(`Error al actualizar: ${err.message}`);
    }
  };

  // Banear/desbanear usuario (ÚNICA definición)
  const confirmToggleBan = async () => {
    if (!userToBan) return;
    
    try {
      const userToUpdate = users.find(u => u.email === userToBan.email);
      if (!userToUpdate) return;

      await makeRequest(
        `/${userToBan.email}`,
        "PUT",
        {
          nickname: userToUpdate.nickname,
          avatar_url: userToUpdate.avatar_url,
          is_admin: userToUpdate.is_admin,
          is_banned: !userToBan.isBanned
        }
      );
      await loadUsers();
      setUserToBan(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Renderizado condicional
  if (authLoading || fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-red-500">Acceso denegado</h2>
        <p className="mb-4">No tienes permisos para acceder al panel de administración.</p>
        <Button onClick={() => router.push("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Panel de Administrador</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Añadir Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    type="text"
                    value={newUser.nickname}
                    onChange={(e) => setNewUser({ ...newUser, nickname: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Crear Usuario</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.email}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.nickname}</TableCell>
                  <TableCell>{u.is_admin ? "Administrador" : "Usuario"}</TableCell>
                  <TableCell>
                    {u.is_banned ? (
                      <span className="text-destructive">Baneado</span>
                    ) : (
                      <span className="text-green-500">Activo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditModal(u)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setUserToDelete(u.email)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={u.is_banned ? "default" : "destructive"}
                      size="icon"
                      onClick={() => setUserToBan({email: u.email, isBanned: u.is_banned})}
                      title={u.is_banned ? "Desbanear" : "Banear"}
                    >
                      {u.is_banned ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal de edición */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario: {editingUser?.email}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Administrador</Label>
                <Checkbox
                  checked={editForm.is_admin}
                  onCheckedChange={(checked) => setEditForm({...editForm, is_admin: !!checked})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Baneado</Label>
                <Checkbox
                  checked={editForm.is_banned}
                  onCheckedChange={(checked) => setEditForm({...editForm, is_banned: !!checked})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmar eliminación
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas eliminar permanentemente este usuario? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteUser}>
                Confirmar Eliminación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación para banear/desbanear */}
        <Dialog open={!!userToBan} onOpenChange={(open) => !open && setUserToBan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {userToBan?.isBanned ? "Desbanear usuario" : "Banear usuario"}
              </DialogTitle>
              <DialogDescription>
                {userToBan?.isBanned 
                  ? "¿Estás seguro que deseas desbanear a este usuario?"
                  : "¿Estás seguro que deseas banear a este usuario?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserToBan(null)}>
                Cancelar
              </Button>
              <Button 
                variant={userToBan?.isBanned ? "default" : "destructive"} 
                onClick={confirmToggleBan}
              >
                {userToBan?.isBanned ? "Confirmar Desbaneo" : "Confirmar Baneo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}