<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSimCardsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sim_cards', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('operator');
            $table->string('gsm')->unique();
            $table->string('serial')->nullable(true);
            $table->string('apn')->nullable(true);
            $table->text('observations')->nullable(true);
            $table->boolean('status')->default(true);
            $table->boolean('asigned')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sim_cards');
    }
}
