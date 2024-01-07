<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;

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
        'email',
        'password',
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
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    function profileImage() {
        return "https://ui-avatars.com/api/?name=".$this->name;
    }
    function getStatus() {
        if (Cache::has('user-online' . $this->id)){
            return Cache::get('user-status' . $this->id, 0);
        }
        else
            return -1;
    }
    function getStatusText() {
        $status = $this->getStatus();
        switch($status) {
            case 0:
                return "Online";
            case 1:
                return "Away";
            case 2:
                return "In a call";
            case 3:
                return "Busy";
            case 4:
                return "Invisible";
            case -1:
                return "Offline";
            default:
                return "Offline";
        }
    }
    function setStatus($status) {
        Cache::put('user-status' . $this->id, $status);
    }
    function restoreStatus() {
        Cache::forget('user-status' . $this->id);
    }
    protected static function boot() {
        parent::boot();
        static::created(function($user) {
            if($user->name != "SYSTEM"){
                $user->profile()->create([
                    "title" => $user->name
                ]);
            }
        });
    }
    function profile() {
        return $this->hasOne(Profile::class);
    }
}
