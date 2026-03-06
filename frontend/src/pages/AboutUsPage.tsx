import {
    Users,
    Target,
    Award,
    Lightbulb,
    ArrowRight,
    ShieldCheck,
    Zap,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AboutUsPage = () => {
    const stats = [
        { label: "Active Mentors", value: "250+", icon: Users },
        { label: "Successful Sessions", value: "10k+", icon: Zap },
        { label: "Subject Areas", value: "50+", icon: Target },
        { label: "Satisfaction Rate", value: "99%", icon: Award },
    ];

    const features = [
        {
            title: "Vetted Industry Experts",
            description: "Learn from professionals at Google, Microsoft, and leading tech companies who have been where you want to go.",
            icon: ShieldCheck,
            color: "bg-black text-white",
        },
        {
            title: "Personalized Roadmap",
            description: "Get a custom learning plan tailored to your career goals, current skill level, and learning pace.",
            icon: Target,
            color: "bg-primary text-black",
        },
        {
            title: "Real-world Projects",
            description: "Move beyond theory with hands-on projects that build your portfolio and demonstrate your expertise.",
            icon: Lightbulb,
            color: "bg-black text-white",
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <section className="relative py-20 bg-black text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-primary/20 to-transparent blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-linear-to-tr from-primary/10 to-transparent blur-3xl"></div>

                <div className="container relative z-10 px-4 md:px-6">
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                            Empowering the Next Generation of <span className="text-primary">Tech Leaders.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            SkillMentor is a premium mentorship platform designed to bridge the gap between academic learning and industry excellence. We connect ambitious students with world-class mentors.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <Button className="bg-primary text-black hover:bg-primary/90 px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 group border-none">
                                Begin Your Journey
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 -mt-10 relative z-20">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="border-none shadow-xl bg-white/90 backdrop-blur-md hover:scale-105 transition-transform duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-black">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 container px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-black text-xs font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            Our Mission
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            We believe quality mentorship should be <span className="text-primary underline decoration-black/10 underline-offset-8">accessible to everyone.</span>
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                            <p>
                                Founded in 2024, SkillMentor was born out of a simple observation: the most successful people in tech all had great mentors. But finding those mentors was often a matter of luck or networking.
                            </p>
                            <p>
                                Our mission is to democratize access to industry expertise. We've built a platform where students from any background can connect with mentors who work at the companies they dream of joining.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-3xl bg-black shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
                                alt="Our Team"
                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                            />
                        </div>
                        {/* Background elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-black/10 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse delay-700"></div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white border-y border-slate-100">
                <div className="container px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">Why Students Choose <span className="text-primary px-2 bg-black">SkillMentor</span></h2>
                        <p className="text-slate-500">We provide a premium experience that goes far beyond standard online courses.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 container px-4 md:px-6">
                <div className="bg-black rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Ready to transform your career?</h2>
                        <p className="text-slate-400 text-lg">Join thousands of students who have already accelerated their learning with SkillMentor.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button className="bg-primary text-black hover:bg-primary/90 px-8 py-7 rounded-2xl text-lg font-black shadow-xl shadow-primary/10 border-none">
                                Get Started Now
                            </Button>
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black px-8 py-7 rounded-2xl text-lg font-bold border-2 transition-all">
                                Browse All Tutors
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;
