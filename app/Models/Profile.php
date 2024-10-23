<?php

namespace App\Models;

use App\Http\Controllers\EmailManager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\email_configuration;

class Profile extends Model
{
    use HasFactory;
    protected $fillable = ["title", "description", "url"]; 
    protected static function boot() {
        parent::boot();
        static::created(function($profile) {
            $emailConfiguration = new email_configuration();
            $emailConfiguration->setUsername("");
            $emailConfiguration->setPassword("");
            $emailConfiguration->hostName = "";
            $emailConfiguration->profile_id = $profile->id;
            $emailConfiguration->save();
        });
    }
    function user() {
        return $this->belongsTo(User::class);
    }
    
    function getProfileImage() {
        return $this->profile_image != null ? 
            $this->profile_image
            : "https://ui-avatars.com/api/?name=".$this->user->name;
    }
    function getProfileBackgroundImage() {
        return $this->profile_background != null ? 
            $this->profile_background
            : "https://picsum.photos/300/200";
    }
    public function EmailConfiguration() {
        return $this->hasOne(email_configuration::class);
    }
    public function IsMailConfigurationValid () {
         return EmailManager::IsMailConfigurationValid();
    }
}
