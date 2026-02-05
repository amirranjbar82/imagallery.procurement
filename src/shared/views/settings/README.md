# Access Control System

This directory contains the access control management views for the application, including module-level and hierarchical access control configurations.

## Components

### Module Access Control (`ModuleAccessControlView.vue`)
- Manages which roles have access to which modules
- Allows setting different access levels (None, View, Edit, Admin) per module and role
- Provides a simple interface for administrators to manage module permissions

### Hierarchical Access Control (`HierarchicalAccessControlView.vue`)
- Manages record-level access based on organizational hierarchy
- Allows defining rules for who can access what data based on:
  - User's role
  - Department membership
  - Position in the organizational chart
  - Record ownership

## Usage

1. **Module Access Control**
   - Navigate to Settings > Module Access Control
   - For each module, set the default access level
   - Override access for specific roles as needed
   - Click "Save Changes" to apply

2. **Hierarchical Access Control**
   - Navigate to Settings > Hierarchical Access Control
   - Click "Add Rule" to create a new access rule
   - Configure the rule parameters:
     - Role: Which role this rule applies to
     - Access Type: What level of access to grant
     - Module: Which module this rule applies to
     - Department: (If applicable) which department's records can be accessed
   - Click "Save Changes" to apply

## Data Model

### Module Access
```typescript
interface ModuleAccess {
  moduleId: string
  roleId: string
  accessLevel: 'none' | 'view' | 'edit' | 'admin'
}
```

### Hierarchical Access Rule
```typescript
interface AccessRule {
  roleId: string
  moduleId: string
  accessType: 'own' | 'department' | 'subordinates' | 'all'
  departmentId?: string  // Required if accessType is 'department'
}
```

## Integration

These components integrate with:
- Vue Router for navigation
- Pinia for state management
- shadcn-vue for UI components
- Firebase Firestore for data persistence (to be implemented)

## Future Enhancements

1. Add support for custom roles
2. Implement inheritance of permissions
3. Add audit logging for permission changes
4. Support for temporary/permanent access grants
5. Bulk operations for managing permissions
