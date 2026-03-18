import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRightLeft, Clock, Save, Activity, AlignLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTransitionPlan } from "@/hooks/use-transitions";

const transitionSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  fromActivity: z.string().min(1, "Current activity is required"),
  toActivity: z.string().min(1, "Next activity is required"),
  warningMinutes: z.coerce.number().min(1, "Please set a warning time"),
  notes: z.string().optional(),
});

type TransitionFormValues = z.infer<typeof transitionSchema>;

export default function Prepare() {
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: createTransition, isPending } = useCreateTransitionPlan();

  const form = useForm<TransitionFormValues>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      childName: "",
      fromActivity: "",
      toActivity: "",
      warningMinutes: 5,
      notes: "",
    },
  });

  const onSubmit = (data: TransitionFormValues) => {
    createTransition(
      { data },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            setLocation("/");
          }, 2000);
        },
      }
    );
  };

  const warningOptions = [2, 5, 10, 15];
  const currentWarning = form.watch("warningMinutes");

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-card p-8 rounded-3xl shadow-xl shadow-primary/10 border border-primary/20 max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Save className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Transition Saved</h2>
          <p className="text-muted-foreground">You're doing great. Taking you back home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-6 py-8 sm:px-8 max-w-md mx-auto relative">
      <header className="flex items-center mb-8 relative z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4 bg-white/50 border border-border shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-foreground">Prepare Transition</h1>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Label htmlFor="childName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Child's Name
          </Label>
          <Input 
            id="childName" 
            placeholder="e.g. Leo" 
            {...form.register("childName")} 
          />
          {form.formState.errors.childName && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.childName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromActivity" className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Current Activity
          </Label>
          <Input 
            id="fromActivity" 
            placeholder="e.g. Playing video games" 
            {...form.register("fromActivity")} 
          />
          {form.formState.errors.fromActivity && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.fromActivity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="toActivity" className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            Next Activity
          </Label>
          <Input 
            id="toActivity" 
            placeholder="e.g. Dinner time" 
            {...form.register("toActivity")} 
          />
          {form.formState.errors.toActivity && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.toActivity.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Warning Time (Minutes)
          </Label>
          <div className="flex gap-2">
            {warningOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => form.setValue("warningMinutes", m)}
                className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 border-2
                  ${currentWarning === m 
                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                    : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                  }`}
              >
                {m}m
              </button>
            ))}
          </div>
          <Input 
            type="number" 
            placeholder="Custom minutes..." 
            className="mt-2"
            {...form.register("warningMinutes")} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-primary" />
            Special Notes (Optional)
          </Label>
          <Textarea 
            id="notes" 
            placeholder="e.g. Needs to bring blue dinosaur..." 
            {...form.register("notes")} 
          />
        </div>

        <Button 
          type="submit" 
          size="xl" 
          className="w-full mt-8 text-lg"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save & Start Transition"}
        </Button>
      </motion.form>
    </div>
  );
}
