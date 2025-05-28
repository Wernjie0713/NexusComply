<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\MobileAuthController;
use App\Http\Controllers\API\MobileProfileController;
use App\Http\Controllers\API\MobileDashboardController;

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
        
        // Dashboard data
        Route::get('/dashboard', [MobileDashboardController::class, 'getData']);
        
        // Additional mobile-specific routes will be added here
    });
});

// Mobile app authentication routes (no auth required)
Route::prefix('mobile')->group(function () {
    Route::post('/login', [MobileAuthController::class, 'login']);
    Route::post('/forgot-password', [MobileAuthController::class, 'sendResetLink']);
    Route::post('/reset-password', [MobileAuthController::class, 'resetPassword']);
}); 