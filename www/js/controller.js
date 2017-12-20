angular.module('kring.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope,$ionicHistory, $ionicPlatform, $ionicAuth, $location, $ionicPopup, $state) {
    

    $ionicPlatform.registerBackButtonAction(function (event) {
        if ($state.current.name == "app.home") {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Keluar Aplikasi?',
                    template: 'Anda yakin keluar aplikasi KRING?',
                    buttons: [{
                        text: 'Tidak'
                    }, {
                        text: 'Ya',
                        onTap: function () {
                            navigator.app.exitApp();
                        }
                    }]
                });
            
        }
        else {
            navigator.app.backHistory();
        }
    }, 100);

    $scope.goToPrivate = function () {
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        if ($rootScope.isLogin == false) {           
                $location.path('/app/login');               
            } else {
                $location.path('/app/private');
            }
    }

    $scope.logout = function () {
        $ionicAuth.logout();
        $rootScope.isLogin = false;
         $ionicHistory.nextViewOptions({
            historyRoot:true
        });
            $location.path('/app/home');
        ;
    }

    //$scope.changeState = function (page) {
    //    $state.go(page);
    //}
})

.controller('HomeCtrl', function ($scope, $rootScope, $ionicAuth, $ionicUser, $ionicPopup, $timeout, $location, $ionicPlatform) {
    $ionicPlatform.ready(function () {
        if ($ionicAuth.isAuthenticated()) {
            $ionicUser.load().then(function () {
            $rootScope.isLogin = true;
            $rootScope.profilePath = $ionicUser.get('profilePath');
            $rootScope.fullname = $ionicUser.details.name;
            $rootScope.email = $ionicUser.details.email;
            });
        } else {
            $rootScope.isLogin = false;
        }
    
});

    $scope.goToPrivate = function () {
        if ($rootScope.isLogin == false) {
            $location.path('/app/login');
        } else {
            $location.path('/app/private');
        }
    }
})

.controller('ProfileCtrl', function ($scope, $rootScope, $cordovaCamera, $ionicPopup, $timeout, $cordovaFile, $ionicUser, $cordovaToast) {
    
    $scope.changePhoto = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 110,
            targetHeight: 110,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (sourcePath) {
            var sourceDirectory = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);
            var sourceFileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1, sourcePath.length);
            sourceFileName = sourceFileName.split('?')[0];         
            
            var d = new Date(),
                n = d.getTime(),
                newFileName = n + ".jpg";
            //Move the file to permanent storage
            $cordovaFile.moveFile(sourceDirectory, sourceFileName, cordova.file.dataDirectory, newFileName)
                .then(function (success) {
                    //$ionicUser.details.image = cordova.file.dataDirectory + newFileName;
                    $ionicUser.set('profilePath', cordova.file.dataDirectory + newFileName);
                     $ionicUser.save().then(function () {
                        $rootScope.profilePath = $ionicUser.get('profilePath');
                    }, function (error) {
                        alert(error);
                    })
            }, function (error) {
                console.dir(error);
            });
        }, function (err) {
            // An error occured. Show a message to the user
        });
    }

    $scope.editname = function () {
        $scope.user = {}
        $scope.user.fullname = $rootScope.fullname;
        // An elaborate, custom popup
        var editPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="user.fullname">',
            title: 'Mengubah Nama',
            subTitle: 'Silahkan ubah nama Anda',
            scope: $scope,
            buttons: [
              { text: 'Batal' },
              {
                  text: '<b>Simpan</b>',
                  type: 'button-positive',
                  onTap: function (e) {
                      if ($scope.user.fullname != "" && $scope.user.fullname != null) {
                          $ionicUser.details.name = $scope.user.fullname;
                          $ionicUser.save().then(function () {
                              $rootScope.fullname = $scope.user.fullname;
                          },
                          function (error) {
                              alert(error);
                          }
                              )
                          //$rootScope.fullname = $scope.user.fullname;
                              //$cordovaToast.show('Nama Anda sudah berubah', 'long', 'center');
                         
                      } else {
                          alert('Nama tidak boleh kosong')
                          e.preventDefault();
                      }
                  }
              }
            ]
        });

        //editPopup.then(function (res) {
        //    console.log('Tapped!', res);
        //});

        $timeout(function () {
            editPopup.close(); //close the popup after 30 seconds for some reason
        }, 30000);

    }
})

