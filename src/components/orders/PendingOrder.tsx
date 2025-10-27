import React from "react";
import OrdersPage from "../../pages/OrdersPage"; // adjust path if needed

const PendingOrder = () => {
    return (<>
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold text-[#22c55e]">Pending Orders</h1>
        </div>
        <OrdersPage
            defaultStatus="available"
            defaultApprovalStatus="pending"
            hideFilters={true}
        />
    </>
    );
};

export default PendingOrder;
