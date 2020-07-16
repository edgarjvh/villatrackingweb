<?php

namespace App\Http\Controllers;

use App\Dealer;
use App\Device;
use App\DeviceModel;
use App\SimCard;
use App\Vehicle;
use Illuminate\Http\Request;

class DevicesController extends Controller
{
    public function getDevices()
    {
        $devices = Device::with(['device_model', 'dealer', 'vehicle', 'sim_card'])->get();
        return response()->json(['result' => 'OK', 'devices' => $devices]);
    }

    public function getDevicesAssociations()
    {
        $unasigned_simcards = SimCard::doesntHave('device')->orderBy('operator', 'ASC')->get(['id', 'operator', 'gsm']);
        $devices_models = DeviceModel::orderBy('device_brand', 'ASC')->get(['id', 'device_brand', 'device_model']);
        $dealers = Dealer::orderBy('name', 'ASC')->get(['id', 'dni', 'name']);
        $vehicles = Vehicle::orderBy('license_plate', 'ASC')->get(['id', 'license_plate', 'brand', 'model']);
        return response()->json(compact('unasigned_simcards', 'devices_models', 'dealers', 'vehicles'));
    }

    public function getDevicesWithChildren()
    {
        $asigned = Device::where('asigned', true)->with(['vehicle', 'sim_card', 'device_model'])->get();
        $unasigned = Device::where('asigned', false)->with(['vehicle', 'sim_card', 'device_model'])->get();
        return response()->json(['result' => 'OK', 'devices' => compact('asigned', 'unasigned')]);
    }

    public function getDevicesWithDeviceModel()
    {
        $asigned = Device::where('asigned', true)->with(['device_model'])->get();
        $unasigned = Device::where('asigned', false)->with(['device_model'])->get();
        return response()->json(['result' => 'OK', 'devices' => compact('asigned', 'unasigned')]);
    }

    public function getDevicesWithVehicle()
    {
        $asigned = Device::where('asigned', true)->with(['vehicle'])->get();
        $unasigned = Device::where('asigned', false)->with(['vehicle'])->get();
        return response()->json(['result' => 'OK', 'devices' => compact('asigned', 'unasigned')]);
    }

    public function getDevicesWithSimCard()
    {
        $asigned = Device::where('asigned', true)->with(['sim_card'])->get();
        $unasigned = Device::where('asigned', false)->with(['sim_card'])->get();
        return response()->json(['result' => 'OK', 'devices' => compact('asigned', 'unasigned')]);
    }

    public function getDevicesConsole() {
        $devices = Device::where('asigned', true)->with(['vehicle', 'sim_card', 'device_model', 'dealer', 'location'])->get();
        return response()->json(['result' => 'OK', 'devices' => $devices]);
    }

    public function saveDevice(Request $request)
    {
        if ($request->id === 0) {
            $imeiExist = Device::where('imei', $request->imei)->first();

            if ($imeiExist) {
                return response()->json(['result' => 'DUPLICATED IMEI']);
            }

            $device = new Device();
            $device->vehicle_id = $request->vehicle_id === 0 ? null : $request->vehicle_id;
            $device->sim_card_id = $request->sim_card_id;
            $device->device_model_id = $request->device_model_id;
            $device->dealer_id = $request->dealer_id;
            $device->imei = $request->imei;
            $device->speed_limit = $request->speed_limit;
            $device->installed_at = $request->installed_at;
            $device->expires_at = $request->expires_at;
            $device->status = $request->status;
            $device->observations = $request->observations;
            $device->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curDevice = Device::where('id', $request->id)->first();

            if ($curDevice->imei !== $request->imei &&
                Device::where('imei', $request->imei)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED IMEI']);
            }

            $device = Device::where('id', $request->id)->update(array(
                'vehicle_id' => $request->vehicle_id === 0 ? null : $request->vehicle_id,
                'sim_card_id' => $request->sim_card_id,
                'device_model_id' => $request->device_model_id,
                'dealer_id' => $request->dealer_id,
                'imei' => $request->imei,
                'speed_limit' => $request->speed_limit,
                'installed_at' => $request->installed_at,
                'observations' => $request->observations,
                'status' => $request->status
            ));

            return response()->json(['result' => $device == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteDevice(Request $request)
    {
        return response()->json(['result' => Device::destroy($request->id) ? 'OK' : 'ERROR']);
    }
}
