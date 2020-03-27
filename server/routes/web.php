<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', 'UsersController@test');

Route::post('/login', 'AuthController@validateLogin');

Route::get('/populatedb', 'UsersController@populatedb');

// USERS
Route::get('/getUsers', 'UsersController@getUsers');
Route::post('/saveUser', 'UsersController@saveUser');
Route::post('/deleteUser', 'UsersController@deleteUser');

// DEALERS
Route::get('/getDealers', 'DealersController@getDealers');
Route::post('/saveDealer', 'DealersController@saveDealer');
Route::post('/deleteDealer', 'DealersController@deleteDealer');

//SIMCARDS
Route::get('/getSimCards', 'SimCardsController@getSimCards');
Route::get('/getSimCardsWithDevice', 'SimCardsController@getSimCardsWithDevice');
Route::get('/getSimCardsWithDeviceChildren', 'SimCardsController@getSimCardsWithDeviceChildren');
Route::get('/getSimCardsWithDeviceModel', 'SimCardsController@getSimCardsWithDeviceModel');
Route::get('/getSimCardsWithDeviceVehicle', 'SimCardsController@getSimCardsWithDeviceVehicle');
Route::post('/saveSimCard', 'SimCardsController@saveSimCard');
Route::post('/deleteSimCard', 'SimCardsController@deleteSimCard');

//DEVICES
Route::get('/getDevices', 'DevicesController@getDevices');
Route::get('/getDevicesWithChildren', 'DevicesController@getDevicesWithChildren');
Route::get('/getDevicesWithDeviceModel', 'DevicesController@getDevicesWithDeviceModel');
Route::get('/getDevicesWithVehicle', 'DevicesController@getDevicesWithVehicle');
Route::get('/getDevicesWithSimCard', 'DevicesController@getDevicesWithSimCard');
Route::post('/saveDevice', 'DevicesController@saveDevice');
Route::post('/deleteDevice', 'DevicesController@deleteDevice');

Route::get('/getDevicesAssociations', 'DevicesController@getDevicesAssociations');

//CLIENTS
Route::get('/getClients', 'ClientsController@getClients');
Route::get('/getClientsWithVehicles', 'ClientsController@getClientsWithVehicles');
Route::post('/saveClient', 'ClientsController@saveClient');
Route::post('/deleteClient', 'ClientsController@deleteClient');

//VEHICLES
Route::get('/getVehicles', 'VehiclesController@getVehicles');
Route::get('/getVehiclesWithDevicesChildren', 'VehiclesController@getVehiclesWithDevicesChildren');
Route::post('/saveVehicle', 'VehiclesController@saveVehicle');
Route::post('/deleteVehicle', 'VehiclesController@deleteVehicle');

// DEVICES MODELS
Route::get('/getDevicesModels', 'DevicesModelsController@getDevicesModels');
Route::post('/saveDeviceModel', 'DevicesModelsController@saveDeviceModel');
Route::post('/deleteDeviceModel', 'DevicesModelsController@deleteDeviceModel');

// GEOFENCES
Route::get('/getGeofences', 'GeofencesController@getGeofences');
Route::post('/deleteGeofence', 'GeofencesController@deleteGeofence');
Route::post('/saveGeofence', 'GeofencesController@saveGeofence');
Route::post('/syncAsigned', 'GeofencesController@syncAsigned')->middleware('cors');
