<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function validateLogin(Request $request){
        $user = User::where('email', strtolower($request->email))->first();

        if ($user){
            if (Hash::check($request->password, $user->password)){
                return response()->json(['result' => 'OK', 'user' => $user]);
            }else{
                return response()->json(['result' => 'NO PASS']);
            }
        }else{
            return response()->json(['result' => 'NO USER']);
        }
    }
}
