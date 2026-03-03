import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { BookOpen, Plus, Trash2, Search, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

const subjectSchema = z.object({
    subjectName: z.string().min(3, "Subject name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    thumbnailUrl: z.string().url("Must be a valid URL"),
    mentorId: z.string().min(1, "Please select a mentor")
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const CreateSubjectPage = () => {
    const { getToken } = useAuth();
    const [mentors, setMentors] = React.useState<any[]>([]);
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            subjectName: "",
            description: "",
            thumbnailUrl: "",
            mentorId: ""
        }
    });

    const fetchData = React.useCallback(async () => {
        try {
            const token = await getToken({ template: "skillmentor-auth" });
            if (!token) {
                console.warn("No token retrieved from Clerk. Ensure 'skillmentor-auth' template exists.");
                toast.error("Authentication session missing. Please refresh.");
                setLoading(false);
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            const [mentorsRes, subjectsRes] = await Promise.all([
                fetch("http://localhost:8081/api/v1/mentors", { headers }),
                fetch("http://localhost:8081/api/v1/subjects", { headers })
            ]);

            const mentorsData = await mentorsRes.json();
            const subjectsData = await subjectsRes.json();

            setMentors(mentorsData.content || mentorsData);
            setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast.error("Failed to load existing data.");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onSubmit = async (values: SubjectFormValues) => {
        try {
            const token = await getToken({ template: "skillmentor-auth" });
            if (!token) {
                toast.error("Authentication session missing. Please refresh.");
                return;
            }
            const res = await fetch("http://localhost:8081/api/v1/subjects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    subjectName: values.subjectName,
                    description: values.description,
                    courseImageUrl: values.thumbnailUrl, // Map frontend thumbnailUrl to backend courseImageUrl
                    mentorId: Number(values.mentorId)
                })
            });

            if (res.ok) {
                toast.success("Subject created successfully!");
                form.reset();
                fetchData(); // Refresh list
            } else {
                toast.error("Failed to create subject. Please check your input.");
            }
        } catch (err) {
            console.error("Failed to create subject:", err);
            toast.error("A network error occurred.");
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mentor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Subject Management</h1>
                    <p className="text-slate-500">Create and organize learning categories across the platform.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    {subjects.length} Active Subjects
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Card className="lg:col-span-12 xl:col-span-5 border-slate-200 shadow-xl shadow-slate-200/50">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Plus className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">New Subject</span>
                        </div>
                        <CardTitle>Create Subject</CardTitle>
                        <CardDescription>Assign themes and experts to new curriculum items.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="subjectName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Advanced Java Programming" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mentorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign Lead Mentor</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select a mentor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {mentors.map(m => (
                                                        <SelectItem key={m.id} value={String(m.id)}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-slate-900">{m.firstName} {m.lastName}</span>
                                                                <span className="text-xs text-slate-500">{m.title}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="thumbnailUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cover Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://images.unsplash.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Define the scope and learning objectives..."
                                                    className="min-h-[100px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11">
                                    Launch Subject
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                            <Search className="w-4 h-4" />
                            Existing Subjects
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                placeholder="Search subjects..."
                                className="pl-9 h-9 text-sm bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Mentor</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-12 text-slate-400">Loading catalog...</TableCell></TableRow>
                                    ) : filteredSubjects.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-12 text-slate-400 italic">No subjects matching your search.</TableCell></TableRow>
                                    ) : filteredSubjects.map((subject) => (
                                        <TableRow key={subject.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                                        <img src={subject.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 line-clamp-1">{subject.subjectName}</span>
                                                        <span className="text-xs text-slate-500 line-clamp-1">{subject.description.substring(0, 40)}...</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                        <GraduationCap className="w-3 h-3 text-indigo-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {subject.mentor?.firstName} {subject.mentor?.lastName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-xs text-indigo-800 leading-relaxed">
                            <strong>Note:</strong> Subjects are visible to students on the landing page immediately after creation. Ensure the cover image URL is publicly accessible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSubjectPage;
