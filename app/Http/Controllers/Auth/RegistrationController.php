<?php

namespace Pterodactyl\Http\Controllers\Auth;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Pterodactyl\Services\Users\UserCreationService;

class RegistrationController extends AbstractLoginController
{
    public function register(Request $request, UserCreationService $userCreationService): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'alpha_dash', 'between:3,32', 'unique:users,username'],
            'email' => ['required', 'email:rfc', 'max:191', 'unique:users,email'],
            'name_first' => ['required', 'string', 'between:1,191'],
            'name_last' => ['required', 'string', 'between:1,191'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
        ]);

        $user = $userCreationService->handle([
            ...$data,
            'root_admin' => false,
            'coins' => 30,
        ]);

        return new JsonResponse([
            'data' => [
                'username' => $user->username,
                'message' => 'Your Drex Hosting account was created. You can now log in.',
            ],
        ], 201);
    }
}
