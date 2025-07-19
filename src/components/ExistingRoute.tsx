import { MdLocationOn } from "react-icons/md";
import { memo } from "react";

interface FormattedRoute {
  id: number;
  pickup: {
    location: string;
    time: string;
  };
  delivery: {
    locations: string[];
    time: string;
  };
}

interface ExistingRoutesProps {
  routes: FormattedRoute[];
}

const ExistingRoutes = memo(({ routes }: ExistingRoutesProps) => {
  return (
    <div className="space-y-6">
      {routes.map((route) => (
        <div key={route.id} className="bg-[#f0fdf4] p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-[#1e1e38] mb-4">
            Route #{route.id}
          </h3>

          <div className="grid grid-cols-[auto,1fr,auto] gap-x-4 gap-y-4">
            {/* Pickup */}
            <div className="p-2 bg-[#22c55e] rounded-full h-fit mt-1">
              <MdLocationOn className="w-4 h-4 text-white" />
            </div>

            <div>
              <div className="text-sm text-gray-700 font-medium">Pickup Location</div>
              <div className="text-[#22c55e]">{route.pickup.location}</div>
            </div>

            <div>
              <div className="text-sm text-gray-700 font-medium">Pickup Time</div>
              <div className="text-[#22c55e]">{route.pickup.time}</div>
            </div>

            {/* Connecting line */}
            <div className="ml-[13px] w-0.5 h-6 bg-[#22c55e] opacity-30" />
            <div className="col-span-2" />

            {/* Deliveries */}
            {route.delivery.locations.map((location, index) => (
              <div key={index} className="contents">
                <div className="p-2 bg-[#22c55e] rounded-full h-fit mt-1">
                  <MdLocationOn className="w-4 h-4 text-white" />
                </div>

                <div>
                  <div className="text-sm text-gray-700 font-medium">
                    Delivery Location {index + 1}
                  </div>
                  <div className="text-[#22c55e]">{location}</div>
                </div>

                <div>
                  {index === 0 ? (
                    <>
                      <div className="text-sm text-gray-700 font-medium">Delivery Time</div>
                      <div className="text-[#22c55e]">{route.delivery.time}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic pt-1">—</div>
                  )}
                </div>

                {/* Line between deliveries */}
                {index !== route.delivery.locations.length - 1 && (
                  <>
                    <div className="ml-[13px] w-0.5 h-6 bg-[#22c55e] opacity-30" />
                    <div className="col-span-2" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

ExistingRoutes.displayName = "ExistingRoutes";

export default ExistingRoutes;
