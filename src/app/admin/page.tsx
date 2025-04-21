"use client";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAuth } from "@/app/providers";
import supabase from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.is_admin) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, [user, router]);

  if (!user?.is_admin) return null;

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="flex justify-end mb-4">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Añadir Usuario
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>
                  {user.is_admin ? "Administrador" : "Usuario"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}