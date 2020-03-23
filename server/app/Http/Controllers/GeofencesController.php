<?php

namespace App\Http\Controllers;

use App\Geofence;
use Illuminate\Http\Request;

class GeofencesController extends Controller
{
    public function getGeofences(){
        $geofences = Geofence::with(['vehicles'])->get();

        return response()->json(['result' => 'OK', 'geofences' => $geofences]);
    }
}
