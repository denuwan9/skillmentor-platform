import React from "react";
import { useAuth } from "@clerk/clerk-react";
import {
    Users,
    BookOpen,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    Activity,
    Clock,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminDashboardPage = () => {
    const { getToken } = useAuth();
    const [stats, setStats] = React.useState({
        totalBookings: 0,
        totalMentors: 0,
        totalSubjects: 0,
        totalStudents: 0,
        totalRevenue: 0,
    });
    const [recentBookings, setRecentBookings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getToken({ template: "skillmentor-auth" });
                if (!token) {
                    console.warn("No token retrieved from Clerk. Ensure 'skillmentor-auth' template exists.");
                    setLoading(false);
                    return;
                }
                const headers = { Authorization: `Bearer ${token}` };

                // Fetching all counts in parallel using Backticks (``)
                const responses = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/bookings`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/subjects`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/students`, { headers }),
                ]);

                const results = await Promise.all(responses.map(async (res) => {
                    if (!res.ok) {
                    
                        const errorText = await res.text();
                        throw new Error(`Backend error: ${res.status}`);
                    }
                    return res.json(); 
                }));

                const [bookings, mentors, subjects, students] = results;

                const bookingsArray = Array.isArray(bookings) ? bookings : [];
                const mentorsData = mentors.content || (Array.isArray(mentors) ? mentors : []);
                const subjectsData = Array.isArray(subjects) ? subjects : [];
                const studentsData = Array.isArray(students) ? students : [];

                // Calculation of revenue (assuming a flat rate)
                const confirmedBookings = bookingsArray.filter((b: any) => b.paymentStatus === "confirmed");
                const estimatedRevenue = confirmedBookings.length * 50;

                setRecentBookings(bookingsArray.slice(0, 5)); // Get last 5 bookings
                setStats({
                    totalBookings: bookingsArray.length,
                    totalMentors: mentorsData.length,
                    totalSubjects: subjectsData.length,
                    totalStudents: studentsData.length,
                    totalRevenue: estimatedRevenue,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [getToken]);

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            description: "Based on confirmed payments",
            icon: DollarSign,
            trend: "up",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            description: "Sessions scheduled so far",
            icon: CalendarCheck,
            trend: "up",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Active Mentors",
            value: stats.totalMentors,
            description: "Industry experts verified",
            icon: Users,
            trend: "neutral",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
        },
        {
            title: "Registered Students",
            value: stats.totalStudents,
            description: "Growing user base",
            icon: BookOpen,
            trend: "up",
            color: "text-violet-600",
            bgColor: "bg-violet-50",
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="animate-pulse text-slate-400 font-medium tracking-wide uppercase text-xs">Synchronizing Workspace...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time metrics and system health indicators.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, idx) => (
                    <Card key={idx} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className={`h-1 w-full ${card.bgColor.replace('50', '500')}`}></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-tight">{card.title}</CardTitle>
                            <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{card.value}</div>
                            <div className="flex items-center mt-2 text-xs font-medium">
                                {card.trend === "up" ? (
                                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mr-2">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        <span>Optimal</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md mr-2">
                                        <Activity className="w-3 h-3 mr-1" />
                                        <span>Stable</span>
                                    </div>
                                )}
                                <span className="text-slate-400">{card.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity Feed */}
                <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b bg-slate-50/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800">Recent Bookings</CardTitle>
                                <CardDescription>Latest system-wide interactions.</CardDescription>
                            </div>
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="divide-y divide-slate-100">
                            {recentBookings.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">No recent activity detected.</div>
                            ) : recentBookings.map((booking, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${booking.paymentStatus === "confirmed" ? "bg-emerald-100/50 text-emerald-600" : "bg-amber-100/50 text-amber-600"
                                        }`}>
                                        {booking.paymentStatus === "confirmed" ? <CreditCard className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 truncate">
                                                {booking.student?.firstName} {booking.student?.lastName}
                                            </span>
                                            <span className="text-slate-400 text-xs text-nowrap">booked {booking.mentor?.firstName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] font-medium h-4 bg-slate-50 border-slate-200">
                                                {booking.subject?.subjectName}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />
                                                {new Date(booking.sessionAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${booking.paymentStatus === "confirmed" ? "text-emerald-500" : "text-amber-500"
                                            }`}>
                                            {booking.paymentStatus}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="p-3 bg-slate-50/50 border-t text-center">
                        <button
                            onClick={() => window.location.href = '/admin/bookings'}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                        >
                            View All Operations →
                        </button>
                    </div>
                </Card>

                {/* System Stats / Tasks */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-indigo-600 text-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">System Health</CardTitle>
                                <TrendingUp className="w-5 h-5 text-indigo-200" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {[
                                { label: "API Gateway", status: "Optimal", color: "bg-emerald-500" },
                                { label: "DB Latency", status: "14ms", color: "bg-emerald-500" },
                                { label: "Auth Logic", status: "Active", color: "bg-indigo-500" },
                                { label: "CDN Status", status: "Global", color: "bg-emerald-500" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400">{item.status}</span>
                                        <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm shadow-emerald-200 animate-pulse`}></div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Quick Action</h3>
                            <p className="text-indigo-100 text-sm mb-4">You have {stats.totalMentors} verified mentors waiting for subject assignments.</p>
                            <button
                                onClick={() => window.location.href = '/admin/subjects'}
                                className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-50 transition-colors"
                            >
                                Assign Subjects
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
