<?php
// ============================================================
// app/Console/Commands/MarkTimeUpSessions.php
// ============================================================
// Scheduler memanggil command ini setiap menit.
// Mencari sesi per_jam yang planned_end_at-nya sudah lewat
// dan mengubah statusnya menjadi time_up.

namespace App\Console\Commands;

use App\Models\PlaySession;
use App\Services\SessionService;
use Illuminate\Console\Command;

class MarkTimeUpSessions extends Command
{
    protected $signature   = 'sessions:mark-time-up';
    protected $description = 'Tandai sesi per_jam yang waktunya sudah habis sebagai time_up';

    public function handle(SessionService $service): void
    {
        $expired = PlaySession::where('status', 'active')
            ->where('session_type', 'per_jam')
            ->where('planned_end_at', '<=', now())
            ->get();

        foreach ($expired as $session) {
            /** @var PlaySession $session */
            $service->markTimeUp($session);
            $this->info("Sesi #{$session->id} ({$session->device->name}) ditandai time_up.");

            // TODO: panggil STBService untuk matikan TV
            // app(STBService::class)->turnOff($session->device->tv_ip_address);
        }

        $this->info("Total time_up: {$expired->count()}");
    }
}
