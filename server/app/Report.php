<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $guarded = [];

    public function device(){
        return $this->belongsTo(Device::class);
    }

    public function report_type(){
        return $this->belongsTo(ReportType::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
