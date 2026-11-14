import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/components/pages/HomePage";
import { EventsPage } from "@/components/pages/EventsPage";
import { BookingPage } from "@/components/pages/BookingPage";
import { AdminMeetingsPage } from "@/components/pages/AdminMeetingsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-gray-50 to-orange-100">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/booking/:eventTypeId" element={<BookingPage />} />
        <Route path="/admin/meetings" element={<AdminMeetingsPage />} />
      </Routes>
    </div>
  );
}
