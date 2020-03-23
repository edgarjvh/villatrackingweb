<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Device;
use Faker\Generator as Faker;

$factory->define(Device::class, function (Faker $faker) {

    $dt = $faker->dateTimeBetween('-7 years', 'now');
    $date = $dt->format("Y-m-d"); // 1994-09-24

    return [
        'vehicle_id' => $faker->numberBetween(1,100),
        'sim_card_id' => $faker->unique()->numberBetween(1,100),
        'device_model_id' => 1,
        'dealer_id' => 1,
        'imei' => $faker->numerify('###############'),
        'status' =>$faker->boolean(),
        'asigned' => $faker->boolean(),
        'speed_limit' => $faker->randomElement([100, 110, 120, 130, 140, 150, 160, 170, 180]),
        'installed_at' => $date,
        'expires_at' => $date,
        'observations' => $faker->paragraph(1)
    ];
});
