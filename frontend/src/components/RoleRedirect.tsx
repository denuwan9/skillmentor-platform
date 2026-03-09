import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";

/**
 * RoleRedirect
 *
 * Drop this component inside any route that should be reached only
 * immediately after sign-in (e.g. a `/redirect` splash route).
 *
 * Behaviour:
 *  - Waits until Clerk has finished loading the user object.
 *  - If role === "admin"  → /admin/dashboard
 *  - Otherwise            → /dashboard   (students, mentors, unauthenticated)
 *
 * Usage in App.tsx:
 *   <Route path="/redirect" element={<RoleRedirect />} />
 *
 * Then set Clerk's `afterSignInUrl` / `afterSignUpUrl` to "/redirect".
 */
const RoleRedirect = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait until Clerk has resolved the session
        if (!isLoaded) return;

        const metadata = user?.publicMetadata as
            | { role?: string; roles?: string[] }
            | undefined;

        // DEBUG: open browser console to see exactly what Clerk returns
        console.log("[RoleRedirect] publicMetadata:", metadata);
        console.log("[RoleRedirect] role value:", metadata?.role);

        // Trim and lowercase for a case-insensitive, whitespace-safe comparison
        const role = (metadata?.role as string | undefined)?.trim().toLowerCase();

        const isAdmin =
            role === "admin" ||
            (Array.isArray(metadata?.roles) &&
                metadata.roles.some((r) => r.trim().toLowerCase() === "admin"));

        console.log("[RoleRedirect] isAdmin:", isAdmin);

        if (isAdmin) {
            navigate("/admin", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
    }, [isLoaded, user, navigate]);

    // Render nothing — this component only exists to redirect
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Signing you in…</p>
            </div>
        </div>
    );
};

export default RoleRedirect;
