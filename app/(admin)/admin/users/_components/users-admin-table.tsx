"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";

export function UsersAdminTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.user.adminList.queryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries(trpc.user.adminList.queryOptions());

  const { mutate: banUser } = useMutation(
    trpc.user.banUser.mutationOptions({ onSuccess: invalidate }),
  );
  const { mutate: unbanUser } = useMutation(
    trpc.user.unbanUser.mutationOptions({ onSuccess: invalidate }),
  );
  const { mutate: setRole } = useMutation(
    trpc.user.setRole.mutationOptions({ onSuccess: invalidate }),
  );

  if (isLoading) {
    return (
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="h-16 bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const users = data?.users ?? [];

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-black">User</TableHead>
            <TableHead className="font-black">Role</TableHead>
            <TableHead className="font-black text-right">Challenges</TableHead>
            <TableHead className="font-black text-right">XP</TableHead>
            <TableHead className="font-black">Joined</TableHead>
            <TableHead className="font-black">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} className={u.banned ? "opacity-60" : ""}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-lg shrink-0">
                    <AvatarImage src={u.image ?? undefined} alt={u.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-black">
                      {u.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {u.role === "admin" ? (
                  <Badge className="font-bold">Admin</Badge>
                ) : (
                  <Badge variant="secondary" className="font-bold">
                    User
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                {u.completedChallenges}
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums text-sm">
                {u.totalXp.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(u.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {u.banned ? (
                  <div>
                    <Badge variant="destructive" className="font-bold">
                      Banned
                    </Badge>
                    {u.banReason && (
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-32 truncate">
                        {u.banReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="font-bold text-green-700 border-green-300 dark:text-green-400 dark:border-green-800"
                  >
                    Active
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="neo-border neo-shadow"
                  >
                    {u.role === "admin" ? (
                      <DropdownMenuItem
                        onClick={() => setRole({ userId: u.id, role: "user" })}
                      >
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Remove admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setRole({ userId: u.id, role: "admin" })}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Make admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {u.banned ? (
                      <DropdownMenuItem
                        onClick={() => unbanUser({ userId: u.id })}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Unban user
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => banUser({ userId: u.id })}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Ban user
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
