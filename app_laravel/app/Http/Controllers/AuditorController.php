<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuditorController extends Controller
{
    /**
     * Handle temporary access to view audit via QR code
     */
    public function viewAudit(Request $request)
    {
        // Get parameters from URL
        $auditId = $request->query('id');
        $timestamp = $request->query('timestamp'); // Make sure this is passed in URL
        $expires = $request->query('expires');
        $token = $request->query('token');

        // Add debug logging
        Log::info('Audit view request', [
            'id' => $auditId,
            'timestamp' => $timestamp,
            'expires' => $expires,
            'token' => $token
        ]);

        // Check if token has expired - return a simple error
        if (time() > $expires) {
            return response('Access Expired: This temporary access link has expired. Please request a new QR code.', 403)
                ->header('Content-Type', 'text/plain');
        }

        // Verify token - calculate expected token for comparison
        if (empty($timestamp)) {
            Log::warning('Missing timestamp parameter in URL');
            $timestamp = 'missing'; // Use a placeholder to avoid -- in the token
        }

        // Now create the token exactly as done in JavaScript
        $expectedToken = base64_encode("$auditId-$timestamp-$expires");

        // Add more verbose logging
        Log::info('Token components', [
            'auditId' => $auditId,
            'timestamp' => $timestamp,
            'expires' => $expires,
            'raw_string' => "$auditId-$timestamp-$expires",
            'encoded' => $expectedToken
        ]);

        // If token doesn't match, return error with debug info
        if ($token !== $expectedToken) {
            return response('Invalid Access: The access token is invalid or has been tampered with.' .
                "\n\nDebug Info:\nExpected Token: " . $expectedToken .
                "\nProvided Token: " . $token, 403)
                ->header('Content-Type', 'text/plain');
        }

        try {
            // Get audit details
            $audit = DB::table('audit')
                ->join('outlets', 'audit.outlet_id', '=', 'outlets.id')
                ->join('status', 'audit.status_id', '=', 'status.id')
                ->leftJoin('compliance_requirements', 'audit.compliance_id', '=', 'compliance_requirements.id')
                ->where('audit.id', $auditId)
                ->select('audit.*', 'outlets.name as outletName', 'compliance_requirements.title as auditType', 'status.name as status')
                ->first();

            if (!$audit) {
                return response('Audit Not Found: The requested audit could not be found.', 404)
                    ->header('Content-Type', 'text/plain');
            }

            // Get all forms for this audit
            $forms = DB::table('audit_form')
                ->join('audit_audit_form', 'audit_form.id', '=', 'audit_audit_form.audit_form_id')
                ->join('status', 'audit_form.status_id', '=', 'status.id')
                ->where('audit_audit_form.audit_id', $auditId)
                ->select('audit_form.*', 'audit_form.status_id', 'status.name as status')
                ->get();

            // Find the most recent audit report for this audit
            $auditReport = DB::table('audit_report')
                ->where('audit_id', $audit->id)
                ->orderBy('created_at', 'desc')
                ->first();

            // Make sure this matches your actual Inertia page component name
            return Inertia::render('Auditor/IndexPage', [
                'audit' => $audit,
                'forms' => $forms,
                'temporaryAccess' => true,
                'expiresAt' => $expires,
                // Add these new props:
                'auditReportExists' => !empty($auditReport),
                'auditReportPath' => $auditReport ? $auditReport->path : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error displaying temporary audit access: ' . $e->getMessage(), [
                'audit_id' => $auditId,
                'trace' => $e->getTraceAsString()
            ]);

            // Return a simple error
            return response('Error Occurred: ' . $e->getMessage(), 500)
                ->header('Content-Type', 'text/plain');
        }
    }
}
