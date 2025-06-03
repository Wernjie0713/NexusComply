<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\UserController;
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
    
    // Compliance Framework Setup page
    Route::get('/admin/compliance-frameworks', function () {
        return Inertia::render('Admin/ComplianceFramework/SetupPage');
    })->name('compliance-frameworks.setup');
    
    // Form Builder routes
    Route::get('/admin/forms/builder/new', function () {
        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'create',
            'formId' => null
        ]);
    })->name('forms.builder.new');
    
    Route::get('/admin/forms/builder/{formId}', function ($formId) {
        return Inertia::render('Admin/Forms/BuilderPage', [
            'mode' => 'edit',
            'formId' => $formId
        ]);
    })->name('forms.builder.edit');
    
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
    
    // API routes for outlet user assignment
    Route::get('/admin/outlet-users', [\App\Http\Controllers\Admin\OutletController::class, 'getOutletUsers'])
        ->name('admin.outlet-users');
    Route::get('/admin/managers', [\App\Http\Controllers\Admin\OutletController::class, 'getManagers'])
        ->name('admin.managers');
    
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
