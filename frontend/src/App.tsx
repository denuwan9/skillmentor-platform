import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import MentorProfilePage from "@/pages/MentorProfilePage";
import AdminLayout from "@/components/AdminLayout";
import ManageBookingsPage from "@/pages/admin/ManageBookingsPage";
import CreateSubjectPage from "@/pages/admin/CreateSubjectPage";
import CreateMentorPage from "@/pages/admin/CreateMentorPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AboutUsPage from "@/pages/AboutUsPage";
import ResourcesPage from "@/pages/ResourcesPage";
import RoleRedirect from "@/components/RoleRedirect";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/mentors/:mentorId" element={<MentorProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/payment/:sessionId"
            element={
              <>
                <SignedIn>
                  <PaymentPage />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="bookings" element={<ManageBookingsPage />} />
            <Route path="mentors" element={<CreateMentorPage />} />
            <Route path="subjects" element={<CreateSubjectPage />} />
          </Route>

          {/* Post-login role-based redirect — set Clerk's afterSignInUrl to "/redirect" */}
          <Route
            path="/redirect"
            element={
              <>
                <SignedIn>
                  <RoleRedirect />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />

          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
