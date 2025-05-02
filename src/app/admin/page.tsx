"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import Header from "@/components/ui/header";

// Componentes de shadcn (no modificados)
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", nickname: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Validar acceso al panel
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      return router.push("/");
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("tokenWeb");

        const res = await fetch("http://localhost:3000/api/v1/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error al obtener usuarios");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Error al cargar usuarios:", err.message);
        setError("No se pudieron cargar los usuarios");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUsers();
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
      const newUserWithUserId = { ...newUser, userId: newUser.email };
      const apiResponse = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(errorData.message || "Error al crear usuario");
      }

      const userData = await apiResponse.json();

      setUsers([
        {
          email: newUser.email,
          nickname: newUser.nickname,
          avatar_url: userData.avatar_url || "",
          is_admin: false,
          is_banned: false,
          created_at: new Date().toISOString(),
        },
        ...users,
      ]);

      setNewUser({ email: "", password: "", nickname: "" });
      setDialogOpen(false);
    } catch (err: any) {
      let errorMessage = "Error al crear usuario";
      if (err.code === "ECONNREFUSED") {
        errorMessage = "No se pudo conectar con el servidor.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error completo:", err);
    }
  };

  // Banear/desbanear usuario
  const handleToggleBan = async (email: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("tokenWeb");

      const userToUpdate = users.find((u) => u.email === email);

      if (!userToUpdate) {
        throw new Error("Usuario no encontrado");
      }

      const response = await fetch(`http://localhost:3000/api/v1/user/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: userToUpdate.nickname,
          avatar_url: userToUpdate.avatar_url,
          is_admin: userToUpdate.is_admin,
          is_banned: !currentStatus,

          // ✅ Enviar `userId` desde el frontend
          userId: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar estado de baneo");
      }

      const updatedUser = await response.json();
      setUsers(
        users.map((u) =>
          u.email === email ? { ...u, is_banned: !currentStatus } : u
        )
      );
    } catch (err: any) {
      setError("No se pudo banear al usuario");
      console.error("Error al banear:", err.message);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (email: string) => {
    try {
      const token = localStorage.getItem("tokenWeb");

      const response = await fetch(`http://localhost:3000/api/v1/user/${email}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // ✅ Requerido por tu backend
          userId: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      setUsers(users.filter((u) => u.email !== email));
    } catch (err: any) {
      setError("No se pudo eliminar el usuario");
      console.error("Error al eliminar:", err.message);
    }
  };

  // Editar usuario
  const openEditModal = (u: any) => {
    setEditingUser(u);
    setNewNickname(u.nickname);
    setNewIsAdmin(u.is_admin);
    setNewIsBanned(u.is_banned);
    setShowEditModal(true);
  };

  const [editingUser, setEditingUser] = useState<any>(null);
  const [newNickname, setNewNickname] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newIsBanned, setNewIsBanned] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("tokenWeb");

      const response = await fetch(`http://localhost:3000/api/v1/user/${editingUser.email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: newNickname,
          is_admin: newIsAdmin,
          is_banned: newIsBanned,
          userId: user?.email, // ✅ Enviar `userId` desde frontend
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }

      refreshUsers();
      setShowEditModal(false);
    } catch (err: any) {
      setError("No se pudieron guardar los cambios");
      console.error("Error al guardar:", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshUsers = async () => {
    try {
      const token = localStorage.getItem("tokenWeb");

      const res = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error al recargar usuarios");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError("No se pudieron recargar los usuarios");
      console.error("Error al recargar:", err.message);
    }
  };

  // Renderizado condicional
  if (authLoading || fetchLoading) {
    return <div>Cargando...</div>;
  }

  if (!user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-red-500">Acceso denegado</h2>
        <p>No tienes permisos para acceder al panel de administración.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Panel de Administrador</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <span>Añadir Usuario</span>
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
                <Button type="submit" disabled={isProcessing}>
                  Crear
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Baneado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.nickname}</TableCell>
                <TableCell>{u.is_admin ? "Administrador" : "Usuario"}</TableCell>
                <TableCell>{u.is_banned ? "Sí" : "No"}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(u)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.email)}>
                      Eliminar
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleToggleBan(u.email, u.is_banned)}>
                      {u.is_banned ? "Desbanear" : "Banear"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modal de edición */}
        {showEditModal && editingUser && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuario: {editingUser.email}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-nickname" className="text-right">
                    Nickname
                  </Label>
                  <Input
                    id="edit-nickname"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-admin" className="text-right">
                    Es admin
                  </Label>
                  <input
                    id="edit-admin"
                    type="checkbox"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-banned" className="text-right">
                    Baneado
                  </Label>
                  <input
                    id="edit-banned"
                    type="checkbox"
                    checked={newIsBanned}
                    onChange={(e) => setNewIsBanned(e.target.checked)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser} disabled={isProcessing}>
                  {isProcessing ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}