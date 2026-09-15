<?php

namespace Pterodactyl\Http\Requests\Admin;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\Allocation;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ServerFormRequest extends AdminFormRequest
{
    /**
     * Allow the dedicated client creation route without opening any other
     * administrator form to non-admin users.
     */
    public function authorize(): bool
    {
        return !is_null($this->user())
            && ((bool) $this->user()->root_admin || $this->routeIs('client.servers.store'));
    }

    /**
     * Select the first available allocation for client-created servers.
     *
     * Clients should not be shown node names, allocation IDs, or IP addresses.
     * The selected allocation is still validated normally below.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->routeIs('client.servers.store') || !$this->user() || $this->user()->root_admin) {
            return;
        }

        $allocation = Allocation::query()
            ->whereNull('server_id')
            ->orderBy('id')
            ->first();

        if (!$allocation) {
            return;
        }

        $this->merge([
            'node_id' => $allocation->node_id,
            'allocation_id' => $allocation->id,
            'allocation_additional' => [],
        ]);
    }

    /**
     * Rules to be applied to this request.
     */
    public function rules(): array
    {
        $rules = Server::getRules();
        $rules['description'][] = 'nullable';
        $rules['custom_image'] = 'sometimes|nullable|string';

        return $rules;
    }

    /**
     * Run validation after the rules above have been applied.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $validator->sometimes('node_id', 'required|numeric|bail|exists:nodes,id', function ($input) {
                return !$input->auto_deploy;
            });

            $validator->sometimes('allocation_id', [
                'required',
                'numeric',
                'bail',
                Rule::exists('allocations', 'id')->where(function ($query) {
                    $query->where('node_id', $this->input('node_id'));
                    $query->whereNull('server_id');
                }),
            ], function ($input) {
                return !$input->auto_deploy;
            });

            $validator->sometimes('allocation_additional.*', [
                'sometimes',
                'required',
                'numeric',
                Rule::exists('allocations', 'id')->where(function ($query) {
                    $query->where('node_id', $this->input('node_id'));
                    $query->whereNull('server_id');
                }),
            ], function ($input) {
                return !$input->auto_deploy;
            });
        });
    }
}
