import { PERMISSION_GROUPS } from '@coachos/shared';

export interface PermissionModule {
  id: string;
  label: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

// Map the shared structure to what the staff app expects
export const MODULAR_DELEGATION_ENGINE: PermissionModule[] = PERMISSION_GROUPS.map(g => ({
  id: g.id,
  label: g.title,
  permissions: g.items
}));

export const getPermissionGroup = (permId: string) => {
  return MODULAR_DELEGATION_ENGINE.find(m => m.permissions.some(p => p.id === permId));
};
