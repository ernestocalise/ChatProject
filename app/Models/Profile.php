<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Profile extends Model
{
    use HasFactory;
    protected $fillable = ["title", "description", "url"]; 
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

}
