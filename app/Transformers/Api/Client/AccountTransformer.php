<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\User;

class AccountTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return 'user';
    }

    /**
     * Return basic information about the currently logged-in user.
     */
    public function transform(User $model): array
    {
        return [
            'id' => $model->id,
            'admin' => $model->root_admin,
            'username' => $model->username,
            'email' => $model->email,
            'first_name' => $model->name_first,
            'last_name' => $model->name_last,
            'language' => $model->language,
            'coins' => $model->coins,
            'server_count' => $model->servers()->count(),
            'server_creation_cost' => 30,
            'daily_server_cost' => 15,
            'daily_claim_amount' => 10,
            'can_claim_coins' => !$model->coins_claimed_at?->isToday(),
            'pending_coin_request' => $model->coinRequests()
                ->where('status', \Pterodactyl\Models\CoinRequest::STATUS_PENDING)
                ->exists(),
        ];
    }
}
