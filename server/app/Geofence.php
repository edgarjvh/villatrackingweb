<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Geofence extends Model
{
    protected $guarded = [];

    public function vehicles(){
        return $this->belongsToMany(Vehicle::class)
            ->withPivot(['last_status', 'date_time'])
            ->withTimestamps();
    }
}
