<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
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

    public function scopeAsigned($query)
    {
        return $query->where('asigned', 1);
    }

    public function scopeUnasigned($query)
    {
        return $query->where('asigned', 0);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function dealer()
    {
        return $this->belongsTo(Dealer::class);
    }

    public function vehicle(){
        return $this->belongsTo(Vehicle::class);
    }

    public function sim_card(){
        return $this->belongsTo(SimCard::class);
    }

    public function device_model(){
        return $this->belongsTo(DeviceModel::class);
    }

    public function location(){
        return $this->hasOne(Location::class, 'imei', 'imei');
    }

    public function alerts(){
        return $this->hasMany(Alert::class, 'imei', 'imei');
    }
}