.controller('SignUpCtrl', function ($scope, $cordovaToast, $location, $ionicLoading, $ionicAuth, $ionicUser) {
    $scope.user = {};

    $scope.register = function () {
        if ($scope.user.password == $scope.user.confpass) {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner>simpan data user...'
            });
            var details = { 'email': $scope.user.email, 'password': $scope.user.password, 'name': $scope.user.fullname };
            $ionicAuth.signup(details).then(function () {
                $ionicUser.get('profilePath','img/profile.png');
                $ionicUser.save();
                $ionicLoading.hide();
                $cordovaToast.show('Sign Up Success', 'long', 'center');
                $location.path('/app/login');
            }, function (err) {
                for (var e of err.details) {
                    if (e === 'conflict_email') {
                        $ionicLoading.hide();
                        alert('Email sudah digunakan.');
                        if (e === 'invalid_email') {
                            $ionicLoading.hide();
                            alert('Email tidak valid');
                        } else if (e === 'required_email') {
                            $ionicLoading.hide();
                            alert('Email tidak boleh kosong.');
                        } else if (e === 'required_password') {
                            $ionicLoading.hide();
                            alert('Password tidak boleh kosong.');
                        } else {
                            $ionicLoading.hide();
                            alert(e);
                        }
                    }
                }
            });

        } else {
            alert('password does not match');
        }
    }
    
})

.controller('LoginCtrl', function ($scope,$ionicHistory, $rootScope, $cordovaToast, $ionicPopup, $location, $ionicLoading, $ionicAuth, $ionicUser) {
    $scope.user = {};
    $scope.login = function (email,password) {
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner>mengirim data...'
        });
        var details = {'email': $scope.user.username, 'password': $scope.user.password};

        $ionicAuth.login('basic', details).then(function (res) {
            $ionicUser.load().then(function () {
                $rootScope.isLogin = true;
                $rootScope.profilePath = $ionicUser.get('profilePath');
                $rootScope.fullname = $ionicUser.details.name;
                $rootScope.email = $ionicUser.details.email;
                $ionicLoading.hide();
                //$cordovaToast.show('Welcome', 'long', 'center');
                $ionicHistory.nextViewOptions({
                    historyRoot: true
                });
                $location.path('/app/home');
            });
           
        }, function (error) {
            $ionicLoading.hide();
            alert('Gagal Login : ' + error);
        });       
    }

    $scope.forgotPass = function (emailAddress) {
                var myPopup = $ionicPopup.show({
                    template: '<input type="email" ng-model="user.email">',
                    title: 'Lupa password',
                    subTitle: 'Silahkan masukan email anda',
                    scope: $scope,
                    buttons: [
                      { text: 'Batal' },
                      {
                          text: '<b>Ok</b>',
                          type: 'button-positive',
                          onTap: function (e) {
                              $ionicAuth.requestPasswordReset($scope.user.email)
                              .then(function () {
                                  var myPopup2 = $ionicPopup.show({
                                      template: '<label>Kode Reset</label><br /><input type="number" ng-model="user.resetCode"><br /><label>Password Baru</label><br /><input type="text" ng-model="user.newPassword">',
                                      title: 'Reset Password',
                                      subTitle: 'Silahkan masukan reset kode dan password baru',
                                      scope: $scope,
                                      buttons: [
                                        { text: 'Batal' },
                                        {
                                            text: '<b>Ok</b>',
                                            type: 'button-positive',
                                            onTap: function (e) {
                                                $ionicAuth.confirmPasswordReset($scope.user.resetCode, $scope.user.newPassword)
                                                .then(function () {
                                                    $cordovaToast.show('Password berhasil di reset', 'long', 'center');                                                   
                                                });

                                            }
                                        }
                                      ]
                                  })
                                  $timeout(function () {
                                      myPopup2.close(); //close the popup after 3 seconds for some reason
                                  }, 30000);
                              });
                              
                          }
                      }
                    ]
                })
            
            $timeout(function () {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 30000);

        
    }
})

