<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\VideochatDocument;
class VideoChatAnswerIceCandidates extends Model
{
    use HasFactory;
    public function VideoChatDocument () {
         return $this->belongsTo(VideochatDocument::class);
    }
}
