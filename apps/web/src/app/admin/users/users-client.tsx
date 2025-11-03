"use client";

import { Checkbox } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import AdminGuard from "@/components/Auth/admin-guard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useI18n } from "@/hooks/use-i18n";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { orpc } from "@/utils/orpc";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string | Date;
};

function AdminUsersPageContent() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  usePageMetadata(t("meta.adminUsers.title"), t("meta.adminUsers.description"));

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => orpc.getAllUsers.call(),
  });

  useGlobalLoader(isLoading, "admin-users-list");

  const updateUserMutation = useMutation({
    mutationFn: async (variables: {
      userId: string;
      isVerified?: boolean;
      isAdmin?: boolean;
    }) => {
      await orpc.updateUserStatus.call(variables);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["admin-all-users"] });
      const previousUsers = queryClient.getQueryData<AdminUser[]>([
        "admin-all-users",
      ]);
      queryClient.setQueryData<AdminUser[]>(
        ["admin-all-users"],
        (oldUsers = []) =>
          oldUsers.map((user) =>
            user.id === variables.userId ? { ...user, ...variables } : user
          )
      );
      return { previousUsers };
    },
    onError: (error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin-all-users"], context.previousUsers);
      }
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : t("admin.users.updateFailed")
        }`
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onSuccess: () => {
      toast.success(t("admin.users.updateSuccess"));
    },
  });

  const verifyAllUsersMutation = useMutation({
    mutationFn: async () => {
      await orpc.verifyAllUsers.call();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admin-all-users"] });
      const previousUsers = queryClient.getQueryData<AdminUser[]>([
        "admin-all-users",
      ]);
      queryClient.setQueryData<AdminUser[]>(
        ["admin-all-users"],
        (oldUsers = []) =>
          oldUsers.map((user) => ({ ...user, isVerified: true }))
      );
      return { previousUsers };
    },
    onError: (error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin-all-users"], context.previousUsers);
      }
      toast.error(
        `Error: ${
          error instanceof Error
            ? error.message
            : t("admin.users.verifyAllFailed")
        }`
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onSuccess: () => {
      toast.success(t("admin.users.verifyAllSuccess"));
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-bold text-2xl sm:text-3xl">
          {t("admin.users.title")}
        </h1>
        <Button
          className="w-full sm:w-auto"
          disabled={
            verifyAllUsersMutation.isPending ||
            updateUserMutation.isPending ||
            !users ||
            users.length === 0
          }
          loading={verifyAllUsersMutation.isPending}
          onClick={() => verifyAllUsersMutation.mutate()}
        >
          {t("admin.users.verifyAll")}
        </Button>
      </div>
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                {t("admin.users.email")}
              </TableHead>
              <TableHead className="min-w-[150px]">
                {t("admin.users.name")}
              </TableHead>
              <TableHead className="w-[120px] text-center">
                {t("admin.users.verified")}
              </TableHead>
              <TableHead className="w-[120px] text-center">
                {t("admin.users.admin")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: AdminUser) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || t("admin.users.noValue")}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={user.isVerified}
                      className="group relative inline-flex h-6 w-6 items-center justify-center rounded border-2 border-gray-300 bg-white transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary"
                      disabled={updateUserMutation.isPending}
                      onChange={(checked) =>
                        updateUserMutation.mutate({
                          userId: user.id,
                          isVerified: Boolean(checked),
                        })
                      }
                    >
                      <Check className="h-4 w-4 text-white opacity-0 transition-opacity group-data-[checked]:opacity-100" />
                    </Checkbox>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={user.isAdmin}
                      className="group relative inline-flex h-6 w-6 items-center justify-center rounded border-2 border-gray-300 bg-white transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-success data-[checked]:bg-success"
                      disabled={updateUserMutation.isPending}
                      onChange={(checked) =>
                        updateUserMutation.mutate({
                          userId: user.id,
                          isAdmin: Boolean(checked),
                        })
                      }
                    >
                      <Check className="h-4 w-4 text-white opacity-0 transition-opacity group-data-[checked]:opacity-100" />
                    </Checkbox>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4 md:hidden">
        {users?.map((user: AdminUser) => (
          <div
            className="rounded-lg border bg-white p-4 shadow-sm"
            key={user.id}
          >
            <div className="mb-3 border-b pb-3">
              <p className="font-medium text-gray-500 text-sm">
                {t("admin.users.email")}
              </p>
              <p className="mt-1 break-all font-semibold text-gray-900">
                {user.email}
              </p>
            </div>
            <div className="mb-3 border-b pb-3">
              <p className="font-medium text-gray-500 text-sm">
                {t("admin.users.name")}
              </p>
              <p className="mt-1 text-gray-900">
                {user.name || t("admin.users.noValue")}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <Checkbox
                  checked={user.isVerified}
                  className="group relative inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 bg-white transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-blue-600 data-[checked]:bg-blue-600"
                  disabled={updateUserMutation.isPending}
                  onChange={(checked) =>
                    updateUserMutation.mutate({
                      userId: user.id,
                      isVerified: Boolean(checked),
                    })
                  }
                >
                  <Check className="h-4 w-4 text-white opacity-0 transition-opacity group-data-[checked]:opacity-100" />
                </Checkbox>
                <span className="text-gray-700 text-sm">
                  {t("admin.users.verified")}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <Checkbox
                  checked={user.isAdmin}
                  className="group relative inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300 bg-white transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-purple-600 data-[checked]:bg-purple-600"
                  disabled={updateUserMutation.isPending}
                  onChange={(checked) =>
                    updateUserMutation.mutate({
                      userId: user.id,
                      isAdmin: Boolean(checked),
                    })
                  }
                >
                  <Check className="h-4 w-4 text-white opacity-0 transition-opacity group-data-[checked]:opacity-100" />
                </Checkbox>
                <span className="text-gray-700 text-sm">
                  {t("admin.users.admin")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {users?.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {t("admin.users.noUsers")}
        </div>
      )}
    </div>
  );
}

export default function UsersClient() {
  return (
    <AdminGuard>
      <AdminUsersPageContent />
    </AdminGuard>
  );
}
