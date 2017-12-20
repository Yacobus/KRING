angular.module('kring.routes', [])

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicCloudProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $ionicCloudProvider.init({
        "core": {
            "app_id": "a30ee567"
        }
    });

    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.icon('ion-chevron-left');
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.navBar.alignTitle('center');
    $stateProvider
     .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            }
        }
    })
    
        .state('app.login', {
            url: "/login",
            views: {
                'menuContent': {
                    templateUrl: "templates/login.html",
                    controller: 'LoginCtrl'
                }
            }
        })

        .state('app.change-password', {
            url: "/change-password",
            views: {
                'menuContent': {
                    templateUrl: "templates/change-password.html",
                    controller: 'ChangePassCtrl'
                }
            }
        })

        .state('app.signup', {
            url: "/signup",
            views: {
                'menuContent': {
                    templateUrl: "templates/signup.html",
                    controller: 'SignUpCtrl'
                }
            }
        })
        .state('app.about', {
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "templates/about.html"
                }
            }
        })

    .state('app.emergency', {
        url: "/emergency",
        views: {
            'menuContent': {
                templateUrl: "templates/emergency.html",
                controller: 'EmergencyCtrl'
            }
        }
    })

    .state('app.important', {
        url: "/important",
        views: {
            'menuContent': {
                templateUrl: "templates/important.html",
                controller: 'ImportantCtrl'
            }
        }
    })
    
         .state('app.important-detail', {
             url: "/important-detail",

             views: {
                 'menuContent': {
                     templateUrl: "templates/important-detail.html",
                     controller: 'ImportantDetailCtrl'
                 }
             }
         })

     .state('app.detail', {
         url: "/detail",        
         views: {
             'menuContent': {
                 templateUrl: "templates/detail.html",          
                 controller: 'DetailCtrl'
             }
         }
     })

    .state('app.private', {
        url: "/private",
        views: {
            'menuContent': {
                templateUrl: "templates/private.html",
                controller: 'PrivateCtrl'
            }
        }
    })

     .state('app.family', {
         url: "/family",
         views: {
             'menuContent': {
                 templateUrl: "templates/family.html",
                 controller: 'FamilyCtrl'
             }
         }
     })

      .state('app.service', {
          url: "/service",
          views: {
              'menuContent': {
                  templateUrl: "templates/service.html",
                  controller: 'ServiceCtrl'
              }
          }
      })
      
        .state('app.transport', {
            url: "/transport",
            views: {
                'menuContent': {
                    templateUrl: "templates/transport.html",
                    controller: 'TransportCtrl'
                }
            }
        })

         .state('app.edit', {
             url: "/edit",
             views: {
                 'menuContent': {
                     templateUrl: "templates/edit-contact.html",
                     controller: 'EditCtrl'
               
                 }
             }
         })
         .state('app.edit-profile', {
             url: "/edit-profile",
             views: {
                 'menuContent': {
                     templateUrl: "templates/edit-profile.html",
                     controller: 'ProfileCtrl'

                 }
             }
         })


    .state('app.add', {
        url: "/add",
        views: {
            'menuContent': {
                templateUrl: "templates/add.html",
                controller: 'AddContactCtrl'
               
            }
        }
    });
      
    $urlRouterProvider.otherwise('/app/home')



});