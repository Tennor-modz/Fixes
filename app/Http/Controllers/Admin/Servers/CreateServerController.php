<?php

namespace Pterodactyl\Http\Controllers\Admin\Servers;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Location;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Repositories\Eloquent\NestRepository;
use Pterodactyl\Repositories\Eloquent\NodeRepository;
use Pterodactyl\Http\Requests\Admin\ServerFormRequest;
use Pterodactyl\Services\Servers\ServerCreationService;

class CreateServerController extends Controller
{
    /**
     * CreateServerController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private NestRepository $nestRepository,
        private NodeRepository $nodeRepository,
        private ServerCreationService $creationService,
    ) {
    }

    /**
     * Displays the create server page.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function index(Request $request): View|RedirectResponse
    {
        $nodes = Node::all();
        if (count($nodes) < 1) {
            $this->alert->warning(trans('admin/server.alerts.node_required'))->flash();

            return redirect()->route($request->routeIs('client.servers.new') ? 'index' : 'admin.nodes');
        }

        $nests = $this->nestRepository->getWithEggs();

        \JavaScript::put([
            'nodeData' => $this->nodeRepository->getNodesForServerCreation(),
            'nests' => $nests->map(function (Nest $item) {
                return array_merge($item->toArray(), [
                    'eggs' => $item->eggs->keyBy('id')->toArray(),
                ]);
            })->keyBy('id'),
        ]);

        return view('admin.servers.new', [
            'locations' => Location::all(),
            'nests' => $nests,
            'client' => $request->routeIs('client.servers.new'),
            'currentUser' => $request->user(),
        ]);
    }

    /**
     * Create a new server on the remote system.
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Pterodactyl\Exceptions\DisplayException
     * @throws \Pterodactyl\Exceptions\Service\Deployment\NoViableAllocationException
     * @throws \Pterodactyl\Exceptions\Service\Deployment\NoViableNodeException
     * @throws \Throwable
     */
    public function store(ServerFormRequest $request): RedirectResponse
    {
        $data = $request->except(['_token']);
        if (!$request->user()->root_admin) {
            $data['owner_id'] = $request->user()->id;
        }

        if (!empty($data['custom_image'])) {
            $data['image'] = $data['custom_image'];
            unset($data['custom_image']);
        }

        $server = $this->creationService->handle($data);

        $this->alert->success(trans('admin/server.alerts.server_created'))->flash();

        return $request->routeIs('client.servers.store')
            ? redirect()->route('index')
            : new RedirectResponse('/admin/servers/view/' . $server->id);
    }
}
