"use client";

import { issueSchema } from "@/app/validationSchema";
import { Issue, User } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
  const { data: users, error, isLoading } = useUsers();
  const [assigneeField, setAssigneeField] = useState(
    issue.assignedToUserId || "Unassigned"
  );

  if (isLoading) return <Skeleton />;

  if (error) return null;

  return (
    <>
      <Select.Root
        value={assigneeField}
        onValueChange={async userId => {
          await axios
            .patch("/api/issues/" + issue.id, {
              assignedToUserId: userId === "Unassigned" ? null : userId,
            })
            .catch(() => {
              toast.error("Changes could not be saved.");
            });
          setAssigneeField(userId);
        }}
      >
        <Select.Trigger></Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Suggestions</Select.Label>
            <Select.Item value="Unassigned">Unassigned</Select.Item>
            {users?.map(user => (
              <Select.Item key={user.id} value={user.id}>
                {user.name}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Toaster />
    </>
  );
};

const useUsers = () =>
  useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => axios.get("/api/users").then(res => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

export default AssigneeSelect;
