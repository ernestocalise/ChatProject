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

    function getMessageComponentData() {
        if($this->type != 1) {
            $this->setFileMessage();
        }
        $item = (object)[
            "messageId" => $this->id,
            "content" => $this->message,
            "senderImage" => $this->User->profileImage(),
            "sender" => $this->User->name,
            "type" => $this->type,
            "sent_at" => $this->created_at,
            "sent_from_user" => $this->User->id == auth()->user()->id,
            "viewed_from" => $this->viewed_from
        ];
        $returnObject = (object)[
            "chatName" => $this->Chat->description,
            "chatId" => $this->Chat->id,
            "chatImage" => $this->Chat->getImage(),
            "message" => $item
        ];
        return $returnObject;
    }
    function SetVisualizzation() {
        $objViewed = json_decode($this->viewed_from);
        $objViewed[]=auth()->user()->id;
        $this->viewed_from = json_encode($objViewed);
        $this->save();
    }
}
