<?php

namespace App\Http\Controllers;

use App\DeviceModel;
use Illuminate\Http\Request;

class DevicesModelsController extends Controller
{
    public function getDevicesModels()
    {
        $devices_models = DeviceModel::all();

        if (count($devices_models) > 0) {
            return response()->json(['result' => 'OK', 'devices_models' => $devices_models]);
        } else {
            return response()->json(['result' => 'NO DEVICES MODELS']);
        }
    }

    public function saveDeviceModel(Request $request)
    {
        if ($request->id === 0) {
            $exists = DeviceModel::where(['device_brand' => $request->brand, 'device_model' => $request->model])->first();

            if ($exists) {
                return response()->json(['result' => 'DUPLICATED DEVICE MODEL']);
            }

            $device_model = new DeviceModel();
            $device_model->device_brand = $request->brand;
            $device_model->device_model = $request->model;
            $device_model->status = $request->status;
            $device_model->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            if (DeviceModel::where(['device_brand' => $request->brand, 'device_model' => $request->model])
                ->whereNotIn('id', [$request->id])
                ->first()
            ) {
                return response()->json(['result' => 'DUPLICATED DEVICE MODEL']);
            }

            $device_model = DeviceModel::where('id', $request->id)->update(array(
                'device_brand' => $request->brand,
                'device_model' => $request->model,
                'status' => $request->status
            ));

            return response()->json(['result' => $device_model == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteDeviceModel(Request $request)
    {
        return response()->json(['result' => DeviceModel::destroy($request->id) ? 'OK' : 'ERROR']);
    }
}
