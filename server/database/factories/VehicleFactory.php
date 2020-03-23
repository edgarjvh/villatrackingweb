<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Vehicle;
use Faker\Generator as Faker;

$factory->define(Vehicle::class, function (Faker $faker) {

    $faker->addProvider(new \Faker\Provider\Fakecar($faker));

    $vehicle = $faker->vehicleArray();

    return [
        'client_id' => $faker->numberBetween(1,50),
        'license_plate' => $faker->vehicleRegistration,
        'brand' => $vehicle['brand'],
        'model' => $vehicle['model'],
        'type' => $faker->vehicleType,
        'year' => $faker->numberBetween(1998,2019),
        'color' => $faker->randomElement(['negro', 'azul', 'marrón', 'gris', 'verde', 'naranja', 'rosa', 'púrpura', 'rojo', 'blanco', 'amarillo']),
        'observations' => $faker->paragraph(1),
        'status' => $faker->boolean()
    ];
});
