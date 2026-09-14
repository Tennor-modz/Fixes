<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('coins')->default(0)->after('root_admin');
            $table->timestamp('coins_claimed_at')->nullable()->after('coins');
        });

        Schema::create('coin_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('amount')->default(10);
            $table->string('reason', 500);
            $table->string('status', 20)->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coin_requests');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['coins', 'coins_claimed_at']);
        });
    }
};
