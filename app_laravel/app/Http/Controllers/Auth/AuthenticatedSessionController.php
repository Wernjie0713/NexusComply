<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ActivityLog;
use function donatj\UserAgent\parse_user_agent;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Log login activity
        $user = Auth::user();
        if ($user) {
            $ua = request()->userAgent();
            $parsed = parse_user_agent($ua);

            $platform = $parsed['platform'] ?? 'Unknown OS';
            $browser = $parsed['browser'] ?? 'Unknown Browser';
            $version = $parsed['version'] ?? '';

            ActivityLog::create([
                'user_id' => $user->id,
                'action_type' => 'Login',
                'target_type' => 'User',
                'details' => 'User "' . $user->name . '" logged in. IP: ' . request()->ip() . '. Device: ' . $platform . '. Browser: ' . $browser . ' ' . $version,
                'created_at' => now(),
            ]);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
