"use client";

import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/app/providers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", nickname: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push("/");
    }
  
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("tokenWeb");
  
        const res = await fetch("http://localhost:3000/api/v1/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        setError("No se pudieron cargar los usuarios");
        console.error("Error al obtener usuarios:", err);
      } finally {
        setFetchLoading(false);
      }
    };
  
    if (user?.is_admin) {
      fetchUsers();
    }
  }, [user, loading, router]);

  if (!loading && (!user || !user.is_admin)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-red-500">Acceso denegado</h2>
        <p>No tienes permisos para acceder al panel de administración.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const validatePassword = (password: string) => {
    const regex = /^(?=(.*\d){3,})(?=(.*[a-z]){3,})(?=(.*[A-Z]){3,}).{9,}$/;
    return regex.test(password);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(newUser.password)) {
      setError("La contraseña debe tener al menos 9 caracteres, incluyendo 3 mayúsculas, 3 minúsculas y 3 números.");
      return;
    }

    try {
      const newUserWithUserId = { ...newUser, userId: newUser.email };
      const apiResponse = await axios.post("http://localhost:3000/api/v1/auth/register", newUserWithUserId);

      setUsers([
        {
          email: newUser.email,
          nickname: newUser.nickname,
          is_admin: false,
          is_banned: false,
          created_at: new Date().toISOString(),
          avatar_url: apiResponse.data.avatar_url || "",
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
      }
      setError(errorMessage);
      console.error("Error:", err);
    }
  };

  if (loading || fetchLoading) {
    return <div>Cargando...</div>;
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
                <UserPlus className="h-4 w-4" />
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
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    type="text"
                    value={newUser.nickname}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nickname: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit">Crear</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Alert variant="default" className="mb-4">
          <AlertDescription>
            Nota: Las operaciones de edición y eliminación deben realizarse manualmente en la base de datos debido a restricciones de seguridad.
          </AlertDescription>
        </Alert>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Baneado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>{user.is_admin ? "Administrador" : "Usuario"}</TableCell>
                <TableCell>{user.is_banned ? "Sí" : "No"}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}