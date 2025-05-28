<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Silber\Bouncer\BouncerFacade as Bouncer;

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
                'user' => $request->user(),
            ],
            'abilities' => function () use ($request) {
                if (!$request->user()) {
                    return null;
                }
                
                return [
                    'roles' => Bouncer::role()->whereAssignedTo($request->user())->pluck('name')->toArray(),
                    'permissions' => Bouncer::can($request->user()),
                ];
            },
        ];
    }
}
