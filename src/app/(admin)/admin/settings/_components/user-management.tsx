"use client";

import { useEffect, useState } from "react";
import { getUsers, updateUserRole, toggleUserBlock } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  image: string | null;
  createdAt: string | null;
}

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"role" | "block">("role");

  const fetchUsersList = async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUsers(query);
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList(search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsersList(search);
  };

  const handleRoleToggle = async (user: UserData) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const result = await updateUserRole(user.id, newRole);
      if (result.success) {
        toast.success(`${user.name} is now ${newRole === "admin" ? "an admin" : "a regular user"}`);
        fetchUsersList(search);
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch (err) {
      toast.error("Failed to update role");
    }
    setDialogOpen(false);
    setTargetUser(null);
  };

  const handleBlockToggle = async (user: UserData) => {
    try {
      const result = await toggleUserBlock(user.id);
      if (result.success) {
        toast.success(
          user.isBlocked
            ? `${user.name} has been unblocked`
            : `${user.name} has been blocked`
        );
        fetchUsersList(search);
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch (err) {
      toast.error("Failed to update user");
    }
    setDialogOpen(false);
    setTargetUser(null);
  };

  const openRoleDialog = (user: UserData) => {
    setTargetUser(user);
    setDialogAction("role");
    setDialogOpen(true);
  };

  const openBlockDialog = (user: UserData) => {
    setTargetUser(user);
    setDialogAction("block");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{users.length} user{users.length !== 1 ? "s" : ""} registered</span>
        </div>
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 w-full sm:w-64 h-10 border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search users..."
            />
          </div>
        </form>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchUsersList(search)}>
                Try again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No users found
              </h3>
              <p className="text-muted-foreground text-sm">
                {search ? "No users match your search." : "No users registered yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">User</TableHead>
                    <TableHead className="font-semibold text-slate-700">Email</TableHead>
                    <TableHead className="font-semibold text-slate-700">Role</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Joined</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-900 text-sm">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-violet-50 text-violet-700 border-violet-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="text-xs">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-medium">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              User Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openRoleDialog(user)}
                              className="cursor-pointer">
                              {user.role === "admin" ? (
                                <>
                                  <ShieldOff className="h-4 w-4 mr-2" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openBlockDialog(user)}
                              className={`cursor-pointer ${
                                user.isBlocked
                                  ? "text-emerald-600 focus:text-emerald-600"
                                  : "text-red-600 focus:text-red-600"
                              }`}>
                              {user.isBlocked ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Unblock User
                                </>
                              ) : (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Block User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {dialogAction === "role"
                ? targetUser?.role === "admin"
                  ? "Remove Admin Role"
                  : "Make Admin"
                : targetUser?.isBlocked
                  ? "Unblock User"
                  : "Block User"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "role" ? (
                <>
                  Are you sure you want to{" "}
                  {targetUser?.role === "admin" ? "remove admin role from" : "make"}{" "}
                  <span className="font-medium text-slate-900">{targetUser?.name}</span>
                  {targetUser?.role === "admin"
                    ? "? They will lose admin privileges."
                    : "? They will have full admin access."}
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  {targetUser?.isBlocked ? "unblock" : "block"}{" "}
                  <span className="font-medium text-slate-900">{targetUser?.name}</span>
                  {targetUser?.isBlocked
                    ? "? They will be able to access the platform again."
                    : "? They will not be able to access the platform."}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setTargetUser(null);
              }}
              className="border-slate-200">
              Cancel
            </Button>
            <Button
              variant={dialogAction === "block" && !targetUser?.isBlocked ? "destructive" : "default"}
              onClick={() => {
                if (!targetUser) return;
                if (dialogAction === "role") {
                  handleRoleToggle(targetUser);
                } else {
                  handleBlockToggle(targetUser);
                }
              }}
              className={
                dialogAction === "role"
                  ? "bg-slate-900 hover:bg-slate-800"
                  : dialogAction === "block" && !targetUser?.isBlocked
                    ? ""
                    : "bg-slate-900 hover:bg-slate-800"
              }>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
