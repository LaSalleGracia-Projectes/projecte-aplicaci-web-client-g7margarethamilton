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
import supabase from "@/lib/supabase";
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
      router.push("/admin");
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("email, nickname, is_admin, is_banned, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
      setFetchLoading(false);
    };

    if (user?.is_admin) {
      fetchUsers();
    }
  }, [user, loading, router]);

  const validatePassword = (password: string) => {
    const regex = /^(?=(.*\d){3,})(?=(.*[a-z]){3,})(?=(.*[A-Z]){3,}).{9,}$/;
    return regex.test(password);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!validatePassword(newUser.password)) {
      setError("La contraseña debe tener al menos 9 caracteres, incluyendo 3 mayúsculas, 3 minúsculas y 3 números.");
      return;
    }

    try {
      // Registrar en Supabase Auth (API Route)
      const supabaseResponse = await axios.post("/api/auth/register", newUser, {
        timeout: 5000,
      });

      if (supabaseResponse.status !== 200) {
        throw new Error(supabaseResponse.data.message || "Error al registrar en Supabase Auth");
      }

      // En handleCreateUser, después de la solicitud
      const newUserWithUserId = { ...newUser, userId: newUser.email };
      const apiResponse = await axios.post("http://localhost:3000/api/v1/auth/register", newUserWithUserId, {
        timeout: 5000,
      });

setUsers([
  {
    email: newUser.email,
    nickname: newUser.nickname,
    is_admin: false,
    is_banned: false,
    created_at: new Date().toISOString(),
    avatar_url: apiResponse.data.avatar_url || "", // Usar avatar_url si la API lo devuelve
  },
  ...users,
]);
      setNewUser({ email: "", password: "", nickname: "" });
      setDialogOpen(false);
    } catch (err: any) {
      let errorMessage = "Error al crear usuario";
      if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        errorMessage = "No se pudo conectar con el servidor. Verifica que la API esté corriendo en http://localhost:3000.";
      } else if (err.response) {
        errorMessage = err.response.data.message || `Error del servidor: ${err.response.status}`;
      }
      setError(errorMessage);
      console.error("Error completo:", err);
    }
  };

  if (loading || fetchLoading) return <div>Cargando...</div>;
  if (!user?.is_admin) return null;

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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  Crear
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Alert variant="default" className="mb-4">
          <AlertDescription>
            Nota: Las operaciones de edición y eliminación de usuarios deben realizarse manualmente en la base de datos debido a restricciones de seguridad.
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
                <TableCell>
                  {user.is_admin ? "Administrador" : "Usuario"}
                </TableCell>
                <TableCell>{user.is_banned ? "Sí" : "No"}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}