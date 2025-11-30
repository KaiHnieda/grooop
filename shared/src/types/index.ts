// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  members?: WorkspaceMember[];
  team?: {
    id: string;
    name: string;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user?: User;
}

export interface WorkspaceCreateInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

// Page Types
export interface Page {
  id: string;
  title: string;
  content: any; // JSON content from editor
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface PageCreateInput {
  title: string;
  workspaceId: string;
  content?: any;
}

// Idea Types
export interface Idea {
  id: string;
  title: string;
  description?: string;
  workspaceId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdeaCreateInput {
  title: string;
  description?: string;
  workspaceId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'invitation' | 'mention' | 'change' | 'comment';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string; // ID of related workspace/page/etc
  createdAt: Date;
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  pageId: string;
  userId: string;
  cursorPosition?: number;
  selection?: { start: number; end: number };
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user?: User;
}

export interface TeamCreateInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}


