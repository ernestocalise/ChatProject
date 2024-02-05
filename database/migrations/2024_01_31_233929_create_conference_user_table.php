<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conference_user', function (Blueprint $table) {
            $table->unsignedBigInteger("conference_id");
            $table->unsignedBigInteger("user_id");
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('conference_id')->references('id')->on('conferences');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conference_user');
    }
};
