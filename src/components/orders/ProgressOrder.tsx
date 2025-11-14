import React from "react";
import DeliveriesTable from "../../components/Order/CompeletedOrder/DeliveriesTables";

const ProgressOrder = () => {
  return (
    <>
      <DeliveriesTable statusFilter="in-progress" />
    </>
  );
};

export default ProgressOrder;
