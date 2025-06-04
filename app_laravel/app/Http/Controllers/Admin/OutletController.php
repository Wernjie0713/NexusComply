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
    public function index()
    {
        $outlets = Outlet::with(['outletUser:id,name,email', 'manager:id,name,email'])
            ->orderBy('name')
            ->get()
            ->map(function ($outlet) {
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
                    'manager' => $outlet->manager,
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
        $outletUsers = User::whereIs('outlet-user')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        $managers = User::whereIs('manager')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
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
                'outlet_user_id' => [
                    'nullable',
                    'exists:users,id',
                    Rule::unique('outlets', 'outlet_user_id')->whereNotNull('outlet_user_id'),
                ],
            'manager_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
            ], [
                'outlet_user_id.unique' => 'This Outlet User is already assigned to another outlet.'
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
        $outletUsers = User::whereIs('outlet-user')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        $managers = User::whereIs('manager')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        return Inertia::render('Admin/Outlets/EditPage', [
            'outlet' => [
                'id' => $outlet->id,
                'name' => $outlet->name,
                'address' => $outlet->address,
                'city' => $outlet->city,
                'state' => $outlet->state,
                'postal_code' => $outlet->postal_code,
                'phone_number' => $outlet->phone_number,
                'operating_hours_info' => $outlet->operating_hours_info,
                'outlet_user_id' => $outlet->outlet_user_id,
                'manager_id' => $outlet->manager_id,
                'is_active' => $outlet->is_active,
            ],
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
        Log::info('Outlet Update Request Data for Outlet ID ' . $outlet->id . ':', $request->all());
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
                'outlet_user_id' => [
                    'nullable',
                    'exists:users,id',
                    Rule::unique('outlets', 'outlet_user_id')->whereNotNull('outlet_user_id')->ignore($outlet->id),
                ],
            'manager_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['boolean'],
            ], [
                'outlet_user_id.unique' => 'This Outlet User is already assigned to another outlet.'
        ]);
            Log::info('Data before $outlet->update():', $validated);
        $outlet->update($validated);
            Log::info('Outlet updated successfully:', $outlet->toArray());
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
            ->select('id', 'name', 'email')
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
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json($managers);
    }

    /**
     * Get outlets that do not have an assigned Outlet User.
     * Used for the Create User form.
     */
    public function availableOutlets()
    {
        $outlets = Outlet::whereNull('outlet_user_id')
            ->orderBy('name')
            ->get(['id', 'name']);
        return response()->json($outlets);
    }
}