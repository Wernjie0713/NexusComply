<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\MobileAuthController;
use App\Http\Controllers\API\MobileProfileController;
use App\Http\Controllers\API\MobileDashboardController;
use App\Http\Controllers\API\MobileComplianceFormController;
use App\Http\Controllers\Api\Mobile\ComplianceRequirementController;
use App\Http\Controllers\API\MobileAuditController;
use App\Http\Controllers\Admin\RolePermissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Mobile app routes for authenticated users
    Route::prefix('mobile')->group(function () {
        // Logout route
        Route::post('/logout', [MobileAuthController::class, 'logout']);

        // User profile routes
        Route::get('/profile', [MobileProfileController::class, 'show']);
        Route::put('/profile', [MobileProfileController::class, 'update']);
        
        // Get current user's outlet
        Route::get('/outlet', [MobileProfileController::class, 'getOutlet']);

        // Dashboard data
        Route::get('/dashboard', [MobileDashboardController::class, 'getData']);

        // Compliance Form
        Route::get('/compliance-forms', [MobileComplianceFormController::class, 'index']);

        // Get form templates for a compliance requirement
        Route::get('/compliance-requirements/{complianceRequirement}/form-templates', [ComplianceRequirementController::class, 'getFormTemplates']);

        // Audit routes
        Route::post('/audits', [MobileAuditController::class, 'store']);
        Route::get('/audits', [MobileAuditController::class, 'getUserAudits']);
        Route::get('/outlets/{id}', [MobileAuditController::class, 'getOutlet']);
        Route::post('/audits/submit-form', [MobileAuditController::class, 'submitForm']);
        Route::post('/audits/upload-file', [MobileAuditController::class, 'uploadFile']);
        Route::delete('/audits/delete-file', [MobileAuditController::class, 'deleteFile']);
        Route::get('/audits/{id}', [MobileAuditController::class, 'show']);
        Route::delete('/audits/{id}', [MobileAuditController::class, 'destroy']);
        Route::put('/audits/{id}/submit', [MobileAuditController::class, 'submit']);
    });

    // Admin routes for authenticated users
    Route::prefix('admin')->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'roles']);
        Route::get('/abilities', [RolePermissionController::class, 'abilities']);
        Route::get('/roles/{role}/abilities', [RolePermissionController::class, 'getRoleAbilities']);
        Route::post('/roles/{role}/abilities', [RolePermissionController::class, 'updateRoleAbilities']);
    });
});

// Mobile app authentication routes (no auth required)
Route::prefix('mobile')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'login']);
    Route::post('/forgot-password', [MobileAuthController::class, 'sendResetLink']);
    Route::post('/reset-password', [MobileAuthController::class, 'resetPassword']);
});

// Mobile Compliance Form routes
Route::get('/mobile/compliance-forms', [MobileComplianceFormController::class, 'index']);
Route::get('/mobile/audits/{auditId}/forms', [MobileComplianceFormController::class, 'getAuditForms']);
Route::get('/mobile/audit-forms/{auditFormId}/issue', [MobileComplianceFormController::class, 'getAuditFormIssue']);
Route::post('/mobile/audits/upload-file', [MobileAuditController::class, 'uploadFile']);
