<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLocationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('imei');
            $table->string('name');
            $table->timestamp('date_time');
            $table->enum('fix', ['A', 'V', 'L'])->default('A');
            $table->double('latitude',11,6);
            $table->double('longitude',11,6);
            $table->integer('speed');
            $table->integer('orientation');
            $table->integer('engine_status')->default(-1);
            $table->string('ip')->nullable(true);
            $table->integer('port')->nullable(true);
            $table->timestamps();

            $table->unique('imei');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('locations');
    }
}
