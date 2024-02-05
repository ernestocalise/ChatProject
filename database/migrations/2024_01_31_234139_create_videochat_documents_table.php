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
        Schema::create('videochat_documents', function (Blueprint $table) {
            $table->id();
            $table->text("offer_candidates")->nullable();
            $table->text("answer_candidates")->nullable();
            $table->unsignedBigInteger("conference_id");
            $table->timestamps();
            $table->foreign('conference_id')->references('id')->on('conferences');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videochat_documents');
    }
};
