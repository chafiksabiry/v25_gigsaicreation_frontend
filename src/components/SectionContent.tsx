import React from "react";
import { GigData } from "../types";
import { SectionGuidance } from "./SectionGuidance";
import BasicSection from "./BasicSection";
import { ScheduleSection } from "./ScheduleSection";
import { CommissionSection } from "./CommissionSection";
import { LeadsSection } from "./LeadsSection";
import { SkillsSection } from "./SkillsSection";
import { TeamStructure } from "./TeamStructure";
import { DocumentationSection } from "./DocumentationSection";
import { validateGigData } from "../lib/validation";

interface SectionContentProps {
  section: string;
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  constants: any;
  onSectionChange?: (section: string) => void;
}

export function SectionContent({
  section,
  data,
  onChange,
  errors,
  onSectionChange,
}: SectionContentProps) {
  const validation = validateGigData(data);

  const sections = [
    "basic",
    "schedule",
    "commission",
    "leads",
    "skills",
    "team",
    "docs",
  ];

  const handlePrevious = () => {
    const currentIndex = sections.indexOf(section);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      if (onSectionChange) {
        onSectionChange(prevSection);
      }
    }
  };

  const handleNext = () => {
    const currentIndex = sections.indexOf(section);
    console.log("Current section:", section);
    console.log("Current index:", currentIndex);
    console.log("Sections:", sections);
    console.log("onSectionChange is defined:", !!onSectionChange);

    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      console.log("Next section:", nextSection);

      if (onSectionChange) {
        console.log("Calling onSectionChange with:", nextSection);
        onSectionChange(nextSection);
      } else {
        console.warn("onSectionChange is undefined");
      }
    } else {
      console.warn("Already at last section, can't go next");
    }
  };

  const renderContent = () => {
    switch (section) {
      case "basic":
        return (
          <BasicSection
            data={data}
            onChange={onChange}
            errors={errors}
            currentSection={section}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSectionChange={onSectionChange}
          />
        );

      case "schedule":
        return (
          <ScheduleSection
            data={data.schedule}
            onChange={(schedule) => onChange({ ...data, schedule })}
            errors={errors}
            hasBaseCommission={!!data.commission.base}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      case "commission":
        return (
          <CommissionSection
            data={data.commission}
            onChange={(commission) => onChange({ ...data, commission })}
            errors={errors}
            warnings={validation.warnings}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      case "leads":
        return (
          <LeadsSection
            data={data.leads}
            onChange={(leads) => onChange({ ...data, leads })}
            errors={errors}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      case "skills":
        return (
          <SkillsSection
            data={data.skills}
            onChange={(skills) => onChange({ ...data, skills })}
            errors={errors}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      case "team":
        return (
          <TeamStructure
            team={data.team}
            onChange={(team) =>
              onChange({ ...data, team: { ...data.team, ...team } })
            }
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      case "docs":
        return (
          <DocumentationSection
            data={data.documentation}
            onChange={(documentation) => onChange({ ...data, documentation })}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <SectionGuidance section={section} />
      {renderContent()}
    </div>
  );
}
