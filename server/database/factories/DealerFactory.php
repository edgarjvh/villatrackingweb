<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Dealer;
use Faker\Generator as Faker;

$factory->define(Dealer::class, function (Faker $faker) {
    return [
        'dni' => '408923343',
        'name' => 'Villa Soft Gps, C.A.',
        'email' => 'ceo@villasoftgps.com.ve',
        'contact' => 'Edgar Villasmil',
        'phone' => '4126594257',
        'address' => 'Cabimas',
        'website' => 'www.villasoftgps.com.ve',
        'status' => true
    ];
});