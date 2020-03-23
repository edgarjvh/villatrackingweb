<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('client_id')->nullable(true)->default(null);
            $table->unsignedBigInteger('vehicle_id')->nullable(true)->default(null);
            $table->unsignedBigInteger('device_id')->nullable(true)->default(null);
            $table->unsignedBigInteger('report_type_id')->nullable(false);
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->string('communication_type')->nullable(true);
            $table->string('sender')->nullable(true);
            $table->string('recipient')->nullable(true);
            $table->text('description')->nullable(true);
            $table->timestamp('date_time');
            $table->timestamp('valid_until')->nullable(true);
            $table->timestamps();

            $table->foreign('client_id')
                ->references('id')
                ->on('clients')
                ->onDelete('cascade')
                ->onUpdate('no action');

            $table->foreign('vehicle_id')
                ->references('id')
                ->on('vehicles')
                ->onDelete('cascade')
                ->onUpdate('no action');

            $table->foreign('device_id')
                ->references('id')
                ->on('devices')
                ->onDelete('cascade')
                ->onUpdate('no action');

            $table->foreign('report_type_id')
                ->references('id')
                ->on('report_types')
                ->onDelete('restrict')
                ->onUpdate('no action');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('no action');

            $table->index('date_time');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reports');
    }
}
