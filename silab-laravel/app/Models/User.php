<?php

namespace App\Models;


use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin \Laravel\Sanctum\HasApiTokens
 */

//
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'full_name',
        'email',
        'password',
        'institusi',
        'nomor_telpon',
        'nim',
        'prodi',
        // Allow API mass-assignment for role/status/login_count
        'role',
        'status',
        'login_count',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function achievements()
    {
        return $this->belongsToMany(\App\Models\Achievement::class, 'user_achievements');
    }

    public function labClearance()
    {
        return $this->hasOne(LabClearance::class);
    }

    public function instrumentRentals()
    {
        return $this->hasMany(InstrumentRental::class);
    }
}
