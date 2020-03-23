<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SimCard extends Model
{
    protected $guarded = [];    

    public function scopeActive($query){
        return $query->where('status', 1)->get();
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }

    public function scopeAsigned($query){
        return $query->where('asigned', 1)->get();
    }

    public function scopeUnasigned($query)
    {
        return $query->where('asigned', 0);
    }

    public function deviceWithChildren(){
        return $this->hasOne(Device::class)->with(['device_model', 'vehicle']);
    }

    public function deviceWithModel(){
        return $this->hasOne(Device::class)->with(['device_model']);
    }

    public function deviceWithVehicle(){
        return $this->hasOne(Device::class)->with(['vehicle']);
    }

    public function device(){
        return $this->hasOne(Device::class);
    }
}
