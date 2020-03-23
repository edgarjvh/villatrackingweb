<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Client;
use Faker\Generator as Faker;
use Illuminate\Support\Facades\Hash;

$factory->define(Client::class, function (Faker $faker) {
    return [
        'dni' => $faker->numberBetween(7000000, 28000000),
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,        
        'password' => Hash::make('12345'),
        'phone' => $faker->randomElement([
            $faker->numberBetween(4120000000, 4129999999),
            $faker->numberBetween(4140000000, 4149999999),
            $faker->numberBetween(4240000000, 4249999999),
            $faker->numberBetween(4160000000, 4169999999),
            $faker->numberBetween(4260000000, 4269999999)            
        ]),
        'address' => $faker->address,        
        'observations' => $faker->paragraph(1),
        'status' => $faker->boolean(),
        'web_access' => $faker->boolean()
    ];
});
