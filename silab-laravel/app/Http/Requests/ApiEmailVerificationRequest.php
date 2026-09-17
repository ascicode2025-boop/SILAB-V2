<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

class ApiEmailVerificationRequest extends FormRequest
{
    /**
     * Ambil user berdasarkan ID dari URL
     */
    public function user($guard = null)
    {
        return User::find($this->route('id'));
    }

    /**
     * Validasi authorize
     */
    public function authorize()
    {
        $user = $this->user();

        if (! $user) return false;

        return hash_equals((string) $user->getKey(), (string) $this->route('id'))
            && hash_equals(sha1($user->getEmailForVerification()), (string) $this->route('hash'));
    }

    /**
     * Rules validation (tidak diperlukan untuk API ini)
     */
    public function rules()
    {
        return [];
    }

    /**
     * Menandai email user sebagai verified
     */
    public function fulfill()
    {
        $user = $this->user();

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }
    }
}
