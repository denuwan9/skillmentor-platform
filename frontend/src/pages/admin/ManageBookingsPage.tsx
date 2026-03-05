import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Video,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Clock
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const ManageBookingsPage = () => {
    const { getToken } = useAuth();
    const [bookings, setBookings] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    // Sort State
    const [sortKey, setSortKey] = React.useState("sessionAt");
    const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Dialog State
    const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
    const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
    const [meetingLink, setMeetingLink] = React.useState("");

    const formatStatus = (s: string) => {
        if (!s) return "";
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };

    const fetchBookings = React.useCallback(async () => {
        try {
            const token = await getToken({ template: "skillmentor-auth" });
            if (!token) {
                console.warn("No token retrieved from Clerk. Ensure 'skillmentor-auth' template exists.");
                toast.error("Authentication session missing. Please refresh.");
                setLoading(false);
                return;
            }
            const res = await fetch("http://localhost:8081/api/v1/admin/bookings", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    React.useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleUpdateStatus = async (id: number, type: "payment" | "session" | "link", value?: string) => {
        let endpoint = "";
        let body: any = null;
        let method = "PUT";

        if (type === "payment") endpoint = "confirm-payment";
        else if (type === "session") endpoint = "complete";
        else if (type === "link") {
            endpoint = "meeting-link";
            body = value;
            method = "PUT";
        }

        try {
            const token = await getToken({ template: "skillmentor-auth" });
            if (!token) {
                toast.error("You must be logged in to perform this action.");
                return;
            }
            const res = await fetch(`http://localhost:8081/api/v1/admin/bookings/${id}/${endpoint}`, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: body ? JSON.stringify(body) : undefined
            });

            if (res.ok) {
                const updated = await res.json();
                setBookings(prev => prev.map(b => b.id === id ? updated : b));
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
                if (type === "link") setIsLinkDialogOpen(false);
            } else {
                toast.error(`Failed to update ${type}. Please try again.`);
            }
        } catch (err) {
            console.error(`Failed to update ${type}:`, err);
            toast.error("A network error occurred.");
        }
    };

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    // 1. Filter
    const filtered = bookings.filter(b => {
        const studentName = `${b.student?.firstName || ""} ${b.student?.lastName || ""}`.toLowerCase();
        const mentorName = `${b.mentor?.firstName || ""} ${b.mentor?.lastName || ""}`.toLowerCase();
        const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || mentorName.includes(searchTerm.toLowerCase());

        // Status Filter
        let matchesStatus = true;
        const bStatus = (b.sessionStatus || "").toLowerCase();
        const pStatus = (b.paymentStatus || "").toLowerCase();

        if (statusFilter === "pending") matchesStatus = pStatus === "pending";
        else if (statusFilter === "confirmed") matchesStatus = pStatus === "confirmed";
        else if (statusFilter === "completed") matchesStatus = bStatus === "completed";

        let matchesDate = true;
        const bDate = new Date(b.sessionAt);
        if (startDate) matchesDate = matchesDate && bDate >= new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && bDate <= end;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // 2. Sort
    const sorted = [...filtered].sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Handling nested objects for sorting if needed (e.g., student name)
        if (sortKey === "student") {
            valA = a.student?.firstName || "";
            valB = b.student?.firstName || "";
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // 3. Paginate
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
                    <p className="text-slate-500 text-sm">Monitor system-wide mentoring sessions and payments.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-6">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by student or mentor name..."
                        className="pl-10 border-none bg-slate-50 shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[50px]">Status</span>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Payment</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[40px]">Date</span>
                    <div className="flex gap-1 items-center w-full">
                        <Input
                            type="date"
                            className="h-10 text-xs bg-slate-50 border-none px-2"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-300">-</span>
                        <Input
                            type="date"
                            className="h-10 text-xs bg-slate-50 border-none px-2"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {/* Bookings Table - Scrollable Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort("id")}>
                                    <div className="flex items-center gap-2">ID <ArrowUpDown className="w-3 h-3" /></div>
                                </TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Mentor</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort("sessionAt")}>
                                    <div className="flex items-center gap-2">Date / Time <ArrowUpDown className="w-3 h-3" /></div>
                                </TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-20 animate-pulse text-slate-400 font-medium">Loading bookings...</TableCell></TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-20 text-slate-400 italic">No matching bookings found.</TableCell></TableRow>
                            ) : paginated.map((booking) => (
                                <TableRow key={booking.id} className="group hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-400">#{booking.id}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{booking.student?.firstName} {booking.student?.lastName}</TableCell>
                                    <TableCell className="text-slate-600">{booking.mentor?.firstName} {booking.mentor?.lastName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal bg-slate-50 border-slate-200">
                                            {booking.subject?.subjectName}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="font-medium text-slate-700">{new Date(booking.sessionAt).toLocaleDateString()}</div>
                                        <div className="text-xs text-slate-400">{new Date(booking.sessionAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-sm">{booking.durationMinutes || 60}m</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={(booking.sessionStatus || "").toLowerCase() === "completed"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-medium px-2.5 py-0.5"
                                            : "bg-blue-50 text-blue-700 border-blue-200/50 font-medium px-2.5 py-0.5"}>
                                            {formatStatus(booking.sessionStatus || "")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={(booking.paymentStatus || "").toLowerCase() === "confirmed"
                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200/50 font-medium px-2.5 py-0.5"
                                            : "bg-amber-50 text-amber-700 border-amber-200/50 font-medium px-2.5 py-0.5"}>
                                            {formatStatus(booking.paymentStatus || "")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {(booking.paymentStatus || "").toLowerCase() === "pending" && (
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold bg-white hover:bg-slate-50 border-slate-200" onClick={() => handleUpdateStatus(booking.id, "payment")}>
                                                    Verify
                                                </Button>
                                            )}
                                            {(booking.sessionStatus || "").toLowerCase() === "scheduled" && (booking.paymentStatus || "").toLowerCase() === "confirmed" && (
                                                <>
                                                    <Button size="sm" variant="outline" className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setMeetingLink(booking.meetingLink || "");
                                                            setIsLinkDialogOpen(true);
                                                        }}>
                                                        <Video className="w-3 h-3 mr-1" />
                                                        Link
                                                    </Button>
                                                    <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleUpdateStatus(booking.id, "session")}>
                                                        Complete
                                                    </Button>
                                                </>
                                            )}
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-4 bg-slate-50/50 border-t">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-900">{paginated.length}</span> of <span className="font-medium text-slate-900">{sorted.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center px-4 text-sm font-medium">
                                Page {currentPage} of {Math.max(1, totalPages)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Meeting Link Dialog */}
                <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Set Meeting Link</DialogTitle>
                            <DialogDescription>
                                Provided a video conference link for this session between <span className="font-semibold text-slate-900">{selectedBooking?.student?.firstName}</span> and <span className="font-semibold text-slate-900">{selectedBooking?.mentor?.firstName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meeting URL</label>
                                <Input
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    className="bg-slate-50"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleUpdateStatus(selectedBooking?.id, "link", meetingLink)}>
                                Save Link
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ManageBookingsPage;
