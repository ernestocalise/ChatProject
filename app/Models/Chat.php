<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\User;
class Chat extends Model
{
    use HasFactory;
    protected $appends= ['LastMessage'];
    function getParticipants() {
        $chat_users = DB::table('chat_user')
            ->selectRaw('user_id')
            ->where('chat_id', '=', $this->id)
            ->whereNull('exited_at')
            ->get();
        $userColl = [];
        
        foreach($chat_users as $id) {
            $user = \App\Models\User::where('id', '=', $id->user_id)->first();
            $user->image = $user->profileImage();
            $userColl[]=$user;
        }
        return $userColl;
    }
    function getMessages() {
        return $this->hasMany(\App\Models\ChatMessage::class);
    }
    function getImage() {
        return "https://ui-avatars.com/api/?name=".$this->description;
    }
    public static function checkChatExists($userIds) {
        return DB::table("chat_user")
        ->selectRaw("chat_id")
        ->whereIn("user_id", $userIds)
        ->whereNotIn("chat_id", function($query) {
            $query->select("chat_id")
                ->from("chats")
                ->where("groupChat", "=", "1");
        })
        ->groupBy("chat_id")
        ->havingRaw("COUNT(user_id) = 2")
        ->get();
    }
    function addUser($user_id) {
        DB::table('chat_user')->insert([
            'chat_id' => $this->id,
            'user_id' => $user_id
        ]);
    }
    function getChatMessages() {
        $messages = $this->getMessages;
        $messageColl = [];
        foreach($messages as $message) {
            if($message->type != 1) {
                $message->setFileMessage();
            }
            $item = (object)[
                "messageId" => $message->id,
                "content" => $message->message,
                "senderImage" => $message->User->profileImage(),
                "sender" => $message->User->name,
                "type" => $message->type,
                "sent_at" => $message->created_at,
                "sent_from_user" => $message->User->id == auth()->user()->id,
                "viewed_from" => $message->viewed_from
            ];
            $messageColl[]=$item;
        }
        $returnObject = (object)[
            "chatName" => $this->description,
            "chatImage" => $this->getImage(),
            "participants" => $this->getParticipants(),
            "messages" => $messageColl
        ];
        return $returnObject;
    }
    function getLastMessageAttribute() {
        $lastMessage = $this->getMessages->last();
        switch($lastMessage->type){
            case 2:
                $lastMessage->message = "Image";
            case 3:
                $lastMessage->message = "File";
            default:
        }
        return (object)[
            "messageId" => $lastMessage->id,
            "content" => $lastMessage->message,
            "senderImage" => $lastMessage->User->profileImage(),
            "sender" => $lastMessage->User->name,
            "sent_at" => $lastMessage->created_at,
            "type" => $lastMessage->type,
            "sent_from_user" => $lastMessage->User->id == auth()->user()->id,
            "viewed_from" => $lastMessage->viewed_from
        ];
    }
    static function getChatsByUserId($user_id) {
        $chat_ids = DB::select("select chat_id
        from chat_messages
        where 
        chat_id IN (SELECT DISTINCT CHAT_ID FROM chat_user WHERE user_id = ?) AND
        created_at =
        (
          select Max(created_at)
          from chat_messages as f where f.chat_id=chat_messages.chat_id
        )
        group by chat_id, created_at
        order by created_at desc", array(auth()->user()->id));
        $chatColl = [];
        foreach($chat_ids as $id) {
            $item = \App\Models\Chat::where('id', '=', $id->chat_id)->first();
            $chatPartecipant = $item->getParticipants();
            $PartecipantColl = [];
            foreach($chatPartecipant as $partecipantUser) {
                $PartecipantColl[]=(object)array(
                    "user_id" => $partecipantUser->id,
                    "user_name" => $partecipantUser->name,
                    "user_image" => $partecipantUser->profile->getProfileImage()
                );
            }
            $item->toJson();
            $itemDecoded = json_decode($item);
            unset($itemDecoded->get_messages);
            $itemDecoded->partecipants = $PartecipantColl;
            $chatColl[]= $itemDecoded;
        }
        return $chatColl;
    }
    function sendSystemMessage($message) {
        $chatMessage = new \App\Models\ChatMessage();
        $chatMessage->user_id = 0;
        $chatMessage->chat_id = $this->id;
        $chatMessage->message = $message;
        $chatMessage->type = 1;
        $chatMessage->save();
    }
    public function getMessagesAfter($messageId) {
        $messages = $this->getMessages()->where("id", ">", $messageId)->get();
        $messageColl = [];
        foreach($messages as $message) {
            if($message->type != 1) {
                $message->setFileMessage();
            }
            $item = (object)[
                "messageId" => $message->id,
                "content" => $message->message,
                "senderImage" => $message->User->profileImage(),
                "type" => $message->type,
                "sender" => $message->User->name,
                "sent_at" => $message->created_at,
                "viewed_from" => $message->viewed_from,
                "sent_from_user" => $message->User->id == auth()->user()->id 
            ];
            $messageColl[]=$item;
        }
        $returnObject = (object)[
            "chatName" => $this->description,
            "chatImage" => $this->getImage(),
            "messages" => $messageColl
        ];
        return $returnObject;
    }
    public function GetVisualizzations() {
        return DB::table("chat_user")
        ->select("user_id","last_viewed_message_id")
        ->where("chat_id",$this->id)->get();
        
    }
    public function SetVisualizzation(){
        DB::table("chat_user")
        ->where("chat_id",$this->id)
        ->where("user_id", auth()->user()->id)
        ->update(["last_viewed_message_id" => $this->getMessages->last()->id]);   
    }
}
