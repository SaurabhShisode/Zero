export const Skills = [
  "DSA",
  "SQL",
  "JavaScript",
  "Java",
  "SystemDesign",
  "OperatingSystems",
  "DBMS",
  "Networking",
  "Aptitude",
  "Behavioral"
] as const;

export type Skill = (typeof Skills)[number];

export const Difficulties = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof Difficulties)[number];

export const CompanyFocuses = ["FAANG", "Service", "Startups", "Any"] as const;
export type CompanyFocus = (typeof CompanyFocuses)[number];

export interface SkillPreference {
  skill: Skill;
  enabled: boolean;
  difficulty: Difficulty;
  preferredLanguage?: string;
  timeCommitmentMinutes?: number;
  companyFocus?: CompanyFocus;
}
