<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Observers\ActivityLogObserver;
use App\Models\User;
use App\Models\Outlet;
use App\Models\Audit;
use App\Models\ComplianceRequirement;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register activity log observers
        User::observe(ActivityLogObserver::class);
        Outlet::observe(ActivityLogObserver::class);
        Audit::observe(ActivityLogObserver::class);
        ComplianceRequirement::observe(ActivityLogObserver::class);
    }
}
