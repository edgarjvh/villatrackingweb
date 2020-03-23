<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */
use App\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Generator as Faker;

$factory->define(User::class, function (Faker $faker) {
    return [
        'name' => 'Edgar Villasmil',
        'email' => 'edgarjvh@gmail.com',
        'email_verified_at' => now(),
        'password' => Hash::make('12345'), // password
        'remember_token' => Str::random(10),
        'dni' => '18370323',
        'phone' => $faker->numberBetween(4120000000, 4129999999),
        'permission_level' => $faker->numberBetween(1, 5),
        'status' =>$faker->boolean()
    ];
});
