<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Silber\Bouncer\BouncerFacade as Bouncer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'title' => $role->title,
                        ];
                    }),
                ] : null,
            ],
            'abilities' => function () use ($request) {
                if (!$request->user()) {
                    return null;
                }

                // Refresh Bouncer's cache for the user on every request
                // This ensures that the latest permissions are always loaded
                Bouncer::refreshFor($request->user());

                // Get all roles
                $roles = Bouncer::role()->whereAssignedTo($request->user())->pluck('name')->toArray();

                // Get all abilities for the user using our new reliable method
                $userAbilities = $request->user()->getAbilitiesManually();

                $permissions = [];
                foreach ($userAbilities as $abilityName) {
                    $permissions[$abilityName] = true;
                }

                return [
                    'roles' => $roles,
                    'permissions' => $permissions,
                ];
            },
        ];
    }
}
