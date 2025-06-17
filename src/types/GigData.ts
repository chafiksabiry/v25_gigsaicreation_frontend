export interface GigData {
  title: string;
  description: string;
  category: string;
  destination_zone: string;
  seniority: {
    level: string;
    yearsExperience: number;
    aiGenerated?: boolean;
  };
} 