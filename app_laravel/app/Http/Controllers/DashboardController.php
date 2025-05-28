<?php

namespace App\Http\Controllers;

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
            return Inertia::render('Admin/DashboardPage');
        }
        
        // Check if user has regional manager role
        if (Bouncer::is($user)->a('regional-manager')) {
            return Inertia::render('Manager/DashboardPage');
        }
        
        // For all other roles (outlet_staff, or default user)
        // We'll use the default dashboard for now
        return Inertia::render('Dashboard');
    }
}
