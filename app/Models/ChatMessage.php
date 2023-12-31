<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Chat;
use Illuminate\Support\Facades\DB;
class ChatMessage extends Model
{
    use HasFactory;

    function Chat() {
        return $this->belongsTo(Chat::class);
    }
    function User() {
        return $this->belongsTo(User::class);
    }

    function setFileMessage() {
        $fs = DB::table("file_storage")
        ->selectRaw("*")
        ->where("id", "=", $this->message)
        ->get();
        $messageObj = (object)array(
            "FilePath" => $fs[0]->filepath,
            "FileName" => $fs[0]->filename,
            "deleted" => $fs[0]->deleted
        );
        $this->message = json_encode($messageObj);
    }

    function SetVisualizzation() {
        $objViewed = json_decode($this->viewed_from);
        $objViewed[]=auth()->user()->id;
        $this->viewed_from = json_encode($objViewed);
        $this->save();
    }
}