.controller('ChangePassCtrl', function ($scope, $rootScope, $cordovaToast, $location, $ionicUser) {
    $scope.change = {};
    $scope.save = function () {
       // if ($scope.change.password == $rootScope.pass) {
            if ($scope.change.newpass == $scope.change.confpass) {
                $ionicUser.details.password = $scope.change.newpass;
                $ionicUser.save().then(function () {
                    $cordovaToast.show('Password has been change', 'long', 'center');
                    $location.path('/app/edit-profile');
                }, function (error) {
                    alert(error);
                });
                
                            
            } else {
                alert('Your new password does not match');
            }
        //} else {
        //    alert('Your current password is wrong');
        //}
    }

})

.controller('EmergencyCtrl', function ($scope,$rootScope) {
    $scope.emergency = [{
                            Id:0,Nama: "Ambulans", NoTelp: "119", Ket: "Penggunaan nomor darurat ini jika Anda/orang yang disekitar dalam keadaan mendesak yang memerlukan pertolongan medis atau pengangkutan (evakuasi) \
                                     ke rumah sakit. Operator di nomor darurat ini akan menghubungi rumah sakit terdekat untuk mendatangkan mobil ambulans."},
                        {
                            Id:1,Nama: "Polisi", NoTelp: "110", Ket: "Penggunaan nomor darurat ini jika Anda/orang yang disekitar dalam keadaan mendesak yang memerlukan pertolongan dari pihak polisi misalnya ada aksi perampokan, teroris, pembunuhan dan lain-lain.\
                            Operator di nomor darurat ini akan menghubungi kantor polisi terdekat untuk mendatangkan petugas dari kepolisian."},
                        {
                            Id:2,Nama: "Kebakaran", NoTelp: "113", Ket: "Penggunaan nomor darurat ini jika disekitar Anda sedang terjadi kebakaran.\
                            Operator di nomor darurat ini akan menghubungi kantor pemadam kebakaran terdekat untuk mendatangkan petugas pemadam kebakaran."},
                        {
                            Id: 4, Nama: "Listrik", NoTelp: "123", Ket: "Penggunaan nomor darurat ini jika Terjadi gangguan listrik di rumah Anda.\
                            Operator di nomor darurat ini akan menghubungi PLN terdekat untuk ditinjau lebih lanjut."},
                        {
                            Id: 5, Nama: "Gangguan Saluran Telepon", NoTelp: "117", Ket: "Gunakan nomor darurat ini apabila terjadi \
                            gangguan saluran telepon di daerah rumah/kantor Anda. \
                            Operator di nomor darurat ini akan langsung  \
                            menghubungi cabang terdekat Anda untuk menangani \
                            masalah Anda lebih lanjut."
                           },
                        {
                            Id: 6, Nama: "Posko Bencana Alam", NoTelp: "129", Ket: "Gunakan nomor darurat ini apabila terjadi \
                            Bencana alam di daerah Anda, seperti tanah longsor, \
                            Gempa, tsunami, banjir, dll. Operator di nomor \
                            darurat ini akan langsung memproses kebutuhan \
                            Anda lebih lanjut."
                        },
                        {
                            Id: 7, Nama: "SAR", NoTelp: "115", Ket: "Gunakan nomor darurat ini apabila ingin mencari orang hilang \
                            atau menghadapi bahaya Dalam musibah-musibah seperti pelayaran, \
                            penerbangan, gedung Runtuh, kecelakaan kereta api dan bencana. \
                            Operator di nomor Darurat ini akan langsung  menindaklanjuti \
                            laporan Anda lebih lanjut."
                        },
                        {
                            Id: 8, Nama: "Pencegahan Bunuh Diri", NoTelp: "021-7256526", Ket: "Gunakan nomor darurat ini apabila Anda melihat orang lain/ \
                            Kerabat Dekat anda mencoba melakukan tindakan bunuh diri. \
                            Operator di nomor Darurat ini akan langsung  menindaklanjuti \
                            laporan Anda lebih lanjut."
                        },
                         {
                             Id: 9, Nama: "Posko Kewaspadaan Nasional", NoTelp: "122", Ket: "Gunakan nomor darurat ini apabila membutuhkan informasi atau \
                             tindakan penyelamatan untuk diri Anda, kerabat dan orang lain ketika \
                            terjadi konflik pemerintahan, sosial atau dengan negara lain. \
                            Operator di nomor Darurat ini akan langsung  menindaklanjuti \
                                laporan Anda lebih lanjut."
                         },
                          {
                              Id: 10, Nama: "Palang Merah Indonesia", NoTelp: "021-4207051", Ket: "Gunakan nomor darurat ini apabila membutuhkan tindakan untuk \
                                memperbaiki hajat hidup  masyarakat rentan, penanggulangan \
                                bencana, kesiapsiagaan penanggulangan bencana, kesehatan dan \
                                perawatan diri Anda dan masyarakat yang membutuhkan. \
                                Operator di nomor Darurat ini akan langsung  menindaklanjuti \
                                laporan Anda lebih lanjut."
                          },
                          {
                              Id: 11, Nama: "Sentra Informasi Keracunan", NoTelp: "021-4250767", Ket: "Gunakan nomor darurat ini apabila membutuhkan informasi dan \
                                petunjuk penanganan korban keracunan, informasi \
                                tentang pencegahan keracunan, informasi tentang efek racun \
                                dan bahaya pada keracunan akut dan kronis. Informasi ini \
                                dapat diberukan kepada masyarakat luas, tenaga profesi kesehatan, \
                                serta instansi pemerintah / swasta yang membutuhkan. \
                                Operator di nomor Darurat ini akan langsung \
                                menindaklanjuti laporan Anda lebih lanjut."
                          },
                           {
                               Id: 12, Nama: "Telepon Selular dan Satelit", NoTelp: "112", Ket: "Gunakan nomor darurat ini apabila membutuhkan informasi mengenai \
                                jaringan telepon satelit. Operator di nomor Darurat ini akan langsung \
                                menjawab pertanyaan Anda lebih lanjut."
                           },
                            {
                                Id: 13, Nama: "Derek Tol", NoTelp: "080021997", Ket: "Gunakan nomor darurat ini apabila membutuhkan layanan derek mobil \
                                ketika berada di jalan tol. Operator di nomor Darurat ini akan langsung \
                                menindaklanjuti laporan Anda lebih lanjut."
                            },
                             {
                                 Id: 14, Nama: "Telkom", NoTelp: "147", Ket: "Gunakan nomor darurat ini apabila membutuhkan informasi terkait dengan pelayanan PT. Telekomunikasi Indonesia. Operator di nomor \
                                darurat ini akan langsung menangani laporan/keluhanAnda lebih lanjut."
                             }

                        ];
       
    $scope.showdetail = function (telp) {
        detail = telp;
        $rootScope.parent = '/app/emergency';
    } 
   
    $scope.CallNumber = function (telp) {
        window.plugins.CallNumber.callNumber(function () {
            //success logic goes here
        }, function () {
            //error logic goes here
        }, telp.NoTelp)
    };
})

