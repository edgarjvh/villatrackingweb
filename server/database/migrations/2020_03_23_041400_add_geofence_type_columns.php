<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddGeofenceTypeColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('geofences', function($table){
            $table->enum('type', ['polygon', 'circle'])->nullable(false)->default('polygon');            
            $table->string('center')->nullable(true);            
            $table->integer('radio')->unsigned()->nullable(true);            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
