// Role values mirror the existing values persisted by the backend.
export const ROLES = Object.freeze({
    SUPER_ADMIN: "1",
    ADMIN: "2",
    STATE_LEAD: "3",
    DISTRICT_LEAD: "4",
    PI: "5",
});

const ALL_ROLES = Object.values(ROLES);

export const permissions = Object.freeze({
    Dashboard: ALL_ROLES,
    CreateUser: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    CreateParticipant: ALL_ROLES,
    Assessment: ALL_ROLES,
    DocumentManagement: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    ModuleManagement: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    Master: [ROLES.SUPER_ADMIN],
    Centres: [ROLES.SUPER_ADMIN],
    Batch: [ROLES.SUPER_ADMIN, ROLES.STATE_LEAD, ROLES.DISTRICT_LEAD],
});

export const hasPermission = (allowedRoles, role) =>
    Array.isArray(allowedRoles) && allowedRoles.includes(role);

// Mirrors the backend's CREATABLE_ROLES (Backend/app/modules/users/constants.py):
// who is allowed to create/edit/delete users of which role. Used to hide
// Edit/Delete actions the backend would reject anyway (403).
export const CREATABLE_ROLES = Object.freeze({
    [ROLES.SUPER_ADMIN]: [ROLES.ADMIN],
    [ROLES.ADMIN]: [ROLES.STATE_LEAD, ROLES.DISTRICT_LEAD, ROLES.PI],
    [ROLES.STATE_LEAD]: [ROLES.DISTRICT_LEAD, ROLES.PI],
    [ROLES.DISTRICT_LEAD]: [ROLES.PI],
    [ROLES.PI]: [],
});

export const canManageRole = (actorRole, targetRole) =>
    Array.isArray(CREATABLE_ROLES[actorRole]) &&
    CREATABLE_ROLES[actorRole].includes(String(targetRole));
