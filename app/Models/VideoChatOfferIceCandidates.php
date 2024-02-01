<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoChatOfferIceCandidates extends Model
{
    use HasFactory;
    public function VideoChatDocument () {
        return $this->belongsTo(VideochatDocument::class);
   }
}
