<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Outlet;
use App\Models\FormTemplate;
use App\Models\Status;
use App\Models\ComplianceRequirement;
use App\Models\AuditForm;
use App\Models\Audit;
use App\Models\Role;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        if ($model instanceof User) {
            $this->logUserCreation($model);
        } elseif ($model instanceof Outlet) {
            $this->logOutletCreation($model);
        } elseif ($model instanceof FormTemplate) {
            $this->logFormTemplateCreation($model);
        } elseif ($model instanceof ComplianceRequirement) {
            $this->logComplianceRequirementCreation($model);
        } elseif ($model instanceof AuditForm) {
            $this->logAuditFormCreation($model);
        } elseif ($model instanceof Role) {
            $this->logActivity($model, 'created');
        } else {
            $this->logActivity($model, 'created');
        }
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        // Check for specific models and log their updates
        if ($model instanceof User) {
            $this->logUserUpdate($model);
        } elseif ($model instanceof Outlet) {
            $this->logOutletUpdate($model);
        } elseif ($model instanceof FormTemplate) {
            $this->logFormTemplateUpdate($model);
        } elseif ($model instanceof ComplianceRequirement) {
            $this->logComplianceRequirementUpdate($model);
        } elseif ($model instanceof AuditForm) {
            $this->logAuditFormUpdate($model);
        } elseif ($model instanceof Role) {
            $this->logActivity($model, 'updated');
        } else {
            // Default logging for other models
            $this->logActivity($model, 'updated');
        }
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->logActivity($model, 'deleted');
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->logActivity($model, 'restored');
    }

    /**
     * Handle the Model "forceDeleted" event.
     */
    public function forceDeleted(Model $model): void
    {
        $this->logActivity($model, 'force_deleted');
    }

    protected function logActivity(?Model $model, string $actionType): void
    {
        if (!$model) {
            \Log::warning('Attempted to log activity for null model');
            return;
        }

        // Refresh the model to ensure we have the latest data
        if ($model instanceof ComplianceRequirement) {
            $model = $model->fresh();
        }

        $targetType = $this->getTargetType($model);
        // Get proper name for the model
        $targetName = match (true) {
            $model instanceof ComplianceRequirement => $model->getAttribute('title'),
            $model instanceof User => $model->name,
            $model instanceof Outlet => $model->name,
            $model instanceof FormTemplate => $model->name,
            $model instanceof Role => $model->name,
            $model instanceof Audit => $model->complianceRequirement ? $model->complianceRequirement->title : "Audit #{$model->id}",
            default => $model->name ?? get_class($model) . '#' . $model->getKey()
        };

        $details = "";

        if ($model instanceof User) {
            $displayRoleName = $this->getRoleDisplayName($targetType);
            if ($actionType === 'deleted') {
                $details = "{$displayRoleName} \"{$targetName}\" was deleted";
            } elseif ($actionType === 'created') {
                $details = "New {$displayRoleName} \"{$targetName}\" was created";
            } elseif ($actionType === 'updated') {
                $details = "{$displayRoleName} \"{$targetName}\" was updated";
            } else {
                // Fallback for other user-specific actions if any
                $details = "{$displayRoleName} \"{$targetName}\" was {$this->getActionVerb($actionType)}";
            }
        } else {
            // For non-User models (Outlet, FormTemplate, Audit, ComplianceRequirement, etc.)
            $displayTargetType = $this->getDisplayTargetType($targetType);

            // Customize the action verb based on the action type
            $actionVerb = 'was ' . $this->getActionVerb($actionType);

            $details = "{$displayTargetType} \"{$targetName}\" {$actionVerb}";
        }

        $this->createLogEntry(
            $targetType,
            $actionType,
            $details,
            Auth::id()
        );
    }

    protected function createLogEntry(string $targetType, string $actionType, string $details, ?int $userId): void
    {
        // Convert target type to user-friendly format
        $displayTargetType = $this->getDisplayTargetType($targetType);

        // Convert action type to user-friendly format
        $displayActionType = $this->getDisplayActionType($actionType);

        ActivityLog::create([
            'target_type' => $displayTargetType,
            'action_type' => $displayActionType,
            'details' => $details,
            'user_id' => $userId,
        ]);
    }

    protected function getTargetType(?Model $model): string
    {
        if (!$model) {
            return 'unknown';
        }

        return match (true) {
            $model instanceof User => $model->role ?? 'user',
            $model instanceof Outlet => 'outlet',
            $model instanceof FormTemplate => 'form_template',
            $model instanceof Role => 'role',
            $model instanceof Audit => 'audit',
            $model instanceof ComplianceRequirement => 'compliance_requirement',
            default => strtolower(class_basename($model))
        };
    }

    protected function getDisplayTargetType(string $targetType): string
    {
        return match ($targetType) {
            'admin' => 'Admin',
            'manager' => 'Manager',
            'outlet_user' => 'Outlet User',
            'user' => 'User',
            'outlet' => 'Outlet',
            'form_template' => 'Form Template',
            'compliance_requirement' => 'Compliance Requirement',
            'audit' => 'Audit',
            'role' => 'Role',
            'compliance_category' => 'Compliance Category',
            default => ucwords(str_replace(['_', '-'], ' ', $targetType))
        };
    }

    protected function getDisplayActionType(string $actionType): string
    {
        return match ($actionType) {
            'created' => 'Creation',
            'updated' => 'Update',
            'deleted' => 'Deletion',
            'restored' => 'Restoration',
            'force_deleted' => 'Deletion',
            'status_changed' => 'Status Change',
            'updated_attributes' => 'Update',
            'assign_manager' => 'Assignment',
            'unassign_manager' => 'Unassignment',
            'assign_outlet-user' => 'Assignment',
            'unassign_outlet-user' => 'Unassignment',
            default => ucwords(str_replace('_', ' ', $actionType))
        };
    }

    protected function getActionVerb(string $actionType): string
    {
        return match ($actionType) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'deleted',
            'restored' => 'restored',
            'force_deleted' => 'permanently deleted',
            'status_changed' => 'status changed',
            'updated_attributes' => 'updated',
            'assign_manager' => 'manager assigned',
            'unassign_manager' => 'manager unassigned',
            'assign_outlet-user' => 'outlet user assigned',
            'unassign_outlet-user' => 'outlet user unassigned',
            default => str_replace('_', ' ', $actionType)
        };
    }

    protected function getRoleDisplayName(string $roleName): string
    {
        switch ($roleName) {
            case 'admin':
                return 'Admin';
            case 'manager':
                return 'Manager';
            case 'outlet_user':
                return 'Outlet User';
            case 'user':
                return 'User';
            default:
                return ucfirst(str_replace(['_', '-'], ' ', $roleName));
        }
    }

    protected function logUserCreation(User $model): void
    {
        $model->load('roles'); // Ensure roles are loaded, though getTargetType now prioritizes role_id
        $userName = $model->name;
        $roleName = $this->getTargetType($model); // This will correctly return admin, manager, outlet_user or user (lowercase)
        $details = "New {$this->getRoleDisplayName($roleName)} \"{$userName}\" was created";
        $this->createLogEntry(
            $roleName,
            'created',
            $details,
            $model->created_by_user_id ?? Auth::id()
        );
    }

    protected function logOutletCreation(Outlet $model): void
    {
        // Log the outlet creation first
        $this->logActivity($model, 'created');

        // Then, if a manager was assigned during creation, log it separately
        if ($model->manager_role_id) {
            $manager = User::where('role_id', $model->manager_role_id)->first();
            if ($manager) {
                $this->logAssignment('manager', $model, $manager);
            }
        }

        // If an outlet user was assigned during creation, log it separately
        if ($model->outlet_user_role_id) {
            $outletUser = User::where('role_id', $model->outlet_user_role_id)->first();
            if ($outletUser) {
                $this->logAssignment('outlet-user', $model, $outletUser);
            }
        }
    }

    protected function logOutletUpdate(Outlet $model): void
    {
        $dirtyAttributes = $model->getDirty();
        $originalAttributes = $model->getOriginal();

        Log::info('logOutletUpdate called:', [
            'model_id' => $model->id,
            'dirty_attributes' => $dirtyAttributes,
            'original_attributes' => $originalAttributes
        ]);

        // Check for manager assignment/unassignment
        if (array_key_exists('manager_role_id', $dirtyAttributes)) {
            $newManagerRoleId = $model->manager_role_id;
            $oldManagerRoleId = $originalAttributes['manager_role_id'];

            Log::info('Processing manager_role_id change:', [
                'old_value' => $oldManagerRoleId,
                'new_value' => $newManagerRoleId
            ]);

            // Log unassignment of old manager if exists
            if ($oldManagerRoleId !== null) {
                $oldManager = User::where('role_id', $oldManagerRoleId)->first();
                if ($oldManager) {
                    $details = "Manager \"{$oldManager->name}\" was unassigned from outlet \"{$model->name}\"";
                    Log::info('Creating manager unassignment log entry:', ['details' => $details]);
                    $this->createLogEntry(
                        'outlet',
                        'unassign_manager',
                        $details,
                        Auth::id()
                    );
                }
            }

            // Log assignment of new manager if exists
            if ($newManagerRoleId !== null) {
                $newManager = User::where('role_id', $newManagerRoleId)->first();
                if ($newManager) {
                    $details = "Manager \"{$newManager->name}\" was assigned to outlet \"{$model->name}\"";
                    Log::info('Creating manager assignment log entry:', ['details' => $details]);
                    $this->createLogEntry(
                        'outlet',
                        'assign_manager',
                        $details,
                        Auth::id()
                    );
                }
            }
            unset($dirtyAttributes['manager_role_id']); // Remove after handling
        }

        // Check for outlet user assignment/unassignment
        if (array_key_exists('outlet_user_role_id', $dirtyAttributes)) {
            $newOutletUserRoleId = $model->outlet_user_role_id;
            $oldOutletUserRoleId = $originalAttributes['outlet_user_role_id'];

            Log::info('Processing outlet_user_role_id change:', [
                'old_value' => $oldOutletUserRoleId,
                'new_value' => $newOutletUserRoleId
            ]);

            // Log unassignment of old outlet user if exists
            if ($oldOutletUserRoleId !== null) {
                $oldOutletUser = User::where('role_id', $oldOutletUserRoleId)->first();
                if ($oldOutletUser) {
                    $details = "Outlet User \"{$oldOutletUser->name}\" was unassigned from outlet \"{$model->name}\"";
                    Log::info('Creating outlet user unassignment log entry:', ['details' => $details]);
                    $this->createLogEntry(
                        'outlet',
                        'unassign_outlet-user',
                        $details,
                        Auth::id()
                    );
                }
            }

            // Log assignment of new outlet user if exists
            if ($newOutletUserRoleId !== null) {
                $newOutletUser = User::where('role_id', $newOutletUserRoleId)->first();
                if ($newOutletUser) {
                    $details = "Outlet User \"{$newOutletUser->name}\" was assigned to outlet \"{$model->name}\"";
                    Log::info('Creating outlet user assignment log entry:', ['details' => $details]);
                    $this->createLogEntry(
                        'outlet',
                        'assign_outlet-user',
                        $details,
                        Auth::id()
                    );
                }
            }
            unset($dirtyAttributes['outlet_user_role_id']); // Remove after handling
        }

        // Log other general attribute changes if any remain after handling specific ones
        if (!empty($dirtyAttributes)) {
            Log::info('Processing remaining attribute changes:', $dirtyAttributes);
            $this->logOtherModelUpdates($model, $dirtyAttributes, 'outlet');
        }
    }

    protected function logFormTemplateCreation(FormTemplate $model): void
    {
        $details = "Form template \"{$model->name}\" was created";
        $this->createLogEntry(
            'form_template',
            'created',
            $details,
            $model->created_by_user_id
        );
    }

    protected function logFormTemplateUpdate(FormTemplate $model): void
    {
        $dirtyAttributes = $model->getDirty();

        if (isset($dirtyAttributes['status_id'])) {
            $oldStatusId = $model->getOriginal('status_id');
            $newStatusId = $model->status_id;

            $oldStatus = Status::find($oldStatusId)?->name;
            $newStatus = Status::find($newStatusId)?->name;

            $details = "Form template \"{$model->name}\" was {$newStatus}";
            $this->createLogEntry(
                'form_template',
                'status_updated',
                $details,
                Auth::id()
            );

            // Remove status_id from dirty attributes to avoid re-logging as 'other'
            unset($dirtyAttributes['status_id']);
        }

        // Log other general attribute changes if any remain
        $this->logOtherModelUpdates($model, $dirtyAttributes, 'form_template');
    }

    protected function logComplianceRequirementCreation(ComplianceRequirement $model): void
    {
        // Refresh the model to ensure we have the latest data
        $model = $model->fresh();
        $details = "Compliance requirement \"{$model->title}\" was created";
        $this->createLogEntry(
            'compliance_requirement',
            'created',
            $details,
            $model->created_by_user_id
        );
    }

    protected function logComplianceRequirementUpdate(ComplianceRequirement $model): void
    {
        $dirtyAttributes = $model->getDirty();

        if (isset($dirtyAttributes['status_id'])) {
            $oldStatusId = $model->getOriginal('status_id');
            $newStatusId = $model->status_id;

            $oldStatus = Status::find($oldStatusId)?->name;
            $newStatus = Status::find($newStatusId)?->name;

            $details = "Compliance requirement \"{$model->name}\" status changed from \"{$oldStatus}\" to \"{$newStatus}\"";
            $this->createLogEntry(
                'compliance_requirement',
                'status_updated',
                $details,
                Auth::id()
            );

            // Remove status_id from dirty attributes to avoid re-logging as 'other'
            unset($dirtyAttributes['status_id']);
        }

        // Log other general attribute changes if any remain
        $this->logOtherModelUpdates($model, $dirtyAttributes, 'compliance_requirement');
    }

    protected function logAssignment(string $roleType, Model $model, User $user, bool $isUnassignment = false): void
    {
        $displayRoleType = $this->getRoleDisplayName($roleType);

        // For unassignment, we need to get the user's name from the model's original state
        $userName = 'Unknown User';
        if ($user instanceof User) {
            $userName = $user->name;
        } elseif ($model instanceof Outlet) {
            if ($roleType === 'manager' && $model->getOriginal('manager_role_id')) {
                $oldManager = User::where('role_id', $model->getOriginal('manager_role_id'))->first();
                if ($oldManager) {
                    $userName = $oldManager->name;
                }
            } elseif ($roleType === 'outlet-user' && $model->getOriginal('outlet_user_role_id')) {
                $oldOutletUser = User::where('role_id', $model->getOriginal('outlet_user_role_id'))->first();
                if ($oldOutletUser) {
                    $userName = $oldOutletUser->name;
                }
            }
        }

        // Handle both string and Model inputs for model name
        $modelName = is_string($model) ? $model : $model->name;

        $details = $isUnassignment
            ? "{$displayRoleType} \"{$userName}\" was unassigned from outlet \"{$modelName}\""
            : "{$displayRoleType} \"{$userName}\" was assigned to outlet \"{$modelName}\"";

        $this->createLogEntry(
            'outlet',
            $isUnassignment ? 'unassign_' . $roleType : 'assign_' . $roleType,
            $details,
            Auth::id()
        );
    }

    protected function logOtherModelUpdates(Model $model, array $dirtyAttributes, string $targetType): void
    {
        if (empty($dirtyAttributes)) {
            return;
        }

        // Skip logging structure changes for form templates
        if ($model instanceof FormTemplate && isset($dirtyAttributes['structure'])) {
            $details = "Form template \"{$model->name}\" was updated";
            $this->createLogEntry(
                $targetType,
                'updated',
                $details,
                Auth::id()
            );
            return;
        }

        // Exclude timestamp fields and role ID fields from logging
        $excludedFields = [
            'updated_at',
            'created_at',
            'manager_role_id',
            'outlet_user_role_id'
        ];
        $dirtyAttributes = array_diff_key($dirtyAttributes, array_flip($excludedFields));

        if (empty($dirtyAttributes)) {
            return;
        }

        $displayTargetType = $this->getDisplayTargetType($targetType);
        $targetName = match (true) {
            $model instanceof ComplianceRequirement => $model->title,
            default => $model->name ?? $model->getKey()
        };
        $userName = Auth::user()?->name ?? 'Unknown User';

        $changes = [];
        foreach ($dirtyAttributes as $attribute => $newValue) {
            $oldValue = $model->getOriginal($attribute);
            $displayAttribute = $this->formatAttributeName($attribute);

            // Format the values for display
            $oldValueDisplay = $this->formatAttributeValue($oldValue);
            $newValueDisplay = $this->formatAttributeValue($newValue);

            $changes[] = "{$displayAttribute} was changed from {$oldValueDisplay} to {$newValueDisplay}";
        }

        $details = "{$displayTargetType} \"{$targetName}\" was updated: " . implode(', ', $changes);

        $this->createLogEntry(
            $targetType,
            'updated',
            $details,
            Auth::id()
        );
    }

    /**
     * Format values for display in activity log
     */
    protected function formatValue($value, string $attribute): string
    {
        if (is_null($value)) {
            return 'empty';
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        // Format phone numbers
        if ($attribute === 'phone_number') {
            return "'" . $value . "'";
        }

        // Format boolean values
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }

        // Format other string values
        return "'" . (string)$value . "'";
    }

    protected function formatAttributeName(string $attribute): string
    {
        return ucwords(str_replace('_', ' ', $attribute));
    }

    protected function formatAttributeValue($value): string
    {
        if (is_null($value)) {
            return 'empty';
        }

        if (is_array($value)) {
            // Check if this is operating hours data
            if (isset($value[0]) && isset($value[0]['day']) && isset($value[0]['isOpen'])) {
                $changes = [];
                foreach ($value as $day) {
                    if ($day['isOpen']) {
                        $changes[] = "{$day['day']}: {$day['openTime']} - {$day['closeTime']}";
                    } else {
                        $changes[] = "{$day['day']}: Closed";
                    }
                }
                return implode(', ', $changes);
            }
            return json_encode($value);
        }

        // Format phone numbers
        if (is_string($value) && preg_match('/^\+?[0-9\s-]+$/', $value)) {
            return "'" . $value . "'";
        }

        // Format boolean values
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }

        // Format other string values
        return "'" . (string)$value . "'";
    }

    protected function logUserUpdate(User $model): void
    {
        $dirtyAttributes = $model->getDirty();

        // Exclude timestamp fields from logging
        $excludedFields = ['updated_at', 'created_at'];
        $dirtyAttributes = array_diff_key($dirtyAttributes, array_flip($excludedFields));

        if (empty($dirtyAttributes)) {
            return;
        }

        $roleName = $this->getTargetType($model);
        $userName = $model->name;
        $changes = [];

        foreach ($dirtyAttributes as $attribute => $newValue) {
            $oldValue = $model->getOriginal($attribute);
            $displayAttribute = $this->formatAttributeName($attribute);

            // Format the values for display
            $oldValueDisplay = $this->formatAttributeValue($oldValue);
            $newValueDisplay = $this->formatAttributeValue($newValue);

            $changes[] = "{$displayAttribute} was changed from {$oldValueDisplay} to {$newValueDisplay}";
        }

        $details = "{$this->getRoleDisplayName($roleName)} \"{$userName}\" was updated: " . implode(', ', $changes);

        $this->createLogEntry(
            $roleName,
            'updated',
            $details,
            Auth::id()
        );
    }

    protected function logAuditFormCreation(AuditForm $model): void
    {
        // Get the audit and form template details
        $audit = $model->audit;
        $formTemplate = $model->formTemplate;
        $outlet = $audit->outlet;
        $compliance = $audit->complianceRequirement;

        $details = "Audit form \"{$formTemplate->name}\" was submitted for outlet \"{$outlet->name}\" (Compliance: {$compliance->title})";

        $this->createLogEntry(
            'audit_form',
            'created',
            $details,
            Auth::id()
        );
    }

    protected function logAuditFormUpdate(AuditForm $model): void
    {
        // Get the audit and form template details
        $audit = $model->audit;
        $formTemplate = $model->formTemplate;
        $outlet = $audit->outlet;
        $compliance = $audit->complianceRequirement;

        $details = "Audit form \"{$formTemplate->name}\" was updated for outlet \"{$outlet->name}\" (Compliance: {$compliance->title})";

        $this->createLogEntry(
            'audit_form',
            'updated',
            $details,
            Auth::id()
        );
    }
}
