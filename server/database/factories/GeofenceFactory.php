<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Geofence;
use Faker\Generator as Faker;

$factory->define(Geofence::class, function (Faker $faker) {
    return [
        'name' => $faker->city,
        'description' =>$faker->text,
        'points' => '[{"lat":10.409101911265005,"lng":-71.45042181015016}]',
        'status' => $faker->numberBetween(0,1),
        'type' => $faker->randomElement(['polygon', 'circle']),
        'radio' => $faker->numberBetween(50,200)
    ];
});
