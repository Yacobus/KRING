// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db = null;
var detail = [];
var menu = "";
angular.module('kring', ['ionic','ionic.cloud','ngCordova', 'kring.controllers', 'kring.routes'])

.run(function ($ionicPlatform, $cordovaSQLite, $rootScope) {
    $rootScope.isLoginPrivate = false;
    $rootScope.isLogin = false;
    $rootScope.username = null;

  $ionicPlatform.ready(function() {
    if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    //window.plugins.sqlDB.copy("kring.db", function () {
    //    db = $cordovaSQLite.openDB("kring.db");
    //}, function (error) {
    //    console.error("There was an error copying the database: " + error);
    //    db = $cordovaSQLite.openDB("kring.db");
    //});

    //if (cordova.platformId === 'ios') {
    //    db = $cordovaSQLite.openDB({ name: "kring.db", iosDatabaseLocation: 'Documents' });
    //} else {
    //    db = $cordovaSQLite.openDB({ name: "kring.db", location: 'default' });
    //}

    if (window.cordova && window.SQLitePlugin) {
        var db = $cordovaSQLite.openDB('accounts.db', 1);
    } else {
        db = window.openDatabase('accounts', '1.0', 'accounts.db', 100 * 1024 * 1024);
    }

    //$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Private (Category TEXT, Name TEXT, Phone TEXT,Other TEXT,Id INTEGER PRIMARY KEY )');
      // $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User (FullName TEXT, UserName TEXT PRIMARY KEY, Email TEXT,Password TEXT,ProfilePath TEXT DEFAULT "img/profile.png",isLogin NUMERIC DEFAULT 0)');

  });

 
})

String.prototype.toHex = function () {
    var buffer = forge.util.createBuffer(this.toString());
    return buffer.toHex();
}

String.prototype.toSHA1 = function () {
    var md = forge.md.sha1.create();
    md.update(this);
    return md.digest().toHex();
}
