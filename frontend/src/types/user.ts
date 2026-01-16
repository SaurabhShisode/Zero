export interface Preference {
  skill: string;
  enabled: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileSlug: string;
  preferences: Preference[];
}
