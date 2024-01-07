<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
class UserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //To check if the user is online
        if (Auth::check()) {
            $expires_after = Carbon::now()->addSeconds(60); 
            Cache::put('user-online' . Auth::user()->id, true, $expires_after);
        }
        //To check for Locale
        if(Session::get("locale") == null)
            Session::put("locale", config("app.locale"));
        App::setLocale(Session::get("locale"));
        return $next($request);
    }
}
