import React from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Users,
  CalendarCheck,
  Menu
} from "lucide-react";
import logo from "@/assets/logo.webp";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  // Supports both singular `role` string and plural `roles` array in publicMetadata
  const publicMetadata = user?.publicMetadata as { role?: string; roles?: string[] } | undefined;
  const isAdmin =
    (publicMetadata?.role?.trim().toLowerCase() === "admin") ||
    (Array.isArray(publicMetadata?.roles) &&
      publicMetadata.roles.some(r => r.trim().toLowerCase() === "admin"));

  React.useEffect(() => {
    // Wait until Clerk has fully resolved the user before checking role
    if (!isLoaded) return;
    if (!user || !isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, user, isAdmin, navigate]);

  // Show spinner while Clerk is loading (prevents layout flash on non-admin redirect)
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Manage Bookings", icon: CalendarCheck, href: "/admin/bookings" },
    { label: "Create Mentor", icon: Users, href: "/admin/mentors" },
    { label: "Create Subject", icon: BookOpen, href: "/admin/subjects" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <img src={logo} alt="SkillMentor Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-xl tracking-tight">SkillMentor</span>
        </Link>
        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Admin Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            <img src={user.imageUrl} alt={user.fullName || ""} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <SignOutButton>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="w-64 border-r bg-white hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <aside className="w-full h-full bg-white flex flex-col border-none">
                    <SidebarContent />
                  </aside>
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-slate-800 truncate">Administrator Dashboard</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
