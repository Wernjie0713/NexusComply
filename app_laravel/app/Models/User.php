<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Silber\Bouncer\Database\HasRolesAndAbilities;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomResetPassword;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRolesAndAbilities;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the outlets managed by this user (if manager).
     */
    public function managedOutlets()
    {
        return $this->hasMany(\App\Models\Outlet::class, 'manager_role_id', 'role_id');
    }

    /**
     * Get the outlet where this user is assigned as outlet_user.
     */
    public function outletUserOutlet()
    {
        return $this->hasOne(\App\Models\Outlet::class, 'outlet_user_role_id', 'role_id');
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * A manual, reliable way to get a user's abilities, bypassing Bouncer's failing API.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAbilitiesManually()
    {
        return DB::table('permissions')
            ->join('assigned_roles', 'permissions.entity_id', '=', 'assigned_roles.role_id')
            ->join('abilities', 'permissions.ability_id', '=', 'abilities.id')
            ->where('permissions.entity_type', config('bouncer.models.role'))
            ->where('assigned_roles.entity_id', $this->id)
            ->where('assigned_roles.entity_type', self::class)
            ->pluck('abilities.name')
            ->unique();
    }
}
