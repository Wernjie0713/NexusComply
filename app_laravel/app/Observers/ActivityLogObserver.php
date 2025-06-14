<?php

namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Silber\Bouncer\BouncerFacade as Bouncer;
use Illuminate\Support\Facades\Log;

class ActivityLogObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        if ($model instanceof \App\Models\User) {
            Log::info('User created in observer', [
                'user_id' => $model->id,
                'user_name' => $model->name,
                'role_id' => $model->role_id,
                'roles' => Bouncer::role()->whereAssignedTo($model)->get()->toArray()
            ]);
        }
        $this->logActivity($model, 'create');
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        if ($model instanceof \App\Models\User) {
            $model->load('roles');
        }
        $this->logActivity($model, 'update');
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        // Store model data before it's deleted
        $modelData = [
            'name' => $model->name ?? 'Unknown',
            'role' => $model instanceof \App\Models\User ? (Bouncer::role()->whereAssignedTo($model)->first()->name ?? 'Unknown') : 'Unknown',
            'id' => $model->id
        ];
        
        $this->logActivity($model, 'delete', $modelData);
    }

    /**
     * Log the activity
     */
    protected function logActivity(Model $model, string $action, array $modelData = []): void
    {
        $details = '';
        
        switch (class_basename($model)) {
            case 'User':
                if ($action === 'create') {
                    $roleName = Bouncer::role()->whereAssignedTo($model)->first()->name ?? 'Unknown';
                    $details = "New user \"{$model->name}\" created with role {$roleName}";
                } elseif ($action === 'update') {
                    $details = "Updated user \"{$model->name}\"";
                } elseif ($action === 'delete') {
                    $details = "Deleted user \"{$modelData['name']}\"";
                }
                break;
                
            case 'Outlet':
                if ($action === 'create') {
                    $details = "New outlet \"{$model->name}\" created";
                } elseif ($action === 'update') {
                    $details = "Updated outlet profile for \"{$model->name}\"";
                } elseif ($action === 'delete') {
                    $details = "Deleted outlet \"{$modelData['name']}\"";
                }
                break;
                
            case 'Audit':
                if ($action === 'create') {
                    $details = "New audit \"{$model->name}\" created";
                } elseif ($action === 'update') {
                    $details = "Updated audit \"{$model->name}\"";
                } elseif ($action === 'delete') {
                    $details = "Deleted audit \"{$modelData['name']}\"";
                }
                break;
                
            case 'ComplianceRequirement':
                if ($action === 'create') {
                    $details = "New compliance framework \"{$model->name}\" created";
                } elseif ($action === 'update') {
                    $details = "Updated compliance framework \"{$model->name}\"";
                } elseif ($action === 'delete') {
                    $details = "Deleted compliance framework \"{$modelData['name']}\"";
                }
                break;
        }

        if ($details) {
            ActivityLog::create([
                'action_type' => $action,
                'target_type' => strtolower(class_basename($model)),
                'details' => $details,
                'user_id' => auth()->id() ?? null,
            ]);
        }
    }
} 