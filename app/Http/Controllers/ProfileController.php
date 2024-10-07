<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmailConfigurationUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\App;
use App\Models\User;
use App\Models\email_configuration;
class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        if($request->user()->profile->EmailConfiguration == null) {
            $emailConfiguration = new email_configuration();
            $emailConfiguration->setUsername("");
            $emailConfiguration->setPassword("");
            $emailConfiguration->hostName = "";
            $emailConfiguration->profile_id = $request->user()->profile->id;
            $emailConfiguration->save();
        }
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function editEmailConfiguration (EmailConfigurationUpdateRequest $request): RedirectResponse 
    {
        $data = $request->validated();
        $request->user()->profile->emailConfiguration->hostname = $data["hostname"];
        $request->user()->profile->emailConfiguration->setUsername($data["username"]);
        $request->user()->profile->emailConfiguration->setPassword($data["mailConfigurationPassword"]);
        $request->user()->profile->emailConfiguration->save();
        return Redirect::route('profile.edit')->with('status', 'email-configuration-updated');
    }
    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    //Manage User Status
    public function setStatus($statusCode) {
        $data = validator(compact("statusCode"), ["statusCode" => "required|numeric"])->validate();
        auth()->user()->setStatus($data["statusCode"]);
    }
    public function getUserInformation ($userId) {
        
         $user = User::find((int)$userId);
         return (object)[
            "id" => $user->id,
            "username" => $user->name,
            "profile_pic" => "https://ui-avatars.com/api/?name=".$user->name
         ];
    }
    public function getStatus($userId) {
        $data = validator(compact("userId"), ["userId" => "required|numeric"])->validate();
        $usr = \App\Models\User::find($data["userId"]);
        return $usr->getStatus();
    }
    public function restoreStatus() {
        return auth()->user()->restoreStatus();
    }
    public function setLocale(Request $request)
    {
        $data = $request->validate([
            "locale" => "required"
        ]);
        $locale = $data["locale"];
        $supportedLanguaged = ["en", "it"];
        if(in_array($locale, $supportedLanguaged)){
            App::setLocale($locale);
            Session::put("locale", $locale);
            auth()->user()->locale = $locale;
            auth()->user()->save();
        }
        return back()->with('status', 'locale-updated');
    }
}
