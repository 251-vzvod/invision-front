"use client";

import { useCallback } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import { useApplicationFormStore } from "../hooks/use-application-form";
import { CITIZENSHIP_OPTIONS } from "../constants";
import type { Gender, DocumentType, FamilyMember } from "../types";
import { Plus, Trash2 } from "lucide-react";

export function PersonalInformationForm() {
  const {
    data: { personalInformation: info, familyDetails },
    hasGuardian,
    setPersonalInformation,
    setFamilyDetails,
    toggleGuardian,
  } = useApplicationFormStore();

  /* ─── Handlers ─── */

  const handlePersonalChange = useCallback(
    (field: string, value: string) => {
      setPersonalInformation({ [field]: value });
    },
    [setPersonalInformation],
  );

  const handleDocumentChange = useCallback(
    (field: string, value: string) => {
      setPersonalInformation({
        document: { ...info.document, [field]: value },
      });
    },
    [setPersonalInformation, info.document],
  );

  const handleGenderSelect = useCallback(
    (gender: Gender) => {
      setPersonalInformation({ gender });
    },
    [setPersonalInformation],
  );

  const handleDocTypeSelect = useCallback(
    (type: DocumentType) => {
      setPersonalInformation({
        document: { ...info.document, type },
      });
    },
    [setPersonalInformation, info.document],
  );

  const handleFamilyMemberChange = useCallback(
    (
      member: "father" | "mother" | "guardian",
      field: keyof FamilyMember,
      value: string,
    ) => {
      if (member === "guardian") {
        const current = familyDetails.guardian;
        if (!current) return;
        setFamilyDetails({
          guardian: { ...current, [field]: value },
        });
      } else {
        setFamilyDetails({
          [member]: { ...familyDetails[member], [field]: value },
        });
      }
    },
    [setFamilyDetails, familyDetails],
  );

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════
         Section 1: Applicant Details
         ═══════════════════════════════════════ */}
      <section>
        <h3 className="text-base font-semibold mb-4">Applicant details</h3>

        {/* Name row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Last Name" required>
            <Input
              id="lastName"
              placeholder="Enter last name"
              value={info.lastName}
              onChange={(e) => handlePersonalChange("lastName", e.target.value)}
            />
          </FormField>

          <FormField label="First Name" required>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={info.firstName}
              onChange={(e) => handlePersonalChange("firstName", e.target.value)}
            />
          </FormField>

          <FormField label="Patronymic">
            <Input
              id="patronymic"
              placeholder="Enter patronymic"
              value={info.patronymic}
              onChange={(e) =>
                handlePersonalChange("patronymic", e.target.value)
              }
            />
          </FormField>
        </div>

        {/* Date of Birth */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Date of Birth" required>
            <Input
              id="birthDate"
              placeholder="DD.MM.YYYY"
              value={info.birthDate}
              onChange={(e) => handlePersonalChange("birthDate", e.target.value)}
              maxLength={10}
            />
          </FormField>
        </div>

        {/* Gender */}
        <div className="mt-4">
          <Label className="mb-2">
            Gender <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-0">
            <button
              type="button"
              onClick={() => handleGenderSelect("MALE")}
              className={cn(
                "rounded-l-lg border px-4 py-2 text-sm font-medium transition-all",
                info.gender === "MALE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect("FEMALE")}
              className={cn(
                "rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium transition-all",
                info.gender === "FEMALE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              Female
            </button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ═══════════════════════════════════════
         Section 2: Nationality & Document
         ═══════════════════════════════════════ */}
      <section>
        <h3 className="text-base font-semibold mb-4">
          Nationality and passport details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Citizenship" required>
            <Select
              value={info.citizenship}
              onValueChange={(val) => handlePersonalChange("citizenship", val)}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select citizenship" />
              </SelectTrigger>
              <SelectContent>
                {CITIZENSHIP_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Individual Identification Number (IIN)" required>
            <Input
              id="iin"
              placeholder="Enter 12-digit IIN"
              value={info.iin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 12);
                handlePersonalChange("iin", v);
              }}
              maxLength={12}
            />
          </FormField>
        </div>

        {/* Document type toggle */}
        <div className="mt-4">
          <Label className="mb-2">
            Type of identity document <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-0">
            <button
              type="button"
              onClick={() => handleDocTypeSelect("passport")}
              className={cn(
                "rounded-l-lg border px-4 py-2 text-sm font-medium transition-all",
                info.document.type === "passport"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              Passport
            </button>
            <button
              type="button"
              onClick={() => handleDocTypeSelect("id_card")}
              className={cn(
                "rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium transition-all",
                info.document.type === "id_card"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              ID
            </button>
          </div>
        </div>

        {/* Document fields */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Document number" required>
            <Input
              id="docNumber"
              placeholder="Enter document number"
              value={info.document.number}
              onChange={(e) => handleDocumentChange("number", e.target.value)}
            />
          </FormField>

          <FormField label="Issued by" required>
            <Input
              id="docIssuedBy"
              placeholder="Issuing authority"
              value={info.document.issuedBy}
              onChange={(e) => handleDocumentChange("issuedBy", e.target.value)}
            />
          </FormField>

          <FormField label="Issue date" required>
            <Input
              id="docIssueDate"
              placeholder="DD.MM.YYYY"
              value={info.document.issueDate}
              onChange={(e) =>
                handleDocumentChange("issueDate", e.target.value)
              }
              maxLength={10}
            />
          </FormField>
        </div>
      </section>

      <Separator />

      {/* ═══════════════════════════════════════
         Section 3: Family Details
         ═══════════════════════════════════════ */}
      <section>
        <h3 className="text-base font-semibold mb-4">Family details</h3>

        {/* Father */}
        <FamilyMemberSection
          title="Father"
          member={familyDetails.father}
          memberKey="father"
          onChange={handleFamilyMemberChange}
        />

        <div className="mt-6" />

        {/* Mother */}
        <FamilyMemberSection
          title="Mother"
          member={familyDetails.mother}
          memberKey="mother"
          onChange={handleFamilyMemberChange}
        />

        {/* Guardian */}
        {hasGuardian && familyDetails.guardian && (
          <>
            <div className="mt-6" />
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Guardian
              </h4>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleGuardian}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <FamilyMemberFields
              member={familyDetails.guardian}
              memberKey="guardian"
              onChange={handleFamilyMemberChange}
            />
          </>
        )}

        {!hasGuardian && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={toggleGuardian}
          >
            <Plus className="size-4" />
            Add Guardian
          </Button>
        )}
      </section>
    </div>
  );
}

/* ─── Reusable Form Field ─── */

function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

/* ─── Family Member Section ─── */

function FamilyMemberSection({
  title,
  member,
  memberKey,
  onChange,
}: {
  title: string;
  member: FamilyMember;
  memberKey: "father" | "mother" | "guardian";
  onChange: (
    member: "father" | "mother" | "guardian",
    field: keyof FamilyMember,
    value: string,
  ) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        {title}
      </h4>
      <FamilyMemberFields
        member={member}
        memberKey={memberKey}
        onChange={onChange}
      />
    </div>
  );
}

function FamilyMemberFields({
  member,
  memberKey,
  onChange,
}: {
  member: FamilyMember;
  memberKey: "father" | "mother" | "guardian";
  onChange: (
    member: "father" | "mother" | "guardian",
    field: keyof FamilyMember,
    value: string,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FormField label="Last Name" required>
        <Input
          placeholder="Enter last name"
          value={member.lastName}
          onChange={(e) => onChange(memberKey, "lastName", e.target.value)}
        />
      </FormField>
      <FormField label="First Name" required>
        <Input
          placeholder="Enter first name"
          value={member.firstName}
          onChange={(e) => onChange(memberKey, "firstName", e.target.value)}
        />
      </FormField>
      <FormField label="Patronymic">
        <Input
          placeholder="Enter patronymic"
          value={member.patronymic}
          onChange={(e) => onChange(memberKey, "patronymic", e.target.value)}
        />
      </FormField>
      <FormField label="Phone" required>
        <Input
          placeholder="+7 (___) ___-__-__"
          value={member.phone}
          onChange={(e) => onChange(memberKey, "phone", e.target.value)}
        />
      </FormField>
    </div>
  );
}
