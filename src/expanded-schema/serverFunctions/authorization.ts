/**
 * Authorization functions that can be referenced in schema definitions.
 * These functions determine if an operation is allowed.
 *
 * Each function should return a boolean indicating
 * whether the operation is permitted.
 * The context parameter contains information
 * about the current user and request.
 */

export type AuthContext = {
  userId?: string;
  userRole?: string;
  isAuthenticated: boolean;
  // Add other context properties as needed
  [key: string]: any;
};

export const authorizationFunctions = {
  /**
   * Checks if the current user is an admin
   */
  isAdmin: (context: AuthContext): boolean => {
    return context.userRole === 'admin';
  },

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated: (context: AuthContext): boolean => {
    return context.isAuthenticated;
  },

  /**
   * Checks if the user is the owner of the resource
   * Requires userId in context and a comparison value
   */
  isOwner: (context: AuthContext, resourceOwnerId?: string): boolean => {
    return context.userId === resourceOwnerId;
  },

  /**
   * Checks if the user has a specific role
   */
  hasRole: (context: AuthContext, requiredRole: string): boolean => {
    return context.userRole === requiredRole;
  },

  /**
   * Always allows the operation (useful for public resources)
   */
  allowAll: (context: AuthContext): boolean => {
    return true;
  },

  /**
   * Always denies the operation
   */
  denyAll: (context: AuthContext): boolean => {
    return false;
  },
};

export type AuthFunctionName = keyof typeof authorizationFunctions;
