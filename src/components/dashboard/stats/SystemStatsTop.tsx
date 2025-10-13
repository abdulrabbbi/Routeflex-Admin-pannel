import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { MdSupervisorAccount, MdWork, MdTwoWheeler, MdPerson } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import SystemStatCard from "./SystemStatCard";
import { getSystemStats, RoleCount } from "../../../api/adminService";
import { SkeletonStatCard } from "../../ui/shared/Skeleton";

type Props = { className?: string };

export default function SystemStatsTop({ className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState<RoleCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSystemStats();
        if (!mounted) return;
        setTotal(data.totalUsers);
        setRoles(data.rolesCount);
      } catch (e: any) {
        setError("Failed to load system stats");
        toast.error(e?.response?.data?.message || "Failed to load system stats");
        setTotal(0);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const map = useMemo(() => {
    const byRole: Record<string, number> = {};
    roles.forEach((r) => (byRole[r.role] = r.count));
    return {
      admin: byRole.admin ?? 0,
      business: byRole.business ?? 0,
      driver: byRole.driver ?? 0,
      individual: byRole.individual ?? 0,
    };
  }, [roles]);

  if (loading) {
    return (
      <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
      {error && (
        <div className="md:col-span-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <SystemStatCard
        label="Total Users"
        value={total}
        icon={<HiUserGroup className="h-6 w-6" />}
        accent="green"
      />
      <SystemStatCard
        label="Businesses"
        value={map.business}
        icon={<MdWork className="h-6 w-6" />}
        accent="blue"
      />
      <SystemStatCard
        label="Drivers"
        value={map.driver}
        icon={<MdTwoWheeler className="h-6 w-6" />}
        accent="orange"
      />

      {/* Stretch: show Admins / Individuals if you like */}
      <div className="md:col-span-3 grid gap-6 sm:grid-cols-2">
        <SystemStatCard
          label="Admins"
          value={map.admin}
          icon={<MdSupervisorAccount className="h-6 w-6" />}
          accent="gray"
        />
        <SystemStatCard
          label="Customers"
          value={map.individual}
          icon={<MdPerson className="h-6 w-6" />}
          accent="rose"
        />
      </div>
    </div>
  );
}
