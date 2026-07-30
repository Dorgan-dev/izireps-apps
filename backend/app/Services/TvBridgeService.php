<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TvBridgeService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('tvbridge.url'), '/');
        $this->apiKey = config('tvbridge.api_key');

        Log::debug('[TvBridgeService] Initialized', [
            'base_url' => $this->baseUrl,
            'api_key_set' => !empty($this->apiKey),
        ]);
    }

    protected function client()
    {
        return Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'Accept' => 'application/json',
        ])->timeout(10);
    }

    public function sendKey(string $mac, string $brand, string $key): array
    {
        if (!$mac || !$brand) return ['ok' => false, 'error' => 'MAC or brand is missing.'];

        try {
            $response = $this->client()->post("{$this->baseUrl}/api/send-key", [
                'mac' => $mac,
                'brand' => strtolower($brand),
                'key' => $key,
            ]);

            if ($response->successful()) {
                return ['ok' => true];
            }

            return ['ok' => false, 'error' => "Bridge responded with HTTP {$response->status()}: {$response->body()}"];
        } catch (\Exception $e) {
            Log::error("TvBridgeService sendKey failed: " . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    public function power(string $mac, string $brand, string $action): array
    {
        if (!$mac || !$brand) return ['ok' => false, 'error' => 'MAC or brand is missing.'];
        if (!in_array(strtoupper($action), ['ON', 'OFF'])) return ['ok' => false, 'error' => 'Invalid action.'];

        $url = "{$this->baseUrl}/api/power";
        Log::info('[TvBridgeService] Sending power command', [
            'url' => $url,
            'mac' => $mac,
            'brand' => $brand,
            'action' => $action,
        ]);

        try {
            $response = $this->client()->post($url, [
                'mac' => $mac,
                'brand' => strtolower($brand),
                'action' => strtoupper($action),
            ]);

            if ($response->successful()) {
                return ['ok' => true];
            }

            Log::error('[TvBridgeService] power command got non-2xx response', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return ['ok' => false, 'error' => "Bridge responded with HTTP {$response->status()}: {$response->body()}"];
        } catch (\Exception $e) {
            Log::error("[TvBridgeService] power {$action} exception: " . $e->getMessage());
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    public function getStatus(string $mac, string $brand): array
    {
        if (!$mac || !$brand) return ['online' => false];

        try {
            $response = $this->client()->get("{$this->baseUrl}/api/status/" . strtolower($brand) . "/{$mac}");
            
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::error("TvBridgeService getStatus failed: " . $e->getMessage());
        }

        return ['online' => false];
    }
}
