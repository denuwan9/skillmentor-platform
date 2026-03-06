import React from "react";
import { useParams, Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Award,
    Briefcase,
    Star,
    Calendar,
    ChevronLeft,
    Users,
    GraduationCap,
    Lightbulb
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchedulingModal } from "@/components/SchedulingModel";

const MentorProfilePage = () => {
    const { mentorId } = useParams();
    const [mentor, setMentor] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isSchedulingOpen, setIsSchedulingOpen] = React.useState(false);
    const [selectedSubject, setSelectedSubject] = React.useState<any>(null);

    React.useEffect(() => {
        // Fetch mentor details from the NEW public profile endpoint
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors/${mentorId}/profile`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then(data => {
                // Ensure the numeric ID is available in the object
                if (!data.id && mentorId) {
                    data.id = Number(mentorId);
                }
                setMentor(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch mentor profile:", err);
                setLoading(false);
            });
    }, [mentorId]);

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading profile...</div>;
    if (!mentor) return <div className="text-center py-20">Mentor not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Mentors
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-50/50 to-white">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-2xl bg-slate-200 overflow-hidden shadow-lg">
                                        <img src={mentor.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.firstName}`} alt={mentor.firstName} className="w-full h-full object-cover" />
                                    </div>
                                    {mentor.isCertified && (
                                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mentor.firstName} {mentor.lastName}</h1>
                                            {mentor.isCertified && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 uppercase text-[10px] tracking-wider font-bold">Certified Mentor</Badge>}
                                        </div>
                                        <p className="text-lg text-slate-600 font-medium">{mentor.title} at {mentor.company}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{mentor.experienceYears} Years Experience</div>
                                        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" />{mentor.averageRating?.toFixed(1) || "0.0"} ({mentor.totalReviews || 0} reviews)</div>
                                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Since {mentor.startYear || "2024"}</div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button onClick={() => {
                                            setSelectedSubject(mentor.subjects?.[0]);
                                            setIsSchedulingOpen(true);
                                        }}>Book Session</Button>
                                        <Button variant="outline">Message</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="about" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1">
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="subjects">Subjects Taught</TabsTrigger>
                            <TabsTrigger value="reviews">Student Reviews</TabsTrigger>
                        </TabsList>
                        <TabsContent value="about" className="mt-6 space-y-6">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader><CardTitle className="text-xl">Biography</CardTitle></CardHeader>
                                <CardContent><p className="text-slate-600 leading-relaxed whitespace-pre-line">{mentor.bio}</p></CardContent>
                            </Card>

                            {mentor.experienceHighlights && mentor.experienceHighlights.length > 0 && (
                                <Card className="border-slate-100 shadow-sm">
                                    <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Career Highlights</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {mentor.experienceHighlights.map((highlight: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-slate-100 shadow-sm">
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700"><GraduationCap className="w-4 h-4" /> Expertise</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm text-slate-600">{mentor.profession}</p></CardContent>
                                </Card>
                                <Card className="border-slate-100 shadow-sm">
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700"><Award className="w-4 h-4" /> Key Skills</CardTitle></CardHeader>
                                    <CardContent className="flex flex-wrap gap-2">
                                        {(mentor.skills && mentor.skills.length > 0) ? (
                                            mentor.skills.map((skill: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 border-none">{skill}</Badge>
                                            ))
                                        ) : (
                                            mentor.subjects?.map((s: any) => (<Badge key={s.id} variant="outline" className="text-slate-500">{s.subjectName}</Badge>))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="subjects" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mentor.subjects?.map((subject: any) => (
                                    <Card key={subject.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-40 bg-slate-100 relative">
                                            <img src={subject.courseImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"} alt={subject.subjectName} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-2 right-2"><Badge className="bg-white/90 text-slate-900 border-none backdrop-blur-sm">{subject.enrollmentCount || 0} Enrolled</Badge></div>
                                        </div>
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                                            <CardDescription className="line-clamp-2">{subject.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <Button variant="secondary" className="w-full" onClick={() => {
                                                setSelectedSubject(subject);
                                                setIsSchedulingOpen(true);
                                            }}>Schedule Subject</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-6">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader><CardTitle>What Students Say</CardTitle><CardDescription>Verified reviews from completed sessions</CardDescription></CardHeader>
                                <CardContent className="space-y-6">
                                    {mentor.reviews && mentor.reviews.length > 0 ? (
                                        mentor.reviews.map((review: any, idx: number) => (
                                            <div key={idx} className="space-y-2 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-semibold text-slate-900">{review.studentName}</div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed italic">"{review.reviewText}"</p>
                                                <div className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No reviews yet. Be the first to rate this mentor!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-100 shadow-xl overflow-hidden">
                        <div className="bg-indigo-600 p-6 text-white text-center"><p className="text-indigo-100 text-sm font-medium mb-1">Impact Overview</p><h3 className="text-2xl font-bold">Mentorship Stats</h3></div>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                <div className="p-6 flex items-center justify-between"><span className="text-slate-600 font-medium">Students Taught</span><span className="text-2xl font-bold text-slate-900">{mentor.totalEnrollments || 0}</span></div>
                                <div className="p-6 flex items-center justify-between"><span className="text-slate-600 font-medium">Avg. Rating</span><div className="flex items-center gap-1"><span className="text-2xl font-bold text-slate-900">{mentor.averageRating?.toFixed(1) || "0.0"}</span><Star className="w-4 h-4 text-amber-500 fill-amber-500" /></div></div>
                                <div className="p-6 flex items-center justify-between"><span className="text-slate-600 font-medium">Positive Reviews</span><span className="text-2xl font-bold text-slate-900">{mentor.totalReviews > 0 ? `${mentor.positiveReviews}%` : "No reviews"}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SchedulingModal
                isOpen={isSchedulingOpen}
                onClose={() => setIsSchedulingOpen(false)}
                mentor={mentor}
                selectedSubject={selectedSubject}
            />
        </div>
    );
};

export default MentorProfilePage;
