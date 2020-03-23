<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */
use App\SimCard;
use Faker\Generator as Faker;

$factory->define(SimCard::class, function (Faker $faker) {
    $gsm = $faker->unique()->randomElement([
        $faker->numberBetween(4120000000, 4129999999),
        $faker->numberBetween(4140000000, 4149999999),
        $faker->numberBetween(4240000000, 4249999999),
        $faker->numberBetween(4160000000, 4169999999),
        $faker->numberBetween(4260000000, 4269999999)            
    ]);

    $p = substr($gsm, 0, 3);

    $apn = 'gprsweb.digitel.ve';
    $operator = 'Digitel';

    if ($p === '414' || $p === '424') {$apn = 'internet.movistar.ve';}
    if ($p === '416' || $p === '426') {$apn = 'int.movilnet.com.ve';}

    if ($p === '414' || $p === '424') {$operator = 'Movistar';}
    if ($p === '416' || $p === '426') {$operator = 'Movilnet';}

    return [
        'operator' => $operator,
        'gsm' => $gsm,
        'serial' => $faker->numerify('####################'),
        'apn' => $apn,
        'observations' => $faker->paragraph(),
        'status' =>$faker->boolean(),
        'asigned' => $faker->boolean()
    ];
});
