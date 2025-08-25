export interface Project {
  id: string;
  name: string;
  code_url: string;
  demo_url: string;
  start_date: Date;
  end_date: Date;
  current: boolean;
  stack: string;
  highlights: string;
}

export interface ExperienceGroup {
  id: string;
  name: string;
  description: string;
  experiences?: Experience[];
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  start_date: Date;
  end_date: Date;
  current: boolean;
  description: string;
  skills: string;
  group?: ExperienceGroup;
}

export interface HomePage {
  id: string;
  overview: string;
  now: string;
  interests: string;
  futureGoals: string;
  languages: string;
  frameworks: string;
  databases: string;
  devops: string;
}

export interface CreateUpdateProjectDto {
  name: string;
  code_url: string;
  demo_url: string;
  start_date: Date;
  end_date: Date;
  current: boolean;
  stack: string;
  highlights: string;
}

export interface CreateUpdateExperienceGroupDto {
  name: string;
  description: string;
}

export interface CreateUpdateExperienceDto {
  company: string;
  title: string;
  start_date: Date;
  end_date: Date;
  current: boolean;
  description: string;
  skills: string;
  groupId?: string;
}

export interface CreateUpdateHomePageDto {
  overview: string;
  now: string;
  interests: string;
  futureGoals: string;
  languages: string;
  frameworks: string;
  databases: string;
  devops: string;
}
