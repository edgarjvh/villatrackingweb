<?php

namespace App\Http\Controllers;

use App\SimCard;
use Illuminate\Http\Request;

class SimCardsController extends Controller
{
    public function getSimCards()
    {
        $simcards = SimCard::with('Device')->get();
        return response()->json(['result' => 'OK', 'simcards' => $simcards]);
    }

    public function getSimCardsWithDeviceChildren(){
        $asigned = SimCard::where('asigned', true)->with('DeviceWithChildren')->get();
        $unasigned = SimCard::where('asigned', false)->with('DeviceWithChildren')->get();
        return response()->json(['result' => 'OK', 'simcards' => compact('asigned','unasigned')]);
    }
    
    public function getSimCardsWithDevice(){
        $asigned = SimCard::where('asigned', true)->with('Device')->get();
        $unasigned = SimCard::where('asigned', false)->with('Device')->get();
        return response()->json(['result' => 'OK', 'simcards' => compact('asigned','unasigned')]);
    }
    
    public function getSimCardsWithDeviceModel(){
        $asigned = SimCard::where('asigned', true)->with('DeviceWithModel')->get();
        $unasigned = SimCard::where('asigned', false)->with('DeviceWithModel')->get();
        return response()->json(['result' => 'OK', 'simcards' => compact('asigned','unasigned')]);
    }
    
    public function getSimCardsWithDeviceVehicle(){
        $asigned = SimCard::where('asigned', true)->with('DeviceWithVehicle')->get();
        $unasigned = SimCard::where('asigned', false)->with('DeviceWithVehicle')->get();
        return response()->json(['result' => 'OK', 'simcards' => compact('asigned','unasigned')]);
    }

    public function saveSimCard(Request $request)
    {
        if ($request->id === 0) {
            $gsmExist = SimCard::where('gsm', $request->gsm)->first();

            if ($gsmExist) {
                return response()->json(['result' => 'DUPLICATED GSM']);
            }
            
            $serialExist = SimCard::where('serial', $request->serial)->first();

            if ($serialExist) {
                return response()->json(['result' => 'DUPLICATED SERIAL']);
            }

            $simcard = new SimCard();
            $simcard->operator = $request->operator;
            $simcard->gsm = $request->gsm;
            $simcard->serial = $request->serial;
            $simcard->apn = strtolower($request->apn);
            $simcard->observations = $request->observations;            
            $simcard->status = $request->status;
            $simcard->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curSimcard = SimCard::where('id', $request->id)->first();

            if ($curSimcard->gsm !== $request->gsm &&
                SimCard::where('gsm', $request->gsm)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED GSM']);
            }

            if ($curSimcard->serial !== $request->serial &&
                SimCard::where('serial', $request->serial)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED SERIAL']);
            }

            $simcard = SimCard::where('id', $request->id)->update(array(
                'operator' => $request->operator,
                'gsm' => $request->gsm,
                'serial' => $request->serial,
                'apn' => strtolower($request->apn),
                'observations' => $request->observations,                
                'status' => $request->status
            ));

            return response()->json(['result' => $simcard == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteSimCard (Request $request){
        return response()->json(['result' => SimCard::destroy($request->id) ? 'OK' : 'ERROR']);
    }
}
