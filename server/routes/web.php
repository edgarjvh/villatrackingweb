<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', 'UsersController@test');

Route::post('/login', 'AuthController@validateLogin')->middleware('cors2');

Route::get('/populatedb', 'UsersController@populatedb');

// USERS
Route::get('/getUsers', 'UsersController@getUsers');
Route::post('/saveUser', 'UsersController@saveUser')->middleware('cors2');
Route::post('/deleteUser', 'UsersController@deleteUser')->middleware('cors2');

// DEALERS
Route::get('/getDealers', 'DealersController@getDealers');
Route::post('/saveDealer', 'DealersController@saveDealer')->middleware('cors2');
Route::post('/deleteDealer', 'DealersController@deleteDealer')->middleware('cors2');

//SIMCARDS
Route::get('/getSimCards', 'SimCardsController@getSimCards');
Route::get('/getSimCardsWithDevice', 'SimCardsController@getSimCardsWithDevice');
Route::get('/getSimCardsWithDeviceChildren', 'SimCardsController@getSimCardsWithDeviceChildren');
Route::get('/getSimCardsWithDeviceModel', 'SimCardsController@getSimCardsWithDeviceModel');
Route::get('/getSimCardsWithDeviceVehicle', 'SimCardsController@getSimCardsWithDeviceVehicle');
Route::post('/saveSimCard', 'SimCardsController@saveSimCard')->middleware('cors2');
Route::post('/deleteSimCard', 'SimCardsController@deleteSimCard')->middleware('cors2');

//DEVICES
Route::get('/getDevices', 'DevicesController@getDevices');
Route::get('/getDevicesWithChildren', 'DevicesController@getDevicesWithChildren');
Route::get('/getDevicesWithDeviceModel', 'DevicesController@getDevicesWithDeviceModel');
Route::get('/getDevicesWithVehicle', 'DevicesController@getDevicesWithVehicle');
Route::get('/getDevicesWithSimCard', 'DevicesController@getDevicesWithSimCard');
Route::get('/getDevicesConsole', 'DevicesController@getDevicesConsole');
Route::post('/saveDevice', 'DevicesController@saveDevice')->middleware('cors2');
Route::post('/deleteDevice', 'DevicesController@deleteDevice')->middleware('cors2');

Route::get('/getDevicesAssociations', 'DevicesController@getDevicesAssociations');

//CLIENTS
Route::get('/getClients', 'ClientsController@getClients');
Route::get('/getClientsConsole', 'ClientsController@getClientsConsole');
Route::get('/getClientsWithVehicles', 'ClientsController@getClientsWithVehicles');
Route::post('/saveClient', 'ClientsController@saveClient')->middleware('cors2');
Route::post('/deleteClient', 'ClientsController@deleteClient')->middleware('cors2');

//VEHICLES
Route::get('/getVehicles', 'VehiclesController@getVehicles');
Route::get('/getVehiclesWithDevicesChildren', 'VehiclesController@getVehiclesWithDevicesChildren');
Route::post('/saveVehicle', 'VehiclesController@saveVehicle')->middleware('cors2');
Route::post('/deleteVehicle', 'VehiclesController@deleteVehicle')->middleware('cors2');

// DEVICES MODELS
Route::get('/getDevicesModels', 'DevicesModelsController@getDevicesModels');
Route::post('/saveDeviceModel', 'DevicesModelsController@saveDeviceModel')->middleware('cors2');
Route::post('/deleteDeviceModel', 'DevicesModelsController@deleteDeviceModel')->middleware('cors2');

// GEOFENCES
Route::get('/getGeofences', 'GeofencesController@getGeofences');
Route::post('/deleteGeofence', 'GeofencesController@deleteGeofence')->middleware('cors2');
Route::post('/saveGeofence', 'GeofencesController@saveGeofence')->middleware('cors2');
Route::post('/syncAsigned', 'GeofencesController@syncAsigned')->middleware('cors2');
