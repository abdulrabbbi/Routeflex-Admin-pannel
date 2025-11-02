import React from "react";
import OrdersPage from "../../pages/OrdersPage"; // adjust path if needed

const ProgressOrder = () => {
    return (<>
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold text-[#22c55e]">In Progress Orders</h1>
        </div>
        <OrdersPage
            defaultStatus="in-progress"
            defaultApprovalStatus="approved"
            hideFilters={true}
        />
    </>
    );
};

export default ProgressOrder;
