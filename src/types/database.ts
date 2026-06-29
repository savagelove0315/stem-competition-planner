export type UUID = string;
export type Timestamp = string;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type TeacherStatus = "active" | "inactive" | "archived";
export type CompetitionStatus = "draft" | "planned" | "active" | "completed" | "archived";
export type StudentStatus = "active" | "inactive" | "archived";
export type StudentCompetitionStatus = "registered" | "waitlisted" | "withdrawn" | "completed";
export type ActivityStatus = "draft" | "planned" | "active" | "completed" | "cancelled" | "archived";
export type ActivityParticipantStatus = "assigned" | "attended" | "absent" | "cancelled";
export type TeamStatus = "active" | "inactive" | "disqualified" | "archived";
export type TeamMemberStatus = "active" | "inactive" | "left";
export type ConflictType = "student_overlap" | "team_overlap" | "location_overlap" | "capacity" | "other";
export type ConflictSeverity = "info" | "warning" | "error" | "critical";
export type ConflictStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export type Teacher = {
  id: UUID;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  status: TeacherStatus;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Competition = {
  id: UUID;
  name: string;
  description: string | null;
  status: CompetitionStatus;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
  registrationOpensAt: Timestamp | null;
  registrationClosesAt: Timestamp | null;
  leadTeacherId: UUID | null;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Student = {
  id: UUID;
  studentCode: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  gradeLevel: string | null;
  email: string | null;
  phone: string | null;
  guardianName: string | null;
  guardianContact: string | null;
  status: StudentStatus;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type StudentCompetition = {
  id: UUID;
  studentId: UUID;
  competitionId: UUID;
  status: StudentCompetitionStatus;
  registeredAt: Timestamp;
  withdrawnAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Activity = {
  id: UUID;
  competitionId: UUID;
  name: string;
  activityType: string | null;
  description: string | null;
  status: ActivityStatus;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
  location: string | null;
  capacity: number | null;
  requiresTeam: boolean;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ActivityParticipant = {
  id: UUID;
  activityId: UUID;
  competitionId: UUID;
  studentId: UUID;
  role: string | null;
  status: ActivityParticipantStatus;
  assignedAt: Timestamp;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Team = {
  id: UUID;
  competitionId: UUID;
  name: string;
  teamCode: string | null;
  status: TeamStatus;
  coachTeacherId: UUID | null;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type TeamMember = {
  id: UUID;
  teamId: UUID;
  competitionId: UUID;
  studentId: UUID;
  role: string | null;
  status: TeamMemberStatus;
  joinedAt: Timestamp;
  leftAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ConflictRecord = {
  id: UUID;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  status: ConflictStatus;
  primaryCompetitionId: UUID;
  primaryActivityId: UUID;
  conflictingCompetitionId: UUID;
  conflictingActivityId: UUID;
  studentId: UUID | null;
  teamId: UUID | null;
  summary: string;
  details: JsonValue;
  detectedAt: Timestamp;
  resolvedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AppSetting = {
  id: UUID;
  settingKey: string;
  settingValue: JsonValue;
  description: string | null;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type DatabaseTableMap = {
  teachers: Teacher;
  competitions: Competition;
  students: Student;
  student_competitions: StudentCompetition;
  activities: Activity;
  activity_participants: ActivityParticipant;
  teams: Team;
  team_members: TeamMember;
  conflict_records: ConflictRecord;
  app_settings: AppSetting;
};
