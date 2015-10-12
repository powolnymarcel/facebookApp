'use strict';

angular.module('ngSocial.facebook',['ngRoute','ngFacebook','firebase'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider.when('/facebook', {
            templateUrl:'facebook/facebook.html',
            controller:'facebookCtrl'
        });
    }])

    .config( function( $facebookProvider ) {
        $facebookProvider.setAppId('903032536446608');

        $facebookProvider.setPermissions("email,public_profile,user_posts,publish_actions,user_photos");
    })
    .run(function($rootScope){
            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "http://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        })

    //Filte perso de stackOverflow pour mettre la 1er lettre en MAJ
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })

    .controller("facebookCtrl",['$scope','$facebook','$firebaseArray',function($scope,$facebook,$firebaseArray){
        var ref = new Firebase("https://fb--app.firebaseio.com/");
        $scope.infos = $firebaseArray(ref);

        $scope.isLoggedIn = false;

           // Va lancer la procédure de loggin avec un popup de Facebook
        $scope.login= function(){
          $facebook.login().then(function(){
              $scope.isLoggedIn = true;

             // Juste un petit log pour savoir qui s'est loggé rien de méchant ;-)
              $facebook.api("/me?fields=email,name,first_name,last_name,gender,locale,age_range,link,timezone,verified,updated_time").then(function(response){
                  var name= response.name;
                  var email= response.email;
                  $scope.infos.$add({
                      name:name,
                      email:email
                  }).then(function(ref){
                      var id= ref.key();
                      console.log('contact ajouté avec id ' + id)

                  });
              },function(err){
                  $scope.welcomeMessage="Veuillez vous authentifier."
              })
                  refresh();
          })
        }

        $scope.logout= function(){
            $facebook.logout().then(function(){
                $scope.isLoggedIn = false;
                refresh();
            })
        }
        function refresh(){
            $facebook.api("/me?fields=email,name,first_name,last_name,gender,locale,age_range,link,timezone,verified,updated_time").then(function(response){
                $scope.welcomeMessage= "Bienvenue " +response.name;
                $scope.isLoggedIn = true;
                if(response.verified == true){
                    $scope.verificated= "Oui"
                }else{
                    $scope.verificated="Non"
                }
                $facebook.api('/me/picture').then(function(response){
                        $scope.picture=response.data.url;
                })
                $facebook.api('/me/permissions').then(function(response){
                    $scope.permissions= response.data;
                })
                $facebook.api('/me/posts').then(function(response){
                    $scope.posts= response.data;
                    console.log(response.data);
                })

                    $scope.userInfo= response;
                console.log(response);


            },function(err){
                $scope.welcomeMessage="Veuillez vous authentifier."
            })
        }
        function refreshShortVersion(){
                $facebook.api('/me/posts').then(function(response){
                    $scope.posts= response.data;
                })
        }

        $scope.postStatus=function(){
            var body=this.messageSurfb;
            $facebook.api('/me/feed',"post",{message:body}).then(function(response){
                $("#snackbarid").snackbar("show");
                clearFields();
                refresh();
            });

        }

        $scope.supprimer=function(post){
            if(confirm('Etes-vous certain de vouloir supprimer le post :' +post.message+' ?')){

                var postId = post.id;
            $facebook.api(postId, 'delete').then(function(response){
                refreshShortVersion();
                $("#snackbardelete").snackbar("show");

            });

            }

        }

        $scope.edit=function(post){
            $scope.editFormShow= true;
            $scope.ajoutFormSubmit= true;

            $scope.message = post.message ;
            $scope.id = post.id


            //console.log("****************");
           //console.log(post);
        }


        $scope.editFormSubmit=function(){
            var id = $scope.id;
            var mess = $scope.message;
            //alert(id);
           // alert(mess);
            $facebook.api(
                "/"+id+"",
                "POST",
                {
                    "message": mess
                }
            ).then(function(response){
                    $("#snackbarEdited").snackbar("show");
                    refresh();
                    $scope.editFormShow = false;
                    $scope.ajoutFormSubmit = false;
                    clearFields();
                });

        }


        $scope.annulerEditer=function(){
            $scope.editFormShow = false;
            $scope.ajoutFormSubmit = false;
            clearFields();

        }

        // Effacer les input
        function clearFields(){
            $scope.message='';
            $scope.messageSurfb='';
        }
        refresh();
    }]);