.controller('ImportantCtrl', function ($scope,$location,$rootScope) {
    //$scope.important = [{
    //                     Id:1,Nama: "TRANSPORSTATION",Ket:"Provide Taxi, Flight, Train, Shuttle Bus numbers."},
    //                    {Id:2,Nama:"FOOD",Ket:"Provide well known fast food restaurant numbers."},
    //                    {Id:3,Nama:"TELECOMMUNICATION",Ket:"Provide customer service celular call center numbers."},
    //                    {Id:4, Nama: "BANK", Ket: "Provide customer service bank call center numbers."}];

    $scope.showdetail = function (detailmenu) {
        menu = detailmenu;
        $location.path('/app/important-detail');
        $rootScope.parent = 'app/important';
    }
})

.controller('TransportCtrl', function ($scope,$location,$rootScope) {
    $scope.showdetail = function (detailmenu) {
        menu = detailmenu;
        $location.path('/app/important-detail');
        $rootScope.parent = 'app/transport';
    }
})


.controller('ImportantDetailCtrl', function ($scope,$rootScope,$location) {
    $scope.detail = [];
    
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.judul = menu;
        switch (menu) {
            case "Taxi":
                $scope.detail = [{
                    Id: 1, Nama: "Blue Bird", Phone: "021-79171234"
                },
                {
                    Id: 2, Nama: "Express", Phone: "021-26509000"
                },
                {
                    Id: 3, Nama: "Gamya", Phone: "021-87795555"
                },
                {
                    Id: 4, Nama: "Morante Jaya", Phone: "021-4603333"
                },
                {
                    Id: 5, Nama: "Gading", Phone: "021-4613001"
                },
                {
                    Id: 6, Nama: "Dian", Phone: "021-4250505"
                },
                {
                    Id: 7, Nama: "Putra", Phone: "021-7817771"
                },
                {
                    Id: 8, Nama: "Prestasi", Phone: "021-4754545"
                },
                {
                    Id: 9, Nama: "Queen", Phone: "021-6410001"
                },
                {
                    Id: 10, Nama: "Steady Safe", Phone: "021-3922222"
                },
                {
                    Id: 11, Nama: "Silver Bird", Phone: "021-7941234"
                },
                {
                    Id: 12, Nama: "Royal City", Phone: "021-8500888"
                },
                {
                    Id: 13, Nama: "Tiffany", Phone: "021-5854545"
                },
                {
                    Id: 14, Nama: "Rajawali", Phone: "021-8401133"
                },
                {
                    Id: 15, Nama: "Ratax", Phone: "021-7398669"
                }];
                break;
            case "Pesawat":
                $scope.detail = [{
                    Id: 1, Nama: "Bandara Soekarno hatta", Phone: "021-5505179"
                },
                {
                    Id: 2, Nama: "Halim", Phone: "021-80999200"
                },
                {
                    Id: 4, Nama: "Pondok Cabe", Phone: "021-7401123"
                },
                {
                    Id: 5, Nama: "Garuda", Phone: "0807-180780"
                },
                {
                    Id: 6, Nama: "Lion Air", Phone: "0804-1-778899"
                },
                {
                    Id: 7, Nama: "Air Asia", Phone: "021-29270999"
                },
                {
                    Id: 8, Nama: "Citilink", Phone: "0804-1080808"
                },
                {
                    Id: 9, Nama: "Sriwijaya Air", Phone: "021-6405566"
                },
                {
                    Id: 10, Nama: "Tiger Air", Phone: "021-5502655"
                }];
                break;
            case "Kereta":
                $scope.detail = [{
                    Id: 1, Nama: "KAI", Phone: "121"
                },
                {
                    Id: 2, Nama: "Jakarta kota", Phone: "021-6928515"
                },
                {
                    Id: 3, Nama: "Gambir", Phone: "021-3862361"
                },
                {
                    Id: 4, Nama: "Pasar Senen", Phone: "021-4210164"
                },
                {
                    Id: 5, Nama: "Jatinegara", Phone: "021- 8192318"
                },
                {
                    Id: 6, Nama: "Tanah abang", Phone: "021-3840048"
                },
                {
                    Id: 7, Nama: "Manggarai", Phone: "021-8292444"
                },
                {
                    Id: 8, Nama: "Bekasi", Phone: "021-8841901"
                },
                {
                    Id: 9, Nama: "Bogor", Phone: "0251-322101"
                }];
                break;
            case "Bus":
                $scope.detail = [{
                    Id: 1, Nama: "Transjakarta", Phone: "021-85916767"
                },
                {
                    Id: 2, Nama: "Bekasi", Phone: "021-8841901"
                },
                {
                    Id: 3, Nama: "Cibinong", Phone: "021-87900894"
                },
                {
                    Id: 4, Nama: "Kalideres", Phone: "021-5445348"
                },
                {
                    Id: 5, Nama: "Kp.Rambutan 1", Phone: "021-8400063"
                },
                {
                    Id: 6, Nama: "Kp.Rambutan 2", Phone: "021-8400062"
                },
                {
                    Id: 7, Nama: "Pulo Gadung 1", Phone: "021-4883742"
                },
                {
                    Id: 8, Nama: "Pulo Gadung 2", Phone: "021-4897748"
                },
                {
                    Id: 9, Nama: "Rawamangun", Phone: "021-4897455"
                },
                {
                    Id: 10, Nama: "Cikokol tng", Phone: "021-55761265"
                },
                {
                    Id: 11, Nama: "Baranangsiang", Phone: "0251-318809"
                }];
                break;
            case "Makanan":
                $scope.detail = [{
                    Id: 1, Nama: "KFC", Phone: "14022"
                },
                {
                    Id: 2, Nama: "Mc Donald", Phone: "14045"
                },
                {
                    Id: 3, Nama: "Solaria", Phone: "14099"
                },
                {
                    Id: 4, Nama: "Burger King", Phone: "021-500025"
                },
                {
                    Id: 5, Nama: "Wendys", Phone: "021-500063"
                },
                {
                    Id: 6, Nama: "Domino Pizza", Phone: "021-500366"
                },
                {
                    Id: 7, Nama: "Hoka Hoka Bento", Phone: "021-500505"
                },
                {
                    Id: 8, Nama: "PHD", Phone: "021-500600"
                },
                {
                    Id: 9, Nama: "Bakmi GM", Phone: "021-5655007"
                },
                {
                    Id: 10, Nama: "D Cost", Phone: "021-29277777"
                },
                {
                    Id: 11, Nama: "Sour Sally", Phone: "021-29960000"
                },
                 {
                     Id: 12, Nama: "Baso L Tembak", Phone: "0804-1444555"
                 },
                 {
                     Id: 13, Nama: "Nasi Bakar", Phone: "085211124425"
                }];
                break;
            case "Telekomunikasi":
                $scope.detail = [{
                    Id: 1, Nama: "Axis call center", Phone: "838"
                },
                {
                    Id: 2, Nama: "Axis cek pulsa", Phone: "*888#"
                },
                {
                    Id: 3, Nama: "Esia call center", Phone: "*999"
                },
                {
                    Id: 4, Nama: "Esia cek pulsa", Phone: "*955"
                },
                {
                    Id: 5, Nama: "Flexi call center", Phone: "147"
                },
                {
                    Id: 6, Nama: "Flexi cek pulsa", Phone: "*99#"
                },
                {
                    Id: 7, Nama: "IM3 / Mentari call center", Phone: "100"
                },
                {
                    Id: 8, Nama: "IM3 / Mentari  cek pulsa", Phone: "*388#"
                },
                {
                    Id: 9, Nama: "Matrix call center", Phone: "111"
                },
                {
                    Id: 10, Nama: "Star One call center", Phone: "111"
                },
                {
                    Id: 11, Nama: "Star One cek pulsa", Phone: "*555#"
                },
                {
                    Id: 12, Nama: "Smartfren call center", Phone: "888"
                },
                 {
                     Id: 13, Nama: "Smartfren cek pulsa", Phone: "*999"
                 },
                 {
                     Id: 14, Nama: "Simpati/AS call center", Phone: "155"
                 },
                {
                    Id: 15, Nama: "Simpati/AS cek pulsa", Phone: "*888#"
                },
                {
                    Id: 16, Nama: "Kartu Halo call center", Phone: "133"
                },
                {
                    Id: 17, Nama: "Three call center", Phone: "123"
                },
                {
                    Id: 18, Nama: "Three cek pulsa", Phone: "*111#"
                },
                {
                    Id: 19, Nama: "XL call center", Phone: "817"
                },
                {
                    Id: 20, Nama: "XL cek pulsa", Phone: "*123#"
                },
                {
                    Id: 21, Nama: "Informasi billing/tagihan telepon", Phone: "109"
                },
                {
                    Id: 22, Nama: "Informasi jam atau waktu", Phone: "103"
                },
                {
                    Id: 23, Nama: "Informasi lokal/umum", Phone: "108"
                },
                {
                    Id: 24, Nama: "Informasi interlokal", Phone: "106"
                },
                {
                    Id: 25, Nama: "Informasi internasional ", Phone: "102"
                },
                {
                    Id: 26, Nama: "Informasi interlokal (operator)", Phone: "105"
                },
                 {
                     Id: 27, Nama: "Informasi internasional (operator)", Phone: "101"
                 },
                 {
                     Id: 28, Nama: "Informasi telemarketing", Phone: "162"
                 },
                 {
                     Id: 29, Nama: "Informasi pos dan giro", Phone: "161"
                 },
                 {
                     Id: 30, Nama: "Layanan Phonogram / Telegram", Phone: "165"
                 }];
                break;
            case "Bank":
                $scope.detail = [{
                    Id: 1, Nama: "Mandiri", Phone: "14000"
                },
                {
                    Id: 2, Nama: "BCA", Phone: "69888"
                },
                {
                    Id: 3, Nama: "BTN", Phone: "021-26533555"
                },
                {
                    Id: 4, Nama: "BRI", Phone: "14017"
                },
                {
                    Id: 5, Nama: "BNI", Phone: "021-500046"
                },
                {
                    Id: 6, Nama: "HSBC", Phone: "500700"
                },
                {
                    Id: 7, Nama: "CitiBank", Phone: "69999"
                },
                {
                    Id: 8, Nama: "BII", Phone: "69811"
                },
                {
                    Id: 9, Nama: "Permata", Phone: "63399"
                },
                {
                    Id: 10, Nama: "Mayapada", Phone: "021-500029"
                },
                {
                    Id: 11, Nama: "CIMB", Phone: "14041"
                },
                {
                    Id: 12, Nama: "Panin", Phone: "60678"
                },
                 {
                     Id: 13, Nama: "Danamon", Phone: "67777"
                 }];
                break;
        }
    })

    $scope.CallNumber = function (telp) {
        window.plugins.CallNumber.callNumber(function () {
            //success logic goes here
        }, function () {
            //error logic goes here
        }, telp.Phone)
    };
    
    $scope.goBack = function () {
        $location.path($rootScope.parent);
    }
    //$scope.showdetail = function (telp) {
    //    detail = telp;   
    //}
})

