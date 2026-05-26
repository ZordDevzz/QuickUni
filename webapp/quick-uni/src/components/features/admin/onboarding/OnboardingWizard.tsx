"use client";

import { useState, useEffect } from "react";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";
import { 
  CheckCircle2, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  Circle, 
  Settings, 
  FileSearch, 
  PlayCircle 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getSessionAction } from "@/actions/onboarding";

interface OnboardingWizardProps {
  schemas: unknown[];
  initialSessionId?: string | null;
}

export function OnboardingWizard({ schemas, initialSessionId }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const t = useTranslations("Onboarding");

  useEffect(() => {
    if (initialSessionId) {
      const resume = async () => {
        const res = await getSessionAction(initialSessionId);
        if (res.success && res.data) {
          const status = (res.data as any).status;
          if (status === "draft") setStep(1);
          else if (status === "validating" || status === "ready") setStep(2);
          else setStep(3);
        }
      };
      resume();
    }
  }, [initialSessionId]);

  const steps = [
    { id: 1, name: t("Step1Name"), icon: Settings },
    { id: 2, name: t("Step2Name"), icon: FileSearch },
    { id: 3, name: t("Step3Name"), icon: PlayCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Stepper UI */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex flex-col items-center space-y-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step > s.id ? 'bg-primary border-primary text-primary-foreground' : 
                step === s.id ? 'border-primary' : 'border-muted'
              }`}>
                {step > s.id ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-medium">{s.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-4 h-[2px] w-12 ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto">
        {step === 1 && (
          <OnboardingStep1 
            schemas={schemas} 
            onNext={(id) => {
              setSessionId(id);
              setStep(2);
            }} 
          />
        )}
        {step === 2 && sessionId && (
          <OnboardingStep2 
            sessionId={sessionId} 
            onBack={() => setStep(1)} 
            onNext={() => {
              setStep(3);
            }} 
          />
        )}
        {step === 3 && sessionId && (
          <OnboardingStep3 
            sessionId={sessionId} 
            onComplete={() => {
              // Optional: show some final fireworks or just stay here
            }}
          />
        )}
      </div>
    </div>
  );
}
