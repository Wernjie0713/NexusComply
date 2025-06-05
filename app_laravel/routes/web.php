<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\FormTemplateController;
use App\Http\Controllers\Admin\ComplianceRequirementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        // 'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Unified dashboard route that uses DashboardController to handle role-based rendering
Route::get('/dashboard', [DashboardController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// User management routes - controller handles role-based access
Route::middleware(['auth', 'verified'])->group(function () {
    // User listing page
    Route::get('/users', [UserController::class, 'index'])
        ->name('users.index');
    
    // User activity log page
    Route::get('/users/{user}/activity-log', [UserController::class, 'activityLog'])
        ->name('users.activity-log');
    
    // Audit management pages
    Route::get('/audits', function () {
        return Inertia::render('Admin/Audits/IndexPage');
    })->name('audits.index');
    
    // Share form access page
    Route::get('/audits/share-form/{formId}', function ($formId) {
        return Inertia::render('Admin/Audits/ShareFormAccessPage', [
            'formId' => $formId
        ]);
    })->name('audits.share-form');
    
    // Compliance Requirements routes
    Route::resource('/admin/compliance-requirements', ComplianceRequirementController::class)
        ->names([
            'index' => 'admin.compliance-requirements.index',
            'store' => 'admin.compliance-requirements.store',
            'update' => 'admin.compliance-requirements.update',
            'destroy' => 'admin.compliance-requirements.destroy',
        ])
        ->except(['create', 'edit', 'show']); // Not needed for inline form handling
    
    // Form Template routes
    Route::resource('/admin/form-templates', FormTemplateController::class)
        ->names([
            'index' => 'admin.form-templates.index',
            'create' => 'admin.form-templates.create',
            'store' => 'admin.form-templates.store',
            'edit' => 'admin.form-templates.edit',
            'update' => 'admin.form-templates.update',
            'destroy' => 'admin.form-templates.destroy',
        ]);
    
    // Settings - Roles & Permissions page
    Route::get('/admin/settings/roles-permissions', function () {
        return Inertia::render('Admin/Settings/RolesPermissionsPage');
    })->name('settings.roles-permissions');
    
    // Outlet Management Routes
    Route::resource('/admin/outlets', \App\Http\Controllers\Admin\OutletController::class)
        ->names([
            'index' => 'admin.outlets.index',
            'create' => 'admin.outlets.create',
            'store' => 'admin.outlets.store',
            'edit' => 'admin.outlets.edit',
            'update' => 'admin.outlets.update',
            'destroy' => 'admin.outlets.destroy',
        ]);
    
    // User Management Routes
    Route::resource('/admin/users', \App\Http\Controllers\Admin\UserController::class)
        ->names([
            'index' => 'admin.users.index',
            'create' => 'admin.users.create',
            'store' => 'admin.users.store',
            'edit' => 'admin.users.edit',
            'update' => 'admin.users.update',
            'destroy' => 'admin.users.destroy',
        ]);
    
    // API routes for outlet user assignment
    Route::get('/admin/outlet-users', [\App\Http\Controllers\Admin\OutletController::class, 'getOutletUsers'])
        ->name('admin.outlet-users');
    Route::get('/admin/managers', [\App\Http\Controllers\Admin\OutletController::class, 'getManagers'])
        ->name('admin.managers');
    // API route for available outlets for user creation
    Route::get('/admin/available-outlets', [\App\Http\Controllers\Admin\OutletController::class, 'availableOutlets'])
        ->name('admin.available-outlets');
    
    // Manager Routes
    Route::get('/manager/audits', function () {
        return Inertia::render('Manager/Audits/IndexPage');
    })->name('manager.audits');
    
    Route::get('/manager/audits/share-form/{formId}', function ($formId) {
        return Inertia::render('Manager/Audits/ShareFormAccessPage', [
            'formId' => $formId
        ]);
    })->name('manager.audits.share-form');
    
    // User Management Routes for Manager
    Route::get('/manager/users', function () {
        return Inertia::render('Manager/Users/IndexPage');
    })->name('manager.users');
    
    Route::get('/manager/users/{userId}/activity-log', function ($userId) {
        return Inertia::render('Manager/Users/ActivityLogPage', [
            'userId' => $userId
        ]);
    })->name('manager.users.activity-log');
    
    Route::get('/manager/reports', function () {
        return Inertia::render('Manager/ReportsPage');
    })->name('manager.reports');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Custom auth routes to override Breeze defaults with Admin-themed components
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Admin/Auth/LoginPage');
    })->name('login');
    
    Route::get('/forgot-password', function () {
        return Inertia::render('Admin/Auth/ForgotPasswordPage');
    })->name('password.request');
    
    Route::get('/reset-password/{token}', function ($token) {
        return Inertia::render('Admin/Auth/ResetPasswordPage', [
            'token' => $token,
            'email' => request('email'),
        ]);
    })->name('password.reset');
});

// Include standard auth routes (for POST handlers)
require __DIR__.'/auth.php';
