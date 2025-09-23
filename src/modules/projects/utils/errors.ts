class ProjectServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectServiceError";
  }
}

class ProjectNotFoundException extends ProjectServiceError {
  constructor(projectId: number) {
    super(`Project with ID ${projectId} not found`);
    this.name = "ProjectNotFoundException";
  }
}

class UserNotFoundException extends ProjectServiceError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = "UserNotFoundException";
  }
}

class InvitationExistsError extends ProjectServiceError {
  constructor(projectId: number, userId: string) {
    super(`Invitation for user ${userId} to project ${projectId} already exists`);
    this.name = "InvitationExistsError";
  }
}

class ProjectMembershipExistsError extends ProjectServiceError {
  constructor(projectId: number, userId: string) {
    super(`User ${userId} is already a member of project ${projectId}`);
    this.name = "ProjectMembershipExistsError";
  }
}

class NoAcceptannceError extends ProjectServiceError {
  constructor(projectId: number) {
    super(`Project ${projectId} is not taking anymore members!`);
    this.name = "NoAcceptannceError";
  }
}

export {
  InvitationExistsError,
  NoAcceptannceError,
  ProjectMembershipExistsError,
  ProjectNotFoundException,
  ProjectServiceError,
  UserNotFoundException,
};
