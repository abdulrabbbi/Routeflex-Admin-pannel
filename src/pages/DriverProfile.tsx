import { useParams } from "react-router-dom";
import DriverProfileOverview from "../components/drivers/DriverProfileOverview";


export default function DriverProfile() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="min-h-screen bg-background p-6">
      {id ? <DriverProfileOverview /> : <p>Driver ID not found</p>}
    </main>
  );
}
