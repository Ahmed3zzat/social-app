import User, { roles } from "../DB/models/user.model.js";

export const canChangeRoleMiddleWare = async (req, res, next) => {
  const { role: currentUserRole } = req.user;
  const { userId, role: newRole } = req.body;

  const rolesHierarchy = Object.keys(roles);

  // Get current user's role level
  const currentUserLevel = rolesHierarchy.indexOf(currentUserRole);

  // Get target user's new role level
  const newRoleLevel = rolesHierarchy.indexOf(newRole);
  if (newRoleLevel === -1) {
    return next(new Error("Invalid Role", { cause: 400 }));
  }

  // Get target user
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // Get target user's current role level
  const targetCurrentLevel = rolesHierarchy.indexOf(targetUser.role);
  if (targetCurrentLevel === -1) {
    return next(new Error("Invalid target user role", { cause: 400 }));
  }

  // Prevent changing users with equal or higher authority
  if (targetCurrentLevel <= currentUserLevel) {
    return next(
      new Error("You cannot change this user's role", { cause: 403 }),
    );
  }

  // Prevent assigning a role equal to or higher than your own
  if (newRoleLevel < currentUserLevel) {
    return next(
      new Error("You cannot assign this role", { cause: 403 }),
    );
  }

  req.targetUser = targetUser;

  return next();
};