<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVehiclesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('client_id')->nullable(true)->default(null);
            $table->string('license_plate')->unique();
            $table->string('brand')->nullable(true);
            $table->string('model')->nullable(true);
            $table->string('type')->nullable(true);
            $table->integer('year')->nullable(true);
            $table->string('color')->nullable(true);
            $table->text('observations')->nullable(true);
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('client_id')
                ->references('id')->on('clients')
                ->onDelete('set null')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('vehicles');
    }
}
