var database={
	    db : null,
	    iniciar : function(){


	        this.db = window.sqlitePlugin.openDatabase({name: 'mibd10.db', location:'default'}, function(success){
	        console.log(success)}, function(error){
	        console.log(error)});

	        var query= 'CREATE TABLE IF NOT EXISTS notas';
	                query += '(id_nota INTEGER PRIMARY KEY AUTOINCREMENT,';
            		query += 'nota TEXT,';
            		query += 'fecha DATETIME DEFAULT CURRENT_TIMESTAMP,';
            		query += 'latitud REAL DEFAULT 0.000000,';
            		query += 'longitud REAL DEFAULT 0.000000,';
            		query += 'altitud REAL DEFAULT 0.000000);';
            		this.db.executeSql(query,[],function(){},function(error){alert(error)});

            	query= 'CREATE TABLE IF NOT EXISTS fotos';
                	 query += '(id_foto INTEGER PRIMARY KEY AUTOINCREMENT,';
                     query += 'archivo TEXT,';
                     query += 'fecha DATETIME DEFAULT CURRENT_TIMESTAMP,';
                     query += 'latitud REAL DEFAULT 0.000000,';
                     query += 'longitud REAL DEFAULT 0.000000,';
                     query += 'altitud REAL DEFAULT 0.000000);';
                     this.db.executeSql(query,[],function(){},function(error){alert(error)});

                query= 'CREATE TABLE IF NOT EXISTS lugares';
                      query += '(id_lugar INTEGER PRIMARY KEY AUTOINCREMENT,';
                      query += 'id_nota INTEGER,';
                      query += 'lugar TEXT);';
                      this.db.executeSql(query,[],function(){},function(error){alert(error)});

                query= 'CREATE TABLE IF NOT EXISTS rutas';
                       query += '(id_ruta INTEGER PRIMARY KEY AUTOINCREMENT,';
                       query += 'ruta TEXT,';
                       query += 'inicio DATETIME DEFAULT CURRENT_TIMESTAMP,';
                       query += 'fin DATETIME DEFAULT \'0000-00-0000:00:00\');';
                       this.db.executeSql(query,[],function(){},function(error){alert(error)});

                query= 'CREATE TABLE IF NOT EXISTS rutas_coords';
                        query += '(id_rutas_coords INTEGER PRIMARY KEY AUTOINCREMENT,';
                        query += 'id_ruta INTEGER,';
                        query += 'fecha DATETIME DEFAULT CURRENT_TIMESTAMP,';
                        query += 'latitud REAL DEFAULT 0.000000,';
                        query += 'longitud REAL DEFAULT 0.000000,';
                        query += 'altitud REAL DEFAULT 0.000000);';
                        this.db.executeSql(query,[],function(){},function(error){alert(error)});

	    
                },
	    guardar_nota:function gn(nota, latitud, longitud, altitud, success, error){

	    var query= 'INSERT INTO notas(nota, latitud, longitud, altitud) VALUES(?,?,?,?)';
	        this.db.executeSql(query,[nota, latitud, longitud, altitud], success, error); carga_notas();
	    },

	    guardar_lugar: function gl(id_nota_current, address, success){
	        var query= 'INSERT INTO lugares(id_nota, lugar) VALUES(?,?)';
	        this.db.executeSql(query,[id_nota_current, address], success);
	    },

	    carga_notas: function cn(success){
	    var query = 'SELECT * FROM notas ORDER BY fecha DESC';
	    this.db.executeSql(query, null, success);
	    return;
        },

        guardar_foto: function gf(file_name, latitud, longitud, altitud, success){
            var query = 'INSERT INTO fotos (archivo, latitud, longitud, altitud) VALUES (?,?,?,?)';
            this.db.executeSql(query,[file_name, latitud, longitud, altitud], success);
        },

        carga_fotos: function cf(success){
        var query= 'SELECT * FROM fotos ORDER BY fecha DESC';
        this.db.executeSql(query, null, success);
        },

        carga_lugares: function cl(success){
                var query= 'SELECT * FROM lugares ORDER BY id_nota DESC';
                this.db.executeSql(query, null, success);
                },
        guardar_ruta: function gr(ruta, success){
                var query = 'INSERT INTO rutas (ruta) VALUES (?)';
                this.db.executeSql(query, [ruta], success);
                },

        guardar_ruta_coords: function grc(id_ruta, latitud, longitud, altitud, success){
                var query = 'INSERT INTO rutas_coords (id_ruta, latitud, longitud, altitud) VALUES (?,?,?,?)';
                this.db.executeSql(query, [id_ruta, latitud, longitud, altitud], success);
                },

        actualiza_ruta: function ar(id_ruta, success){
                var query = 'UPDATE rutas SET fin = DATETIME(\'now\') WHERE id_ruta = ?';
                this.db.executeSql(query, [id_ruta], success);
                },
        cargar_rutas: function crs(success){
                var query='SELECT * FROM rutas ORDER BY inicio DESC';
                this.db.executeSql(query, null, success);
                },

        carga_rutas_coords:function crc(id_ruta, success){
                var query = 'SELECT * FROM rutas_coords WHERE id_ruta= ? ORDER BY fecha DESC';
                this.db.executeSql(query, [id_ruta], success);
                },

        carga_polyline: function cp(id_ruta, success){
                var query = 'SELECT * FROM rutas_coords WHERE id_ruta= ?';
                this.db.executeSql(query, [id_ruta], success);
                },

};

        function iniciar(){

                 database.iniciar();
                 carga_notas();
                 carga_fotos();
                 carga_lugares();
                 carga_rutas();
                 trazar_mapa();


                $("#formulario_nota").submit(guardar_nota);
                $("#nota").on('keyup', contar_nota);
                $("#boton_hacer_foto").click(hacer_foto);
                $("#formulario_ruta").submit(iniciar_ruta);
                $("#boton_finalizar").hide();
         };



    document.addEventListener("deviceready", function(){
    iniciar();
    });

    window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fileSystem){
                var directoryEntry= fileSystem.root;
                directoryEntry.getDirectory("fotos", {create:true, exlusive:false});
    });



    function guardar_nota(evt){
              evt.preventDefault();
              var nota =$("#nota").val();
              if(nota.length > 0){
                  $("#boton_enviar_nota").attr("disabled", "disabled").val("Cargando...").button("refresh");
                  navigator.geolocation.getCurrentPosition(function(position){
                  var guardar_nota_success = function(results){
                  var id_nota_current = results.insertId;
                  var location={
                  lng: parseFloat(position.coords.longitude),
                  lat: parseFloat(position.coords.latitude)
                  };
                  var reverseGeocode= new google.maps.Geocoder();
                  reverseGeocode.geocode({
                  'location':location
                  },function(results,status){
                  var address="";
                      if(status == google.maps.GeocoderStatus.OK){
                      address = results[0].formatted_address;
                      }else{
                        address = "-No detectado-";
                      }
                    database.guardar_lugar(id_nota_current, address, carga_lugares);
                  });
                    carga_notas();
                  };
                  var guardar_nota_error= function(error){
                  console.log(error);
                  };
                  database.guardar_nota(nota, position.coords.latitude, position.coords.longitude,
                  position.coords.altitude, guardar_nota_success, guardar_nota_error);

                  $("#nota").val("");
                  $.mobile.navigate("#pagina_notas");
                  },function(error){
                  alert(error.message)
                  $("#boton_enviar_nota").removeAttr("disabled").val("Enviar").button("refresh");
                  },{
                  enableHighAccuracy:true,
                  timeout:30000
                  });

              }else{
                alert("Debes introducir tu experiencia");
                }
    };


    function carga_notas(){
                    database.carga_notas(function(res){
                    var li='';
                    var item;
                    for(var i = 0; i < res.rows.length; i++){
                    item = res.rows.item(i);
                    li+='<li><p><strong>' + item.fecha + '</strong></p><p>' + item.nota + '</p></li>';
                    }
                    $("#listado_notas").html(li).listview("refresh");
                    });
                    }


    function contar_nota(){
                    var nota=$("#nota").val();
                    if(nota.length >= 140){
                    $("#contador_nota").addClass("red");
                    }else{
                    $("#contador_nota").removeClass("red");
                    }
                    $("#numero_nota").html(nota.length)

    }

    function hacer_foto(){
                navigator.camera.getPicture(function(picture){
                window.resolveLocalFileSystemURI(picture, resolveOnSuccess,resOnError);
                function resolveOnSuccess(entry){
                window.requestFileSystem(LocalFileSystem.PERSISTENT,0,function(fileSystem){
                var directoryEntry= fileSystem.root;
                directoryEntry.getDirectory("fotos", {create: true, exlusive:false},
                function (directory){
                var fecha = new Date();
                var unix_time = fecha.getTime();
                var file_name = 'cuaderno_'+unix_time+'.jpg';
                entry.moveTo(directory, file_name, succeesMove, resOnError);
                },function(error){
                console.log(error);
                });
                },function(evt){
                console.log(evt);
                });
                }function succeesMove(entry){
                console.log(entry);
                navigator.geolocation.getCurrentPosition(function(position){
                database.guardar_foto(entry.name, position.coords.latitude, position.coords.longitude, position.coords.altitude, carga_fotos);
                },function(error){
                alert(error.message);
                },{
                enableHighAccuracy: true,
                timeout: 30000
                });
                }
                function resOnError(error){
                alert(error);
                }
                },function(error){

                },{quality: 50, destinationType: Camera.DestinationType.FILE_URI});
    }

    function carga_fotos(){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem){
            var directoryEntry = fileSystem.root;
            directoryEntry.getDirectory("fotos", {create: true, exlusive: false},
            function(directory){
            database.carga_fotos(function(res){
            var li = '';
            var item;
            for (var i = 0; i < res.rows.length; i++){
            item = res.rows.item(i);
            li += '<li><img src = "' + directory.nativeURL + item.archivo +'">' + item.fecha + '</li>';
            }
            $("#listado_fotos").html(li).listview("refresh");
            });
            }, function(error){
            console.log(error);
            });
            }, function(evt){
            console.log(evt);
            });
            }

    function carga_lugares(){
            database.carga_lugares(function(res){
            var li= '';
            var item;
            for(var i = 0; i < res.rows.length; i++){
            item = res.rows.item(i);
            li += '<li><strong>' + (res.rows.length - i) + '</strong>' + item.lugar + '</li>';
            }
            $("#listado_lugares").html(li).listview("refresh");
            });
            }

    function iniciar_ruta(evt){
            evt.preventDefault();
            var ruta = $("#ruta").val();
            if(ruta.length > 0){
            database.guardar_ruta(ruta,function(res){
            var watchID = navigator.geolocation.watchPosition(function (position){
            database.guardar_ruta_coords(res.insertId, position.coords.latitude, position.coords.longitude, position.coords.altitude)
            }, function(error){
            console.log(error);
            }, {timeout: 30000});
            $("#formulario_ruta").hide();
            $("#ruta").val('');
            $("#boton_finalizar").text("Finalizar ruta" + res.insertId).show().click(function(){
            navigator.geolocation.clearWatch(watchID);
            database.actualiza_ruta(res.insertId);
            $("#formulario_ruta").show();
            $("#boton_finalizar").hide();
            carga_rutas();
            $.mobile.navigate("#pagina_rutas");
            }).buton("refresh");
            });

            }else{
                         alert("Introduce el nombre de la ruta");
                  }
             }

    function trazar_mapa(){

                navigator.geolocation.getCurrentPosition(function(position){
                var mapa = new google.maps.Map(document.getElementById('mapa'),{
                center:{
                lat: position.coords.latitude,
                lng: position.coords.longitude
                },
                zoom:16,
                });
                var latLong;
                var marker;

                latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                marker = new google.maps.Marker({
                position: latLong,
                title:"Punto"
                });
                var contentString = "Tu ruta empieza aquí";
                var infowindow = new google.maps.InfoWindow({
                content: contentString

                });
                marker.setMap(mapa);
                infowindow.open(mapa, marker);
                }, function(error){ alert(error.message) },{ enableHighAccuracy:true, timeout:30000});
    }

    function cargar_ruta(id){
             database.carga_rutas_coords(id, function(res){
             var li= '';
             var item;
             for(var i = 0; i < res.rows.length; i++){
             item= res.rows.item(i);
             li += '<li><h4>' + item.fecha + '</h4><p>Latitud: ' + item.latitud + '</p><p>Longitud: ' + item.longitud + '</p><p>altitud: ' + item.altitud + '</p></li>';
             }
             navigator.geolocation.getCurrentPosition(function(position){
                        var map = new google.maps.Map(document.getElementById('map'),{
                        center:{
                        lat: item.latitud,
                        lng: item.longitud
                        },
                        zoom:17,
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                        });
                        var flightPlanCoordinates = [];
                        for ( k = 0; k < res.rows.length; k++){
                        item= res.rows.item(k);

                         flightPlanCoordinates[k] = new google.maps.LatLng(item.latitud, item.longitud);
                        }
                        var flightPath = new google.maps.Polyline({
                                    path: flightPlanCoordinates,
                                    geodesic:true,
                                    strokeColor:'#FF0000',
                                    strokeOpacity: 1.0,
                                    strokeWeight:4
                                    });
                                    flightPath.setMap(map);

                        }, function(error){ alert(error.message) },{ enableHighAccuracy:true, timeout:30000});

             $("#listado_ruta").html(li).listview("refresh");
            });
    }

    function carga_rutas(){
              database.cargar_rutas(function(res){
              var li = '';
              var item;
              for(var i = 0; i < res.rows.length; i++){
              item = res.rows.item(i);
              li += '<li data-ruta= "' + item.id_ruta + '"><a href="#pagina_ver_ruta"><h4>' + item.ruta + '</h4><p>idRuta: ' + item.id_ruta + '</p><p>Inicio: ' + item.inicio +  '</p><p>Fin: ' + item.fin + '</p></a></li>';
              }
              $("#listado_rutas").on('click','li', function(){
              cargar_ruta($(this).data('ruta'));
              });
              $("#listado_rutas").html(li).listview("refresh");
              });
    }