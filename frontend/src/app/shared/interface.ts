export interface User {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  orcid?: string;
  bio?: string;
  photoUrl?: string;
  country?: string;
  googleScholar?: string;
  snip?: string;
  publications?: Array<Record<string, any>>;
  courses?: Array<Record<string, any>>;
  milestones?: Array<Record<string, any>>;
  token?: string;
}
export interface AuthResponse {
  token: string;
  user: User;
}