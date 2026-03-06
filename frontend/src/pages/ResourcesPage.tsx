import { useState } from "react";
import {
    Search,
    BookOpen,
    Code,
    Briefcase,
    ChevronRight,
    Filter,
    Layers,
    Sparkles,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ResourcesPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Career Guides", "Technical Docs", "Interview Prep", "Industry Reports"];

    const resources = [
        {
            title: "Full-Stack Developer Roadmap 2024",
            description: "A comprehensive guide to mastering modern web development from frontend to backend.",
            category: "Technical Docs",
            type: "PDF Guide",
            icon: Code,
            color: "text-black",
            bgColor: "bg-primary",
        },
        {
            title: "Cracking the Tech Interview",
            description: "Proven strategies and practice questions for landing offers at Tier-1 tech companies.",
            category: "Interview Prep",
            type: "E-Book",
            icon: Briefcase,
            color: "text-primary",
            bgColor: "bg-black text-primary",
        },
        {
            title: "System Design Essentials",
            description: "Master the art of building scalable, distributed systems for high-traffic applications.",
            category: "Technical Docs",
            type: "Video Series",
            icon: Layers,
            color: "text-black",
            bgColor: "bg-primary",
        },
        {
            title: "2024 Software Industry Trends",
            description: "An in-depth look at AI integration, remote work, and salary benchmarks for the coming year.",
            category: "Industry Reports",
            type: "Report",
            icon: Sparkles,
            color: "text-primary",
            bgColor: "bg-black text-primary",
        },
        {
            title: "Resume Building for Engineers",
            description: "ATS-friendly templates and tips to make your profile stand out to recruiters.",
            category: "Career Guides",
            type: "Toolbox",
            icon: BookOpen,
            color: "text-black",
            bgColor: "bg-primary",
        },
        {
            title: "Effective Communication for Lead roles",
            description: "Soft skills training for senior engineers transitioning into leadership and management.",
            category: "Career Guides",
            type: "Workshop",
            icon: Users,
            color: "text-primary",
            bgColor: "bg-black text-primary",
        },
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || resource.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <section className="bg-white border-b border-slate-100 py-16">
                <div className="container px-4 md:px-6">
                    <div className="max-w-3xl space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Knowledge Hub & <span className="text-primary px-2 bg-black">Resources</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                            Accelerate your growth with our curated selection of technical guides, career playbooks, and industry insights, all designed to complement your mentorship.
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="sticky top-14 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search resources, guides, or skills..."
                                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-primary/20 transition-all rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0 hidden sm:block" />
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                        ? "bg-black text-primary shadow-lg shadow-black/10"
                                        : "text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12 flex-1">
                <div className="container px-4 md:px-6">
                    {filteredResources.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredResources.map((resource, idx) => (
                                <Card key={idx} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden flex flex-col bg-white">
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-4 rounded-2xl ${resource.bgColor} ${resource.color} group-hover:scale-110 transition-transform duration-300`}>
                                                <resource.icon className="w-8 h-8" />
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-[10px] py-1 border-none">
                                                {resource.type}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                {resource.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                                {resource.category}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {resource.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t border-slate-50 bg-slate-50/50">
                                        <Button variant="ghost" className="w-full text-black font-black text-xs uppercase tracking-widest hover:text-primary hover:bg-black p-0 flex items-center justify-between px-4 h-10 rounded-xl transition-all">
                                            Access Resource
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white rounded-[3rem] shadow-inner shadow-slate-100 border border-slate-50">
                            <div className="p-6 bg-slate-50 rounded-full text-slate-400">
                                <Search className="w-12 h-12" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
                                <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                                className="mt-4 rounded-xl border-slate-200 hover:bg-black hover:text-primary transition-all"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container px-4 md:px-6">
                    <div className="bg-black rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="max-w-xl space-y-4 text-center md:text-left relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Stay ahead of the <span className="text-primary">tech curve.</span></h2>
                            <p className="text-slate-400 text-lg">Subscribe to our weekly newsletter for the latest resources, mentor spotlights, and career opportunities.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 relative z-10">
                            <Input
                                placeholder="Enter your email"
                                className="h-14 md:w-80 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:bg-white/20 focus:ring-primary/20 transition-all rounded-2xl"
                            />
                            <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 border-none">
                                Join Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResourcesPage;
