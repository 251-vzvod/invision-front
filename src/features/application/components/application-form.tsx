"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useApplicationFormStore } from "../hooks/use-application-form";
import { PersonalInformationForm } from "./personal-information-form";
import { ProgramSelectorDialog } from "./program-selector-dialog";
import type { ApplicationTab } from "../types";
import { Pencil, Lock } from "lucide-react";

const TABS: { value: ApplicationTab; label: string; disabled?: boolean }[] = [
  { value: "personal", label: "Personal Information" },
  { value: "contact", label: "Contact Information" },
  { value: "education", label: "Education" },
  { value: "motivation", label: "Motivation" },
];

export function ApplicationForm() {
  const { data, activeTab, setActiveTab, setProgram } =
    useApplicationFormStore();
  const [programDialogOpen, setProgramDialogOpen] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value as ApplicationTab);
  };

  const handleNextStep = () => {
    const currentIndex = TABS.findIndex((t) => t.value === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].value);
    }
  };

  return (
    <div className="min-h-screen bg-accent-1">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">Application</h1>

            {/* Program badge */}
            <button
              type="button"
              onClick={() => setProgramDialogOpen(true)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:border-primary/50 hover:shadow-sm",
                data.program
                  ? "border-primary/30 bg-accent-1 text-foreground"
                  : "border-dashed border-border bg-background text-muted-foreground",
              )}
            >
              {data.program
                ? data.program.displayLabel
                : "Select program..."}
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          <Badge variant="secondary" className="w-fit text-xs uppercase tracking-wider">
            {data.status}
          </Badge>
        </div>

        {/* ═══ Form Card ═══ */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* Tabs navigation */}
            <div className="border-b border-border px-4 sm:px-6">
              <TabsList
                variant="line"
                className="h-auto w-full flex-wrap justify-start gap-0 bg-transparent p-0"
              >
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={tab.disabled}
                    className={cn(
                      "relative rounded-none border-0 px-4 py-3 text-sm font-medium",
                      "data-active:text-foreground data-active:after:absolute data-active:after:inset-x-0 data-active:after:bottom-0 data-active:after:h-0.5 data-active:after:bg-primary data-active:after:opacity-100",
                    )}
                  >
                    {tab.label}
                    {tab.disabled && <Lock className="size-3" />}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="p-4 sm:p-6">
              <TabsContent value="personal" className="mt-0">
                <PersonalInformationForm />
              </TabsContent>

              <TabsContent value="contact" className="mt-0">
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  Contact Information — coming soon
                </div>
              </TabsContent>

              <TabsContent value="education" className="mt-0">
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  Education — coming soon
                </div>
              </TabsContent>

              <TabsContent value="motivation" className="mt-0">
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  Motivation — coming soon
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* ═══ Footer: Next Step ═══ */}
          <div className="flex justify-end border-t border-border px-4 py-4 sm:px-6">
            <Button
              size="lg"
              onClick={handleNextStep}
              className="min-w-[140px] rounded-xl font-semibold"
            >
              Next Step
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ Program Selector Modal ═══ */}
      <ProgramSelectorDialog
        open={programDialogOpen}
        onOpenChange={setProgramDialogOpen}
        currentProgram={data.program}
        onSelect={setProgram}
      />
    </div>
  );
}
