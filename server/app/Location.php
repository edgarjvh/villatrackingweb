<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $guarded = [];

    public function device(){
        return $this->belongsTo(Device::class, 'imei', 'imei');
    }
}
