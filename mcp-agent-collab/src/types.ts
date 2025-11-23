/**
 * Type definitions for agent collaboration
 */

export interface TaskProgress {
  agent: 'claude' | 'copilot';
  task: string;
  status: 'planning' | 'in_progress' | 'blocked' | 'completed';
  details?: string;
  timestamp: string;
}

export interface ReviewRequest {
  id: string;
  requestedBy: 'claude' | 'copilot';
  code: string;
  filePath: string;
  context: string;
  concerns?: string[];
  timestamp: string;
}

export interface HelpRequest {
  id: string;
  requestedBy: 'claude' | 'copilot';
  question: string;
  context: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface CoordinationPlan {
  id: string;
  initiatedBy: 'claude' | 'copilot';
  tasks: {
    assignedTo: 'claude' | 'copilot';
    description: string;
    priority: number;
  }[];
  timestamp: string;
}

export interface CollaborationState {
  currentTasks: TaskProgress[];
  reviewRequests: ReviewRequest[];
  helpRequests: HelpRequest[];
  coordinationPlans: CoordinationPlan[];
  sharedContext: Record<string, any>;
}
