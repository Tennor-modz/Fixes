<?php

namespace Pterodactyl\Console\Commands\Server;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\ServerDeletionService;

class ChargeDailyCoinsCommand extends Command
{
    protected $signature = 'servers:charge-daily-coins';
    protected $description = 'Charge 15 coins for client servers and delete unpaid servers.';

    public function handle(ServerDeletionService $serverDeletionService): int
    {
        Server::query()->with('user')->whereHas('user', fn ($query) => $query->where('root_admin', false))->chunkById(100, function ($servers) use ($serverDeletionService): void {
            foreach ($servers as $server) {
                $charged = DB::transaction(function () use ($server): bool {
                    return $server->user()->where('coins', '>=', 15)->decrement('coins', 15) === 1;
                });

                if (!$charged) {
                    $serverDeletionService->withForce()->handle($server);
                }
            }
        });

        return self::SUCCESS;
    }
}

?>
