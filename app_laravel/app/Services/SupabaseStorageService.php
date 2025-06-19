<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseStorageService
{
    private $bucketName = 'auditfile';
    private $supabaseUrl;
    private $supabaseKey;

    public function __construct()
    {
        $this->supabaseUrl = config('services.supabase.url');
        $this->supabaseKey = config('services.supabase.key');
    }

    public function uploadFile($fileData, $fileName)
    {
        try {
            \Log::info('Starting Supabase upload', [
                'fileName' => $fileName,
                'fileSize' => strlen($fileData),
                'supabaseUrl' => $this->supabaseUrl,
                'bucketName' => $this->bucketName
            ]);

            // Create a temporary file
            $tempPath = tempnam(sys_get_temp_dir(), 'supabase_upload_');
            file_put_contents($tempPath, $fileData);

            \Log::info('Temporary file created', [
                'tempPath' => $tempPath,
                'tempFileSize' => filesize($tempPath)
            ]);

            // Use multipart/form-data to upload the file
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'apikey' => $this->supabaseKey,
            ])->attach(
                'file',
                file_get_contents($tempPath),
                $fileName
            )->post($this->supabaseUrl . '/storage/v1/object/' . $this->bucketName . '/' . $fileName);

            \Log::info('Supabase API response', [
                'status' => $response->status(),
                'body' => $response->body(),
                'headers' => $response->headers()
            ]);

            // Clean up temporary file
            unlink($tempPath);

            if (!$response->successful()) {
                \Log::error('Supabase upload error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('Failed to upload file to Supabase: ' . $response->body());
            }

            // Get signed URL that's valid for 7 days
            $signedUrl = $this->getSignedUrl($fileName);

            \Log::info('Upload successful, got signed URL', [
                'signedUrl' => $signedUrl
            ]);

            return [
                'path' => $fileName,
                'url' => $signedUrl
            ];
        } catch (\Exception $e) {
            \Log::error('Supabase upload error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function getFile($fileName)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'apikey' => $this->supabaseKey,
            ])->get($this->getPublicUrl($fileName));

            if (!$response->successful()) {
                throw new \Exception('Failed to get file from Supabase');
            }

            return [
                'contents' => $response->body(),
                'mime_type' => $this->getMimeType($fileName)
            ];
        } catch (\Exception $e) {
            Log::error('Supabase download error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteFile($fileName)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'apikey' => $this->supabaseKey,
            ])->delete($this->supabaseUrl . '/storage/v1/object/' . $this->bucketName . '/' . $fileName);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Supabase delete error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getSignedUrl($fileName)
    {
        try {
            // Request a signed URL from Supabase
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->supabaseKey,
                'apikey' => $this->supabaseKey,
            ])->post($this->supabaseUrl . '/storage/v1/object/sign/' . $this->bucketName . '/' . rawurlencode($fileName), [
                'expiresIn' => 604800 // 7 days in seconds
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to get signed URL');
            }

            $data = $response->json();
            if (!isset($data['signedURL'])) {
                throw new \Exception('No signed URL in response');
            }

            // Return the full signed URL with correct path
            return $this->supabaseUrl . '/storage/v1' . $data['signedURL'];
        } catch (\Exception $e) {
            Log::error('Failed to get signed URL: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getMimeType($fileName)
    {
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // Add more mime types as needed
        ];

        return $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
    }
} 