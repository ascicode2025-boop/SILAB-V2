<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // GET /api/users
    public function index(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'koordinator') {
            return response()->json(['message' => 'Hanya koordinator yang dapat mengakses ini'], 403);
        }

        // Return all users (simple list). Paginate later if needed.
        $select = ['id', 'name', 'email', 'role', 'institusi as institution', 'nomor_telpon as phone', 'login_count'];
        if (Schema::hasColumn('users', 'status')) {
            $select[] = 'status';
        }

        $users = User::select($select)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($u) {
                // Prioritaskan status dari database
                // Jika status sudah diset (termasuk 'Non-Aktif'), gunakan itu
                $status = 'Aktif'; // default untuk user baru

                if (isset($u->status) && !empty($u->status)) {
                    // Gunakan status dari database (ini sudah final, tidak di-override)
                    $status = $u->status;
                } elseif (!isset($u->login_count) || intval($u->login_count) === 0) {
                    // Jika belum pernah login dan tidak ada status, anggap Non-Aktif
                    $status = 'Non-Aktif';
                }

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'institution' => $u->institution ?? $u->institusi ?? null,
                    'phone' => $u->phone ?? $u->nomor_telpon ?? null,
                    'login_count' => $u->login_count,
                    'status' => $status,
                ];
            });

        return response()->json(['data' => $users]);
    }

    // POST /api/users
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'koordinator') {
            return response()->json(['message' => 'Hanya koordinator yang dapat membuat user'], 403);
        }

        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            // Only allow creating the three specific roles
            'role' => 'required|string|in:Teknisi,Koordinator,kepala',
            // institution corresponds to frontend "institution" field
            'institution' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        // For Kepala Lab and Koordinator, institution is required
        $role = $request->role;
        if (in_array($role, ['Kepala Lab', 'Koordinator']) && empty(trim($request->institution ?? ''))) {
            return response()->json(['message' => 'Validation error', 'errors' => ['institution' => ['Institution is required for selected role']]], 422);
        }

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'institusi' => $request->institution ?? null,
                'nomor_telpon' => $request->phone ?? null,
                'login_count' => 0,
            ];

            if (Schema::hasColumn('users', 'status')) {
                $userData['status'] = 'Aktif';
            }

            $user = User::create($userData);

        return response()->json(['message' => 'User created', 'user' => $user], 201);
    }

    // PATCH /api/users/{id}
    public function update(Request $request, $id)
    {
        if (!Auth::check() || Auth::user()->role !== 'koordinator') {
            return response()->json(['message' => 'Hanya koordinator yang dapat mengubah user'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data = $request->only(['name', 'email', 'role', 'institution', 'phone', 'status', 'password']);

        // If role is provided in update, ensure it's one of allowed roles
        if (isset($data['role']) && !in_array($data['role'], ['Teknisi', 'Koordinator', 'Kepala Lab'])) {
            return response()->json(['message' => 'Validation error', 'errors' => ['role' => ['Invalid role']]], 422);
        }

        // If role change requires institution, validate presence
        if (isset($data['role']) && in_array($data['role'], ['Kepala Lab', 'Koordinator']) && empty(trim($request->institution ?? ''))) {
            return response()->json(['message' => 'Validation error', 'errors' => ['institution' => ['Institution is required for selected role']]], 422);
        }

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['role'])) $user->role = $data['role'];
        if (isset($data['institution'])) $user->institusi = $data['institution'];
        if (isset($data['phone'])) $user->nomor_telpon = $data['phone'];
            if (isset($data['status']) && Schema::hasColumn('users', 'status')) $user->status = $data['status'];
        if (isset($data['password']) && $data['password']) $user->password = Hash::make($data['password']);

        $user->save();

        return response()->json(['message' => 'User updated', 'user' => $user]);
    }
}