.controller('DetailCtrl', function ($scope,$rootScope,$location, $state) {
    $scope.reload = function () {
        $state.reload();
    }
    $scope.detail = {};
    $scope.detail.Nama = detail.Nama;
    $scope.detail.NoTelp = detail.NoTelp;
    $scope.detail.Ket = detail.Ket;
    
    $scope.CallNumber = function () {
        var number = detail.NoTelp;
        window.plugins.CallNumber.callNumber(function () {
            //success logic goes here
        }, function () {
            //error logic goes here
        }, number)
    };

    $scope.goBack = function () {
        $location.path($rootScope.parent)
    }
})

.controller('PrivateCtrl', function ($scope) {
   

})

.controller('EditCtrl', function ($scope, $ionicPopup, $cordovaSQLite, $cordovaToast,$location,$rootScope,$location) {
    $scope.contact = {};
    $scope.contact.Name = detail.Name;
    $scope.contact.Phone = detail.Phone;
    $scope.contact.Category = detail.Category;

    $scope.save = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Edit Contact',
                template: 'Are you sure you want to change this contact?'
            });

            confirmPopup.then(function (result) {
                if (result) {
                    $cordovaSQLite.execute(db, 'UPDATE Private SET Category=?,Name=?,Phone=? WHERE Id=?', [$scope.contact.Category,$scope.contact.Name,$scope.contact.Phone, detail.Id])
                    .then(function (res) {
                        if ($scope.contact.Category == 'Family') {
                            $location.path('/app/family');
                        } else {
                            $location.path('/app/service');
                        }
                        $cordovaToast.show(' contact number has been updated', 'long', 'center');
                    }, function (error) {
                        alert(error);
                    });
                } else {

                }
            });      
    }


    $scope.goBack = function () {
        $location.path($rootScope.parent)
    }
})

