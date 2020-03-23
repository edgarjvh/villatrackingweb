<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class TrClientsVehicles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared(
            '
            CREATE TRIGGER clients_AFTER_DELETE AFTER DELETE ON `clients` FOR EACH ROW
                BEGIN
                    UPDATE vehicles SET client_id = NULL WHERE client_id = OLD.id;
                END
            '
        );
    }

    
    public function down()
    {
        DB::unprepared('DROP TRIGGER `clients_AFTER_DELETE`');
    }
}
