// Test script to verify team role validation
import { mapGeneratedDataToGigData } from './src/lib/ai.ts';

// Mock data with invalid team roles (like "Sales Representatives")
const mockGeneratedData = {
  title: "Health Insurance Sales Representative",
  description: "Join our HARX sales team to sell health insurance policies...",
  team: {
    size: 6,
    structure: [
      {
        roleId: "Sales Representatives", // This is invalid - should be mapped to "agent"
        count: 1,
        seniority: {
          level: "Mid-Level",
          yearsExperience: 3
        }
      }
    ],
    territories: ["Singapore", "Invalid Territory"], // This should be filtered out
    reporting: {
      to: "Manager",
      frequency: "Regular"
    },
    collaboration: ["Team Bonuses"]
  }
};

// Test the validation
try {
  const result = mapGeneratedDataToGigData(mockGeneratedData);
  console.log("Validation result:");
  console.log("Team structure:", result.team.structure);
  console.log("Team territories:", result.team.territories);
  console.log("✅ Validation working correctly!");
} catch (error) {
  console.error("❌ Validation failed:", error.message);
} 