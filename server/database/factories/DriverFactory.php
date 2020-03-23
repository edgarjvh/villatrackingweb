<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Driver;
use Faker\Generator as Faker;

$factory->define(Driver::class, function (Faker $faker) {
    return [
        'dni' => $faker->numberBetween(7000000, 28000000),
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail, 
        'phone' => $faker->randomElement([
            $faker->numberBetween(4120000000, 4129999999),
            $faker->numberBetween(4140000000, 4149999999),
            $faker->numberBetween(4240000000, 4249999999),
            $faker->numberBetween(4160000000, 4169999999),
            $faker->numberBetween(4260000000, 4269999999)            
        ])
    ];
});
