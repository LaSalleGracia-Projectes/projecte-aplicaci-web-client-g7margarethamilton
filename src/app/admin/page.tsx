"use client"

import Header from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { UserPlus, Edit, Trash2 } from "lucide-react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function ContactPage() {
    const users = [
        { id: 1, email: "user1@example.com", nickname: "User1", is_admin: true },
        { id: 2, email: "user2@example.com", nickname: "User2", is_admin: false },
    ];

    return ( 
        <>
        <Header/>
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
            <TableHead>Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {/* Mapear users para futuro */}
            {users.map((user) => (
            <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>
                <Button
                    variant={user.is_admin ? "default" : "outline"}
                    size="sm"
                    onClick={ () => {}}
                >
                    {user.is_admin ? "Administrador" : "Usuario"}
                </Button>
                </TableCell>
                <TableCell className="flex gap-2">
                <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {}}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        </>
    );
};