import React from "react";
import { BoxesSkeleton5, SkeletonStatCard } from "../ui/shared/Skeleton";

export const StatsSkeleton: React.FC = () => (
  <div className="mb-6 space-y-4">
    {/* <BoxesSkeleton5 /> */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
  </div>
);
