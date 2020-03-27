<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\GeofenceVehicle;
use Faker\Generator as Faker;

$factory->define(GeofenceVehicle::class, function (Faker $faker) {
    return [
        'geofence_id' => $faker->numberBetween(41,60),
        'vehicle_id' => $faker->numberBetween(1,100),
        'last_status' => $faker->numberBetween(0,2),
        'date_time' => now()
    ];
});
