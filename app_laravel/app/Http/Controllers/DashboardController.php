<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Silber\Bouncer\BouncerFacade as Bouncer;

class DashboardController extends Controller
{
    /**
     * Show the appropriate dashboard based on user role.
     *
     * @return \Inertia\Response
     */
    public function show()
    {
        $user = Auth::user();
        
        // Check if user has admin role using Bouncer
        if (Bouncer::is($user)->an('admin')) {
            return app(AdminDashboardController::class)->index();
        }
        
        // Check if user has manager role
        if (Bouncer::is($user)->a('manager')) {
            return app(\App\Http\Controllers\Manager\DashboardController::class)->index();
        }
        
        // For all other roles (outlet_staff, or default user)
        // We'll use the default dashboard for now
        return Inertia::render('Dashboard');
    }
}
