"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HabitTracker() {
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = useQuery(api.habits.getHabitEntry, { date: today });
  const logMorning = useMutation(api.habits.logMorning);
  const logEvening = useMutation(api.habits.logEvening);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if it's morning (before 1 PM) or evening
  const currentHour = new Date().getHours();
  const defaultIsMorning = currentHour < 13; // Before 1:00 PM
  const [isMorning, setIsMorning] = useState(defaultIsMorning);

  const [morningForm, setMorningForm] = useState({
    wakeTime: "",
    bodyWeight: "",
    sleepTime: "",
    previousDayScreenTime: "",
  });

  const [eveningForm, setEveningForm] = useState({
    featuresShipped: "",
    calories: "",
    protein: "",
    stepsCount: "",
  });

  useEffect(() => {
    if (todayEntry) {
      setMorningForm((prev) => ({
        ...prev,
        wakeTime: todayEntry.wakeTime?.toString() ?? "",
        bodyWeight: todayEntry.bodyWeight?.toString() ?? "",
        sleepTime: todayEntry.sleepTime?.toString() ?? "",
      }));
      setEveningForm({
        featuresShipped: todayEntry.featuresShipped?.toString() ?? "",
        calories: todayEntry.calories?.toString() ?? "",
        protein: todayEntry.protein?.toString() ?? "",
        stepsCount: todayEntry.stepsCount?.toString() ?? "",
      });
    }
  }, [todayEntry]);

  const handleMorningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!morningForm.wakeTime || !morningForm.bodyWeight || !morningForm.sleepTime || !morningForm.previousDayScreenTime) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting morning data:", morningForm);
      const result = await logMorning({
        wakeTime: parseInt(morningForm.wakeTime),
        bodyWeight: parseFloat(morningForm.bodyWeight),
        sleepTime: parseFloat(morningForm.sleepTime),
        previousDayScreenTime: parseFloat(morningForm.previousDayScreenTime),
      });
      console.log("Morning data saved:", result);
      setMorningForm((prev) => ({ ...prev, previousDayScreenTime: "" }));
    } catch (error) {
      console.error("Error logging morning data:", error);
      alert("Error saving morning data. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEveningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!eveningForm.featuresShipped || !eveningForm.calories || !eveningForm.protein || !eveningForm.stepsCount) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting evening data:", eveningForm);
      const result = await logEvening({
        featuresShipped: parseInt(eveningForm.featuresShipped),
        calories: parseFloat(eveningForm.calories),
        protein: parseFloat(eveningForm.protein),
        stepsCount: parseInt(eveningForm.stepsCount),
      });
      console.log("Evening data saved:", result);
    } catch (error) {
      console.error("Error logging evening data:", error);
      alert("Error saving evening data. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 max-w-md mx-auto w-full px-4">
      {isMorning ? (
        /* Morning */
        <form onSubmit={handleMorningSubmit} className="w-full space-y-4">
          <div className="flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => setIsMorning(false)}
              className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer"
            >
              Morning
            </button>
          </div>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Wake time (minutes since midnight)"
              value={morningForm.wakeTime}
              onChange={(e) =>
                setMorningForm((prev) => ({ ...prev, wakeTime: e.target.value }))
              }
              className="text-center"
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Weight (kg)"
              value={morningForm.bodyWeight}
              onChange={(e) =>
                setMorningForm((prev) => ({
                  ...prev,
                  bodyWeight: e.target.value,
                }))
              }
              className="text-center"
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Sleep (hours)"
              value={morningForm.sleepTime}
              onChange={(e) =>
                setMorningForm((prev) => ({
                  ...prev,
                  sleepTime: e.target.value,
                }))
              }
              className="text-center"
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Yesterday screen time (hours)"
              value={morningForm.previousDayScreenTime}
              onChange={(e) =>
                setMorningForm((prev) => ({
                  ...prev,
                  previousDayScreenTime: e.target.value,
                }))
              }
              className="text-center"
            />
          </div>
          <Button type="submit" variant="ghost" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      ) : (
        /* Evening */
        <form onSubmit={handleEveningSubmit} className="w-full space-y-4">
          <div className="flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => setIsMorning(true)}
              className="text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer"
            >
              Evening
            </button>
          </div>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Features shipped"
              value={eveningForm.featuresShipped}
              onChange={(e) =>
                setEveningForm((prev) => ({
                  ...prev,
                  featuresShipped: e.target.value,
                }))
              }
              className="text-center"
            />
            <Input
              type="number"
              placeholder="Calories"
              value={eveningForm.calories}
              onChange={(e) =>
                setEveningForm((prev) => ({
                  ...prev,
                  calories: e.target.value,
                }))
              }
              className="text-center"
            />
            <Input
              type="number"
              placeholder="Protein (g)"
              value={eveningForm.protein}
              onChange={(e) =>
                setEveningForm((prev) => ({
                  ...prev,
                  protein: e.target.value,
                }))
              }
              className="text-center"
            />
            <Input
              type="number"
              placeholder="Steps"
              value={eveningForm.stepsCount}
              onChange={(e) =>
                setEveningForm((prev) => ({
                  ...prev,
                  stepsCount: e.target.value,
                }))
              }
              className="text-center"
            />
          </div>
          <Button type="submit" variant="ghost" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      )}
    </div>
  );
}

