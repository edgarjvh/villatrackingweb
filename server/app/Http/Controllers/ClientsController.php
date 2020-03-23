<?php

namespace App\Http\Controllers;

use App\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientsController extends Controller
{
    public function getClients(){
        $clients = Client::orderBy('name', 'ASC')->get();
        return response()->json(['result' => 'OK', 'clients' => $clients]);  
    }

    public function getClientsWithVehicles(){
        $clients = Client::with(['vehicles'])->get();
        return response()->json(['result' => 'OK', 'clients' => $clients]);  
    }

    public function saveClient(Request $request)
    {
        if (!$this->isValidEmail($request->email)) {
            return response()->json(['result' => 'INVALID EMAIL']);
        }

        if ($request->id === '0') {
            $dniExist = Client::where('dni', $request->dni)->first();

            if ($dniExist) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }

            $emailExist = Client::where('email', $request->email)->first();

            if ($emailExist) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }

            $client = new Client();
            $client->dni = $request->dni;
            $client->name = $request->name;
            $client->email = strtolower($request->email);
            $client->phone = $request->phone;
            $client->address = $request->address;
            $client->observations = $request->observations;
            $client->status = $request->status;
            $client->web_access = $request->web_access;
            $client->password = Hash::make('12345');
            $client->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curClient = Client::where('id', $request->id)->first();

            if ($curClient->dni !== $request->dni &&
                Client::where('dni', $request->dni)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }

            if ($curClient->email !== $request->email &&
                Client::where('email', $request->email)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }

            $client = Client::where('id', $request->id)->update(array(
                'dni' => $request->dni,
                'name' => $request->name,
                'email' => strtolower($request->email),
                'phone' => $request->phone,
                'address' => $request->address,
                'observations' => $request->observations,
                'status' => $request->status,
                'web_access' => $request->web_access,
            ));

            return response()->json(['result' => $client == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteClient(Request $request)
    {
        return response()->json(['result' => Client::destroy($request->id) ? 'OK' : 'ERROR']);
    }

    function isValidEmail($email)
    {
        return (false !== filter_var($email, FILTER_VALIDATE_EMAIL));
    }
}
