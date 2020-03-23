<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDevicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('vehicle_id')->nullable(true)->default(null);
            $table->unsignedBigInteger('sim_card_id');
            $table->unsignedBigInteger('device_model_id');
            $table->unsignedBigInteger('dealer_id');
            $table->string('imei')->unique();
            $table->boolean('asigned')->default(false);
            $table->integer('speed_limit')->default(0);
            $table->date('installed_at');
            $table->date('expires_at')->nullable(true);
            $table->string('ip')->nullable(true);
            $table->integer('port')->nullable(true)->default(0);
            $table->boolean('status')->default(true);
            $table->string('observations')->nullable(true);
            $table->timestamps();

            $table->foreign('vehicle_id')
                ->references('id')
                ->on('vehicles')
                ->onDelete('set null')
                ->onUpdate('no action');

            $table->foreign('sim_card_id')
                ->references('id')
                ->on('sim_cards')
                ->onDelete('restrict')
                ->onUpdate('no action');

            $table->foreign('device_model_id')
                ->references('id')
                ->on('device_models')
                ->onDelete('restrict')
                ->onUpdate('no action');

            $table->foreign('dealer_id')
                ->references('id')
                ->on('dealers')
                ->onDelete('restrict')
                ->onUpdate('no action');
            
            $table->index('installed_at');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('devices');
    }
}
