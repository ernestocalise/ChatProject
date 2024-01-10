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

    public function EmailConfiguration() {
        return $this->hasOne(email_configuration::class);
    }

}
