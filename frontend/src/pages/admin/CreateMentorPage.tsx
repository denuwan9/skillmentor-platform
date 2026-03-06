import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    Check,
    ChevronRight,
    ExternalLink,
    Eye,
    Search,
    Edit2,
    X,
    Users,
    Mail,
    Building2,
    Briefcase,
    Plus,
    Clock,
    Trash2
} from "lucide-react";
import { MentorCard } from "@/components/MentorCard";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const mentorSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    title: z.string().min(2, "Title is required"),
    profession: z.string().min(2, "Profession is required"),
    company: z.string().min(2, "Company is required"),
    experienceYears: z.number().min(0, "Experience years must be a positive number"),
    bio: z.string().min(20, "Bio must be at least 20 characters"),
    profileImageUrl: z.string().url("Invalid image URL").or(z.string().length(0)),
    isCertified: z.boolean(),
    startYear: z.string().min(4, "Start year is required"),
    skills: z.string().optional(),
    experienceHighlights: z.string().optional()
});

type MentorFormValues = z.infer<typeof mentorSchema>;

const CreateMentorPage = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    // List State
    const [mentors, setMentors] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Edit State
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [createdMentorId, setCreatedMentorId] = React.useState<number | null>(null);
    const [editingMentorId, setEditingMentorId] = React.useState<number | null>(null);

    const form = useForm<MentorFormValues>({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            title: "",
            profession: "",
            company: "",
            experienceYears: 0,
            profileImageUrl: "",
            isCertified: false,
            startYear: new Date().getFullYear().toString(),
            skills: "",
            experienceHighlights: ""
        },
    });

    // Reset to user defaults on mount if not editing
    React.useEffect(() => {
        if (!editingMentorId && user && !form.getValues("title")) { // Only reset if not editing and form is emptyish
            form.reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.primaryEmailAddress?.emailAddress || "",
                phoneNumber: "",
                title: "",
                profession: "",
                company: "",
                experienceYears: 0,
                bio: "",
                profileImageUrl: user.imageUrl || "",
                isCertified: false,
                startYear: new Date().getFullYear().toString(),
                skills: "",
                experienceHighlights: ""
            });
        }
    }, [user, editingMentorId, form]);

    const fetchMentors = React.useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors`);
            const data = await res.json();
            setMentors(data.content || data);
        } catch (err) {
            console.error("Failed to fetch mentors:", err);
            toast.error("Failed to load mentor list.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    const watchedValues = form.watch();

    // Mock mentor for preview
    const previewMentor = {
        id: editingMentorId || 0,
        mentorId: editingMentorId ? String(editingMentorId) : "preview",
        ...watchedValues,
        positiveReviews: 100,
        totalEnrollments: 0,
        subjects: []
    };

    const handleEdit = (mentor: any) => {
        setEditingMentorId(mentor.id);
        form.reset({
            firstName: mentor.firstName || "",
            lastName: mentor.lastName || "",
            email: mentor.email || "",
            phoneNumber: mentor.phoneNumber || "",
            title: mentor.title || "",
            profession: mentor.profession || "",
            company: mentor.company || "",
            experienceYears: Number(mentor.experienceYears) || 0,
            bio: mentor.bio || "",
            profileImageUrl: mentor.profileImageUrl || "",
            isCertified: !!mentor.isCertified,
            startYear: String(mentor.startYear || ""),
            skills: Array.isArray(mentor.skills) ? mentor.skills.join(", ") : "",
            experienceHighlights: Array.isArray(mentor.experienceHighlights) ? mentor.experienceHighlights.join(", ") : "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editing ${mentor.firstName}'s profile`);
    };

    const handleDelete = async (mentor: any) => {
        if (!window.confirm(`Are you sure you want to remove ${mentor.firstName} ${mentor.lastName} as a mentor? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = await getToken({ template: "skillmentor-auth" });
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors/${mentor.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast.success("Mentor removed successfully.");
                fetchMentors();
                if (editingMentorId === mentor.id) {
                    cancelEdit();
                }
            } else {
                toast.error("Failed to delete mentor.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("A network error occurred.");
        }
    };

    const cancelEdit = () => {
        setEditingMentorId(null);
        form.reset({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.primaryEmailAddress?.emailAddress || "",
            phoneNumber: "",
            title: "",
            profession: "",
            company: "",
            experienceYears: 0,
            bio: "",
            profileImageUrl: user?.imageUrl || "",
            isCertified: false,
            startYear: new Date().getFullYear().toString(),
            skills: "",
            experienceHighlights: ""
        });
    };

    const onSubmit = async (values: MentorFormValues) => {
        try {
            const token = await getToken({ template: "skillmentor-auth" });
            const url = editingMentorId
                ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors/${editingMentorId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors`;

            const res = await fetch(url, {
                method: editingMentorId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...values,
                    skills: values.skills ? values.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
                    experienceHighlights: values.experienceHighlights ? values.experienceHighlights.split(",").map(h => h.trim()).filter(Boolean) : []
                })
            });
            const data = await res.json();

            if (res.ok) {
                if (editingMentorId) {
                    toast.success("Mentor profile updated successfully!");
                    setEditingMentorId(null);
                    fetchMentors();
                    form.reset();
                } else {
                    setCreatedMentorId(data.id);
                    setIsSubmitted(true);
                    fetchMentors();
                }
            } else {
                toast.error(data.message || "Operation failed.");
            }
        } catch (err) {
            console.error("Failed to save mentor:", err);
            toast.error("A network error occurred.");
        }
    };

    const filteredMentors = mentors.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profession?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isSubmitted) {
        return (
            <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in duration-500">
                <Card className="text-center p-8 border-emerald-100 bg-emerald-50/10">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <CardTitle className="text-3xl">Mentor Registered!</CardTitle>
                        <CardDescription className="text-lg">
                            {watchedValues.firstName} {watchedValues.lastName} has been successfully granted the mentor role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-500">
                            The mentor profile is now active and can be seen by students looking for {watchedValues.profession} experts.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Another
                            </Button>
                            <Button onClick={() => window.open(`/mentors/${createdMentorId}`, '_blank')} className="bg-indigo-600 gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {editingMentorId ? "Edit Mentor Profile" : "Add New Mentor"}
                    </h1>
                    <p className="text-slate-500">
                        {editingMentorId ? "Update professional details for an existing expert." : "Register a new expert or upgrade an existing user's privileges."}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {editingMentorId && (
                        <Button variant="ghost" onClick={cancelEdit} className="text-slate-500 gap-2">
                            <X className="w-4 h-4" />
                            Cancel Edit
                        </Button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        <Users className="w-4 h-4" />
                        {mentors.length} Verified Mentors
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Section */}
                <div className="lg:col-span-7 space-y-8">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle>{editingMentorId ? "Modify Credentials" : "Mentor Details"}</CardTitle>
                            <CardDescription>Fill in the professional profile information.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...(form as any)}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="firstName" render={({ field }) => (
                                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (
                                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="+1..." {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    {/* Professional Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Professional Profile</h3>
                                        <FormField control={form.control} name="title" render={({ field }) => (
                                            <FormItem><FormLabel>Professional Title</FormLabel><FormControl><Input placeholder="Senior Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="profession" render={({ field }) => (
                                                <FormItem><FormLabel>Profession</FormLabel><FormControl><Input placeholder="Engineering" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="company" render={({ field }) => (
                                                <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Tech Corp" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="experienceYears" render={({ field }) => (
                                                <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="startYear" render={({ field }) => (
                                                <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input placeholder="2020" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="bio" render={({ field }) => (
                                            <FormItem><FormLabel>Professional Bio</FormLabel><FormControl><Textarea placeholder="Share expertise and experience..." className="h-32 resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />

                                        <FormField control={form.control} name="skills" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Skills / Specializations (Comma separated)</FormLabel>
                                                <FormControl><Input placeholder="React, Java, Cloud Architecture..." {...field} /></FormControl>
                                                <p className="text-[10px] text-slate-400">These will appear as badges on the profile.</p>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="experienceHighlights" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experience Highlights (Comma separated)</FormLabel>
                                                <FormControl><Input placeholder="10+ Projects led, 5 years at Google..." {...field} /></FormControl>
                                                <p className="text-[10px] text-slate-400">Key achievements to showcase expertise.</p>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Media & Certs */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Verification & Media</h3>
                                        <FormField control={form.control} name="profileImageUrl" render={({ field }) => (
                                            <FormItem><FormLabel>Profile Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="isCertified" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Certified Mentor</FormLabel>
                                                    <p className="text-xs text-slate-500">Check this if the mentor has verified credentials or certifications.</p>
                                                </div>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <Button type="submit" size="lg" className={`w-full ${editingMentorId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white shadow-md transition-colors h-12`}>
                                        {editingMentorId ? "Update Mentor Profile" : "Grant Mentor Access"}
                                        <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Mentor List Section */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/30 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Registered Mentors</CardTitle>
                                    <CardDescription>Click edit to update existing profiles.</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search mentors..."
                                        className="pl-9 bg-white border-slate-200"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mentor</TableHead>
                                        <TableHead>Profession</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Loading directory...</TableCell></TableRow>
                                    ) : filteredMentors.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">No mentors found matching your search.</TableCell></TableRow>
                                    ) : filteredMentors.map((m) => (
                                        <TableRow key={m.id} className={`${editingMentorId === m.id ? 'bg-indigo-50/50' : 'group hover:bg-slate-50'}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                        <img src={m.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} alt="" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 leading-tight">{m.firstName} {m.lastName}</span>
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                            <Mail className="w-2.5 h-2.5" />
                                                            {m.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-700">{m.profession}</span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <Building2 className="w-2.5 h-2.5" />
                                                        {m.company}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={m.isCertified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                                                    {m.isCertified ? "Certified" : "Standard"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(m)}
                                                        className={`h-8 w-8 p-0 ${editingMentorId === m.id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(m)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-5 sticky top-8 space-y-6">
                    <div className="flex items-center justify-between text-slate-500 font-medium px-1">
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Live Preview
                        </div>
                        {editingMentorId && <Badge className="bg-amber-500 uppercase tracking-widest text-[10px] font-black">Edit Mode</Badge>}
                    </div>

                    <div className={`${editingMentorId ? 'ring-2 ring-amber-500 ring-offset-4 rounded-xl' : ''} transition-all duration-300`}>
                        <div className="scale-95 origin-top opacity-90 hover:opacity-100 transition-opacity">
                            <MentorCard mentor={previewMentor as any} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <span className="text-amber-600 font-bold text-xs">!</span>
                            </div>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                <strong>Note:</strong> Changes requested in Edit mode will overwrite the existing mentor profile data in the database.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                <Clock className="w-4 h-4 text-slate-400 mb-1" />
                                <span className="text-[10px] uppercase font-bold text-slate-400">Years</span>
                                <span className="text-sm font-bold text-slate-700">{watchedValues.experienceYears}+</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                <Briefcase className="w-4 h-4 text-slate-400 mb-1" />
                                <span className="text-[10px] uppercase font-bold text-slate-400">Industry</span>
                                <span className="text-sm font-bold text-slate-700 truncate w-full">{watchedValues.profession || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMentorPage;
