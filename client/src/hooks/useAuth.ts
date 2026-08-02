import { useEffect, useState } from "react";

import { getCurrentUser } from "../api/auth.api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;

  phone: string | null;

  avatar: string | null;

  roleId: string;

  role: {
    id: string;

    name: string;

    description: string;

    status: string;

    permissions: {
      roleId: string;

      permissionId: string;

      permission: {
        id: string;

        name: string;

        description: string;

        groupId: string;
      };
    }[];
  };
}

export default function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();

      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    refetch: fetchUser,
  };
}
