"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { FACULTIES } from "../constants";
import type { SelectedProgram, ProgramLevel } from "../types";
import { GraduationCap, BookOpen, ChevronRight, Check } from "lucide-react";

interface ProgramSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProgram: SelectedProgram | null;
  onSelect: (program: SelectedProgram) => void;
}

export function ProgramSelectorDialog({
  open,
  onOpenChange,
  currentProgram,
  onSelect,
}: ProgramSelectorDialogProps) {
  const [step, setStep] = useState<"level" | "faculty" | "speciality">("level");
  const [selectedLevel, setSelectedLevel] = useState<ProgramLevel | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(
    null,
  );

  const selectedFaculty = FACULTIES.find((f) => f.id === selectedFacultyId);

  const handleLevelSelect = (level: ProgramLevel) => {
    if (level === "foundation") {
      onSelect({
        level: "foundation",
        facultyId: null,
        specialityId: null,
        displayLabel: "Foundation Year",
      });
      resetAndClose();
      return;
    }
    setSelectedLevel(level);
    setStep("faculty");
  };

  const handleFacultySelect = (facultyId: string) => {
    const faculty = FACULTIES.find((f) => f.id === facultyId);
    if (!faculty) return;

    if (faculty.specialities.length === 1) {
      const spec = faculty.specialities[0];
      onSelect({
        level: "undergraduate",
        facultyId: faculty.id,
        specialityId: spec.id,
        displayLabel: `Undergraduate | ${spec.name}`,
      });
      resetAndClose();
      return;
    }

    setSelectedFacultyId(facultyId);
    setStep("speciality");
  };

  const handleSpecialitySelect = (specialityId: string) => {
    if (!selectedFaculty) return;
    const spec = selectedFaculty.specialities.find(
      (s) => s.id === specialityId,
    );
    if (!spec) return;

    onSelect({
      level: "undergraduate",
      facultyId: selectedFaculty.id,
      specialityId: spec.id,
      displayLabel: `Undergraduate | ${spec.name}`,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("level");
    setSelectedLevel(null);
    setSelectedFacultyId(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === "speciality") {
      setSelectedFacultyId(null);
      setStep("faculty");
    } else if (step === "faculty") {
      setSelectedLevel(null);
      setStep("level");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "level" && "Choose program type"}
            {step === "faculty" && "Choose faculty"}
            {step === "speciality" &&
              `Choose speciality — ${selectedFaculty?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === "level" &&
              "Select the type of program you want to apply for"}
            {step === "faculty" && "Select the faculty for your undergraduate program"}
            {step === "speciality" && "Select your speciality"}
          </DialogDescription>
        </DialogHeader>

        {/* Back button */}
        {step !== "level" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="w-fit"
          >
            ← Back
          </Button>
        )}

        <div className="flex flex-col gap-2">
          {/* Step 1: Level */}
          {step === "level" && (
            <>
              <ProgramOption
                icon={<BookOpen className="size-5" />}
                title="Foundation Year"
                description="Preparatory year before undergraduate studies"
                isSelected={currentProgram?.level === "foundation"}
                onClick={() => handleLevelSelect("foundation")}
              />
              <ProgramOption
                icon={<GraduationCap className="size-5" />}
                title="Undergraduate (Bachelor's)"
                description="Choose a faculty and speciality"
                isSelected={currentProgram?.level === "undergraduate"}
                onClick={() => handleLevelSelect("undergraduate")}
                hasArrow
              />
            </>
          )}

          {/* Step 2: Faculty */}
          {step === "faculty" &&
            FACULTIES.map((faculty) => (
              <ProgramOption
                key={faculty.id}
                title={faculty.name}
                description={faculty.specialities
                  .map((s) => s.name)
                  .join(", ")}
                isSelected={currentProgram?.facultyId === faculty.id}
                onClick={() => handleFacultySelect(faculty.id)}
                hasArrow={faculty.specialities.length > 1}
              />
            ))}

          {/* Step 3: Speciality */}
          {step === "speciality" &&
            selectedFaculty?.specialities.map((spec) => (
              <ProgramOption
                key={spec.id}
                title={spec.name}
                isSelected={currentProgram?.specialityId === spec.id}
                onClick={() => handleSpecialitySelect(spec.id)}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Reusable option card ─── */

function ProgramOption({
  icon,
  title,
  description,
  isSelected,
  onClick,
  hasArrow,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  hasArrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent-1",
        isSelected
          ? "border-primary bg-accent-1"
          : "border-border bg-background",
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {isSelected && <Check className="size-4 shrink-0 text-primary" />}
      {hasArrow && !isSelected && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </button>
  );
}
