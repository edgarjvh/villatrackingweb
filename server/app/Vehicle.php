<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
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

    public function devices()
    {
        return $this->hasMany(Device::class);
    }    

    public function devicesChildren(){
        return $this->hasMany(Device::class)->with(['device_model', 'dealer', 'sim_card']);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function drivers()
    {
        return $this->belongsToMany(Driver::class)->withTimestamps();
    }

    public function geofences()
    {
        return $this->belongsToMany(Geofence::class)
            ->withPivot(['last_status', 'date_time'])
            ->withTimestamps();
    }
}
