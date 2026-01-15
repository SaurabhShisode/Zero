export declare const Skills: readonly ["DSA", "SQL", "JavaScript", "Java", "SystemDesign", "CSFundamentals"];
export type Skill = (typeof Skills)[number];
export declare const Difficulties: readonly ["Easy", "Medium", "Hard"];
export type Difficulty = (typeof Difficulties)[number];
export declare const CompanyFocuses: readonly ["FAANG", "Service", "Startups", "Any"];
export type CompanyFocus = (typeof CompanyFocuses)[number];
export interface SkillPreference {
    skill: Skill;
    enabled: boolean;
    difficulty: Difficulty;
    preferredLanguage?: string;
    timeCommitmentMinutes?: number;
    companyFocus?: CompanyFocus;
}
//# sourceMappingURL=common.d.ts.map