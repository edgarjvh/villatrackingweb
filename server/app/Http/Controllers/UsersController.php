<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function test(){
        return 'hola';
    }

    public function populatedb(){
        try{
            factory(\App\DeviceModel::class)->times(1000)->create();
        }catch(Exception $e){
    
        }
        factory(\App\User::class)->create();
        factory(\App\Client::class)->times(50)->create();
        factory(\App\Vehicle::class)->times(100)->create();
        factory(\App\Dealer::class)->create();
        factory(\App\Driver::class)->times(100)->create();
        factory(\App\SimCard::class)->times(100)->create();
        factory(\App\Device::class)->times(100)->create();    
    
        return 'done';
    }

    public function getUsers()
    {
        $users = User::all();

        if (count($users) > 0) {
            return response()->json(['result' => 'OK', 'users' => $users]);
        } else {
            return response()->json(['result' => 'NO USERS']);
        }
    }

    public function saveUser(Request $request)
    {
        if (!$this->isValidEmail($request->email)) {
            return response()->json(['result' => 'INVALID EMAIL']);
        }

        if ($request->id === 0) {
            $dniExist = User::where('dni', $request->dni)->first();

            if ($dniExist) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }

            $emailExist = User::where('email', $request->email)->first();

            if ($emailExist) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }

            $user = new User();
            $user->dni = $request->dni;
            $user->name = $request->name;
            $user->email = strtolower($request->email);
            $user->phone = $request->phone;
            $user->permission_level = $request->permission_level;
            $user->status = $request->status;
            $user->password = Hash::make('12345');
            $user->save();

            return response()->json(['result' => 'CREATED']);
        } else {
            $curUser = User::where('id', $request->id)->first();

            if ($curUser->dni !== $request->dni &&
                User::where('dni', $request->dni)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED DNI']);
            }

            if ($curUser->email !== $request->email &&
                User::where('email', $request->email)->first()
            ) {
                return response()->json(['result' => 'DUPLICATED EMAIL']);
            }

            $user = User::where('id', $request->id)->update(array(
                'dni' => $request->dni,
                'name' => $request->name,
                'email' => strtolower($request->email),
                'phone' => $request->phone,
                'permission_level' => $request->permission_level,
                'status' => $request->status
            ));

            return response()->json(['result' => $user == 1 ? 'UPDATED' : 'ERROR']);
        }
    }

    public function deleteUser(Request $request)
    {
        return response()->json(['result' => User::destroy($request->id) ? 'OK' : 'ERROR']);
    }

    function isValidEmail($email)
    {
        return (false !== filter_var($email, FILTER_VALIDATE_EMAIL));
    }
}
