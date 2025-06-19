<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class MobileProfileController extends Controller
{
    /**
     * Get the user's profile information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoles(),
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        // Validate the incoming request
        // Note: We're reusing the same validation rules as the web profile update
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($request->user()->id),
            ],
        ]);

        // Update the user's profile
        $user = $request->user();
        $user->fill($validated);

        // Handle email verification status
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Get the current user's outlet information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOutlet(Request $request): JsonResponse
    {
        $user = $request->user();
        \Log::info('User requesting outlet:', [
            'user_id' => $user->id,
            'role_id' => $user->role_id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoles()
        ]);

        // Use the relationship defined in User model
        $outlet = $user->outletUserOutlet;
        
        \Log::info('Outlet query result:', [
            'outlet_found' => $outlet ? true : false,
            'outlet_details' => $outlet ? $outlet->toArray() : null
        ]);

        if (!$outlet) {
            return response()->json([
                'message' => 'No outlet assigned to this user',
                'debug_info' => [
                    'user_role_id' => $user->role_id,
                    'roles' => $user->getRoles()
                ]
            ], 404);
        }

        return response()->json([
            'id' => $outlet->id,
            'name' => $outlet->name,
            'address' => $outlet->address,
            'city' => $outlet->city,
            'state' => $outlet->state,
            'postal_code' => $outlet->postal_code,
            'phone_number' => $outlet->phone_number,
            'operating_hours_info' => $outlet->operating_hours_info
        ]);
    }
} 