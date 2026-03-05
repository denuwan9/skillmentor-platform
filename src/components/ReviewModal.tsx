import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitReview } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
    mentorName: string;
    onSuccess: () => void;
}

export function ReviewModal({
    isOpen,
    onClose,
    sessionId,
    mentorName,
    onSuccess,
}: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getToken } = useAuth();

    const handleSubmit = async () => {
        if (rating < 1) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await getToken({ template: "skillmentor-auth" });
            if (!token) throw new Error("Not authenticated");

            await submitReview(token, sessionId, rating, review);
            toast.success("Review submitted! Thank you for your feedback.");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate your session</DialogTitle>
                    <DialogDescription>
                        How was your session with {mentorName}? Your feedback helps other students.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 text-center">Score</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <span className="text-sm font-medium text-slate-500">Service Feedback</span>
                        <Textarea
                            placeholder="What did you learn? What could be improved?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="resize-none h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Skip
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
