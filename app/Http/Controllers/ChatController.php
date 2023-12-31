<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use File;
class ChatController extends Controller
{
    public function index() {
        $users = User::all()->except(array(auth()->user()->id, 0));
        return view('chat.index', compact("users"));
    }
    public function getChatMessages($chatId) {
        return Chat::find($chatId)->getChatMessages();
    }
    public static function openOrCreateChat() {
        $targetUserId = request("userId");
        $collUserIds = [];
        $collUserIds[] = $targetUserId;
        $collUserIds[] = auth()->user()->id;
        $collChats = Chat::checkChatExists($collUserIds);
        if(count($collChats) >= 1) {
            return $collChats[0]->chat_id;
        }
        else {
            $chat = new Chat();
            $usr = User::find($targetUserId);
            $chat->description = "Personal chat between ".auth()->user()->name." and {$usr->name}";
            $chat->groupChat = false;
            $chat->save();
            $chat->addUser(auth()->user()->id);
            $chat->addUser($targetUserId);
            $chat->sendSystemMessage("Chat Created by ".auth()->user()->name);
            return $chat->id;
        }
    }
    public function checkChatChanged(Request $request) {
        $chatId = $request->input("chatId");
        $lastMessageId = $request->input("messageId");
        $chat = Chat::find($chatId);
        return (object)[
            "chatChanged" => !($chat->getLastMessageAttribute()->messageId == $lastMessageId)
        ];
    }
    public function getNewMessages(Request $request) {
        $chatId = $request->input("chatId");
        $lastMessageId = $request->input("messageId");
        $chat = Chat::find($chatId);
        return $chat->getMessagesAfter($lastMessageId);
    }
    public function sendMessage(Request $request) {
        $message = $request->input("message");
        $chatId = $request->input("chatId");
        $chatMessage = new \App\Models\ChatMessage();
        $chatMessage->user_id = auth()->user()->id;
        $chatMessage->chat_id = $chatId;
        $chatMessage->message = $message;
        $chatMessage->type = 1;
        $chatMessage->save();
    }
    public function getChatCount() {
        return DB::table("chat_user")
        ->selectRaw("count(chat_id) AS ChatCount")
        ->where("user_id", "=", auth()->user()->id)
        ->get();
    }
    public function setVisualizzation($messageId) {
        $message = ChatMessage::find($messageId);
        $message->SetVisualizzation();
    }
    public function uploadFile(Request $request) {
        $chatId = $request->input("chatId");
        $file = $request->file("file");
        $fileName = $file->getClientOriginalName();
        $fileMimeType = $file->getMimeType();
        $destinationPath = "storage/{$chatId}";
        $isImage = false;
        //Check if is Image:
        $imageMimeTypes = ['image/jpeg','image/gif','image/png','image/bmp','image/svg+xml'];
            if(in_array($fileMimeType, $imageMimeTypes))
            $isImage = true;
        //Check if chatfolder exists or create ut
        File::isDirectory($destinationPath) or File::makeDirectory($destinationPath, 0777, true, true);
        $filePath = "{$destinationPath}/{$fileName}";
        $iterator = 1;
        $tempFilePath = $filePath;
        $tempFileName = $fileName;
        while(File::exists($tempFilePath)){
            $fnWithoutExtension = pathinfo($fileName, PATHINFO_FILENAME);
            $fnOnlyExtension = pathinfo($fileName, PATHINFO_EXTENSION);
            $tempFileName = "{$fnWithoutExtension}_{$iterator}.{$fnOnlyExtension}";
            $tempFilePath = "{$destinationPath}/{$tempFileName}";
            $iterator++;
        }
        $filePath = $tempFilePath;
        $fileName = $tempFileName;
        if($file->move($destinationPath, $fileName)) {
            DB::table('file_storage')->insert([
                'filename' => $fileName,
                'filepath' => $filePath,
                'deleted' => 0
            ]);
            $fileStorageId = DB::getPdo()->lastInsertId();
            $chatMessage = new \App\Models\ChatMessage();
            $chatMessage->user_id = auth()->user()->id;
            $chatMessage->chat_id = $chatId;
            $chatMessage->message = $fileStorageId;
            $chatMessage->type = $isImage ? 2 : 3;
            $chatMessage->save();
            return (object)array( "FileUploaded" => true);
        }
            return (object)array( "FileUploaded" => false);
    }
}
