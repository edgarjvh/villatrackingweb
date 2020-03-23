<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ReportType extends Model
{
    protected $guarded = [];

    public function reports(){
        return $this->hasMany(Report::class);
    }
}