.controller('FamilyCtrl', function ($scope,$rootScope, $cordovaSQLite, $ionicPopup, $cordovaToast,$location,$window) {
    $scope.family = [];
    $cordovaSQLite.execute(db, 'SELECT * FROM Private WHERE Category=?',['Family'])
     .then(function (res) {
         if (res.rows.length > 0) {
             for (var i = 0; i < res.rows.length; i++) {
                 
                 $scope.family.push({
                     Name: res.rows.item(i).Name,
                     Phone: String(res.rows.item(i).Phone),
                     Category: res.rows.item(i).Category,
                     Id: res.rows.item(i).Id
                 });
                 
             }
         }
     }, function (error) {
         alert(error);
     });

    $scope.CallNumber = function (telp) {
        window.plugins.CallNumber.callNumber(function () {
            //success logic goes here
        }, function () {
            //error logic goes here
        }, telp.Phone)
    };

    $scope.DeleteContact = function (telp) {
          var confirmPopup = $ionicPopup.confirm({
                title: 'Delete Contact',
                template: 'Are you sure you want to delete this contact?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $cordovaSQLite.execute(db, 'DELETE FROM Private WHERE Category=? AND Name=?', ['Family', telp.Name])
                    .then(function (res) {
                        $cordovaToast.show(telp.Name + ' contact number has been deleted', 'long', 'center');
                        $cordovaSQLite.execute(db, 'SELECT * FROM Private WHERE Category=?', ['Family'])
                            .then(function (res) {
                                $scope.family = [];
                                if (res.rows.length > 0) {
                                    for (var i = 0; i < res.rows.length; i++) {

                                        $scope.family.push({
                                            Name: res.rows.item(i).Name,
                                            Phone: String(res.rows.item(i).Phone),
                                            Category: res.rows.item(i).Category,
                                            Id: res.rows.item(i).Id
                                        });

                                    }
                                    $scope.$apply();
                                }
                            }, function (error) {
                                alert(error);
                            });
                    }, function (error) {
                        alert(error);
                    });
                } else {
                   
                }
            });     
    }
    
    $scope.EditContact = function (telp) {
        detail = telp;
        $location.path('/app/edit');
        $rootScope.parent = '/app/family';
    }
})

