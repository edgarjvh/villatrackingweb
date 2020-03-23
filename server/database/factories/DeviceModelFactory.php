<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\DeviceModel;
use Faker\Generator as Faker;

$factory->define(DeviceModel::class, function (Faker $faker) {
    $devicesModels = [
        [
            'brand' => 'XEXUN',
            'model' => 'TK103'
        ],
        [
            'brand' => 'Hunter Pro',
            'model' => 'CP60'
        ],
        [
            'brand' => 'Hunter Pro',
            'model' => 'HPLOW'
        ],
        [
            'brand' => 'Tracker',
            'model' => 'GT60'
        ],
        [
            'brand' => 'Tracker',
            'model' => 'TK103B'
        ],
        [
            'brand' => 'Syrus',
            'model' => 'SY2210'
        ],
        [
            'brand' => 'COBAN',
            'model' => 'TK103A'
        ],
        [
            'brand' => 'COBAN',
            'model' => 'TK103F'
        ],
        [
            'brand' => 'COBAN',
            'model' => 'TK103H'
        ],
        [
            'brand' => 'OEM',
            'model' => 'MT01'
        ],
        [
            'brand' => 'Calamp',
            'model' => 'LMU330'
        ],
        [
            'brand' => 'Skypatrol',
            'model' => 'TT8750'
        ],
        [
            'brand' => 'Skypatrol',
            'model' => 'TT8750+'
        ],
        [
            'brand' => 'Skypatrol',
            'model' => 'TT8740'
        ]
    ];

    $model = $faker->randomElement($devicesModels);

    return [
        'device_brand' => $model['brand'],
        'device_model' => $model['model'],
        'status' => $faker->boolean()
    ];
});
