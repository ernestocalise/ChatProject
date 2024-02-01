<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Conference;
use App\Models\VideoChatOfferIceCandidates;
use App\Models\VideoChatAnswerIceCandidates;
class VideochatDocument extends Model
{
    use HasFactory;
    public function conference () {
         return $this->belongsTo(Conference::class);
    }
    public function OfferIceCandidates () {
         return $this->hasMany(VideoChatOfferIceCandidates::class);
    }
    public function AnswerIceCandidates () {
         return $this->hasMany(VideoChatAnswerIceCandidates::class);
    }
}
