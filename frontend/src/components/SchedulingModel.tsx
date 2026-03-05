import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useNavigate } from "react-router";
import type { Mentor } from "@/types";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  selectedSubject?: any;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export function SchedulingModal({
  isOpen,
  onClose,
  mentor,
  selectedSubject,
}: SchedulingModalProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const navigate = useNavigate();

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const subject = selectedSubject || mentor.subjects?.[0];

  // Logic to determine if a time slot is in the past
  const isTimeInPast = (timeStr: string) => {
    if (!date) return false;
    const now = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < now;
  };

  const handleSchedule = () => {
    if (date && selectedTime && subject) {
      const sessionDateTime = new Date(date);
      const [hours, minutes] = selectedTime.split(":");
      sessionDateTime.setHours(
        Number.parseInt(hours),
        Number.parseInt(minutes),
        0,
        0
      );

      const mentorId = mentor.id || (typeof mentor.mentorId === 'number' ? mentor.mentorId : null);
      const subjectId = subject?.id;

      if (!mentorId || !subjectId) {
        console.error("Missing IDs for scheduling:", { mentorId, subjectId, mentor, subject });
      }

      const sessionId = `${mentorId || 'unknown'}-${Date.now()}`;
      const searchParams = new URLSearchParams({
        date: sessionDateTime.toISOString(),
        courseTitle: subject?.subjectName ?? "",
        mentorName: mentorName,
        mentorId: String(mentorId ?? ""),
        mentorImg: mentor.profileImageUrl ?? "",
        subjectId: String(subjectId ?? ""),
      });
      navigate(`/payment/${sessionId}?${searchParams.toString()}`);
    }
  };

  // Reset selected time if it becomes invalid when date changes
  useEffect(() => {
    if (selectedTime && isTimeInPast(selectedTime)) {
      setSelectedTime(undefined);
    }
  }, [date]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-start gap-1">
          <DialogTitle className="text-2xl">
            Book {subject?.subjectName}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Schedule your session with <span className="font-semibold text-slate-900">{mentorName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Choose a date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Choose a time</h4>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => {
                const isPast = isTimeInPast(time);
                return (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      isPast && "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
                    )}
                    onClick={() => !isPast && setSelectedTime(time)}
                    disabled={isPast}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date || !selectedTime || !subject}>
            Continue to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
