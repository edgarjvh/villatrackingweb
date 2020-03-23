<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $guarded = [];

    public function vehicles(){
        return $this->belongsToMany(Vehicle::class)->withTimestamps();
    }
}
