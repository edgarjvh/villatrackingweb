<?php

namespace App\Http\Controllers;

use App\Vehicle;
use Illuminate\Http\Request;

class VehiclesController extends Controller
{
    public function getVehicles(){
        $vehicles = Vehicle::with(['Client'])->orderBy('license_plate', 'ASC')->get();
        return response()->json(['result' => 'OK', 'vehicles' => $vehicles]);        
    }

    public function getVehiclesWithDevicesChildren(){
        $vehicles = Vehicle::with(['Client', 'devicesChildren'])->orderBy('license_plate', 'ASC')->get();
        return response()->json(['result' => 'OK', 'vehicles' => $vehicles]);        
    }

    public function saveVehicle(Request $request)
    {
        if ($request->id === 0) {
            $licensePlateExist = Vehicle::where('license_plate', $request->license_plate)->first();

            if ($licensePlateExist) {
                return response()->json(['result' => 'DUPLICATED LICENSE PLATE']);
            }                       

            $vehicle = new Vehicle();
            $vehicle->client_id = $request->client_id === 0 || $request->client_id === '0' || $request->client_id === 'null' ? null : $request->client_id;
            $vehicle->license_plate = strtoupper($request->license_plate);
            $vehicle->brand = $request->brand;
            $vehicle->model = $request->model;
            $vehicle->type = $request->type;
            $vehicle->year = $request->year;
            $vehicle->color = $request->color;
            $vehicle->observations = $request->observations;            
            $vehicle->status = $request->status;
            $vehicle->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curVehicle = Vehicle::where('id', $request->id)->first();

            if ($curVehicle->license_plate !== $request->license_plate &&
                Vehicle::where('license_plate', $request->license_plate)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED LICENSE PLATE']);
            }          

            $vehicle = Vehicle::where('id', $request->id)->update(array(
                'client_id' => $request->client_id === 0 || $request->client_id === '0' || $request->client_id === 'null' ? null : $request->client_id,
                'license_plate' => strtoupper($request->license_plate),
                'brand' => $request->brand,
                'model' => $request->model,
                'type' => $request->type,
                'year' => $request->year,
                'color' => $request->color,
                'observations' => $request->observations,                
                'status' => $request->status
            ));

            return response()->json(['result' => $vehicle == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteVehicle (Request $request){
        return response()->json(['result' => Vehicle::destroy($request->id) ? 'OK' : 'ERROR']);
    }
}