.controller('ServiceCtrl', function ($scope,$rootScope, $cordovaSQLite, $ionicPopup, $cordovaToast, $location, $state) {
    $scope.service = [];
    $cordovaSQLite.execute(db, 'SELECT * FROM Private WHERE Category=?', ['Services'])
     .then(function (res) {
         if (res.rows.length > 0) {
             for (var i = 0; i < res.rows.length; i++) {

                 $scope.service.push({
                     Name: res.rows.item(i).Name,
                     Phone: res.rows.item(i).Phone,
                     Category: res.rows.item(i).Category,
                     Id: res.rows.item(i).Id
                 });

             }
         }
     }, function (error) {
         alert(error);
     });

    $scope.CallNumber = function (telp) {
        window.plugins.CallNumber.callNumber(function () {
            //success logic goes here
        }, function () {
            //error logic goes here
        }, telp.Phone)
    };

    $scope.DeleteContact = function (telp) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Contact',
            template: 'Are you sure you want to delete this contact?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                $cordovaSQLite.execute(db, 'DELETE FROM Private WHERE Category=? AND Name=?', ['Services', telp.Name])
                .then(function (res) {
                    $cordovaToast.show(telp.Name + ' contact number has been deleted', 'long', 'center');
                    $cordovaSQLite.execute(db, 'SELECT * FROM Private WHERE Category=?', ['Services'])
                    .then(function (res) {
                        $scope.service = [];
                        if (res.rows.length > 0) {
                            for (var i = 0; i < res.rows.length; i++) {

                                $scope.service.push({
                                    Name: res.rows.item(i).Name,
                                    Phone: res.rows.item(i).Phone
                                });

                            }
                            $scope.$apply();
                        }
                    }, function (error) {
                        alert(error);
                    });
                }, function (error) {
                    alert(error);
                });
            } else {

            }
        });
    }

    $scope.EditContact = function (telp) {
        detail = telp;
        $location.path('/app/edit');
        $rootScope.parent = '/app/service';
    }
})

.controller('AddContactCtrl', function ($scope, $cordovaSQLite, $location,$cordovaToast) {
    $scope.add = {};

    $scope.save = function () {
        $cordovaSQLite.execute(db, 'INSERT INTO Private (Category, Name , Phone) VALUES(?,?,?)',[$scope.add.category,$scope.add.name,$scope.add.phone])
        .then(function (result) {
            $cordovaToast.show('Kontak berhasil disimpan ', 'long', 'center');
            $location.path('/app/private');
        }, function (error) {
            alert('Gagal simpan data : '+error);
        })
    }

})