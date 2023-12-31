<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
//Status Functions
Route::middleware("auth")->group(function() {
Route::get("/user/setStatus/{statusCode}", [ProfileController::class, "setStatus"]);
Route::get("/user/getStatus/{userId}", [ProfileController::class, "getStatus"]);
Route::get("/user/restoreStatus", [ProfileController::class, "restoreStatus"]);
});
//ChatFunctions
Route::middleware('auth')->group(function () {
Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::get('/chats/getChats', function () {
    return App\Models\Chat::getChatsByUserId(auth()->user()->id);
});
Route::get('/chats/getMessages/{chatId}', [ChatController::class, 'getChatMessages']);
Route::get('/chats/getChatCount', [ChatController::class, 'getChatCount']);
Route::post('/chats/checkChatChanged', [ChatController::class, 'checkChatChanged']);
Route::post('/chats/getNewMessages',  [ChatController::class, 'getNewMessages']);
Route::post('/chats/sendMessage',  [ChatController::class, 'sendMessage']);
Route::post('/chats/addChat', [ChatController::class, 'openOrCreateChat']);
Route::post('/chats/addAttachment', [ChatController::class, 'uploadFile']);
Route::get('/chats/setVisualizzation/{messageId}', [ChatController::class, "setVisualizzation"]);
});
require __DIR__.'/auth.php';
