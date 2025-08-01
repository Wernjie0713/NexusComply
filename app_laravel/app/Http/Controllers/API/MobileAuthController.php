<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Silber\Bouncer\BouncerFacade as Bouncer;

class MobileAuthController extends Controller
{
    /**
     * Handle a login request to the mobile application.
     * 
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Use the same authentication logic from Breeze's LoginRequest
            $request->authenticate();

            // For API, we don't use sessions but tokens
            $user = $request->user();

            // Check if the user has the outlet-user role
            if (!Bouncer::is($user)->an('outlet-user')) {
                // Logout the user since they don't have the correct role
                Auth::logout();

                return response()->json([
                    'message' => 'Access denied. This application is for Outlet Users only.',
                ], 403);
            }

            // Log the login activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action_type' => 'Login',
                'target_type' => 'User',
                'details' => 'User "' . $user->name . '" logged in via mobile. IP: ' . $request->ip(),
                'created_at' => now(),
            ]);

            // Revoke previous tokens and create a new one
            $user->tokens()->delete();
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'outlet-user',
                ],
                'token' => $token,
                'message' => 'Login successful'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Handle a logout request from the mobile application.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // For API tokens, just delete the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Handle a password reset link request from mobile.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Reuse the same Password Broker service from Breeze
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status)
            ]);
        }

        // If we have an error, return it with proper status code
        return response()->json([
            'message' => trans($status),
            'errors' => ['email' => [trans($status)]]
        ], 422);
    }

    /**
     * Handle a new password request from mobile.
     * 
     * @param  \Illuminate\Http\Request  $requeste
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            // 'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Reuse the same password reset logic from Breeze
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status)
            ]);
        }

        return response()->json([
            'message' => trans($status),
            'errors' => ['email' => [trans($status)]]
        ], 422);
    }
}
