import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown,
  ImagePlus, X, Clock, Check, GripVertical, Camera,
} from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";
import { loadSchedules, saveSchedules, Schedule, ScheduleStep } from "./schedule";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function StepCard({
  step,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  step: ScheduleStep;
  index: number;
  total: number;
  onChange: (updated: ScheduleStep) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ ...step, imageDataUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Step header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="text-primary text-xs font-bold">{index + 1}</span>
        </div>
        <input
          type="text"
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="Step name (e.g. Wake up, Breakfast…)"
          className="flex-1 bg-transparent text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none"
        />
        {/* Reorder */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="w-6 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="w-6 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Image area */}
        <div
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
            ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-secondary/50"}
            ${step.imageDataUrl ? "border-solid border-primary/20 bg-transparent" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {step.imageDataUrl ? (
            <div className="relative">
              <img
                src={step.imageDataUrl}
                alt={step.title}
                className="w-full h-40 object-cover rounded-xl"
              />
              <button
                onClick={() => onChange({ ...step, imageDataUrl: undefined })}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium transition"
              >
                <Camera className="w-3 h-3" />
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center py-7 gap-3 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Tap to add a picture</p>
                <p className="text-xs text-muted-foreground mt-0.5">or drag & drop an image here</p>
              </div>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Optional time */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            type="time"
            value={step.time ?? ""}
            onChange={(e) => onChange({ ...step, time: e.target.value || undefined })}
            className="text-sm text-muted-foreground bg-transparent focus:outline-none focus:text-foreground transition"
          />
          {step.time && (
            <button
              onClick={() => onChange({ ...step, time: undefined })}
              className="text-xs text-muted-foreground hover:text-red-500 transition"
            >
              clear
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ScheduleEdit() {
  const params = useParams<{ id?: string }>();
  const [, nav] = useLocation();
  const isNew = !params.id;

  const [name, setName] = useState("");
  const [steps, setSteps] = useState<ScheduleStep[]>([]);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!isNew && params.id) {
      const all = loadSchedules();
      const found = all.find((s) => s.id === params.id);
      if (found) {
        setName(found.name);
        setSteps(found.steps);
      }
    }
  }, [params.id]);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: generateId(), title: "", imageDataUrl: undefined, time: undefined },
    ]);
  }

  function updateStep(id: string, updated: ScheduleStep) {
    setSteps((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function deleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStep(index: number, dir: -1 | 1) {
    const newSteps = [...steps];
    const target = index + dir;
    if (target < 0 || target >= newSteps.length) return;
    [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
    setSteps(newSteps);
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    const all = loadSchedules();
    const validSteps = steps.filter((s) => s.title.trim() || s.imageDataUrl);

    if (isNew) {
      const newSched: Schedule = {
        id: generateId(),
        name: name.trim(),
        steps: validSteps,
        createdAt: new Date().toISOString(),
      };
      saveSchedules([...all, newSched]);
    } else {
      const updated = all.map((s) =>
        s.id === params.id ? { ...s, name: name.trim(), steps: validSteps } : s
      );
      saveSchedules(updated);
    }

    setSaved(true);
    setTimeout(() => nav("/schedule"), 800);
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/schedule">
            <button className="w-9 h-9 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          </Link>
          <h1 className="font-rajdhani text-2xl text-foreground leading-none">
            {isNew ? "New Schedule" : "Edit Schedule"}
          </h1>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      <div className="px-6 space-y-6 relative z-10">
        {/* Schedule name */}
        <div>
          <label className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
            Schedule Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(false); }}
            placeholder="Morning Routine, Speech Practice Day…"
            className={`w-full rounded-2xl border px-5 py-4 text-foreground text-base font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition bg-card shadow-sm
              ${nameError ? "border-red-400 focus:ring-red-300" : "border-border focus:ring-primary/40"}`}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1.5 ml-1">Please give your schedule a name.</p>
          )}
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-primary uppercase tracking-wide">
              Steps ({steps.length})
            </label>
            <span className="text-xs text-muted-foreground">Drag images in, use arrows to reorder</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  total={steps.length}
                  onChange={(u) => updateStep(step.id, u)}
                  onDelete={() => deleteStep(step.id)}
                  onMove={(dir) => moveStep(i, dir)}
                />
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={addStep}
            className="w-full mt-3 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary/50 transition"
          >
            <Plus className="w-5 h-5" />
            Add Step
          </button>
        </div>
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-6 py-4 bg-background/90 backdrop-blur border-t border-border z-20">
        <Button
          size="xl"
          className="w-full shadow-lg shadow-primary/20"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <><Check className="w-5 h-5 mr-2" /> Saved!</>
          ) : (
            <>Save Schedule</>
          )}
        </Button>
      </div>
    </div>
  );
}
