<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class OutletController extends Controller
{
    /**
     * Display a listing of the outlets.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);

        $outlets = Outlet::with(['outletUser:id,name,email,role_id', 'manager:id,name,email,role_id'])
            ->orderBy('name')
            ->paginate($perPage)
            ->through(function ($outlet) {
                return [
                    'id' => $outlet->id,
                    'name' => $outlet->name,
                    'address' => $outlet->address,
                    'city' => $outlet->city,
                    'state' => $outlet->state,
                    'postal_code' => $outlet->postal_code,
                    'phone_number' => $outlet->phone_number,
                    'operating_hours_info' => $outlet->operating_hours_info,
                    'outlet_user' => $outlet->outletUser,
                    'outlet_user_role_id' => $outlet->outlet_user_role_id,
                    'manager' => $outlet->manager,
                    'manager_role_id' => $outlet->manager_role_id,
                    'is_active' => $outlet->is_active,
                ];
            });

        return Inertia::render('Admin/Outlets/IndexPage', [
            'outlets' => $outlets,
        ]);
    }

    /**
     * Show the form for creating a new outlet.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Get only outlet users who are not already assigned to any outlet
        $outletUsers = User::whereIs('outlet-user')
            ->select('id', 'name', 'email', 'role_id')
            ->whereNotIn('role_id', function($query) {
                $query->select('outlet_user_role_id')
                      ->from('outlets')
                      ->whereNotNull('outlet_user_role_id');
            })
            ->orderBy('name')
            ->get();
            
        // Get all managers
        $managers = User::whereIs('manager')
            ->select('id', 'name', 'email', 'role_id')
            ->orderBy('name')
            ->get();
            
        Log::info('Create Outlet - Available Users:', [
            'outletUsers_count' => $outletUsers->count(),
            'managers_count' => $managers->count(),
        ]);
            
        return Inertia::render('Admin/Outlets/CreatePage', [
            'outletUsers' => $outletUsers,
            'managers' => $managers,
        ]);
    }

    /**
     * Store a newly created outlet in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        Log::info('Outlet Store Request Data:', $request->all());
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'address' => ['required', 'string'],
                'city' => ['nullable', 'string', 'max:100'],
                'state' => ['nullable', 'string', 'max:100'],
                'postal_code' => ['nullable', 'string', 'max:20'],
                'phone_number' => ['nullable', 'string', 'max:20'],
                'operating_hours_info' => ['nullable', 'array'],
                'operating_hours_info.*.day' => ['required_with:operating_hours_info', 'string'],
                'operating_hours_info.*.isOpen' => ['required_with:operating_hours_info', 'boolean'],
                'operating_hours_info.*.openTime' => ['nullable', 'required_if:operating_hours_info.*.isOpen,true', 'string', 'date_format:H:i'],
                'operating_hours_info.*.closeTime' => ['nullable', 'required_if:operating_hours_info.*.isOpen,true', 'string', 'date_format:H:i', 'after:operating_hours_info.*.openTime'],
                'outlet_user_role_id' => [
                    'nullable',
                    'exists:users,role_id',
                    Rule::unique('outlets', 'outlet_user_role_id')->whereNotNull('outlet_user_role_id'),
                ],
                'manager_role_id' => ['nullable', 'exists:users,role_id'],
                'is_active' => ['boolean'],
            ], [
                'outlet_user_role_id.unique' => 'This Outlet User is already assigned to another outlet.'
            ]);

            Log::info('Data before Outlet::create():', $validated);
            $outlet = Outlet::create($validated);
            Log::info('Outlet created successfully:', $outlet->toArray());
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Outlet Store Validation Failed:', $e->errors());
            throw $e;
        }
        return redirect()->route('admin.outlets.index')
            ->with('success', 'Outlet created successfully.');
    }

    /**
     * Show the form for editing the specified outlet.
     *
     * @param  \App\Models\Outlet  $outlet
     * @return \Inertia\Response
     */
    public function edit(Outlet $outlet)
    {
        // Load relationships to get full user objects
        $outlet->load(['outletUser', 'manager']);
        
        // Get outlet users that are either:
        // 1. Not assigned to any outlet
        // 2. Currently assigned to this outlet
        $outletUsers = User::whereIs('outlet-user')
            ->select('id', 'name', 'email', 'role_id')
            ->where(function($query) use ($outlet) {
                $query->whereNotIn('role_id', function($subquery) {
                        $subquery->select('outlet_user_role_id')
                                ->from('outlets')
                                ->whereNotNull('outlet_user_role_id');
                    })
                    ->orWhere('role_id', $outlet->outlet_user_role_id);
            })
            ->orderBy('name')
            ->get();
        
        // Get all managers, including the one assigned to this outlet
        $managers = User::whereIs('manager')
            ->select('id', 'name', 'email', 'role_id')
            ->orderBy('name')
            ->get();
            
        $outletData = [
            'id' => $outlet->id,
            'name' => $outlet->name,
            'address' => $outlet->address,
            'city' => $outlet->city,
            'state' => $outlet->state,
            'postal_code' => $outlet->postal_code,
            'phone_number' => $outlet->phone_number,
            'operating_hours_info' => $outlet->operating_hours_info,
            'outlet_user_role_id' => $outlet->outlet_user_role_id,
            'manager_role_id' => $outlet->manager_role_id,
            'is_active' => $outlet->is_active,
        ];
        
        Log::info('Edit Outlet - Available Users:', [
            'outlet' => $outletData,
            'outlet_user_role_id' => $outlet->outlet_user_role_id,
            'manager_role_id' => $outlet->manager_role_id,
            'outletUsers_count' => $outletUsers->count(),
            'managers_count' => $managers->count(),
        ]);
        
        return Inertia::render('Admin/Outlets/EditPage', [
            'outlet' => $outletData,
            'outletUsers' => $outletUsers,
            'managers' => $managers,
        ]);
    }

    /**
     * Update the specified outlet in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Outlet  $outlet
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Outlet $outlet)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'address' => ['required', 'string'],
                'city' => ['nullable', 'string', 'max:100'],
                'state' => ['nullable', 'string', 'max:100'],
                'postal_code' => ['nullable', 'string', 'max:20'],
                'phone_number' => ['nullable', 'string', 'max:20'],
                'operating_hours_info' => ['nullable', 'array'],
                'operating_hours_info.*.day' => ['required_with:operating_hours_info', 'string'],
                'operating_hours_info.*.isOpen' => ['required_with:operating_hours_info', 'boolean'],
                'operating_hours_info.*.openTime' => ['nullable', 'required_if:operating_hours_info.*.isOpen,true', 'string', 'date_format:H:i'],
                'operating_hours_info.*.closeTime' => ['nullable', 'required_if:operating_hours_info.*.isOpen,true', 'string', 'date_format:H:i', 'after:operating_hours_info.*.openTime'],
                'outlet_user_role_id' => [
                    'nullable',
                    'exists:users,role_id',
                    Rule::unique('outlets', 'outlet_user_role_id')->whereNotNull('outlet_user_role_id')->ignore($outlet->id),
                ],
                'manager_role_id' => ['nullable', 'exists:users,role_id'],
                'is_active' => ['boolean'],
            ], [
                'outlet_user_role_id.unique' => 'This Outlet User is already assigned to another outlet.'
            ]);

            // Handle role changes separately to ensure proper logging
            if (array_key_exists('outlet_user_role_id', $validated)) {
                $outlet->outlet_user_role_id = $validated['outlet_user_role_id'];
                $outlet->save();
                unset($validated['outlet_user_role_id']);
            }

            if (array_key_exists('manager_role_id', $validated)) {
                $outlet->manager_role_id = $validated['manager_role_id'];
                $outlet->save();
                unset($validated['manager_role_id']);
            }

            // Update remaining attributes
            if (!empty($validated)) {
                $outlet->update($validated);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Outlet Update Validation Failed:', $e->errors());
            throw $e;
        }
        return redirect()->route('admin.outlets.index')
            ->with('success', 'Outlet updated successfully.');
    }

    /**
     * Remove the specified outlet from storage.
     *
     * @param  \App\Models\Outlet  $outlet
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Outlet $outlet)
    {
        $outlet->delete();

        return redirect()->route('admin.outlets.index')
            ->with('success', 'Outlet deleted successfully.');
    }

    /**
     * Get users with the 'outlet-user' role for dropdown selection.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOutletUsers()
    {
        $outletUsers = User::whereIs('outlet-user')
            ->select('id', 'name', 'email', 'role_id')
            ->orderBy('name')
            ->get();

        return response()->json($outletUsers);
    }

    /**
     * Get users with the 'manager' role for dropdown selection.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManagers()
    {
        $managers = User::whereIs('manager')
            ->select('id', 'name', 'email', 'role_id')
            ->orderBy('name')
            ->get();

        return response()->json($managers);
    }

    /**
     * Get outlets that do not have an assigned Outlet User.
     * Used for the Create User form.
     */
    public function availableOutlets(Request $request)
    {
        // If a manager_id is provided, we include outlets already assigned to this manager
        $managerId = $request->input('manager_id');
        
        $query = Outlet::orderBy('name');
        
        if ($request->has('for_role') && $request->input('for_role') === 'manager') {
            // For managers, we want outlets that are:
            // 1. Not assigned to any manager (manager_role_id is null)
            // 2. Already assigned to this manager (if editing)
            if ($managerId) {
                $query->where(function($q) use ($managerId) {
                    $q->whereNull('manager_role_id')
                      ->orWhere('manager_role_id', $managerId);
                });
            } else {
                $query->whereNull('manager_role_id');
            }
        } else {
            // For outlet users, we want outlets without an assigned user
            $query->whereNull('outlet_user_role_id');
            
            // If editing an outlet user, include their current outlet
            if ($request->has('current_outlet_id')) {
                $currentOutletId = $request->input('current_outlet_id');
                $query->orWhere('id', $currentOutletId);
            }
        }
        
        $outlets = $query->get(['id', 'name']);
        
        return response()->json($outlets);
    }
}