<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $guarded = [];

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    public function vehicles(){
        return $this->hasMany(Vehicle::class);
    }

    public function vehiclesChildren(){
        return $this->hasMany(Vehicle::class)->with(['devicesChildren']);
    }

    public function contacts(){
        return $this->hasMany(Contact::class);
    }

    public function reports(){
        return $this->hasMany(Report::class);
    }

    public function suggestions(){
        return $this->hasMany(Suggestion::class);
    }

}
