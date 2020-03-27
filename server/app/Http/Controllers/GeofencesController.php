<?php

namespace App\Http\Controllers;

use App\Geofence;
use App\Vehicle;
use Illuminate\Http\Request;

class GeofencesController extends Controller
{
    public function getGeofences(){
        $geofences = Geofence::with(['vehicles'])->get();

        $vehicles = Vehicle::whereNotNull('client_id')->orderBy('license_plate', 'asc')->get();

        return response()->json(['result' => 'OK', 'geofences' => $geofences, 'vehiclesAvailables' => $vehicles]);
    }

    public function deleteGeofence (Request $request){
        return response()->json(['result' => Geofence::destroy($request->id) ? 'OK' : 'ERROR']);
    }

    public function saveGeofence (Request $request){
        if ($request->id === 0) {
            $nameExist = Geofence::where('name', $request->name)->first();

            if ($nameExist) {
                return response()->json(['result' => 'DUPLICATED NAME']);
            }

            $geofence = new Geofence();
            $geofence->name = $request->name;
            $geofence->description = $request->description;
            $geofence->points = $request->points;
            $geofence->type = $request->type;
            $geofence->radio = $request->radio;            
            $geofence->status = $request->status;
            $geofence->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curGeofence = Geofence::where('id', $request->id)->first();

            if ($curGeofence->name !== $request->name &&
                Geofence::where('name', $request->name)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED NAME']);
            }

            $device = Geofence::where('id', $request->id)->update(array(                
                'name' => $request->name,
                'description' => $request->description,
                'points' => $request->points,
                'type' => $request->type,
                'radio' => $request->radio,                
                'status' => $request->status
            ));

            return response()->json(['result' => $device == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function syncAsigned (Request $request){

        $geofence = Geofence::find($request->id);                  

        return response()->json(['result' => $geofence->vehicles()->sync($request->vehicles) ? 'OK' : 'ERROR']);
    }
}
