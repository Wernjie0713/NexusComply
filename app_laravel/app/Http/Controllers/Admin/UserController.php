<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the user management index page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Admin/Users/IndexPage');
    }

    /**
     * Display the activity log for a specific user.
     *
     * @param int $userId
     * @return \Inertia\Response
     */
    public function activityLog($userId)
    {
        return Inertia::render('Admin/Users/ActivityLogPage', [
            'userId' => $userId,
        ]);
    }
} 