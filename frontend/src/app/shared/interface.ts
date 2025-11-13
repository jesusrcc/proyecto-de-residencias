// ======================
// Submodelos tipados
// ======================

export interface Publication {
  title?: string;
  journal?: string;
  date?: string;
}

export interface Course {
  title?: string;
  institution?: string;
  date?: string;
}

export interface Milestone {
  title?: string;
  date?: string;   // o Date si en backend viene como ISO
  type?: string;
  description?: string;
}

// ======================
// Modelo principal de usuario
// ======================

export interface User {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  orcid?: string;
  photoUrl?: string;
  bio?: string;
  country?: string;
  googleScholar?: string;
  gallery?: string[];
  publications?: Publication[];
  courses?: Course[];
  milestones?: Milestone[];
  token?: string;
}

// ======================
// Respuesta del backend
// ======================

export interface AuthResponse {
  token: string;
  user: User;
}
