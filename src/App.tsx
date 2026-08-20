import { BrowserRouter, Route, Routes } from "react-router-dom";
import Topbar from "@/components/Topbar";
import InfluencerProfile from "@/routes/InfluencerProfile";
import EmptyState from "@/components/EmptyState";

function NotAvailable() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
      <EmptyState
        title="Page not available"
        body="This site only serves individual creator trust profiles."
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Routes>
        <Route path="/influencers/:handle" element={<InfluencerProfile />} />
        <Route path="*" element={<NotAvailable />} />
      </Routes>
    </BrowserRouter>
  );
}
