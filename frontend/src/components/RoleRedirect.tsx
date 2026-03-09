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

        const isAdmin =
            metadata?.role === "admin" ||
            metadata?.role === "ADMIN" ||
            (Array.isArray(metadata?.roles) && metadata.roles.includes("ADMIN"));

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
