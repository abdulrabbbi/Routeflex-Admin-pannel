import DeliveriesTable from "./DeliveriesTable";

const CancelledDeliveries = () => {
  return <DeliveriesTable statusFilter="cancelled" />;
};

export default CancelledDeliveries;
