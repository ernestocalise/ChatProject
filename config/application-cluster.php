<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [

    /*
    |--------------------------------------------------------------------------
    | Chat Enabled
    |--------------------------------------------------------------------------
    |
    | This value is the check of chat application enabled
    |
    */
    "chat_enabled" => env("IS_CHAT_ENABLED", false),

    /*
    |--------------------------------------------------------------------------
    | METERED API KEY
    |--------------------------------------------------------------------------
    |
    | This value is the API KEY of the Metered STUN/TURN Server
    |
    */
    "metered_api_key" => env("METERED_API_KEY", ""),
    /*
    |--------------------------------------------------------------------------
    | Profile Skill
    |--------------------------------------------------------------------------
    |
    | This value is the check of profile skill
    |
    */
    "skill_enabled" => env("PROFILE_SKILL_ENABLED", false),

    /*
    |--------------------------------------------------------------------------
    | Project Enabled
    |--------------------------------------------------------------------------
    |
    | This value checks if the projects are enabled in the system.
    |
    */
    "project_enabled" => env("PROFILE_PROJECT_ENABLED", false),
    
    /*
    |--------------------------------------------------------------------------
    | Experience Enabled
    |--------------------------------------------------------------------------
    |
    | This value determines if the user can add past experiences
    |
    */
    "experience_enabled" => env("PROFILE_EXPERIENCE_ENABLED", false),

    /*
    |--------------------------------------------------------------------------
    | CV GENERATION
    |--------------------------------------------------------------------------
    |
    | This value determines if CV generation is enabled in the system.
    |
    */
    "cv_generation" => env("PROFILE_CV_ENABLED", false),
    
    /*
    |--------------------------------------------------------------------------
    | EMAIL MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | This value determines if the email functionality is enabled in the system
    |
    */
    "skill_enabled" => env("EMAIL_MANAGEMENT_ENABLED", false)
];
