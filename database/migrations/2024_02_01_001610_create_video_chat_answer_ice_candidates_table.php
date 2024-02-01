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
        Schema::create('video_chat_answer_ice_candidates', function (Blueprint $table) {
            $table->id();
            $table->text("candidate");
            $table->unsignedBigInteger("videochat_document_id");
            $table->timestamps();
            $table->foreign('videochat_document_id')->references('id')->on('videochat_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_chat_answer_ice_candidates');
    }
};
