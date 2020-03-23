<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class TrVehiclesDevices extends Migration
{
    
    public function up()
    {
        DB::unprepared(
            '
            CREATE TRIGGER vehicles_AFTER_DELETE AFTER DELETE ON `vehicles` FOR EACH ROW
                BEGIN
                    UPDATE devices SET vehicle_id = NULL WHERE vehicle_id = OLD.id;
                END
            '
        );
    }

    public function down()
    {
        DB::unprepared('DROP TRIGGER `vehicles_AFTER_DELETE`');
    }
}
