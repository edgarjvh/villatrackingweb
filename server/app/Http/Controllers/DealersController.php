<?php

namespace App\Http\Controllers;

use App\Dealer;
use Illuminate\Http\Request;

class DealersController extends Controller
{
    public function getDealers()
    {
        $dealers = Dealer::all();

        if (count($dealers) > 0) {
            return response()->json(['result' => 'OK', 'dealers' => $dealers]);
        } else {
            return response()->json(['result' => 'NO DEALERS']);
        }
    }

    public function saveDealer(Request $request)
    {
        if (!$this->isValidEmail($request->email)){
            return response()->json(['result' => 'INVALID EMAIL']);
        }

        if ($request->id === 0) {
            $dniExist = Dealer::where('dni', $request->dni)->first();

            if ($dniExist) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }            

            $emailExist = Dealer::where('email', $request->email)->first();

            if ($emailExist) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }
            $dealer = new Dealer();

            $dealer->dni = $request->dni;
            $dealer->name = $request->name;
            $dealer->email = strtolower($request->email);
            $dealer->contact = $request->contact;
            $dealer->phone = $request->phone;
            $dealer->address = $request->address;
            $dealer->website = strtolower($request->website);
            $dealer->status = $request->status;
            $dealer->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curDealer = Dealer::where('id', $request->id)->first();

            if ($curDealer->dni !== $request->dni &&
                Dealer::where('dni', $request->dni)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }

            if ($curDealer->email !== $request->email &&
                Dealer::where('email', $request->email)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }

            $dealer = Dealer::where('id', $request->id)->update(array(
                'dni' => $request->dni,
                'name' => $request->name,
                'email' => strtolower($request->email),
                'contact' => $request->contact,
                'phone' => $request->phone,
                'address' => $request->address,
                'website' => strtolower($request->website),
                'status' => $request->status
            ));

            return response()->json(['result' => $dealer == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteDealer (Request $request){
        return response()->json(['result' => Dealer::destroy($request->id) ? 'OK' : 'ERROR']);
    }

    function isValidEmail($email){
        return (false !== filter_var($email, FILTER_VALIDATE_EMAIL));
    }
}
