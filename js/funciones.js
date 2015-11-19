var api_imgs='http://www.turismoavila.com/app/apiD.php';
var api_url='http://www.turismoavila.com/app/apiD.php';
var kml_url='http://www.turismoavila.com/app/resources/avila.kml';
var extern_url='http://www.turismoavila.com/app/resources/';
var local_url='../../resources/json/';

var ID_ROUTE_DOWNLOAD;
var RADIO_DESDE_USER=10; //km
var RADIO_DESDE_USER_MAPA_LOCATION=100; //km
var DATOS, FILTRO, NOMBRE_FILTRO, CONTENEDOR, ES_MUNICIPIO, ES_SERVICIO;

var fav_list=new Object();
var routes_list=new Object();
var trekking_routes=new Object();
var categ_list=new Object();
var cat_services_list=new Object();
var MAX_NUMBER_ROUTES=10;
var MAX_NUMBER_POINTS_ROUTE=8;

var coord_image_ppal=new Array();
var coord_image=new Array();
var array_coord_image_ppal=new Array();
var array_coord_image=new Array();
var zoom=1.02;

var intentos=0;

var default_language='es';

var lang_available=[['es','Castellano'],['en','English']];

var TEXTOS=texts_app[getLocalStorage("current_language")];

function onBodyLoad()
{		
	document.addEventListener("deviceready", onDeviceReady, false);
	
	//Desactivada de momento la presentación
	setLocalStorage("skip_presentation","1");

	//Cargamos las categorias en local storage
	categ_list=JSON.parse(getLocalStorage("categ_list"));		
	if(categ_list==null)
	{		
		$.getJSON(local_url+'category_list.json', function (data) 
		{
			categ_list=new Object();	
			$.each(data.result.items, function(index, d) 
			{   		
				categ_list[d.id]=new Array();
			
				categ_list[d.id].push(
					{
						es:d.es,
						en:d.en
					}
				);	
			});				
			setLocalStorage("categ_list", JSON.stringify(categ_list));  
		});		
	}
	
	//Cargamos los tipos de servicios en local storage
	cat_services_list=JSON.parse(getLocalStorage("cat_serv_list"));		
	if(cat_services_list==null)
	{		
		$.getJSON(local_url+'categories_services_list.json', function (data) 
		{
			cat_services_list=new Object();	
			$.each(data.result.items, function(index, d) 
			{   		
				cat_services_list[d.id]=new Array();
			
				cat_services_list[d.id].push(
					{
						es:d.es,
						en:d.en
					}
				);	
			});				
			setLocalStorage("cat_serv_list", JSON.stringify(cat_services_list));  
		});		
	}
	
}

function onDeviceReady()
{					
	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
	
	if(typeof device!="undefined")
	{
	
		console.log("WINDOW "+window);
		console.log("DEVICE "+device);
	
		if(device.platform!='android' && device.platform!='Android') 
		{
			window.plugin.statusbarOverlay.hide();
		}
	}

	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("menubutton", onMenuKeyDown, false);
	 
}    
function onBackKeyDown()
{
	if(window.location.href.search(new RegExp("index.html$")) != -1 || window.location.href.search(new RegExp("main_menu.html$")) != -1) 
	{		
		navigator.app.exitApp();
		return false;
	}
	window.history.back();
}
function onMenuKeyDown()
{
	window.location.href='menu.html';
}
function onOutKeyDown()
{
	navigator.app.exitApp();
	return false;
}
function onOnline()
{
	/*var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Conexión: ' + states[networkState]);*/

}
function onOffline()
{
	//$(".contenedor").prepend("Necesita una conexión a internet para poder ver correctamente todos los contenidos de la aplicación");
}

function show_welcome_phrase(index)
{
	$('#ov_text_01').html(phrase_welcome[index][1]);
	$('#ov_text_02').html(phrase_welcome[index][2]);
	
	var interval_01=setInterval(function(){
		$('#ov_text_01').hide('drop',{direction: "right"},1000,function(){});
		$('#ov_text_02').hide('drop',{direction: "right"},1000,function(){
		
			index++;
			if(index>=phrase_welcome.length)
			{
				index=0;
			}
			$('#ov_text_01').html(phrase_welcome[index][1]);
			$('#ov_text_02').html(phrase_welcome[index][2]);
			
			
			$('#ov_text_01').show('drop',1000,function(){});
			$('#ov_text_02').show('drop',1000,function(){});
			
		});
	},4000);
}

function show_lang_selector(container)
{
	var cadena='';
	$.each(lang_available, function(i,lang) {
		if(lang[0]==getLocalStorage("current_language"))
		{
			cadena+='<div id="ov_menu_01_item_'+i+'" class="ov_menu_01_item" onclick="changeLanguage(this,\''+lang[0]+'\');"> '+lang[1]
						+'<img class="ov_image_02" alt="check" src="styles/images/icons/check.png"/></div>';
		}
		else
		{
			cadena+='<div id="ov_menu_01_item_'+i+'" class="ov_menu_01_item" onclick="changeLanguage(this,\''+lang[0]+'\');">'+lang[1]+'</div>';
		}
	});
	$('#'+container).html(cadena);
}
function changeLanguage(actual,lang)
{
	$('.ov_image_02').remove();
	$(actual).append('<img class="ov_image_02" alt="check" src="styles/images/icons/check.png"/>');
	setLocalStorage("current_language",lang);
}

function view_presentation_or_menu()
{
	$('#ov_curtain_1_1').show('fade',500);
	$("#ov_view_container_01").hide('drop',500,function(){

		if(localStorage.getItem("skip_presentation")=="1")
		{
			window.location.href='./html/'+getLocalStorage("current_language")+'/main_menu.html';
		}
		else
		{
			window.location.href='./html/'+getLocalStorage("current_language")+'/presentation.html';
		}
	});
}

function devolver_sin_tildes(value_con_tildes) {
	
	var translate = {
			"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", 
			"&aacute;":"a", "&eacute;":"e", "&iacute;":"i", "&oacute;":"o", "&uacute;":"u",
			"Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
			"&Aacute;":"A", "&Eacute;":"E", "&Iacute;":"I", "&Oacute;":"O", "&Uacute;":"U",
		    "ä": "a", "ö": "o", "ü": "u",
		    "Ä": "A", "Ö": "O", "Ü": "U" 
		};		
		
	var translate_re = /[áéíóúÁÉÍÓÚöäüÖÄÜ]|(&aacute;)|(&eacute;)|(&iacute;)|(&oacute;)|(&uacute;)|(&Aacute;)|(&Eacute;)|(&Iacute;)|(&Oacute;)|(&Uacute;)/g;
	
	var value_sin_tildes=value_con_tildes.replace(translate_re, function(match, contents, offset, s) { 

		    return translate[match]; 
	});
	
	return value_sin_tildes;
}
function search_string(value, container) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	
	$('#'+container).html("<div id='cargador'><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:20px' /></div>");		
	
	$('.ov_zone_21').attr("class","ov_zone_21_b");
	$('#'+container).attr("class","ov_zone_21");	
	$('.ov_box_11_active').attr("class","ov_box_12");	
	
	var sorted_points=new Array();
	var sorted_empr=new Array();
	var sorted_avaut=new Array();
	
	if(value!="")
	{		
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");
			
		/*var expr_regular2="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular2+=split_value[i]+"|";
		}
		expr_regular2=expr_regular2.slice(0,-1);
	
		var q2 = $.trim(expr_regular2),
			regex2 = new RegExp(q2, "i");
			
		console.log(regex);*/
					
		$.getJSON('../../resources/json/point_list.json', function (data) {
			
			 $.each(data.result.items, function (ind, point) {
			 					
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  if(point.es.nombre.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								if(point.es.descripcion.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.es.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var description_point_sin_tildes=devolver_sin_tildes(point.es.descripcion);
									
								if(description_point_sin_tildes.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								break;
					
					case "en":  if(point.en.nombre.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								if(point.en.descripcion.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.en.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var description_point_sin_tildes=devolver_sin_tildes(point.en.descripcion);
								if(description_point_sin_tildes.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								break;
				}	

				if(point.municipio!=null)
				{
					if(point.municipio.search(regex) != -1) {
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);	
					}

					var municipio_point_sin_tildes=devolver_sin_tildes(point.municipio);
					if(municipio_point_sin_tildes.search(regex) != -1) {
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);	
					}
				}
				 
			});
						
			sorted_points.sort(SortByLangName);
			
			$.each(sorted_points, function(ind, point) {
				cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+point.id+'\'" >';
									
				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+point.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';

				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+point.es.nombre+'</div></div>';
			
				cadena+='</div>';
			});
			
			/*EMPRESAS*/
			$.getJSON('../../resources/json/empresas_list.json', function (data2) {

				 $.each(data2.result.items, function (ind, empr) {			
					
					if(empr.activo=="si")
					{												
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  if(empr.es.nombre.search(regex) != -1) {	
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										
										var name_empr_sin_tildes=devolver_sin_tildes(empr.es.nombre);
										if(name_empr_sin_tildes.search(regex) != -1) {
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);	
										}
										
										/*
										var description_empr_sin_tildes=devolver_sin_tildes(empr.es.descripcion)
										if(description_empr_sin_tildes.search(regex) != -1) {	
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										*/
										
										break;
							
							case "en":  if(empr.en.nombre.search(regex) != -1) {
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										
										/*
										var description_empr_sin_tildes=devolver_sin_tildes(empr.en.descripcion)
										if(description_empr_sin_tildes.search(regex) != -1) {	
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										*/
										break;
						}

						if(empr.municipio!=null)
						{
							if(empr.municipio.search(regex) != -1) {	
								if($.inArray(empr, sorted_empr)==-1)				
									sorted_empr.push(empr);		
							}
							
							var municipio_empr_sin_tildes=devolver_sin_tildes(empr.municipio);
							if(municipio_empr_sin_tildes.search(regex) != -1) {
								if($.inArray(empr, sorted_empr)==-1)				
									sorted_empr.push(empr);		
							}
						}
						
					}			
					 
				});
									
				sorted_empr.sort(SortByLangName);
				
				$.each(sorted_empr, function(ind, empr) {
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/empresa.html?id='+empr.id+'\'" >';
										
					cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
	
					cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+empr.es.nombre+'</div></div>';
				
					cadena+='</div>';
				});
				
				/*cad_result+=cadena;
				
				if(cadena=="")
				{		
					cad_result="<p>"+TEXTOS[0]+"</p>";
				}
				cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
				$('#'+container).html(cad_result);		
				
				$('#cargador').hide();*/
				
	
				/*AVILA AUTENTICA*/
				$.getJSON('../../resources/json/avautentica_list.json', function (data3) {

					 $.each(data3.result.items, function (ind, avaut) {			
						
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  if(avaut.es.nombre.search(regex) != -1) {	
											if($.inArray(avaut, sorted_avaut)==-1)				
												sorted_avaut.push(avaut);		
										}
										
										var name_avaut_sin_tildes=devolver_sin_tildes(avaut.es.nombre);
										if(name_avaut_sin_tildes.search(regex) != -1) {
											if($.inArray(avaut, sorted_avaut)==-1)				
												sorted_avaut.push(avaut);	
										}

										break;
							
							case "en":  if(avaut.en.nombre.search(regex) != -1) {
											if($.inArray(avaut, sorted_avaut)==-1)				
												sorted_avaut.push(avaut);		
										}
										
										var name_avaut_sin_tildes=devolver_sin_tildes(avaut.en.nombre);
										if(name_avaut_sin_tildes.search(regex) != -1) {
											if($.inArray(avaut, sorted_avaut)==-1)				
												sorted_avaut.push(avaut);	
										}
										
										break;
						}
						
						if(avaut.tag.search(regex) != -1) {	
							if($.inArray(avaut, sorted_avaut)==-1)				
								sorted_avaut.push(avaut);		
						}
						var tag_avaut_sin_tildes=devolver_sin_tildes(avaut.tag);
						if(tag_avaut_sin_tildes.search(regex) != -1) {
							if($.inArray(avaut, sorted_avaut)==-1)				
								sorted_avaut.push(avaut);	
						}										

						if(avaut.direccion!=null)
						{
							if(avaut.direccion.search(regex) != -1) {	
								if($.inArray(avaut, sorted_avaut)==-1)				
									sorted_avaut.push(avaut);		
							}
							
							var municipio_empr_sin_tildes=devolver_sin_tildes(avaut.direccion);
							if(municipio_empr_sin_tildes.search(regex) != -1) {
								if($.inArray(avaut, sorted_avaut)==-1)				
									sorted_avaut.push(avaut);		
							}
						}		
						 
					});
										
					sorted_avaut.sort(SortByLangName);
					
					$.each(sorted_avaut, function(index, avaut) {
				
						cadena+='<div>';
											
						cadena+='<div id="ov_box_13_1_f" class="ov_box_13" onclick="$(\'#info_avaut_filter_'+index+'\').toggle();" >+</div>';

						cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#info_avaut_filter_'+index+'\').toggle();">';
						
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  cadena+=avaut.es.nombre;
										break;
							
							case "en":  cadena+=avaut.en.nombre;
										break;
						}
						
						cadena+='</div></div>';			
					
						cadena+='<div class="ov_box_14_d" id="info_avaut_filter_'+index+'"><div class="ov_text_18">';
											
							if(avaut.tlf)
								cadena+='<i class="fa fa-phone fa-fw"></i> '+avaut.tlf+'<br>';			
							
							if(avaut.email)
								cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+avaut.email+'" >'+avaut.email+'</a><br>';
							
							if(avaut.web)
								cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+avaut.web+'" >'+avaut.web+'</a><br>';
							
							if(avaut.direccion)
								cadena+='<i class="fa fa-home fa-fw"></i> '+avaut.direccion+'<br>';
							
							cadena+='</div></div>';   
							
							cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
							
						cadena+='</div>';

					});
					
					cad_result+=cadena;
					
					if(cadena=="")
					{		
						cad_result="<p>"+TEXTOS[0]+"</p>";
					}
					cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
					$('#'+container).html(cad_result);		
					
					$('#cargador').hide();
		
						
				});
					
			});
						
		});

	}
}

function search_string_in_avaut(value, container, type) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	
	var sorted_points=new Array();
	var sorted_empr=new Array();
	
	if(value!="")
	{
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");
		
		$.getJSON('../../resources/json/avautentica_list.json', function (data) {
			
			 $.each(data.result.items, function (ind, point) {
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  if(point.es.nombre.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.es.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								break;
					
					case "en":  if(point.en.nombre.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.en.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								break;
				}	
				
				if(point.tag.search(regex) != -1) {	
					if($.inArray(point, sorted_points)==-1)				
						sorted_points.push(point);		
				}
				var tag_avaut_sin_tildes=devolver_sin_tildes(point.tag);
				if(tag_avaut_sin_tildes.search(regex) != -1) {
					if($.inArray(point, sorted_points)==-1)				
						sorted_points.push(point);	
				}										

				if(point.direccion!=null)
				{
					if(point.direccion.search(regex) != -1) {	
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);		
					}
					
					var municipio_empr_sin_tildes=devolver_sin_tildes(point.direccion);
					if(municipio_empr_sin_tildes.search(regex) != -1) {
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);		
					}
				}	
				 
			});
						
			sorted_points.sort(SortByLangName);			

			$.each(sorted_points, function(index, d) {
				
				cadena+='<div>';
									
				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" onclick="$(\'#info_avaut_filter_'+index+'\').toggle();" >+</div>';

				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#info_avaut_filter_'+index+'\').toggle();">';
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  cadena+=d.es.nombre;
								break;
					
					case "en":  cadena+=d.en.nombre;
								break;
				}
				
				cadena+='</div></div>';			
			
				cadena+='<div class="ov_box_14_d" id="info_avaut_filter_'+index+'"><div class="ov_text_18">';
									
					if(d.tlf)
						cadena+='<i class="fa fa-phone fa-fw"></i> '+d.tlf+'<br>';			
					
					if(d.email)
						cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+d.email+'" >'+d.email+'</a><br>';
					
					if(d.web)
						cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+d.web+'" >'+d.web+'</a><br>';
					
					if(d.direccion)
						cadena+='<i class="fa fa-home fa-fw"></i> '+d.direccion+'<br>';
					
					cadena+='</div></div>';   
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
				cadena+='</div>';
										
			});
			
			if(cadena=="")
			{		
				cadena="<p>"+TEXTOS[0]+"</p>";
			}
			cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
			$('#'+container).html(cadena);		
			$('.ov_zone_21').attr("class","ov_zone_21_b");
			$('#'+container).attr("class","ov_zone_21");	
			$('.ov_box_11_active').attr("class","ov_box_12");		
					
		});

	}
}

function search_string_in_cat(value, container, type) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	
	var sorted_points=new Array();
	var sorted_empr=new Array();
	
	if(value!="")
	{
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");
			
		var q2 = type,
			regex2 = new RegExp(q2, "i");
		
		$.getJSON('../../resources/json/point_list.json', function (data) {
			
			var filter_points=new Array();
			
			$.each(data.result.items, function (ind, d) {
		 		$.each(d.categoria, function(i, cat) {
					if(cat.id.search(regex2) != -1) 
					{			
						if($.inArray(d, filter_points)==-1)				
							filter_points.push(d);			
					}
				});
			});
			
			filter_points.sort(SortByLangName);
				
			$.each(filter_points, function (ind, point) {
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  if(point.es.nombre.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.es.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);	
								}
								
								break;
					
					case "en":  if(point.en.nombre.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								var name_point_sin_tildes=devolver_sin_tildes(point.en.nombre);
								if(name_point_sin_tildes.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);	
								}
								break;
				}	

				if(point.municipio!=null)
				{
					if(point.municipio.search(regex) != -1) {	
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);		
					}
					
					var municipio_empr_sin_tildes=devolver_sin_tildes(point.municipio);
					if(municipio_empr_sin_tildes.search(regex) != -1) {
						if($.inArray(point, sorted_points)==-1)				
							sorted_points.push(point);		
					}
				}					
				 
			});
			
			sorted_points.sort(SortByLangName);
			
			$.each(sorted_points, function(ind, point) {
				cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+point.id+'\'" >';
									
				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+point.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';

				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+point.es.nombre+'</div></div>';
			
				cadena+='</div>';
			});
			
			/*EMPRESAS*/
			$.getJSON('../../resources/json/empresas_list.json', function (data2) {
	
				 $.each(data2.result.items, function (ind, empr) {
					
					if(empr.activo=="si")
					{
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  if(empr.es.nombre.search(regex) != -1) {	
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										
										var name_empr_sin_tildes=devolver_sin_tildes(empr.es.nombre);
										if(name_empr_sin_tildes.search(regex) != -1) {
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);	
										}
										
										break;
							
							case "en":  if(empr.en.nombre.search(regex) != -1) {
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);		
										}
										
										var name_empr_sin_tildes=devolver_sin_tildes(empr.en.nombre);
										if(name_empr_sin_tildes.search(regex) != -1) {
											if($.inArray(empr, sorted_empr)==-1)				
												sorted_empr.push(empr);	
										}
										
										break;
						}
						
						if(empr.municipio!=null)
						{
							if(empr.municipio.search(regex) != -1) {	
								if($.inArray(empr, sorted_points)==-1)				
									sorted_points.push(empr);		
							}
							
							var municipio_empr_sin_tildes=devolver_sin_tildes(empr.municipio);
							if(municipio_empr_sin_tildes.search(regex) != -1) {
								if($.inArray(empr, sorted_points)==-1)				
									sorted_points.push(empr);		
							}
						}	
						
					}				
					 
				});
									
				sorted_empr.sort(SortByLangName);
				
				$.each(sorted_empr, function(ind, empr) {
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/empresa.html?id='+empr.id+'\'" >';
										
					cadena+='<div id="ov_box_13_1_f" class="ov_box_13"><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
	
					cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+empr.es.nombre+'</div></div>';
				
					cadena+='</div>';
				});
				
				cad_result+=cadena;
				
				if(cadena=="")
				{		
					cad_result="<p>"+TEXTOS[0]+"</p>";
				}
				cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
				$('#'+container).html(cad_result);		
	
				$('.ov_zone_21').attr("class","ov_zone_21_b");
				$('#'+container).attr("class","ov_zone_21");	
				$('.ov_box_11_active').attr("class","ov_box_12");						
					
			});
			
			
		});

	}
}

function search_string_in_mun(value, container, type) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	if(value!="")
	{
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");			
		
		$.getJSON('../../resources/json/municipios_list.json', function (data) {
			
			var filter_points=new Array();
			
			$.each(data.result.items, function (ind, d) {
		 		
				if(d.id.search(regex) != -1 || d.nombre.search(regex) != -1) 
				{		
					if($.inArray(d, filter_points)==-1)					
						filter_points.push(d);			
				}
				
			});
			
			filter_points.sort(SortByName);
	
			$.each(filter_points, function (ind, point) {
				
				cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+point.id+'\'" >';
									
				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+point.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';

				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+point.nombre+'</div></div>';
			
				cadena+='</div>';	
				 
			});

			cad_result+=cadena;
			
			if(cadena=="")
			{		
				cad_result="<p>"+TEXTOS[0]+"</p>";
			}
			cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
			$('#'+container).html(cad_result);		
			
			$('.ov_zone_21').attr("class","ov_zone_21_b");
			$('#'+container).attr("class","ov_zone_21");	
			$('.ov_box_11_active').attr("class","ov_box_12");						
		});

	}
}

function search_string_in_av(value, container, type) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	if(value!="")
	{
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");			
		
		$.getJSON('../../resources/json/conoceavila_list.json', function (data) {
			
			var filter_points=new Array();
			
			$.each(data.result.items, function (ind, d) {
		 		
				if(d.id.search(regex) != -1) 
				{		
					if($.inArray(d, filter_points)==-1)					
						filter_points.push(d);			
				}
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  if(d.es.nombre.search(regex) != -1) {	
									if($.inArray(d, filter_points)==-1)				
										filter_points.push(d);		
								}
								
								var point_sin_tildes=devolver_sin_tildes(d.es.nombre);
								if(point_sin_tildes.search(regex) != -1) {
									if($.inArray(d, filter_points)==-1)				
										filter_points.push(d);	
								}
								
								break;
					
					case "en":  if(point.en.nombre.search(regex) != -1) {
									if($.inArray(d, filter_points)==-1)				
										filter_points.push(d);		
								}
								
								var point_sin_tildes=devolver_sin_tildes(d.en.nombre);
								if(point_sin_tildes.search(regex) != -1) {
									if($.inArray(d, filter_points)==-1)				
										filter_points.push(d);	
								}
								
								break;
				}
				
			});
			
			filter_points.sort(SortByLangName);
			
			console.log(filter_points);
	
			$.each(filter_points, function (ind, point) {
				
				cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/conoce.html?id='+point.id+'\'" >';
									
				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+point.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  var informacion=point.es;	
								break;
								
					case "en":  var informacion=point.en;	
								break;
				}
		
				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion.nombre+'</div></div>';

				cadena+='</div>';	
				 
			});

			cad_result+=cadena;
			
			if(cadena=="")
			{		
				cad_result="<p>"+TEXTOS[0]+"</p>";
			}
			cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
			$('#'+container).html(cad_result);		
			
			$('.ov_zone_21').attr("class","ov_zone_21_b");
			$('#'+container).attr("class","ov_zone_21");	
			$('.ov_box_11_active').attr("class","ov_box_12");						
		});

	}
}

function search_string_in_ser(value, container, type) {
	
	var cadena="";
	var cad_result="<p>"+TEXTOS[28]+"</p>";
	
	var sorted_points=new Array();
	
	if(value!="")
	{
		//Busqueda normal
		var trim_value=$.trim(value);
		var split_value=trim_value.split(" ");
		
		var palabras_excluidas="";
				
		var expr_regular="";
		for(i=0; i<split_value.length; i++)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		
		//Busqueda sin tildes 
		
		var value_sin_tildes = devolver_sin_tildes(value);
		
		var trim_value_sin_tildes=$.trim(value_sin_tildes);
		var split_value_sin_tildes=trim_value_sin_tildes.split(" ");
				
		for(i=0; i<split_value_sin_tildes.length; i++)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		expr_regular+="|";
		for(i=split_value_sin_tildes.length-1; i>=0; i--)
		{			
			expr_regular+=""+split_value_sin_tildes[i]+".*";
		}
		expr_regular=expr_regular.slice(0,-2);
		
		var q = $.trim(expr_regular),
			regex = new RegExp(q, "i");
		
		$.getJSON('../../resources/json/services_list.json', function (data) {
						
			$.each(data.result.items, function (ind, point) {
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  if(point.es.nombre.search(regex) != -1) {	
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								
								break;
					
					case "en":  if(point.en.nombre.search(regex) != -1) {
									if($.inArray(point, sorted_points)==-1)				
										sorted_points.push(point);		
								}
								break;
				}				
				 
			});
			
			sorted_points.sort(SortByLangName);
			
			$.each(sorted_points, function(i, servicio) {

				cadena+='<div onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');" id="ov_box_13_1_f" class="ov_box_13" >+</div>';

				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+servicio.es.nombre+'</div></div>';
								break;
					
					case "en":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+servicio.en.nombre+'</div></div>';
								break;
				}

				cadena+='<div class="ov_box_14_d" id="info_service_'+i+'"><div class="ov_text_18">';
				if(servicio.tlf)
					cadena+='<i class="fa fa-phone fa-fw"></i> '+servicio.tlf+'<br>';
				if(servicio.fax)
					cadena+='<i class="fa fa-fax fa-fw"></i> '+servicio.fax+'<br>';
				if(servicio.direccion)
					cadena+='<i class="fa fa-home fa-fw"></i> '+servicio.direccion+'<br>';
				if(servicio.email)
					cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+servicio.email+'" >'+servicio.email+'</a><br>';
				if(servicio.web)
					cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+servicio.web+'" >'+servicio.web+'</a><br>';
								
				cadena+='</div>';
				
				if(servicio.direccion)
					cadena+='<div id="map_'+i+'" class="location_map_01"></div>';
				cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';
										
				cadena+='</div>';
				
				cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';

				cadena+='</div>';

			});
			
			cad_result+=cadena;
			
			if(cadena=="")
			{		
				cad_result="<p>"+TEXTOS[0]+"</p>";
			}
			cad_result+='<div class="ov_clear_floats_01">&nbsp;</div>';
			$('#'+container).html(cad_result);		

			$('.ov_zone_21').attr("class","ov_zone_21_b");
			$('#'+container).attr("class","ov_zone_21");	
			$('.ov_box_11_active').attr("class","ov_box_12");						
			
			$("a").on("click", function(e) {
				var url = $(this).attr('href');
				var containsHttp = new RegExp('http\\b'); 

				if(containsHttp.test(url)) { 
					e.preventDefault(); 
					window.open(url, "_system", "location=yes"); // For iOS
					//navigator.app.loadUrl(url, {openExternal: true}); //For Android
				}
			});	

		
		});
		
	}
}

function show_info_map_services(id, direccion) {

	$("#info_service_"+id).toggle();
	if(direccion)
	{
		setTimeout(function() {
			$("#map_"+id).gmap3({
				address:direccion,
				marker:{
						address:direccion,
					},
				map:{
						options:{
							zoom:17
						}
					}									
			});
					
		}, 250)
	}
}

function ajax_recover_data(type, folder, values, container, params) {
		
	if(params)
	{
		for(var i=0;i<params.length;i++)
		{
			if(params[i][0]=="id")
			{
				var filter_id=params[i][1];
			}
			if(params[i][0]=="element")
			{
				var element=params[i][1];
			}
			if(params[i][0]=="start")
			{
				var start=parseInt(params[i][1]);
			}
			if(params[i][0]=="limit")
			{
				var limit=parseInt(params[i][1]);
			}
			if(params[i][0]=="downloaded")
			{
				var downloaded=params[i][1];
			}
		}
	}
	
	var file_to_load="";
	if(typeof downloaded!="undefined" && downloaded=="yes")
	{
		alert("entro en yes");
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
		//window.webkitRequestFileSystem(PERSISTENT, 0, function(fileSystem) 
		{
			fs=fileSystem.root;							
							
			if(folder!="")
			{
				file_to_load=fs.toURL()+file_path+folder+"/"+values+".json";
			}
			else
			{
				file_to_load=fs.toURL()+file_path+values+".json";
			}
			
			alert("file to load "+file_to_load);
			
		}, onFileSystemError);   
		
	}
	else
	{
		if(folder!="")
		{
			file_to_load=local_url+folder+"/"+values+".json";
		}
		else
		{
			file_to_load=local_url+values+".json";
		}		
	}
	
	var objajax=$.getJSON(file_to_load, f_success)
		.fail(function(jqXHR, textStatus, errorThrown) {
			//alert('Error: "+textStatus+"  "+errorThrown);	
			
			 $("#"+container).html(TEXTOS[6]+"<br>Error: "+file_to_load+" - "+textStatus+"  "+errorThrown);

		});

	function f_success(data) {

		if(data.length==0) {
			
			$("#"+container).html("<p>"+TEXTOS[7]+"</p>");
			return;
		}
		
		switch(type)
		{
			case "services_municipio": 	
			
					var cadena="";
					var servicio=null;
					var start_count=start;
					
					var objajax=$.getJSON("../../resources/json/municipios_list.json", function(municipios) {
	
						var filter_name="";
						var filter_identificador="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
						
						$.each(municipios.result.items, function(i, mun) {
							
							if(mun.id==aBuscar || mun.nombre==aBuscar)
							{								
								filter_name=mun.nombre;
								filter_identificador=mun.id;
							}
							
						});					

						var filter_points=new Array();
						var resultados=0;
						
						var start_count=start;
									
						$.each(data.result.items, function(index, d) {   
								
							if(d.municipio!=null)
							{							
								if(d.municipio==filter_identificador) 
								{										
									if($.inArray(d, filter_points)==-1)	
									{										
										filter_points.push(d);	
										servicio=d;										
									}
								}
							}
		
						});
						
						/////////////////////////
										
						$.each(filter_points, function(i, servicio) {

							if(servicio!=null)
							{
								cadena+='<div class="ov_zone_15a">';

								cadena+='<div onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');" id="ov_box_13_1_f" class="ov_box_13" >+</div>';
								
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+servicio.es.nombre+'</div></div>';
												break;
									
									case "en":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+servicio.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+servicio.en.nombre+'</div></div>';
												break;
								}

								cadena+='<div class="ov_box_14_d" id="info_service_'+i+'"><div class="ov_text_18">';
								
								if(servicio.tlf)
									cadena+='<i class="fa fa-phone fa-fw"></i> '+servicio.tlf+'<br>';
								if(servicio.fax)
									cadena+='<i class="fa fa-fax fa-fw"></i> '+servicio.fax+'<br>';
								
								if(servicio.email)
									cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+servicio.email+'" >'+servicio.email+'</a><br>';
								if(servicio.web)
									cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+servicio.web+'" >'+servicio.web+'</a><br>';
								
								if(servicio.direccion)
									cadena+='<i class="fa fa-home fa-fw"></i> '+servicio.direccion+'<br>';
											
								cadena+='</div>';
								
								if(servicio.direccion)
									cadena+='<div id="map_'+i+'" class="location_map_01"></div>';
								cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';
														
								cadena+='</div>';
								
								cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';

								cadena+='</div>';
								
								servicio=null;
							}	
						
						});	
						
						if(cadena=="")					
						{
							cadena+='<div class="ov_zone_15"><p>'+TEXTOS[7]+'</p></div>';
						}
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';

						$("#"+container).html(cadena);
					
					})
					
					//fail list servicios
					.fail(function(jqXHR, textStatus, errorThrown) {
						//alert('Error: "+textStatus+"  "+errorThrown);	
						
						$("#"+container).html("<p>"+TEXTOS[6]+"</p>");
	
					});
					
					break;
					
			case "avautentica_list": 	
			
					var cadena="";
					var start_count=start;
					var filter_points=new Array();
						
					var objajax=$.getJSON("../../resources/json/categories_avautentica_list.json", function(cat_avaut) {
						
						var filter_name="";
						var filter_identificador="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
							
						$.each(cat_avaut.result.items, function(i, cat) {
							
							if(cat.id==aBuscar)
							{
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  filter_name=cat.es;
												break;
									
									case "en":  filter_name=cat.en;
												break;
								}
								
								filter_identificador=cat.id;
							}
							
						});	
												
						$.each(data.result.items, function(index, d) {   

							if(filter_id=="")
							{
								filter_points.push(d);	
							}
							else
							{
								$.each(d.tipo, function(i, tipo) {
									if(tipo.id.search(regex) != -1) 
									{							
										if($.inArray(d, filter_points)==-1)
											filter_points.push(d);			
									}
								});
							}
							
						});
						
						cadena+='<div class="ov_zone_15"><h3>Ávila Auténtica</h3></div>';
				
						cadena+='<select id="secciones_avaut" class="ov_select_01" onchange="go_to_page(\'avautentica_list\',$(\'#secciones_avaut\').val());">';
						
						cadena+='<option value="">'+TEXTOS[39]+'</option>';
											
						$.each(cat_avaut.result.items, function(i, cat) {			
														
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  var informacion=cat.es;	
											break;
											
								case "en":  var informacion=cat.en;	
											break;
							}

							if(filter_id==cat.id) {
								cadena+='<option value="'+cat.id+'" selected>'+informacion+'</option>';		
							} else {
								cadena+='<option value="'+cat.id+'" >'+informacion+'</option>';
							}
							
						});
						
						cadena+='</select>';
				
						$.each(filter_points, function(index, d) {
							
							/*if(start_count>index)
							{
								return true;
							}
							else
								start_count++;
								
							if(start_count>start+limit)
								return false;*/
								
								
							cadena+='<div>';
								
								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" onclick="$(\'#info_avaut_'+index+'\').toggle();">+</div>';
								
								cadena+='<div id="ov_box_14_1_f" class="ov_box_14" ><div id="ov_text_24_1_f" class="ov_text_24"  onclick="$(\'#info_avaut_'+index+'\').toggle();">';
									
									switch(getLocalStorage("current_language"))
									{
										default:
										case "es":  cadena+=d.es.nombre;
													break;
										
										case "en":  cadena+=d.en.nombre;
													break;
									}
									
									cadena+='</div>';
																		
								cadena+='</div>';
								
								cadena+='<div class="ov_box_14_d" id="info_avaut_'+index+'"><div class="ov_text_18">';
										
								if(d.tlf)
									cadena+='<i class="fa fa-phone fa-fw"></i> '+d.tlf+'<br>';			
								
								if(d.email)
									cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+d.email+'" >'+d.email+'</a><br>';
								
								if(d.web)
									cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+d.web+'" >'+d.web+'</a><br>';
								
								if(d.direccion)
									cadena+='<i class="fa fa-home fa-fw"></i> '+d.direccion+'<br>';
								
								cadena+='</div></div>';   
								
								cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
								
							cadena+='</div>';
													
						});
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
							
						/*if(start-limit>=0)
							cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
						
						if(start+limit<data.result.total)
							cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
							
					})
					.fail(function(jqXHR, textStatus, errorThrown) {
						//alert('Error: "+textStatus+"  "+errorThrown);	
						
						$("#"+container).html("<p>"+TEXTOS[6]+"</p>");
	
					});
						
					
					break;
					
			case "services_list": 	
			
					var cadena="";
					var start_count=start;
										
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  cadena+='<div class="ov_zone_15"><h3>'+data.result.es+'</h3></div>';
									break;
						
						case "en":  cadena+='<div class="ov_zone_15"><h3>'+data.result.en+'</h3></div>';
									break;
					}
					
					$.each(data.result.items, function(index, d) {
						
						/*if(start_count>index)
						{
							return true;
						}
						else
							start_count++;
							
						if(start_count>start+limit)
							return false;*/
							
							
						cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_service.html?id='+d.id+'\'" >';
							
						cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
						
						cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">';
						
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  cadena+=d.es;
										break;
							
							case "en":  cadena+=d.en;
										break;
						}
						
						cadena+='</div></div>';
						
						cadena+='</div>';   
					});
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
					/*if(start-limit>=0)
						cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
					
					if(start+limit<data.result.total)
						cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
					$("#"+container).html(cadena);
							
					break;
					
			case "filter_list_services": 	
			
					var objajax=$.getJSON("../../resources/json/categories_services_list.json", function(servicios) {
	
						var filter_name="";
						var filter_identificador="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
							
						$.each(servicios.result.items, function(i, ser) {
							
							if(ser.id==aBuscar || ser.nombre==aBuscar)
							{
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  filter_name=ser.es;
												break;
									
									case "en":  filter_name=ser.en;
												break;
								}
								
								filter_identificador=ser.id;
							}
							
						});					
						
						///////////////////							
						
						var cadena="";
						
						cadena+="<div class='ov_zone_15'>";
						
						if(filter_name!="")
						{
							cadena+="<h3>"+filter_name+"</h3>";
						}
						
						cadena+="</div>";
						
						var filter_points=new Array();
						var resultados=0;
						
						var start_count=start;
									
						$.each(data.result.items, function(index, d) {   

							$.each(d.categoria, function(i, cat) {
								if(cat.id.search(regex) != -1) 
								{							
									if($.inArray(d, filter_points)==-1)
										filter_points.push(d);			
								}
							});
		
						});
						
						///////////////////
						
						resultados=filter_points.length;
	
						$.each(filter_points, function(i, fd) {
	
							//cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/municipios.html?id='+fd.municipio+'\'" >';
							cadena+='<div >';

							cadena+='<div onclick="show_info_map_services(\''+i+'\', \''+fd.direccion+'\');" id="ov_box_13_1_f" class="ov_box_13" >+</div>';
							
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+fd.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+fd.es.nombre+'</div></div>';
											break;
								
								case "en":  cadena+='<div class="ov_box_14" onclick="show_info_map_services(\''+i+'\', \''+fd.direccion+'\');"><div id="ov_text_24_1_f" class="ov_text_24">'+fd.en.nombre+'</div></div>';
											break;
							}
	
							cadena+='<div class="ov_box_14_d" id="info_service_'+i+'"><div class="ov_text_18">';
							
							if(fd.tlf)
								cadena+='<i class="fa fa-phone fa-fw"></i> '+fd.tlf+'<br>';
							if(fd.fax)
								cadena+='<i class="fa fa-fax fa-fw"></i> '+fd.fax+'<br>';
							
							if(fd.email)
								cadena+='<i class="fa fa-envelope fa-fw"></i> <a href="mailto:'+fd.email+'" >'+fd.email+'</a><br>';
							if(fd.web)
								cadena+='<i class="fa fa-globe fa-fw"></i> <a href="'+fd.web+'" >'+fd.web+'</a><br>';
							
							if(fd.direccion)
								cadena+='<i class="fa fa-home fa-fw"></i> '+fd.direccion+'<br>';
							
							cadena+='</div>';
							
							if(fd.direccion)
								cadena+='<div id="map_'+i+'" class="location_map_01"><img src="../../styles/images/icons/loader.gif" style="margin:0 5px;width:20px" />'+TEXTOS[43]+'</div>';
							cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';
													
							cadena+='</div>';
							
							cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
	
							cadena+='</div>';
						});
												
						if(resultados==0)
						{
							cadena+="<p>"+TEXTOS[0]+"</p>";
						}
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
												
						cadena+="</div>";
						
						
						$("#"+container).html(cadena);
						
		
						///////////////////
						
						
					})
					
					//fail list servicios
					.fail(function(jqXHR, textStatus, errorThrown) {
						//alert('Error: "+textStatus+"  "+errorThrown);	
						
						$("#"+container).html("<p>"+TEXTOS[6]+"</p>");
	
					});
						
									
					break;
										
					
			case "municipios_list": 	
			
					var cadena="";
					var start_count=start;
					
					var sorted_municipios=new Array();
					
					$.each(data.result.items, function(index, d) {   
						
						if($.inArray(d, sorted_municipios)==-1)					
							sorted_municipios.push(d);	
						
					});

					sorted_municipios.sort(SortByName);
					
					$.each(sorted_municipios, function(index, d) {
						
						/*if(start_count>index)
						{
							return true;
						}
						else
							start_count++;
							
						if(start_count>start+limit)
							return false;*/
							
							
						cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+d.id+'\'" >';
							
						cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
						
						cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+d.nombre+'</div></div>';
						
						cadena+='</div>';   
					});
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
					/*if(start-limit>=0)
						cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
					
					if(start+limit<data.result.total)
						cadena+="<a class='verpagina' href='municipios_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
					$("#"+container).html(cadena);
							
					break;
					
					
			case "filter_list_municipios": 	
					
					var objajax=$.getJSON("../../resources/json/municipios_list.json", function(municipios) {
	
						var filter_name="";
						var filter_identificador="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
							
						$.each(municipios.result.items, function(i, mun) {
							
							if(mun.id==aBuscar || mun.nombre==aBuscar)
							{
								filter_name=mun.nombre;
								filter_identificador=mun.id;
							}
							
						});					
						
						//////////////////											
						
						var cadena="";
						
						if(filter_name!="")
						{
							cadena+="<div class='ov_zone_15'><h3>"+filter_name+"</h3>";

							cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/municipios.html?id='+filter_identificador+'\'" >';
		
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
							
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+filter_name+'</div></div>';
	
							cadena+='</div>';
							
							cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
							cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';
							
							cadena+="<p>"+TEXTOS[1]+"</p></div>";
						}
						
						///////////////////		
						
						var filter_points=new Array();
						var resultados=0;
						
						var start_count=start;
			
						$.each(data.result.items, function(index, d) {   
								
							if(d.municipio!=null)
							{	
								if(d.municipio==filter_name) 
								{		
									if($.inArray(d, filter_points)==-1)					
										filter_points.push(d);			
								}
							}
		
						});
							
						///////////////////
						
						//También añadimos puntos de empresas
						
						$.getJSON("../../resources/json/empresas_list.json", function(empresas) {
															
							$.each(empresas.result.items, function(index, empr) {   
								
								if(empr.municipio!=null)
								{										
									if(empr.municipio==filter_name) 
									{												
										if($.inArray(empr, filter_points)==-1)					
											filter_points.push(empr);			
									}
								}
			
							});
																			
							///////////////////			
							
							resultados=filter_points.length;
		
							$.each(filter_points, function(i, fd) {
		
								cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+fd.id+'\'" >';
		
								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+fd.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
								
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+fd.es.nombre+'</div></div>';
												break;
									
									case "en":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+fd.en.nombre+'</div></div>';
												break;
								}
		
								cadena+='</div>';
							});
							
							if(resultados==0)
							{
								cadena+="<p>"+TEXTOS[0]+"</p>";
							}
							
							cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
							
							$("#"+container).html(cadena);
							
							///////////////////
						
						});
					
					})
					
					//fail list municipios
					.fail(function(jqXHR, textStatus, errorThrown) {
						//alert('Error: "+textStatus+"  "+errorThrown);	
						
						$("#"+container).html("<p>"+TEXTOS[6]+"</p>");
	
					});
						
									
					break;
					
			case "filter_list_p": 	
					
					/*Habría que comprobar folder para ver si es point o empresa (o cualquier otro elemento) y en función de eso redirigir donde fuese necesario.*/
					
					var objajax=$.getJSON("../../resources/json/category_list.json", function(categorias) {
						
						var filter_name="";
						
						var q = filter_id,
							regex = new RegExp(q, "i");
						
						$.each(categorias.result.items, function(i, cat) {

							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  if(cat.id.search(regex) != -1) 
												filter_name=cat.es;
											break;
								
								case "en":  if(cat.id.search(regex) != -1) 
												filter_name=cat.en;
											break;
							}
						});
						
						///////////////////
						
						var cadena="";
						cadena+="<div class='ov_zone_15'><h3>"+filter_name+"</h3><p>"+TEXTOS[1]+"</p></div>";
						
						var filter_points=new Array();
						var resultados=0;
						
						var start_count=start;
					
						$.each(data.result.items, function(index, d) {   
							
							var coord=d.geolocalizacion.split(",");
							var lat1=parseFloat(coord[0]);
							var lon1=parseFloat(coord[1]);
							
							$.each(d.categoria, function(i, cat) {
								if(cat.id.search(regex) != -1) 
								{							
									if($.inArray(d, filter_points)==-1)
										filter_points.push(d);			
								}
							});
							
						});
						
						filter_points.sort(SortByLangName);

						resultados=filter_points.length;
						
						$.each(filter_points, function(i, fd) {
						
							/*if(start_count>i)
							{
								return true;
							}
							else
								start_count++;
								
							if(start_count>start+limit)
								return false;*/
							
							cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/'+element+'.html?id='+fd.id+'\'" >';

								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+fd.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
								
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=fd.es;	
												break;
												
									case "en":  var informacion=fd.en;	
												break;
								}
						
								cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion.nombre+'</div></div>';
							
							cadena+='</div>';
						});
						
						if(resultados==0)
						{
							cadena+="<p id='resultados_filter'>"+TEXTOS[0]+"</p>";
						}
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						/*if(start-limit>=0)
							cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
						
						if(start+limit<resultados)
							cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
						ajax_recover_data("filter_list_e", "", "empresas_list", "ov_zone_21_all", [['id',identificador],['start',start],['limit',limit],['element','empresa']]);
						
						///////////////////
						
					})
						.fail(function(jqXHR, textStatus, errorThrown) {
							//alert('Error: "+textStatus+"  "+errorThrown);	
							
							$("#"+container).html("<p>"+TEXTOS[6]+"<br>Error: category_list.json - "+textStatus+"  "+errorThrown+"</p>");

						});
									
					break;
					
			case "filter_list_e": 	
					
					/*Habría que comprobar folder para ver si es point o empresa (o cualquier otro elemento) y en función de eso redirigir donde fuese necesario.*/
					
					var objajax=$.getJSON("../../resources/json/category_list.json", function(categorias) {
						
						var filter_name="";
						
						var q = filter_id,
							regex = new RegExp(q, "i");
						
						$.each(categorias.result.items, function(i, cat) {

							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  if(cat.id.search(regex) != -1) 
												filter_name=cat.es;
											break;
								
								case "en":  if(cat.id.search(regex) != -1) 
												filter_name=cat.en;
											break;
							}
						});
						
						///////////////////
						
						var cadena="";
						
						var filter_points=new Array();
						var resultados=0;
						
						var start_count=start;

						$.each(data.result.items, function(index, d) {   
							
							if(d.activo=="si")
							{
								var coord=d.geolocalizacion.split(",");
								var lat1=parseFloat(coord[0]);
								var lon1=parseFloat(coord[1]);
								
								$.each(d.categoria, function(i, cat) {
									if(cat.id.search(regex) != -1) 
									{							
										if($.inArray(d, filter_points)==-1)
											filter_points.push(d);			
									}
								});
							}
							
						});
						
						filter_points.sort(SortByLangName);
						
						resultados=filter_points.length;

						$.each(filter_points, function(i, fd) {
						
							/*if(start_count>i)
							{
								return true;
							}
							else
								start_count++;
								
							if(start_count>start+limit)
								return false;*/
							
							cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/'+element+'.html?id='+fd.id+'\'" >';

								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+fd.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
								
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=fd.es;	
												break;
												
									case "en":  var informacion=fd.en;	
												break;
								}
						
								cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion.nombre+'</div></div>';
							
							cadena+='</div>';
						});
						
						if(resultados!=0)
						{
							$("#resultados_filter").html("");
						}
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						/*if(start-limit>=0)
							cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
						
						if(start+limit<resultados)
							cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).append(cadena);						
						
						///////////////////
						
					})
						.fail(function(jqXHR, textStatus, errorThrown) {
							//alert('Error: "+textStatus+"  "+errorThrown);	
							
							$("#"+container).html("<p>"+TEXTOS[6]+"<br>Error: category_list.json - "+textStatus+"  "+errorThrown+"</p>");

						});
									
					break;
					
			case "conoce_avila": 	
										
					var resultados=0;
					var cadena="";
					$.each(data.result.items, function(i, fd) {
					
						/*if(start_count>i)
						{
							return true;
						}
						else
							start_count++;
							
						if(start_count>start+limit)
							return false;*/
						
						cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/'+element+'.html?id='+fd.id+'\'" >';

							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+fd.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
														
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  var informacion=fd.es;	
											break;
											
								case "en":  var informacion=fd.en;	
											break;
							}
					
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion.nombre+'</div></div>';
						
						cadena+='</div>';
						
						resultados++;
					});

					if(resultados==0)
					{
						cadena+="<p>"+TEXTOS[0]+"</p>";
					}
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
					/*if(start-limit>=0)
						cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start-limit)+"&limit="+limit+"' style='float:left'>"+TEXTOS[27]+"</a>";
					
					if(start+limit<resultados)
						cadena+="<a class='verpagina' href='filter_list.html?id="+filter_id+"&start="+(start+limit)+"&limit="+limit+"' style='float:right'>"+TEXTOS[26]+"</a>";*/
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
					$("#"+container).html(cadena);
					
					///////////////////
						
					
					break;
					
			case "category_list": 			
					var cadena="";

					/*Ya no haría falta al estar guardandolo en localstorage, hay que sacar este case de aquí, porque no es necesario cargar el archivo category_list.json
					$.each(data.result.items, function(index, d) {   
					
						cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+d.id+'\'" >';
							
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
							
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  var informacion=d.es;	
											break;
											
								case "en":  var informacion=d.en;	
											break;
							}
					
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion+'</div></div>';
						
						cadena+='</div>';
							
					});*/
					
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/municipios_list.html\'" >';
					cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
					cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+TEXTOS[29]+'</div></div>';
					cadena+='</div>';
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';
					
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/services_list.html\'" >';
					cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
					cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+TEXTOS[50]+'</div></div>';
					cadena+='</div>';
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					cadena+='<div class="ov_vertical_space_02">&nbsp;</div>';					
					

					categ_list=JSON.parse(getLocalStorage("categ_list"));
					
					$.each(categ_list, function(index, d) {
						cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+index+'\'" >';
							
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
							
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  var informacion=d[0].es;	
											break;
											
								case "en":  var informacion=d[0].en;	
											break;
							}
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion+'</div></div>';
						
						cadena+='</div>';
							
					});
					
					cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
					
					$("#"+container).html(cadena);
									
					break;
					
			case "near_filter_list": 			
					
					var objajax=$.getJSON("../../resources/json/category_list.json", function(categorias) {
						var filter_name="";
							
						var q = filter_id,
							regex = new RegExp(q, "i");
						
						$.each(categorias.result.items, function(i, cat) {
	
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  if(cat.id.search(regex) != -1) 
												filter_name=cat.es;
											break;
								
								case "en":  if(cat.id.search(regex) != -1) 
												filter_name=cat.en;
											break;
							}
						});
						
						var latlong = get_current_pos_user(data, filter_id, filter_name, container, false, false);
					});	
								
					break;
					
			case "near_points_list": 			
					
					var latlong = get_current_pos_user(data, "", "", container, false, false);
									
					break;
					
			case "near_services_list": 			
					
					var objajax=$.getJSON("../../resources/json/services_list.json", function(servicios) {
	
						var filter_name="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
							
						$.each(servicios.result.items, function(i, ser) {
							
							if(ser.id==aBuscar)
							{
								filter_name=ser.nombre;
							}
							
						});		
						
						var latlong = get_current_pos_user(data, filter_id, filter_name, container, false, true);
					
					});
									
					break;
					
			case "near_municipios_list": 			
					
					var objajax=$.getJSON("../../resources/json/municipios_list.json", function(municipios) {
	
						var filter_name="";
						
						var q = decodeURI(filter_id),
								regex = new RegExp("^" + q + "$");
								
						var aBuscar=decodeURI(filter_id);
							
						$.each(municipios.result.items, function(i, mun) {
							
							if(mun.id==aBuscar)
							{
								filter_name=mun.nombre;
							}
							
						});		
						
						var latlong = get_current_pos_user(data, filter_id, filter_name, container, true, false);
					
					});
									
					break;
					
			case "points": 			
					var cadena="";
					
					var d=data.result;
					
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=d.es;	
									break;
									
						case "en":  var informacion=d.en;	
									break;
					}
					
					$("#point_name").html(informacion.nombre);
					$("#point_mini_description").html(informacion.miniDescripcion);
					$("#point_description").html(informacion.descripcion);
					$("#container_point").css("background-image","url(../.."+d.imagenDestacada+")");
					
					$("#categories_point").append('<div class="ov_box_19" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+d.municipio+'\'">'+d.municipio+'</div>');
						
					categ_list=JSON.parse(getLocalStorage("categ_list"));
					$.each(d.categoria, function(i, cat) {
					
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  $("#categories_point").append('<div class="ov_box_18" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+cat.id+'\'">'+categ_list[cat.id][0].es+'</div>');
										break;
										
							case "en":  $("#categories_point").append('<div class="ov_box_18" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+cat.id+'\'">'+categ_list[cat.id][0].en+'</div>');
								
										break;
						}
					});
					 
					$("#categories_point").append('<div class="ov_clear_floats_01"> </div>');
					
					break;
					
			case "empresa": 			
					var cadena="";
					
					var d=data.result;
					
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=d.es;	
									break;
									
						case "en":  var informacion=d.en;	
									break;
					}
					   
					$("#point_name").html(informacion.nombre);
					$("#point_mini_description").html(informacion.miniDescripcion);
					$("#point_description").html(informacion.descripcion);
						
					$("#container_point").css({"min-height": "60px", "height": "60px"});
					
					var image=new Image();
					image.src="../.."+d.imagenDestacada;
					
					image.onload = function() {

						if(image.complete)
						{
							$("#container_point").attr("style", "");
							$("#container_point").css("background-image","url(../.."+d.imagenDestacada+")");
						}
					}
					
					if(d.tlfn)
						cadena+="<i class='fa fa-phone fa-fw'> </i> "+d.tlfn+"<br>";
					if(d.fax)
						cadena+="<i class='fa fa-fax fa-fw'> </i> "+d.fax+"<br>";
					if(d.direccion)
						cadena+="<i class='fa fa-home fa-fw'> </i> "+d.direccion+"<br>";
					if(d.email)
						cadena+="<i class='fa fa-envelope fa-fw'> </i> <a href='mailto:"+d.email+"' >"+d.email+"</a><br>";
					if(d.web)
						cadena+="<i class='fa fa-globe fa-fw'> </i> <a href='http://"+d.web+"' >"+d.web+"</a><br>";
					
					$("#data_info").html(cadena);			
					
					if(d.municipio)
						$("#categories_point").append('<div class="ov_box_19" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+d.municipio+'\'">'+d.municipio+'</div>');		
						
					categ_list=JSON.parse(getLocalStorage("categ_list"));
					$.each(d.categoria, function(i, cat) {
					
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  $("#categories_point").append('<div class="ov_box_18" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+cat.id+'\'">'+categ_list[cat.id][0].es+'</div>');
										break;
										
							case "en":  $("#categories_point").append('<div class="ov_box_18" onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_list.html?id='+cat.id+'\'">'+categ_list[cat.id][0].en+'</div>');
								
										break;
						}
					});
					 
					$("#categories_point").append('<div class="ov_clear_floats_01"> </div>');
					
					break;
					
					
			case "municipio": 			
					var cadena="";
					
					var d=data.result;
					
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=d.es;	
									break;
									
						case "en":  var informacion=d.en;	
									break;
					}
										
					$("#point_description").html('<h2>'+informacion.nombre+'</h2>'+informacion.descripcion);
					$("#point_description").append("<h4>"+informacion.termino_municipal+"</h4>");
									
					$("#point_data").html("<h4>"+TEXTOS[36]+"</h4>"+informacion.datos_demograficos);
					$("#point_data").append("<h4>"+TEXTOS[37]+"</h4>"+informacion.fiestas);
					//$("#point_data").append(informacion.avila_azul);										
					
					break;
					
			case "gallery_point": 			
					var cadena="";
					
					var d=data.result;
					
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=d.es;	
									break;
									
						case "en":  var informacion=d.en;	
									break;
					}
					
					//Recoger número de imágenes en carpeta para la función que muestra imágenes.
					
					//cadena+=d.id+" *** "+d.galeria+" *** "+d.geolocalizacion+" *** "+d.QRlink;
					//galeria="../../resources/gallery/castro_ulaca/"
					
					$("#point_name").html(informacion.nombre);
					$("#point_mini_description").html(informacion.miniDescripcion);
									
					break;
					
			case "location_point": 			
					var cadena="";
					
					var geolocalizacion=data.result.geolocalizacion;
					if(geolocalizacion!="")
					{
						geolocalizacion=geolocalizacion.split(/[(,)]/);
						var geo_lat=geolocalizacion[1];
						var geo_lon=geolocalizacion[2];
						var my_zoom=parseInt(geolocalizacion[3]);
						
						setTimeout(function() {
							
							$("#"+container).gmap3({
								address:data.result.es.nombre,
								map:{
										options:{
											mapTypeId: google.maps.MapTypeId.HYBRID,
											center:[geo_lat, geo_lon],
											zoom:my_zoom
										}
									},
								marker:{
										values:[{latLng:[geo_lat, geo_lon], data:data.result.es.nombre}],
										events:{
											  click: function(marker, event, context){
												var map = $(this).gmap3("get"),
												  infowindow = $(this).gmap3({get:{name:"infowindow"}});
												if (infowindow){
												  infowindow.open(map, marker);
												  infowindow.setContent(context.data);
												} else {
												  $(this).gmap3({
													infowindow:{
													  anchor:marker, 
													  options:{content: context.data}
													}
												  });
												}
											  }
											}
									}
							});
							
						}, 500);
					}
					else
					{
						$("#"+container).html("<p>"+TEXTOS[8]+"</p>");						
					}

									
					break;
					
			case "geolocation_point": 			
					var cadena="";

					$("#datos_geo_position").html("<span id='geoloc_loader' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");			

					if (navigator.geolocation)
					{
						options = {
						  enableHighAccuracy: true,
						  timeout: 15000,
						  maximumAge: 30000
						};
						
						navigator.geolocation.getCurrentPosition(function(position){

							var geolocalizacion=data.result.geolocalizacion;
							if(geolocalizacion!="")
							{
								geolocalizacion=geolocalizacion.split(/[(,)]/);
								var geo_lat=geolocalizacion[1];
								var geo_lon=geolocalizacion[2];
								var my_zoom=parseInt(geolocalizacion[3]);

								setTimeout(function() {

									$("#"+container).gmap3({
										  getroute:
										  {
												options:
												{
													origin:new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
													destination:new google.maps.LatLng(geo_lat, geo_lon),
													travelMode: google.maps.DirectionsTravelMode.DRIVING
												},		
										  
											  callback: function(results){
											  	console.log("dentro");
											      if (!results) return;
											      $(this).gmap3({
											        map:{
											          options:{
											          	mapTypeId: google.maps.MapTypeId.HYBRID,
											            zoom: my_zoom,  
											            center: [geo_lat, geo_lon]
											          }
											        },
											        directionsrenderer:{
											          options:{
											            directions:results
											          } 
											        }
											      });
											      
											      $("#geoloc_loader").hide();
											  
												}
										}
									});
								}, 500);
													
							}
							else
							{
								$("#"+container).html("<p>"+TEXTOS[8]+"</p>");		
								$("#geoloc_loader").hide();				
							}
							
						}, function() {
							
							$("#datos_geo_position").html("<p>"+TEXTOS[3]+"</p>");		
							$("#geoloc_loader").hide();
											
						}, options);
						
					}
					else
					{	
						$("#datos_geo_position").html("<p class='data_route'>"+TEXTOS[44]+"</p>");	
						$("#cargando").hide();
					}
					
								
					break;
					
			case "trekking_routes": 		

					//Guardar en localstorage los id y nombres de las rutas descargadas, 
					//para luego recorrer ese localstorage y mostrar el listado sin tener que leer el directorio
					//Esto valdría también para mostrar sólo las rutas a descargar que no se hayan descargado anteriormente
				
					var cadena="";
					
					console.log(data.result);
					
					var indice=0;
					$.each(data.result.routes, function(index, rutas) 
					{   		
						cadena+='<div onclick="go_to_page(\'troute\',\''+rutas.id+'&downloaded=no\');" >';
						cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14" /></div>';
									
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+rutas.es.nombre+'</div></div>';	
										break;
										
							case "en":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+rutas.en.nombre+'</div></div>';	
										break;
						}
							
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						cadena+='</div>';
						
						indice++;
						
					});		
					
					
					window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
					//window.webkitRequestFileSystem(PERSISTENT, 0, function(fileSystem) 
					{
						console.log("FileSystem OK");
						//Cargado el sistema de archivos, recuperar ficheros
						
						fs=fileSystem.root;
						setFilePath();
						
						console.log(file_path);	
						
						fs.getDirectory("DiputacionAvila",{create:true, exclusive:false},function() {
														
							fs.getDirectory(file_path,{create:true, exclusive:false},function() {
																
								fs.getDirectory(file_path+"/json",{create:true, exclusive:false},function() {
									
									fs.getDirectory(file_path+"/json/routes",{create:true, exclusive:false},function(dirEntry) {
										
										var dirReader = dirEntry.createReader();
																	  
										  function readEntries() {

											  dirReader.readEntries(function(entries) {
											  
												for(var i = 0; i < entries.length; i++) {
												  var entry = entries[i];
												  
												  if (entry.isDirectory){
													console.log('Directory: ' + entry.fullPath);
												  }
												  else if (entry.isFile){
													console.log('File: ' + entry.fullPath);
																										
													//fs.root.getFile(entry.fullPath, {}, function(fileEntry) {
													$.getJSON(fs.toURL()+entry.fullPath, function(data) {
													
														var e=data.result;

														// Get a File object representing the file,
														// then use FileReader to read its contents.
														//fileEntry.file(function(file) {
														//   var reader = new FileReader();
													
														//   reader.onloadend = function(e) {
															
																var cadena2="";
																
																cadena2+='<div onclick="go_to_page(\'troute\',\''+e.id+'&downloaded=yes\');" >';
																cadena2+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14" /></div>';
																			
																switch(getLocalStorage("current_language"))
																{
																	default:
																	case "es":  cadena2+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+e.es.nombre+'</div></div>';	
																				break;
																				
																	case "en":  cadena2+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+e.en.nombre+'</div></div>';	
																				break;
																}
																	
																cadena2+='<div class="ov_clear_floats_01">&nbsp;</div>';
																cadena2+='</div>';
																
																$("#"+container).append(cadena2);		
																
																indice++;
																
														//  };
													
														//   reader.readAsText(file);
														   
														//}, function(jqXHR, textStatus, errorThrown) {		
														//
														//	console.log("Error reader: No se ha cargado el archivo");
														//
														//	});
													
													  }, function(jqXHR, textStatus, errorThrown) {		
										
															console.log("Error getFile: No se ha cargado el archivo");
													
														});
													  
												  }
												}
												
											 }, function(jqXHR, textStatus, errorThrown) {		
									
												console.log("Error ReadEntries: No se ha cargado el directorio "+fs.toURL()+file_path+"/json/routes/");
											
											});
											
											
											 
										}
										readEntries(); // Start reading dirs.
										
									},onError);					
								},onError);								
							},onError);							
						},onError);
								
				
				},onFileSystemError);   	
				
					/**************************/
					/* DESCOMENTAR HASTA AQUÍ */
					/**************************/
	
						
						/******************
	
						fs.getDirectory("DiputacionAvila",{create:true, exclusive:false},function() {
							
							fs.getDirectory(file_path,{create:true, exclusive:false},function() {
								
								fs.getDirectory(file_path+"/json/",{create:true, exclusive:false},function() {
		
									fs.getDirectory(file_path+"/json/routes",{create:true, exclusive:false},function(dirEntry) {
									
										
										  var dirReader = dirEntry.createReader();
																	  
										  var readEntries = function() {
											
											  dirReader.readEntries(function(entries) {
												
												for(var i = 0; i < entries.length; i++) {
												  var entry = entries[i];
												  if (entry.isDirectory){
													console.log('Directory: ' + entry.fullPath);
												  }
												  else if (entry.isFile){
													console.log('File: ' + entry.fullPath);
													
													fs.root.getFile(entry.fullPath, {}, function(fileEntry) {

														// Get a File object representing the file,
														// then use FileReader to read its contents.
														fileEntry.file(function(file) {
														   var reader = new FileReader();
													
														   reader.onloadend = function(e) {
															
																cadena+='<div onclick="go_to_page(\'troute\',\''+this.id+'\');" >';
																cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14" /></div>';
																			
																switch(getLocalStorage("current_language"))
																{
																	default:
																	case "es":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+this.es.nombre+'</div></div>';	
																				break;
																				
																	case "en":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+this.es.nombre+'</div></div>';	
																				break;
																}
																	
																cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
																cadena+='</div>';
																
																indice++;
																
														   };
													
														   reader.readAsText(file);
														   
														}, function(jqXHR, textStatus, errorThrown) {		
										
															console.log("Error reader: No se ha cargado el archivo");
													
															});
													
													  }, function(jqXHR, textStatus, errorThrown) {		
										
															console.log("Error getFile: No se ha cargado el archivo");
													
														});
													  
												  }
												}
											
											  }, function(jqXHR, textStatus, errorThrown) {		
										
													console.log("Error ReadEntries: No se ha cargado el directorio "+fs.toURL()+file_path+"/json/routes/");
											
											});
											
										}, function(jqXHR, textStatus, errorThrown) {		
										
												console.log("Error ReadEntries: No se ha cargado el directorio "+fs.toURL()+file_path+"/json/routes/");
										
										});
								  
									}, function(jqXHR, textStatus, errorThrown) {		
										
											console.log("Error ReadEntries: No se ha cargado el directorio "+fs.toURL()+file_path+"/json/routes/");
									
									});
								};
						
						  readEntries(); // Start reading dirs.
						  
						}, function(jqXHR, textStatus, errorThrown) {		
						
									console.log("Error getDirectory: No se ha cargado el directorio "+fs.toURL()+file_path+"/json/routes/");
						});
						
								
							},onError);
						},onError);   						
						
						**************************/
						
						/**************************
						
						var dirReader = fs.createReader();
						var entries = [];
						
						  // Call the reader.readEntries() until no more results are returned.
						  var readEntries = function() {
						     dirReader.readEntries (function(results) {
						     	
						     	console.log(results);
						     	
						      if (!results.length) {
						        
								entries.sort();
														        
						        //entries.forEach(function(entry, i) {
						        $.each(entries, function(index, rutas) {
						        	
						        	console.log(rutas);
						        	
								    cadena+='<div onclick="go_to_page(\'troute\',\''+rutas.id+'\');" >';
									cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14" /></div>';
												
									switch(getLocalStorage("current_language"))
									{
										default:
										case "es":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+rutas.es.nombre+'</div></div>';	
													break;
													
										case "en":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+rutas.es.nombre+'</div></div>';	
													break;
									}
										
									cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
									cadena+='</div>';
									
									indice++;
								  });
								
						  
						      } else {
						        //entries = entries.concat(toArray(results));
						        entries = entries.concat(Array.prototype.slice.call(results || [], 0));
						        
						        readEntries();
						      }
						    }, function(jqXHR, textStatus, errorThrown) {		
						
									console.log("No se ha cargado el archivo "+fs.toURL()+file_path+"/json/route"+id+".json");
							
								});
						  };
						
						  readEntries(); // Start reading dirs.
							
						
								
						/*var objajax=$.getJSON(fs.toURL()+file_path+"/json/routes"+id+".json", f_success)
						.fail(function(jqXHR, textStatus, errorThrown) {		
						
							console.log("No se ha cargado el archivo "+fs.toURL()+file_path+"/json/route"+id+".json");
							
						});*/

					//});
					
					
					/*
					 
					 function toArray(list) {
						  return Array.prototype.slice.call(list || [], 0);
						}
						
						function listResults(entries) {
						  // Document fragments can improve performance since they're only appended
						  // to the DOM once. Only one browser reflow occurs.
						  var fragment = document.createDocumentFragment();
						
						  entries.forEach(function(entry, i) {
						    var img = entry.isDirectory ? '<img src="folder-icon.gif">' :
						                                  '<img src="file-icon.gif">';
						    var li = document.createElement('li');
						    li.innerHTML = [img, '<span>', entry.name, '</span>'].join('');
						    fragment.appendChild(li);
						  });
						
						  document.querySelector('#filelist').appendChild(fragment);
						}
						
						function onInitFs(fs) {
						
						  var dirReader = fs.root.createReader();
						  var entries = [];
						
						  // Call the reader.readEntries() until no more results are returned.
						  var readEntries = function() {
						     dirReader.readEntries (function(results) {
						      if (!results.length) {
						        listResults(entries.sort());
						      } else {
						        entries = entries.concat(toArray(results));
						        readEntries();
						      }
						    }, errorHandler);
						  };
						
						  readEntries(); // Start reading dirs.
						
						} 
					 
					 */
					
					$("#"+container).html(cadena);						
								
					break;
					
					
			case "trekking_route_info": 			
					
					var cadena="";
					var indice=0;
					var info;
					
					$.each(data.result.items, function(ind, etapa) {

						if(etapa.id == filter_id) 
						{
							cadena+='<hr><h3>'+etapa.desde+' - '+etapa.hasta+'</h3>';	
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  cadena+=etapa.es.descripcion;	
											break;
											
								case "en":  cadena+=etapa.en.descripcion;	
											break;
							}
						}
					});
						
					cadena+='<div class="ov_vertical_space_02">&nbsp;</div>';
					cadena+='</div>';
										
					$("#"+container).html(cadena);						
					
					break;
							
			case "predefined_routes": 			
					var cadena="";
					
					$.each(data.result.routes, function(ind, rut) 
					{   								
						$.each(rut, function(index, rutas) 
						{

							cadena+='<div onclick="go_to_page(\'proute\',\''+rutas.id+'\');">';
							
								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
											
								cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">';
								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  cadena+=rutas.es.nombre;
												break;
									case "en": cadena+=rutas.en.nombre;
												break;
								}
								cadena+='</div></div>';	
							
							cadena+="</div>";
	
							cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						});			

					});			
					
					$("#"+container).html(cadena);						
								
					
					break;
					
			case "proute": 			
					var cadena="";
					var points=new Array();
					var wpoints=new Array();
					
					var id_route = decodeURI(identificador);

					var my_route=data.result.routes[0][id_route];	
					var geo_lat;
					var geo_lon;
										
					//Recogemos los puntos de la ruta
					var i=0; 
					var locate_ini, locate_fin;
					var fin=my_route.items.length; 
								
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  $("#"+container).append("<div class='ov_zone_15'><h3>"+my_route.es.nombre+"</h3></div>");
									break;
						case "en":  $("#"+container).append("<div class='ov_zone_15'><h3>"+my_route.en.nombre+"</h3></div>");
									break;
					}
					
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  cadena+="<div class='ov_zone_15'>"+my_route.es.descripcion+"</div>";
									break;
						case "en":  cadena+="<div class='ov_zone_15'>"+my_route.en.descripcion+"</div>";
									break;
					}
						
					cadena+='<div class="ov_vertical_space_01"> </div>';
					
					cadena+='<table class="table_routes">';
					
					$.each(my_route.items[0], function(index, puntos) { 
						
						var geolocalizacion=(puntos.geolocalizacion).split(/[(,)]/);
						geo_lat=geolocalizacion[1];
						geo_lon=geolocalizacion[2];
						var my_zoom=parseInt(geolocalizacion[3]);
	
						if(typeof(google)!="undefined")
						{
							if(i==0)
								locate_ini=new google.maps.LatLng(geo_lat, geo_lon);
							else if(i==fin)
								locate_fin=new google.maps.LatLng(geo_lat, geo_lon);
							else
							{		
								wpoints.push(
									{
										location: new google.maps.LatLng(geo_lat,geo_lon), 
										stopover: true
									}
								);
							}
						}
						
						points.push(
							{
								latLng: [geo_lat,geo_lon], 
								data: '<a href="points.html?id='+puntos.id+'">'+puntos.es.nombre+'</a>'
							}
						);

						cadena+='<tr><td>';
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  cadena+='<a href="points.html?id='+puntos.id+'">'+puntos.es.nombre+'</a>';
										break;
							case "en": 	cadena+='<a href="points.html?id='+puntos.id+'">'+puntos.en.nombre+'</a>';
										break;
						}
						
						cadena+='</td>';
						cadena+='</tr>';		
						
						i++;
						
					});
					
					cadena+="</table>";
					
					var container1="ov_points";
					var container2="ov_gmap";

					$("#"+container).append("<div id='"+container1+"' class='ov_zone_21_b'> </div>");
					$("#"+container).append("<div id='"+container2+"' class='location_map_01'>"+TEXTOS[43]+"<img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></div>");
					
					$("#"+container1).html(cadena);
					
					setTimeout(function() {
							
						$("#"+container2).gmap3({ 
							  map:
							  {
								  options:{
									zoom: 10,  
									center: locate_ini,
								  }
							  },
							  marker:
							  {
									values: points,
									cluster:{
											radius: 100,
											0: {
												content: "<div class='cluster cluster-1'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  },
											10: {
												content: "<div class='cluster cluster-2'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  },
											25: {
												content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  }
									},
									options:{
										icon: "../../styles/images/icons/my_point.png"
									},
									events:{
											  click: function(marker, event, context){
												var map = $(this).gmap3("get"),
												  infowindow = $(this).gmap3({get:{name:"infowindow"}});
												if (infowindow){
												  infowindow.open(map, marker);
												  infowindow.setContent(context.data);
												} else {
												  $(this).gmap3({
													infowindow:{
													  anchor:marker, 
													  options:{content: context.data}
													}
												  });
												}
											  }
											}
							  },
							  getroute:
							  {
									options:
									{
										origin:locate_ini,
										waypoints: wpoints,
										destination:locate_fin,
										optimizeWaypoints: true,
										travelMode: google.maps.DirectionsTravelMode.DRIVING
									},
									callback: function(results)
											  {
												  if (!results) return;
												  $(this).gmap3({
														map:{
														  options:{
															zoom: 10,  
															center: locate_ini,
														  }
														},
														directionsrenderer:{
														  options:{
															 directions:results,
															 preserveViewport: false,
															 markerOptions: {
																visible: false,
																clickable: false
															}
														  } 
														}
												  });
											  }
							  }
						});
						
					}, 500);
									
					break;
					

			case "troute":    

					var cadena="";
					var d=data.result;
								
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=d.es;	
									break;
									
						case "en":  var informacion=d.en;	
									break;
					}
					
					cadena+="<h3>"+informacion.nombre+"</h3>";
					cadena+=informacion.descripcion;
					
					cadena+="<h4>"+TEXTOS[31]+"</h4>";
					
					cadena+='<table class="table_routes">';
					$.each(d.items, function(i, d) {  

						if(typeof downloaded!="undefined" && downloaded=="yes")
						{
							cadena+='<tr><td><a href="#" onclick="go_to_page(\'canvas\',\''+d.id+'&gpx='+d.gpx+'&json='+identificador+'&downloaded=yes\');">'+d.desde+' - '+d.hasta+'</a></td></tr>';				
						}
						else
						{
							cadena+='<tr><td><a href="#" onclick="go_to_page(\'canvas\',\''+d.id+'&gpx='+d.gpx+'&json='+identificador+'&downloaded=no\');">'+d.desde+' - '+d.hasta+'</a></td></tr>';						
						}
						
					});	
					cadena+='</table>';
					
					$("#"+container).html(cadena);
					
					break;
			
		}
			
		$("a").on("click", function(e) {
			
			var url = $(this).attr('href');
			var containsHttp = new RegExp('http\\b'); 

			if(containsHttp.test(url)) { 
				e.preventDefault(); 
				window.open(url, "_system", "location=yes"); // For iOS
				//navigator.app.loadUrl(url, {openExternal: true}); //For Android
			}
		});	
	
	}
	
}

function ajax_paint_routes(type, folder, values, container, params) {

	var file_to_load="";
			
	if(params)
	{
		for(var i=0;i<params.length;i++)
		{	
			if(params[i][0]=="id")
			{
				var id=params[i][1];
			}
			if(params[i][0]=="gpx")
			{
				var gpx=params[i][1];
			}
			if(params[i][0]=="start")
			{
				var start=parseInt(params[i][1]);
			}
			if(params[i][0]=="limit")
			{
				var limit=parseInt(params[i][1]);
			}
			if(params[i][0]=="haveCanvas")
			{
				var haveCanvas=params[i][1];
			}
			if(params[i][0]=="canvas_number")
			{
				var canvas_number=parseInt(params[i][1]);
			}
			if(params[i][0]=="downloaded")
			{
				var downloaded=parseInt(params[i][1]);
			}
		}
	}
	
	if(typeof downloaded!="undefined" && downloaded=="yes")
	{
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
		//window.webkitRequestFileSystem(PERSISTENT, 0, function(fileSystem) 
		{
			fs=fileSystem.root;							
							
			if(folder!="")
			{
				file_to_load=fs.toURL()+file_path+folder+"/"+values+".json";
			}
			else
			{
				file_to_load=fs.toURL()+file_path+values+".json";
			}
			
		},onFileSystemError);   
		
	}
	else
	{
		if(folder!="")
		{
			file_to_load=local_url+folder+"/"+values+".json";
		}
		else
		{
			file_to_load=local_url+values+".json";
		}		
	}
	
	var objajax=$.getJSON(file_to_load, f_success)
		.fail(function(jqXHR, textStatus, errorThrown) {
			//alert('Error: "+textStatus+"  "+errorThrown);	
			
			$("#"+container).html(TEXTOS[6]+"<br>Error: "+local_url+folder+"/"+values+".json"+" - "+textStatus+"  "+errorThrown);

		});	

	function f_success(data) {

		if(data.length==0) {
			
			$("#"+container).html("<p>"+TEXTOS[7]+"</p>");
			return;
		}
		
		switch(type)
		{
			case "trekking_route_canvas": 
					var cadena="";
															
					if(haveCanvas==true)
					{
						var src_image="";
				
						var elementos=data.result.items;

						$.each(elementos, function(i,e){

							if(e.id.search(id)!=-1)
							{
								if(typeof downloaded!="undefined" && downloaded=="yes")
								{
									var la_imagen=e.src_image.split("../../");
									src_image=fs.toURL()+file_path+"/images/maps/"+la_imagen[1];  
								}
								else
								{
									src_image=e.src_image;  
								}
								
								coord_image_ppal=e.coord_image_ppal;
								return false;
							}
						});

						if(src_image=="")
						{
							 $("#"+container).append(TEXTOS[7]);
							 return; 									 
						}
					
						var d=data.Result;
						draw_canvas(container,src_image, '../../resources/routes/'+gpx+".gpx", id, canvas_number); 
						
						if(canvas_number==1)
						{
							//$("#"+container).css("height",height);
							$("#datos_geo").append("<div id='datos_geo_position'></div>");
						}
												
						break;
					}
					
					var d=data.result;

					cadena+="<h2>"+d.titulo+"</h2>";
					
					var imagen=d.Image; 
					if(imagen!=null) 
					{
						var imagen_local="../../resources/images/mapas/"+imagen;					
						cadena+="<img src='"+imagen_local+"' alt='Imagen de la ruta' />";
					}

					cadena+=d.texto;

					cadena+="<p><a class='vermas' href='canvas.html?id="+id+"'>Ver ruta con geolocalizaci&oacute;n</a></p>";				
					
					$("#"+container).append(cadena);
					
					break;
			
		}
		
		$("a").on("click", function(e) {
			var url = $(this).attr('href');
			var containsHttp = new RegExp('http\\b'); 

			if(containsHttp.test(url)) { 
				e.preventDefault(); 
				window.open(url, "_system", "location=yes"); // For iOS
				//navigator.app.loadUrl(url, {openExternal: true}); //For Android
			}
		});	
	
	}
	
}

/*****CANVAS RUTAS SENDERISMO*****/
var canvasOffset;
var offsetX;
var offsetY;

var ctx;

var imageX = 0;
var imageY = 0;
var img_global;

var draggingImage = false;
var isDown = false;
var startX=0;
var startY=0;

function handleMouseDown(e) {
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
	draggingImage = true;
}
function handleTouchStart(e) {
    startX = parseInt(e.changedTouches[0].clientX - offsetX);
    startY = parseInt(e.changedTouches[0].clientY - offsetY);
	draggingImage = true;
}

function handleMouseUp(e) {
	e.preventDefault();
    //Pintar la ruta y la geolocalización teniendo en cuenta la nueva posición 'x' e 'y' de la imagen
	if(draggingImage != false)
	{
		draggingImage = false;
		draw_points2(ctx);
	}
}
function handleTouchEnd(e) {
	e.preventDefault();
    //Pintar la ruta y la geolocalización teniendo en cuenta la nueva posición 'x' e 'y' de la imagen
	if(draggingImage != false)
	{
		draggingImage = false;
		draw_points2(ctx);
	}
}
function handleMouseOut(e) {
    handleMouseUp(e);
}
  
function handleMouseMove(e) {
	if(draggingImage) {
	
        imageClick = false;

		mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);

         // mover la imagen con la cantidad del ultimo drag
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        imageX -= dx*2;
        imageY += dy*2;
        // reset startXY para la siguiente vez
        startX = mouseX;       
		startY = mouseY;
		
		
		if(imageX > 0)
			imageX=0;
		if(imageY > 0)
			imageY=0;
			
		if(imageX < -(img_global.height-$("#mapa_canvas").width()))
			imageX= -(img_global.height-$("#mapa_canvas").width());		
			
		if(imageY < -(img_global.width-$("#mapa_canvas").height()))
			imageY= -(img_global.width-$("#mapa_canvas").height());		

        // repintamos
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		ctx.drawImage(img_global, 0, 0, img_global.width, img_global.height, imageY, imageX, img_global.width, img_global.height);

    }

}
function handleTouchMove(e) {
  
  e.preventDefault();
  
	if(draggingImage) {
	
        imageClick = false;

		mouseX = parseInt(e.changedTouches[0].clientX - offsetX);
        mouseY = parseInt(e.changedTouches[0].clientY - offsetY);

        // mover la imagen con la cantidad del ultimo drag
        var dx = mouseX - startX;
        var dy = mouseY - startY;
        imageX -= dx;
        imageY += dy;
        // reset startXY para la siguiente vez
        startX = mouseX;       
		startY = mouseY;
		
		
		if(imageX > 0)
			imageX=0;
		if(imageY > 0)
			imageY=0;
			
		if(imageX < -(img_global.height-$("#mapa_canvas").width()))
			imageX= -(img_global.height-$("#mapa_canvas").width());		
			
		if(imageY < -(img_global.width-$("#mapa_canvas").height()))
			imageY= -(img_global.width-$("#mapa_canvas").height());		

        // repintamos
		ctx.clearRect(0, 0, canvas.height, canvas.width);
		ctx.drawImage(img_global, 0, 0, img_global.width, img_global.height, imageY, imageX, img_global.width, img_global.height);
    }

}

function draw_canvas(container, src_image, src_gpx, id, canvas_number) 
{	
	
	$("#"+container).append('<div id="mapa_canvas" style="overflow:hidden; width=100%; opacity:1" ></div>');
	
		width=$(window).width(); 
		height=$(window).height();
		
		if(canvas_number==1)
		{
			var img = new Image();
			img.src = src_image;
			img.onload = function(){
			
				img_global=img;
				
				$("#mapa_canvas").css("width",width);
				$("#mapa_canvas").css("height",height);
				$("#mapa_canvas").append('<canvas id="canvas" width="'+width+'" height="'+height+'" style="position:relative;top:0;margin:auto;display:block;" ></canvas>');
				
				//Proporcional a la imagen que cargamos
								
				var ratio = Math.min(width/img.height, height/img.width);
					
				$("#canvas").width(img.height*ratio);
				$("#canvas").height(img.width*ratio);	

				$("#mapa_canvas").css("height",img.width*ratio);
				
				var canvas = document.getElementById("canvas");			
				
				$.get(src_gpx, function(xml) { 
				}).done(function(xml_Doc) {
				
					coord_image=coord_image_ppal;
				
					var altura=(coord_image[0][1]-coord_image[1][1]);
					var anchura=(coord_image[0][2]-coord_image[2][2]);
					
					var k=0;
					$(xml_Doc).find("trkpt").each(function() {
						var lat=$(this).attr("lat");
						var lon=$(this).attr("lon");
						
						array_coord_image_ppal[k]=lat+","+lon;
						k++;
						
					});
					
					k=0;
					array_coord_image_ppal.forEach(function(latlon) {
					
						var latlon_split=latlon.split(",");
						lat=latlon_split[0];
						lon=latlon_split[1];
					
						var lat_canvas=parseFloat(((coord_image[0][1]-lat)*width)/altura);
						var lon_canvas=parseFloat(((coord_image[0][2]-lon)*height)/anchura);
	
						lat_canvas=lat_canvas.toFixed(3);
						lon_canvas=lon_canvas.toFixed(3);
						
						array_coord_image[k]=lat_canvas+","+lon_canvas;
						k++;
					});
	
					
					var img = new Image();
					img.src = src_image;
					img.onload = function(){
					
						var contexto = canvas.getContext("2d");
						
						contexto.lineWidth = 2;
						contexto.fillStyle = "orange";		
						contexto.strokeStyle = "orange";		
						contexto.font = '12px "Tahoma"';	
						
						contexto.save();
						// Translate 
						contexto.translate(width, 0);
						// Rotate it
						contexto.rotate(90*Math.PI/180);
						//contexto.restore();		
						
						contexto.drawImage(img, 0, 0, height, width);
	
						draw_points(contexto);
					
					}
					
				}).fail(function(){
					$("#"+container).append("<p>No se pudo cargar la ruta.</p>");
				});
			}
			
		}
		if(canvas_number==2)
		{
			var img = new Image();
			img.src = src_image;
			img.onload = function(){
			
				img_global=img;
				
				$("#mapa_canvas").css("width",width);
				$("#mapa_canvas").css("height",height);
				
				$("#mapa_canvas").append('<canvas id="canvas" width="'+img.height+'" height="'+img.width+'" style="position:relative;top:0;margin:auto;display:block;" ></canvas>');
				
				$("#canvas").width(img.height);
				$("#canvas").height(img.width);			
				
				//$("#canvas").draggable();
				
				canvasOffset = $("#canvas").offset();
				offsetX = canvasOffset.left;
				offsetY = canvasOffset.top;
				
				$("#canvas").mousedown(function (e) {
					handleMouseDown(e);
				});
				$("#canvas").mousemove(function (e) {
					handleMouseMove(e);
				});
				$("#canvas").mouseup(function (e) {
					handleMouseUp(e);
				});
				$("#canvas").mouseout(function (e) {
					handleMouseOut(e);
				});
				
				var canvas = document.getElementById("canvas");			
				
				canvas.addEventListener("touchstart", handleTouchStart);
				canvas.addEventListener("touchmove", handleTouchMove);
				canvas.addEventListener("touchend", handleTouchEnd);
				
				$.get(src_gpx, function(xml) { 
				}).done(function(xml_Doc) {
				
					coord_image=coord_image_ppal;
				
					var altura=(coord_image[0][1]-coord_image[1][1]);
					var anchura=(coord_image[0][2]-coord_image[2][2]);
					
					var k=0;
					$(xml_Doc).find("trkpt").each(function() {
						var lat=$(this).attr("lat");
						var lon=$(this).attr("lon");
						
						array_coord_image_ppal[k]=lat+","+lon;
						k++;
						
					});
					
					k=0;
					array_coord_image_ppal.forEach(function(latlon) {
					
						var latlon_split=latlon.split(",");
						lat=latlon_split[0];
						lon=latlon_split[1];
					
						var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img.height)/altura);
						var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img.width)/anchura);

						lat_canvas=lat_canvas.toFixed(3);
						lon_canvas=lon_canvas.toFixed(3);
						
						array_coord_image[k]=lat_canvas+","+lon_canvas;
						k++;
					});

					{
						var contexto = canvas.getContext("2d");
						ctx=contexto;
						
						contexto.lineWidth = 2;
						contexto.fillStyle = "orange";		
						contexto.strokeStyle = "orange";		
						contexto.font = '12px "Tahoma"';	
						
						contexto.save();
						
						contexto.scale(zoom, zoom);
						
						// Translate 
						contexto.translate(width, 0);
						// Rotate it
						contexto.rotate(90*Math.PI/180);
						//contexto.restore();		
						
						contexto.drawImage(img, 0, 0, img.width, img.height);

						draw_points(contexto);
						
					}
								
				}).fail(function(){
					$("#"+container).append("<p>No se pudo cargar la ruta.</p>");
				});
			}
			
		}
}

function draw_points(contexto)
{
	for(i=0;i<array_coord_image.length;i++)
	{
		var array_points=array_coord_image[i].split(",");
		var lat_canvas=array_points[0];
		var lon_canvas=array_points[1];

		contexto.lineTo(lon_canvas,lat_canvas);								
		contexto.stroke();
		
		contexto.beginPath();
		contexto.arc(lon_canvas,lat_canvas, 2, 0, 2 * Math.PI, true);
		contexto.fill();
		contexto.closePath();
	
		//contexto.fillText(i,lon_canvas,lat_canvas);
	}
	
	show_geoloc();
}

function draw_points2(contexto)
{
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
					
	k=0;
	array_coord_image_ppal.forEach(function(latlon) {
	
		var latlon_split=latlon.split(",");
		lat=latlon_split[0];
		lon=latlon_split[1];
	
		var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img_global.height)/altura)+imageX;
		var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img_global.width)/anchura)+imageY;

		lat_canvas=lat_canvas.toFixed(3);
		lon_canvas=lon_canvas.toFixed(3);
		
		array_coord_image[k]=lat_canvas+","+lon_canvas;
		k++;
	});
	
	contexto.fillStyle = "orange";		
	contexto.strokeStyle = "orange";		

	for(i=0;i<array_coord_image.length;i++)
	{
		var array_points=array_coord_image[i].split(",");
		var lat_canvas=array_points[0];
		var lon_canvas=array_points[1];

		//contexto.lineTo(lon_canvas,lat_canvas);				
		//contexto.stroke();
		
		contexto.beginPath();			
		contexto.arc(lon_canvas,lat_canvas, 3, 0, 2 * Math.PI, true);			
		contexto.fill();
		contexto.closePath();
			
		//contexto.fillText(i,lon_canvas,lat_canvas);
	}
	
	show_geoloc(true);
}


function show_geoloc(redraw)
{
	if (navigator.geolocation)
	{
		//navigator.geolocation.watchPosition(draw_geoloc, error_geoloc_02, options);
		
		options = {
		  enableHighAccuracy: true,
		  timeout: 15000,
		  maximumAge: 30000
		};
		
		$("#cargando").show('fade', function() {
			if(redraw)
				navigator.geolocation.getCurrentPosition(draw_geoloc_02,error_geoloc_02,options);
			else
				navigator.geolocation.getCurrentPosition(draw_geoloc,error_geoloc_02,options);
			
		});
	}
	else
	{	
		$("#datos_geo_position").html("<p class='data_route'>"+TEXTOS[44]+"</p>");	
		$("#cargando").hide();
	}
}

function draw_geoloc(position)
{
	var lat = position.coords.latitude;
  	var lon = position.coords.longitude;
	
	//var lat=40.455;
	//var lon=-4.465;

	var canvas = document.getElementById("canvas");						
	var contexto = canvas.getContext("2d");
	contexto.fillStyle = "#BE0000";		
	contexto.strokeStyle = "#BE0000";		
	contexto.font = '12px "Tahoma"';		

	var width=canvas.width;
	var height=canvas.height;
							
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
	
	var lat_canvas=parseFloat(((coord_image[0][1]-lat)*width)/altura);
	var lon_canvas=parseFloat(((coord_image[0][2]-lon)*height)/anchura);
								
	lat_canvas=Math.round(lat_canvas * 100)/100;
	lon_canvas=Math.round(lon_canvas * 100)/100;
	

	contexto.beginPath();
	contexto.arc(lon_canvas,lat_canvas, 6, 0, 2 * Math.PI, true);
	contexto.fill();
	contexto.closePath();
	
	$("#cargando").hide();
	
	$("#datos_geo_position").html("<div class='data_route'>"+
									  "<h3>"+TEXTOS[45]+"</h3>"+
									  "<p><b>"+TEXTOS[46]+"</b></p>"+
									  "<b>"+TEXTOS[47]+": </b>:" +lat+"<br>"+
									  "<b>"+TEXTOS[48]+": </b>: "+lon+"<br>"+
								  "</div><br>");
								  
	if(lat>=coord_image[0][1] || lat<=coord_image[1][1] || lon<=coord_image[0][2] || lon>=coord_image[2][2])
	{
		$("#datos_geo_position").html("<div class='data_route'>"+
										  "<h3>"+TEXTOS[45]+"</h3>"+
										  "<p>"+TEXTOS[49]+"</p>"+
										  "<b>"+TEXTOS[47]+": </b>:" +lat+"<br>"+
										  "<b>"+TEXTOS[48]+": </b>: "+lon+"<br>"+
									  "</div><br>");
	}
		
}
function draw_geoloc_02(position)
{
	var lat = position.coords.latitude;
  	var lon = position.coords.longitude;
	
	//var lat=40.455;
	//var lon=-4.465;

	var canvas = document.getElementById("canvas");						
	var contexto = canvas.getContext("2d");
	contexto.fillStyle = "#BE0000";		
	contexto.strokeStyle = "#BE0000";		
	contexto.font = '12px "Tahoma"';		

	var width=canvas.width;
	var height=canvas.height;
							
	var altura=(coord_image[0][1]-coord_image[1][1]);
	var anchura=(coord_image[0][2]-coord_image[2][2]);
							
	var lat_canvas=parseFloat(((coord_image[0][1]-lat)*img_global.height)/altura)+imageX;
	var lon_canvas=parseFloat(((coord_image[0][2]-lon)*img_global.width)/anchura)+imageY;
								
	lat_canvas=Math.round(lat_canvas * 100)/100;
	lon_canvas=Math.round(lon_canvas * 100)/100;
	
	contexto.beginPath();
	contexto.arc(lon_canvas,lat_canvas, 6, 0, 2 * Math.PI, true);
	contexto.fill();
	contexto.closePath();
	
	$("#cargando").hide();
		
}
function error_geoloc_02(error)
{
	if(error.code == 1) {
		$("#datos_geo_position").html("<p class='data_route'>La geolocalizaci&oacute;n ha fallado. Acceso denegado.</p>");	
	} 
	else if( error.code == 2) {
		$("#datos_geo_position").html("<p class='data_route'>La geolocalizaci&oacute;n ha fallado. Posición no disponible.</p>");	
	}
	else {
		$("#datos_geo_position").html("<p class='data_route'>La geolocalizaci&oacute;n ha fallado.</p>");	
	}
	$("#cargando").hide();
}
/***FIN CANVAS RUTAS SENDERISMO***/

function show_localstorage_data(type, container, params) {

	if(params)
	{
		for(var i=0;i<params.length;i++)
		{
			if(params[i][0]=="id")
			{
				var id=params[i][1];
			}
		}
	}
	
	switch(type)
	{
		case "cat_list": 			
					var cadena="";
					
					if(getLocalStorage("categ_list")==null || typeof JSON.parse(getLocalStorage("categ_list"))=="undefined")					
					{
						$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
					}					
					else
					{
						cadena+="<h3>"+TEXTOS[40]+"</h3>";
						cadena+='<select id="my_location_select" class="ov_select_01" onchange="go_to_page(\'my_location\',$(\'#my_location_select\').val());">';
						cadena+='<option value="">'+TEXTOS[39]+'</option>';
						
						$.each(JSON.parse(getLocalStorage("categ_list")), function(index, data) {
						
							$.each(data, function(i, d) {			

								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=d.es;	
												break;
												
									case "en":  var informacion=d.en;	
												break;
								}
								
								if(id==index)
									cadena+='<option value="'+index+'" selected>'+informacion+'</option>';		
								else			
									cadena+='<option value="'+index+'">'+informacion+'</option>';
								
							});
						});
						
						cadena+='</select>';
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
					}				
					break;
		
		case "cat_services_list": 			
					var cadena="";
					
					if(typeof JSON.parse(getLocalStorage("cat_serv_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
					}					
					else
					{
						cadena+="<h3>"+TEXTOS[40]+"</h3>";
						cadena+='<select id="my_location_select" class="ov_select_01" onchange="go_to_page(\'my_location\',$(\'#my_location_select\').val());">';
						cadena+='<option value="">'+TEXTOS[39]+'</option>';
						
						cadena+='<optgroup label="'+TEXTOS[51]+'">'+TEXTOS[51];
						$.each(JSON.parse(getLocalStorage("categ_list")), function(index, data) {
						
							$.each(data, function(i, d) {			

								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=d.es;	
												break;
												
									case "en":  var informacion=d.en;	
												break;
								}
								
								if(id==index)
									cadena+='<option value="'+index+'" selected>'+informacion+'</option>';		
								else			
									cadena+='<option value="'+index+'">'+informacion+'</option>';
								
							});
						});
						cadena+='</optgroup>';
						
						cadena+='<optgroup label="'+TEXTOS[52]+'">'+TEXTOS[52];
						$.each(JSON.parse(getLocalStorage("cat_serv_list")), function(index, data) {
						
							$.each(data, function(i, d) {			

								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=d.es;	
												break;
												
									case "en":  var informacion=d.en;	
												break;
								}
								
								if(id==index)
									cadena+='<option value="'+index+'" selected>'+informacion+'</option>';		
								else			
									cadena+='<option value="'+index+'">'+informacion+'</option>';
								
							});
						});
						cadena+='</optgroup>';
						
						cadena+='</select>';
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';						
						
						cadena+='<h4>'+TEXTOS[54]+'</h4>';
						cadena+='<p class="legend"><img src="../../styles/images/icons/my_point_interest.png"> '+TEXTOS[51]+'<br>';
						cadena+='<img src="../../styles/images/icons/my_point_services.png"> '+TEXTOS[52]+'<br>';
						cadena+='<img src="../../styles/images/icons/cluster_point.png"> '+TEXTOS[53]+'</p>';
						cadena+='<div class="ov_vertical_space_01">&nbsp;</div>';	
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
					}
					
					break;		
		
		case "filter_map_list": 			
					var cadena="";
					
					if(typeof JSON.parse(getLocalStorage("cat_serv_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
					}					
					else
					{
						cadena+="<h3>"+TEXTOS[40]+"</h3>";
						cadena+='<select id="my_location_select" class="ov_select_01" onchange="go_to_page(\'my_location\',$(\'#my_location_select\').val());">';
						cadena+='<option value="">'+TEXTOS[39]+'</option>';
						
						$.each(JSON.parse(getLocalStorage("cat_serv_list")), function(index, data) {
						
							$.each(data, function(i, d) {			

								switch(getLocalStorage("current_language"))
								{
									default:
									case "es":  var informacion=d.es;	
												break;
												
									case "en":  var informacion=d.en;	
												break;
								}
								
								if(id==index)
									cadena+='<option value="'+index+'" selected>'+informacion+'</option>';		
								else			
									cadena+='<option value="'+index+'">'+informacion+'</option>';
								
							});
						});
						
						cadena+='</select>';
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
					}
					
					break;		
							
					
		case "fav_list": 			
					var cadena="";
					
					if(getLocalStorage("fav_list")==null || typeof JSON.parse(getLocalStorage("fav_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
					}					
					else
					{
						var contador=0;
						$.each(JSON.parse(getLocalStorage("fav_list")), function(index, data) {
						
							$.each(data, function(i, d) {

								cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
						
								cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+d.id+'\'" >';
									
									switch(getLocalStorage("current_language"))
									{
										default:
										case "es":  var informacion=d.es;	
													break;
													
										case "en":  var informacion=d.en;	
													break;
									}
							
									cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion+'</div></div>';
								
								cadena+='</div>';
							});
							contador++;
						});
											
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
						
						if(contador<=0)
						{
							$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
						}	
					}
									
					break;
					
		case "filter_fav_list": 			
					var cadena="";
					
					if(getLocalStorage("fav_list")==null || typeof JSON.parse(getLocalStorage("fav_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[9]+"</p>");
					}					
					else
					{
						var entrada=false;
						$.each(JSON.parse(getLocalStorage("fav_list")), function(index, data) {
						
							$.each(data, function(i, d) {
								
								$.each(d.categoria, function(i, cat) {
									if(cat.id== id) 
									{							
										cadena+='<div id="ov_box_13_1_f" class="ov_box_13" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
						
										cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+d.id+'\'" >';
											
											switch(getLocalStorage("current_language"))
											{
												default:
												case "es":  var informacion=d.es;	
															break;
															
												case "en":  var informacion=d.en;	
															break;
											}
									
											cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion+'</div></div>';
										
										cadena+='</div>';
										
										entrada=true;
									}
								});

							});
						});
						
						if(!entrada)
						{
							cadena+='<div class="ov_zone_15"><p>'+TEXTOS[0]+'</p></div>';
						}
						
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
					}				
					break;
					
		case "my_routes": 			
					var cadena="";

					if(getLocalStorage("routes_list")==null || typeof JSON.parse(getLocalStorage("routes_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[35]+"<br>"+TEXTOS[55]+"</p><div class='ov_button_03' style='font-size:1.2em' onclick='go_to_page(\"points_list\");' >"+TEXTOS[56]+"</div>");
					}					
					else
					{
						routes_list=JSON.parse(getLocalStorage("routes_list"));						
						//Mostramos las rutas creadas por el usuario
						var indice=0;
						$.each(routes_list, function(index, rutas) 
						{   
							cadena+='<div >';
							
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" onclick="go_to_page(\'route\',\''+index+'\');" >';
							cadena+='<img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14" /></div>';
										
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14_a" onclick="go_to_page(\'route\',\''+index+'\');">';
							cadena+='<div id="ov_text_24_1_f" class="ov_text_24" onclick="$(\'#'+indice+'_puntos\').toggle();">'+index+'</div></div>';
							cadena+='<div class="ov_box_14_b" onclick="remove_route(\''+index+'\');"><img src="../../styles/images/icons/delete.png" /></div>';	
							
							cadena+='<div class="ov_clear_floats_01"> </div>';
							
							cadena+='</div>';

							indice++;
							
						});		

						cadena+='<div class="ov_clear_floats_01"> </div>';
						$("#"+container).html(cadena);
					}			
					
					break;
			
			case "routes": 			
					var cadena="";
					
					if(getLocalStorage("routes_list")==null || typeof JSON.parse(getLocalStorage("routes_list"))=="undefined")
					{
						$("#"+container).html("<p>"+TEXTOS[35]+"</p>");
					}					
					else
					{
						routes_list=JSON.parse(getLocalStorage("routes_list"));
						//Mostramos las rutas creadas por el usuario
						$.each(routes_list, function(index, rutas) {   
		
							cadena+='<div onclick="add_point_to_route(identificador, \''+index+'\', \'points\', \'ov_zone_21_createroute\', 1);" >';
							
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13" >+</div>';
									
							cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+index+'</div></div>';		

							cadena+='</div>';
								
						});					
					
						cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
						
						$("#"+container).html(cadena);
					}
					
					break;
					
					
			case "route": 			
					var cadena="";
					var points=new Array();
					var wpoints=new Array();
					
					var id_route = decodeURI(identificador);
					
					routes_list=JSON.parse(getLocalStorage("routes_list"));
					var my_route=routes_list[id_route];		
					var geo_lat;
					var geo_lon;
					
					//Recogemos los puntos de la ruta
					var i=0; 
					var locate_ini, locate_fin;
					var fin=Object.keys(my_route[0].items).length-1;

					$("#"+container).html("<div class='ov_zone_15'><h3>"+id_route+"</h3></div>");
					
					cadena+='<table class="table_routes">';
					
					$.each(my_route[0].items, function(index, punt) { 
						var puntos=punt[0];
						
						var geolocalizacion=(puntos.geolocalizacion).split(/[(,)]/);
						geo_lat=geolocalizacion[1];
						geo_lon=geolocalizacion[2];
						var my_zoom=parseInt(geolocalizacion[3]);
	
						if(i==0)
							locate_ini=new google.maps.LatLng(geo_lat, geo_lon);
						else if(i==fin)
							locate_fin=new google.maps.LatLng(geo_lat, geo_lon);
						else
						{		
							wpoints.push(
								{
									location: new google.maps.LatLng(geo_lat,geo_lon), 
									stopover: true
								}
							);
						}
						
						points.push(
							{
								latLng: [geo_lat,geo_lon], 
								data: '<a href="points.html?id='+puntos.id+'">'+puntos.es+'</a>'
							}
						);						
	
						cadena+='<tr><td><a href="points.html?id='+puntos.id+'">'+puntos.es+'</a></td>';
						cadena+='<td onclick="remove_point_route(\''+identificador+'\', \''+puntos.id+'\');"><img src="../../styles/images/icons/delete.png" /></td>';
						cadena+='</tr>';	
								
						i++;
						
					});
					
					cadena+='<tr><td><a href="points_list.html">'+TEXTOS[57]+'</a></td>';
					cadena+='<td onclick="go_to_page(\'points_list\');"><img src="../../styles/images/icons/plus.png" /></td>';
					cadena+='</tr>';	
					
					cadena+='</table>';

					var container1="ov_points";
					var container2="ov_gmap";

					$("#"+container).append("<div id='"+container1+"' class='ov_zone_21_b'> </div>");
					$("#"+container).append("<div id='"+container2+"_route' class='ov_zone_21'>");
					$("#"+container).append("<div id='"+container2+"' class='location_map_01'> </div>");
					$("#"+container).append("</div>");

					setTimeout(function() {
							
						$("#"+container2).gmap3({ 
							  map:
							  {
								  options:{
									zoom: 10,  
									center: locate_ini,
								  }
							  },
							  marker:
							  {
									values: points,
									cluster:{
											radius: 25,
											0: {
												content: "<div class='cluster cluster-1'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  },
											10: {
												content: "<div class='cluster cluster-2'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  },
											25: {
												content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
												width: 40,
												height: 55
											  }
									},
									options:{
										icon: "../../styles/images/icons/my_point.png"
									},
									events:{
											  click: function(marker, event, context){
												var map = $(this).gmap3("get"),
												  infowindow = $(this).gmap3({get:{name:"infowindow"}});
												if (infowindow){
												  infowindow.open(map, marker);
												  infowindow.setContent(context.data);
												} else {
												  $(this).gmap3({
													infowindow:{
													  anchor:marker, 
													  options:{content: context.data}
													}
												  });
												}
											  }
											}
							  },
							  getroute:
							  {
									options:
									{
										origin:locate_ini,
										waypoints: wpoints,
										destination:locate_fin,
										optimizeWaypoints: true,
										travelMode: google.maps.DirectionsTravelMode.DRIVING
									},
									callback: function(results)
											  {
												  if (!results) return;
												  $(this).gmap3({
														map:{
														  options:{
															zoom: 10,  
															center: locate_ini,
														  }
														},
														directionsrenderer:{
														  options:{
															 directions:results,
															 preserveViewport: false,
															 markerOptions: {
																visible: false,
																clickable: false
															}
														  } 
														}
												  });
											  }
							  }
						});
						
						$("#"+container1).html(cadena);
						
					}, 500);
									
					break;
	}
}

function ajax_recover_extern_data(operation, container, params) {

	$.ajax({
		  url: api_url,
		  data: { o: operation, p:params },
		  type: 'POST',
		  dataType: 'json',
		  crossDomain: true, 
		  success: f_e_success,
		  error: f_e_error,
		  async:false,
	});
		
	if(params)
	{
		for(var i=0;i<params.length;i++)
		{
			if(params[i][0]=="id")
			{
				var filter_id=params[i][1];
			}
		}
	}

	function f_e_success(data) {
	
		if(data.length==0) {
			
			$("#"+container).html("<div id='ov_zone_15' class='ov_zone_15'><br>"+TEXTOS[7]+"</div>");
			return;
		}
		
		switch(operation)
		{
			case "blog": 			
							break;
					
			case "events": 		
							var cadena='';
							
							cadena+='<div id="ov_zone_15" class="ov_zone_15_b">';
							
							$.each(data.result, function(i,d) {
								cadena+='<div class="ov_box_09_10_a" onclick="window.location.href=\'event.html?id='+d.id_evento+'\'" >'
											+'<div class="ov_text_14">'
											+d.titulo+'<br><span style="color:#333">'+d.fecha_ini+''+d.fecha_fin+'</span>'
											+'</div>'
										+'</div>';
										
								if(d.descripcion!="" && d.descripcion!="&nbsp;")
								{
									cadena+='<div class="ov_box_07_08_a">'
												+'<div class="ov_text_15">'
												+d.descripcion
												+'</div>'
											+'</div>';
								}
							});
							
							/*cadena+='<div id="ov_scroller_01_guide" class="ov_scroller_01_guide">&nbsp;</div>'
									+'<div id="ov_scroller_01" class="ov_scroller_01">'
										+'<img src="../../styles/images/icons/up_arrow.png" alt="up" class="ov_image_10"/>'
										+'<div class="ov_vertical_space_02">&nbsp;</div>'
										+'<img src="../../styles/images/icons/down_arrow.png" alt="down" class="ov_image_10"/>'
									+'</div>';*/
									
							/*var indice=0;
							$.each(data.result, function(i,d) {
								//onclick="window.open('+d.url+', \'_system\', \'location=yes\');"
								if(indice%2)
								{
									
									/*cadena+='<div class="ov_box_09" onclick="window.location.href=\'event.html?id='+d.id_evento+'\'" >'
												+'<div id="ov_text_14_1" class="ov_text_14">'
												+d.titulo+'<br><span style="color:#C0615F">'+d.fecha_ini+''+d.fecha_fin+'</span>'
												+'</div>'
											+'</div>';
											
									cadena+='<div class="ov_box_10">'
												+'<div id="ov_text_15_1" class="ov_text_15">'
												+d.descripcion
												+'</div>'
											+'</div>';*/
											
									
									
									/*cadena+='<div class="ov_box_09_10_a" onclick="window.location.href=\'event.html?id='+d.id_evento+'\'" >'
												+'<div class="ov_text_14_a">'
												+d.titulo+'<br><span style="color:#333">'+d.fecha_ini+''+d.fecha_fin+'</span>'
												+'</div>'
											+'</div>';
											
									if(d.descripcion!="" && d.descripcion!="&nbsp;")
									{
										cadena+='<div class="ov_box_09_10_b">'
													+'<div class="ov_text_15_a">'
													+d.descripcion
													+'</div>'
												+'</div>';
									}
											
								}
								else
								{
									
									/*cadena+='<div class="ov_box_07_a" onclick="window.location.href=\'event.html?id='+d.id_evento+'\'" >'
											+'<div class="ov_text_12">'
											+d.titulo+'<br><span style="color:#333">'+d.fecha_ini+''+d.fecha_fin+'</span>'
											+'</div>'
										+'</div>'
									cadena+='<div class="ov_box_08_a">'
											+'<div class="ov_text_13">'
											+d.descripcion
											+'</div>'
										+'</div>';*/
									
									
									/*cadena+='<div class="ov_box_07_08_a" onclick="window.location.href=\'event.html?id='+d.id_evento+'\'" >'
												+'<div class="ov_text_12_a">'
												+d.titulo+'<br><span style="color:#333">'+d.fecha_ini+''+d.fecha_fin+'</span>'
												+'</div>'
											+'</div>';
									
									if(d.descripcion!="" && d.descripcion!="&nbsp;")
									{									
										cadena+='<div class="ov_box_07_08_b">'
													+'<div class="ov_text_13_a">'
													+d.descripcion
													+'</div>'
												+'</div>';
									}
									
								}
								
								indice++;
								
							});*/
							cadena+='</div>';
							
							$("#"+container).html(cadena);			

							//$("#ov_scroller_01_guide").css("height",$("#ov_zone_15").height()-$("#ov_scroller_01").height());

							function ov_manage_scroll_01(event,ui)
							{				
								//$("#ov_scroller_01_guide").css("height",$("#ov_zone_15").height()-$("#ov_scroller_01").height());
								
								var actual_top=ui.position.top;
								var new_position=-1*parseInt(actual_top/1.5);

								$("#ov_zone_15").css("top",new_position+"px");
								
							}
	
							$( "#ov_scroller_01" ).draggable({ axis: "y", containment: "parent", drag: function(event,ui){ov_manage_scroll_01(event,ui);},revert: false });

							break;	
					
			case "event": 		
							var cadena='';
									
							var d=data.result;
							
							//onclick="window.open('+d.url+', \'_system\', \'location=yes\');"
							cadena+='<div class="" onclick="window.open('+data.url_web+', \'_system\', \'location=yes\');" >'
										+'<div class="ov_text_08">'
										+d.titulo+'<br><span class="ov_text_32">'+d.fecha_ini+''+d.fecha_fin+'</span>'
										+'</div>'
									+'</div>';
									
							cadena+='<div class="ov_box_22">'
										+'<div class="ov_text_09">'
										+d.descripcion
										+'</div>'
									+'</div>';		

							cadena+='<div class="ov_clear_floats_01"> </div>';

							$("#"+container).html(cadena);
							
							break;	
							
			case "moreinfo": 		
							var cadena='';
							
							cadena+=TEXTOS[7];
									
							/*var d=data.result;
							
							cadena+='<div class="" onclick="window.open('+data.url_web+', \'_system\', \'location=yes\');" >'
										+'<div class="ov_text_08">'
										+d.titulo+'<br><span class="ov_text_32">'+d.fecha_ini+''+d.fecha_fin+'</span>'
										+'</div>'
									+'</div>';
									
							cadena+='<div class="ov_box_22">'
										+'<div class="ov_text_09">'
										+d.descripcion
										+'</div>'
									+'</div>';		

							cadena+='<div class="ov_clear_floats_01"> </div>';*/

							$("#"+container).html(cadena);
							
							break;	
							
			case "video": 		
							var cadena='';		
							
							cadena=data.result;							

							$("#"+container).html(cadena);
							
							break;				
									
					
		}
		
		$("a").on("click", function(e) {
			var url = $(this).attr('href');
			var containsHttp = new RegExp('http\\b'); 
			var containsHttps = new RegExp('https\\b'); 

			if(containsHttp.test(url)) { 
				e.preventDefault(); 
				window.open(url, "_system", "location=yes"); // For iOS
				//navigator.app.loadUrl(url, {openExternal: true}); //For Android
			}
			else if(containsHttps.test(url)) { 
				e.preventDefault(); 
				window.open(url, "_system", "location=yes"); // For iOS
				//navigator.app.loadUrl(url, {openExternal: true}); //For Android
			}
		});	
	
	}
	function f_e_error(jqXHR, textStatus, errorThrown) {
		//alert('Error: "+textStatus+"  "+errorThrown);	
		
		$("#"+container).html("<div id='ov_zone_15' class='ov_zone_15'><br>"+TEXTOS[10]+"</div>");
	}
	
}


function add_fav_to_list(id,click_div,text_div) 
{
	$.getJSON(local_url+'points/'+id+'.json', function (data) {
	
		d=data.result;
		
		/*Recoger idiomas
		var langs=new Array();
		$.each(lang_available, function(i,lang) {
			langs.push(lang[0]);
		});*/
		
		fav_list=JSON.parse(getLocalStorage("fav_list"));
		
		if(fav_list==null)
			fav_list=new Object();
	
		fav_list[id]=new Array();
		fav_list[id].push(
			{
				id:id,
				es:d.es.nombre,
				en:d.en.nombre,
				categoria:d.categoria,
				municipio:d.municipio,
				geolocalizacion: d.geolocalizacion
			}
		);		
		
		$('#'+text_div).html('no fav');
		$('#'+click_div).attr("onclick","remove_fav_to_list('"+id+"','"+click_div+"','"+text_div+"')");

		setLocalStorage("fav_list", JSON.stringify(fav_list));
	
	});
				
}

function remove_fav_to_list(id,click_div,text_div)
{
	fav_list=JSON.parse(getLocalStorage("fav_list"));

	delete fav_list[id];
	
	$('#'+text_div).html('fav');
	$('#'+click_div).attr("onclick","add_fav_to_list('"+id+"','"+click_div+"','"+text_div+"')");

	setLocalStorage("fav_list", JSON.stringify(fav_list));

}

function add_point_to_route(id, name, folder, container, overwrite) 
{
	//CONTROLAR
	//MAXIMO 10 rutas
	//MAXIMO 8 puntos por ruta
	
	if(name=="")
	{
		alert(TEXTOS[11]);
		return false;
	}

	$.getJSON(local_url+folder+'/'+id+'.json', function (data) {
	
		d=data.result;
		
		name=$.trim(name);
		
		/*Recoger idiomas
		var langs=new Array();
		$.each(lang_available, function(i,lang) {
			langs.push(lang[0]);
		});*/
		
		routes_list=JSON.parse(getLocalStorage("routes_list"));
		
		if(routes_list==null)
			routes_list=new Object();
						
		if(Object.keys(routes_list).length>=MAX_NUMBER_ROUTES)
		{
			alert(TEXTOS[12]+" "+MAX_NUMBER_ROUTES+" "+TEXTOS[13]);
			return false;
		}
			
		if(overwrite==0 && routes_list[name]!=null)
		{
			alert(TEXTOS[14]);
			return false;
		}
		if(overwrite==0)
		{
			routes_list[name]=new Array();
			var items_list=new Object();	
			items_list[d.id]=new Array();
			items_list[d.id].push(
						{
							id:d.id,
							es:d.es.nombre,
							en:d.en.nombre,
							geolocalizacion: d.geolocalizacion
						}
					);	
			routes_list[name].push({id:name,items:items_list});
		}
		if(overwrite==1)
		{
			
			var items_list=routes_list[name][0].items;	
			
			if(Object.keys(items_list).length>=MAX_NUMBER_POINTS_ROUTE)
			{
				alert(TEXTOS[15]+" "+MAX_NUMBER_POINTS_ROUTE+" "+TEXTOS[16]);
				return false;
			}
		
			items_list[d.id]=new Array();
			items_list[d.id].push(
						{
							id:d.id,
							es:d.es.nombre,
							en:d.en.nombre,
							geolocalizacion: d.geolocalizacion
						}
					);	
			routes_list[name].push({id:name,items:items_list});

		}
		setLocalStorage("routes_list", JSON.stringify(routes_list));

		go_to_page("my_routes","mis_rutas");
	
	});
				
}

function remove_point_route(id, name)
{
	var respuesta=confirm(TEXTOS[33]);
	if(respuesta)
	{
		routes_list=JSON.parse(getLocalStorage("routes_list"));
		
		delete routes_list[id][0].items[name];
	
		setLocalStorage("routes_list", JSON.stringify(routes_list));
		
		window.location.reload();
	}
}

function remove_route(id)
{
	var respuesta=confirm(TEXTOS[32]);
	if(respuesta)
	{
		routes_list=JSON.parse(getLocalStorage("routes_list"));
	
		delete routes_list[id];
	
		setLocalStorage("routes_list", JSON.stringify(routes_list));
		
		window.location.reload();
	}
}

function scan_qr(){

	cordova.plugins.barcodeScanner.scan(function(result) 
		{
			if (!result.cancelled) 
			{
				/*alert("Scanned Code: " + result.text 
				+ ". Format: " + result.format
				+ ". Cancelled: " + result.cancelled);*/
				
				if((result.text).search("points.html")!=-1)
				{
					window.location.href="./"+result.text; 
					//window.location.href="./"+getLocalStorage("current_language")+result.text;
				}
				else
				{
					alert(TEXTOS[17]+":  "+result.text);
				}
			}
		}, 
		function(error){
			alert(TEXTOS[18]);
		}
	);
}

function error_geoloc(error)
{
	$("#geoloc_map_text").html("<p>"+TEXTOS[19]+"</p>");
}

function get_current_pos_user(data, filter_id, filter_name, container, is_mun, is_serv)
{
	DATOS=data;
	FILTRO=filter_id;
	NOMBRE_FILTRO=filter_name;
	CONTENEDOR=container;
	ES_MUNICIPIO=is_mun;
	ES_SERVICIO=is_serv;
	
	if (navigator.geolocation)
	{		
		navigator.geolocation.getCurrentPosition(return_current_points,return_all_points,{enableHighAccuracy:true, maximumAge:30000, timeout:10000});
				
		$("#"+container).append("<div class='ov_zone_15'><p>"+TEXTOS[4]+"</p></div>");
		
	}
	else
	{
		return_all_points();
	}
}

//Para obtener las coordenadas dando una direccion
function getLocation(address) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': address }, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var latitude = results[0].geometry.location.lat();
			var longitude = results[0].geometry.location.lng();
			var latlon="("+latitude+","+longitude+")";
			return latlon;
		} else {
			return false;
		}
	});
}

function return_current_points(position)
{
	//User position
	var lat1 = position.coords.latitude;
  	var lon1 = position.coords.longitude;
  	var latlong = lat1+","+lon1;
	
	var cadena="";
	
	if(typeof FILTRO=="undefined")
		q="";
	
	var q = FILTRO,
			regex = new RegExp(q, "i");
	
	cadena+="<div class='ov_zone_15'><h3>"+NOMBRE_FILTRO+"</h3><p>"+TEXTOS[42]+" "+RADIO_DESDE_USER+" "+TEXTOS[24]+"</p></div>";
	
	var near_points=new Array();
	var resultados=0;
	$.each(DATOS.result.items, function(index, d) {   

		if(ES_SERVICIO)
		{
			//Point position				
			d.geolocalizacion=getLocation(d.direccion);
			//Habría que esperar al callback de la función, mejor añadir estos datos en el fichero json de servicios
		}
		
		//Point position
		var geolocalizacion=d.geolocalizacion.split(/[(,)]/);
		var lat2=parseFloat(geolocalizacion[1]);
		var lon2=parseFloat(geolocalizacion[2]);
		
		
		//SI NO HAY FILTRO
		if(typeof q=="undefined" || q=="")
		{
			var radio=RADIO_DESDE_USER;
			var radioTierra=6371; //km

			var dLat = (lat2-lat1).toRad();
			var dLon = (lon2-lon1).toRad();

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
					Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var di = radioTierra * c;

			if(di<=radio)
				near_points.push(d);
		
		}
		else
		{
			if(!ES_MUNICIPIO)
			{
				$.each(d.categoria, function(i, cat) {
					if(cat.id.search(regex) != -1) 
					{							
							var radio=RADIO_DESDE_USER;
							var radioTierra=6371; //km
	
							var dLat = (lat2-lat1).toRad();
							var dLon = (lon2-lon1).toRad();
							
							var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
									Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
									Math.sin(dLon/2) * Math.sin(dLon/2);
							var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
							var di = radioTierra * c;
							
							if(di<=radio)
								near_points.push(d);
						
					}
				});
			}
			else
			{
				if(d.id.search(regex) != -1) 
				{							
						var radio=RADIO_DESDE_USER;
						var radioTierra=6371; //km

						var dLat = (lat2-lat1).toRad();
						var dLon = (lon2-lon1).toRad();
						
						var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
								Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
								Math.sin(dLon/2) * Math.sin(dLon/2);
						var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
						var di = radioTierra * c;
						
						if(di<=radio)
							near_points.push(d);
					
				}
			}
		}
		
		
	});
	
	resultados=near_points.length;
	
	if(!ES_MUNICIPIO)
		near_points.sort(SortByLangName);
	else
		near_points.sort(SortByName);
	
	$.each(near_points, function(i, near_d) {

			if(!ES_MUNICIPIO)
			{
				if(ES_SERVICIO)
				{
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+near_d.municipio+'&tab=services\'" >';
				}
				else
				{
					cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+near_d.id+'\'" >';
				}
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  var informacion=near_d.es.nombre;	
								break;
								
					case "en":  var informacion=near_d.en.nombre;	
								break;
				}
			}
			else
			{
				cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/filter_by_municipio.html?id='+near_d.id+'\'" >';
				var informacion=near_d.nombre;
			}

			cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+near_d.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
			
			cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion+'</div></div>';
		
			cadena+='</div>';
	});
	
	if(resultados==0)
	{
		cadena+="<p>"+TEXTOS[5]+"</p>";
	}
	
	cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
	
	$("#"+CONTENEDOR).html(cadena);
			

}
function return_all_points()
{
	var q = FILTRO,
			regex = new RegExp(q, "i");

		var cadena="";
		cadena+="<div class='ov_zone_15'><p>"+TEXTOS[3]+"<br>"+TEXTOS[1]+"</p><h3>"+NOMBRE_FILTRO+"</h3></div>";
		
		var filter_points=new Array();
		var resultados=0;
	
		$.each(DATOS.result.items, function(index, d) {   
			
			var coord=d.geolocalizacion.split(",");
			var lat1=parseFloat(coord[0]);
			var lon1=parseFloat(coord[1]);
			
			if(q=="")
			{
				if($.inArray(d, filter_points)==-1)
						filter_points.push(d);			
			}
			else
			{
				$.each(d.categoria, function(i, cat) {
					if(cat.id.search(regex) != -1) 
					{							
						if($.inArray(d, filter_points)==-1)
							filter_points.push(d);			
					}
				});
			}
			
		});

		
		resultados=filter_points.length;
		
		$.each(filter_points, function(i, fd) {
						
			cadena+='<div onclick="window.location.href=\'../'+getLocalStorage('current_language')+'/points.html?id='+fd.id+'\'" >';

				cadena+='<div id="ov_box_13_1_f" class="ov_box_13" style="background-image:url(../..'+fd.imagen+');" ><img src="../../styles/images/icons/right_arrow.png" alt="menu" class="ov_image_14"/></div>';
				
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  var informacion=fd.es;	
								break;
								
					case "en":  var informacion=fd.en;	
								break;
				}
		
				cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+informacion.nombre+'</div></div>';
			
			cadena+='</div>';
		});
		
		if(resultados==0)
		{
			cadena+="<p>"+TEXTOS[0]+"</p>";
		}
		
		cadena+='<div class="ov_clear_floats_01">&nbsp;</div>';
		
		$("#"+CONTENEDOR).html(cadena);
				
}

function show_near_geoloc(id_filtro)
{
	FILTRO=id_filtro;
	if(!FILTRO)
	{
		FILTRO="";
	}
	
	if (navigator.geolocation)
	{		
		navigator.geolocation.getCurrentPosition(draw_near_geoloc,draw_map_points,{enableHighAccuracy:true, maximumAge:30000, timeout:30000});
		
		$("#geoloc_map_text").html("<p>"+TEXTOS[4]+"</p>");
		
	}
	else
	{
		$("#geoloc_map_text").html("<p>"+TEXTOS[22]+"</p>");
	}
}
	   
/* Converts numeric degrees to radians */
Number.prototype.toRad = function() {
   return this*Math.PI/180;
}
function draw_near_geoloc(position)
{	
	//User position
	var lat1 = position.coords.latitude;
  	var lon1 = position.coords.longitude;
  	var latlong = lat1+","+lon1;
  	
  	var radio=RADIO_DESDE_USER_MAPA_LOCATION;
  	var radioTierra=6371; //km
	
	//Recoger todos los puntos de interés
	var near_points=new Array();
	var id_cat="";
	
	//Recoger todos los servicios
	var near_services=new Array();
	var id_cat_ser="";
	
	//Puntos de interés
	$.getJSON(local_url+"point_list.json", function(data) {
		
		if(typeof categ_list[FILTRO]!="undefined")
		{
			switch(getLocalStorage("current_language"))
			{
				default:
				case "es":  id_cat=categ_list[FILTRO][0].es;
							break;
									
				case "en":  id_cat=categ_list[FILTRO][0].en;
							break;
			}
		}

		$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
		
		$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
		
		var q = FILTRO,
			regex = new RegExp(q, "i");
			
		$.each(data.result.items, function(index, d) {   

			var geolocalizacion=d.geolocalizacion.split(/[(,)]/);
			var lat2=parseFloat(geolocalizacion[1]);
			var lon2=parseFloat(geolocalizacion[2]);
			
			var dLat = (lat2-lat1).toRad();
			var dLon = (lon2-lon1).toRad();
			
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
					Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var di = radioTierra * c;
			
			$.each(d.categoria, function(i, cat) {
				if(cat.id.search(regex) != -1) 
				{			
					if($.inArray(d, near_points)==-1)	
					{			
						if(di<=radio)
							near_points.push(d);
					}	
				}
			});
							
		});
		
		//Empresas
		$.getJSON(local_url+"empresas_list.json", function(data2) {
			
			if(typeof categ_list[FILTRO]!="undefined")
			{
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  id_cat=categ_list[FILTRO][0].es;
								break;
										
					case "en":  id_cat=categ_list[FILTRO][0].en;
								break;
				}
			}
	
			$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
			
			$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
			
			var q = FILTRO,
				regex = new RegExp(q, "i");
				
			$.each(data2.result.items, function(index, d) {   
	
				var geolocalizacion=d.geolocalizacion.split(/[(,)]/);
				var lat2=parseFloat(geolocalizacion[1]);
				var lon2=parseFloat(geolocalizacion[2]);
				
				var dLat = (lat2-lat1).toRad();
				var dLon = (lon2-lon1).toRad();
				
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
						Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
						Math.sin(dLon/2) * Math.sin(dLon/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var di = radioTierra * c;
				
				$.each(d.categoria, function(i, cat) {
					if(cat.id.search(regex) != -1) 
					{			
						if($.inArray(d, near_points)==-1)	
						{			
							if(di<=radio)
								near_points.push(d);
						}	
					}
				});
								
			});
			
		
			//Servicios
			$.getJSON(local_url+"services_list.json", function(data3) {
				
				if(typeof cat_services_list[FILTRO]!="undefined")
				{
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  id_cat_ser=cat_services_list[FILTRO][0].es;
									break;
											
						case "en":  id_cat_ser=cat_services_list[FILTRO][0].en;
									break;
					}
				}
	
				$("#geoloc_map_text").html("<h3>"+id_cat_ser+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
				
				$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
				
				var q = FILTRO,
					regex = new RegExp(q, "i");
					
				$.each(data3.result.items, function(index, d) {   
					
					$.each(d.categoria, function(i, cat) {
						if(cat.id.search(regex) != -1) 
						{			
							if($.inArray(d, near_services)==-1)	
							{			
								near_services.push(d);
							}	
						}
					});			
					
				});
				
				//GMAP3
				var myLocation=new google.maps.LatLng(lat1, lon1);	
				var todos_puntos=new Array();
				todos_puntos.push({latLng:myLocation,data:TEXTOS[25]});		
				
				var resultados=near_points.length+near_services.length;
				var enlace_punto="";
				$.each(near_points, function(i, near_d) {
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  var informacion=near_d.es;	
										break;
										
							case "en":  var informacion=near_d.en;	
										break;
						}
						
						if((near_d.id).indexOf("EMPR")!=-1)
						{
							enlace_punto="<p><img src='../../styles/images/icons/nearest.png' alt='interes' style='vertical-align: middle;margin: 2px;' /> <a href='empresa.html?id="+near_d.id+"' >"+informacion.nombre+"</a></p>";
						}
						else
						{
							enlace_punto="<p><img src='../../styles/images/icons/nearest.png' alt='interes' style='vertical-align: middle;margin: 2px;' /> <a href='points.html?id="+near_d.id+"' >"+informacion.nombre+"</a></p>";
						}
							
					var coord=near_d.geolocalizacion.split(/[(,)]/);
					var lat=coord[1];
					var lon=coord[2]; 			
					todos_puntos.push(
						{
							latLng:new Array(lat, lon),
							data: enlace_punto,
							options:{
							  icon: "../../styles/images/icons/my_point_interest.png"
							},
							events:
							{
					          click:function(marker, event, context)
									{
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, marker);
											infowindow.setContent(context.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:marker, 
													options:{content: context.data}
												}
											});
										}
									}
					        }
						}
					);	
							
				});
			
				$.each(near_services, function(i, near_d) {
						switch(getLocalStorage("current_language"))
						{
							default:
							case "es":  var informacion=near_d.es;	
										break;
										
							case "en":  var informacion=near_d.en;	
										break;
						}
						
						enlace_punto="<p><img src='../../styles/images/icons/servicios2.png' alt='servicios' style='vertical-align: middle;margin: 2px;' /> <a href='filter_by_municipio.html?id="+near_d.municipio+"&tab=services' >"+informacion.nombre+"</a></p>";
							
					//var coord=near_d.geolocalizacion.split(/[(,)]/);
					//var lat=coord[1];
					//var lon=coord[2]; 			
					todos_puntos.push(
						{
							//latLng:new Array(lat, lon),
							address: near_d.direccion,
							data: enlace_punto,
							options:{
							  icon: "../../styles/images/icons/my_point_services.png"
							},
							events:
							{
					          click:function(marker, event, context)
									{
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, marker);
											infowindow.setContent(context.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:marker, 
													options:{content: context.data}
												}
											});
										}
									}
					        }
						}
					);	
								
				});
					
				if(resultados==0)
				{
					if(id_cat=="" && id_cat_ser!="")
					{
						$("#geoloc_map_text").html("<h3>"+id_cat_ser+"</h3><p>"+TEXTOS[5]+"</p>"); 
					}
					else if(id_cat!="" && id_cat_ser=="")
					{
						$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[5]+"</p>"); 
					}
					else
					{
						$("#geoloc_map_text").html("<p>"+TEXTOS[5]+"</p>"); 
					}
					
				}	
				
				$("#my_location_map").height(parseInt($(window).height())-parseInt($("#title_location").height())+"px");
				
				$("#my_location_map").gmap3({
					kmllayer:{
						options:{
						  url: kml_url+"?dummy="+(new Date()).getTime(),
						  opts:{
							suppressInfoWindows: true,
							preserveViewport: true,
							clickable: false,
							zIndex: 1
						  }
						}
					  },  
					  map:{
						options:{
						  center: myLocation,
						  zoom: 15,
						  mapTypeId: google.maps.MapTypeId.ROADMAP
						}
					  },
					  overlay:{
						latLng: myLocation,
						options:{
							  content:  '<div style=" border-bottom: 8px solid #444; height: 0px; width: 0px; '+
										'border-right: 8px solid transparent; margin: auto; border-left: 8px solid transparent;"></div>'+
										'<div style="background-color:#fff;border:2px solid #444;text-align:center;padding:5px 10px;">'+
										TEXTOS[25]+'</div>',
							  offset:{
								y:0,
								x:-40
							  }
						  }
					  },
					  marker:{
						values: todos_puntos,
						events:{ // events trigged by markers 
							click: function(marker, event, context)
									{
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, marker);
											infowindow.setContent(context.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:marker, 
													options:{content: context.data}
												}
											});
										}
									}
						},
						callback: function() {
							 $("#geoloc_map_text_02").html("");
						},
						cluster:{
						  radius: 90,
						  events:{ // events trigged by clusters 
								click: function(cluster, event, context)
									{							
										var info=new Object();
										info.data="";
										if(context.data.markers.length>6)
										{
											info.data=context.data.markers.length+" "+TEXTOS[41];
											
										}
										else
										{
											$.each(context.data.markers, function(i, m) {
												if((m.data).search("href")!=-1)
													info.data+=m.data;
											});
										}
	
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, cluster.main);
											infowindow.setContent(info.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:cluster.main, 
													options:{content: info.data}
												}
											});
										}
									},
							mouseover: function(cluster){
							  $(cluster.main.getDOMElement()).css("border", "0px");
							},
							mouseout: function(cluster){
							  $(cluster.main.getDOMElement()).css("border", "0px");
							}
						  },
						  0: {
							content: "<div class='cluster cluster-1'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  },
						  10: {
							content: "<div class='cluster cluster-2'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  },
						  25: {
							content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  }
						}
					  }
				});
			
			
			
			}).fail(function(jqXHR, textStatus, errorThrown) {
				//alert('Error: "+textStatus+"  "+errorThrown);	
				
				$("#geoloc_map_text").append("<p>"+TEXTOS[6]+"<br>Error: "+textStatus+"  "+errorThrown+"</p>");
	
			});
			
		}).fail(function(jqXHR, textStatus, errorThrown) {
				//alert('Error: "+textStatus+"  "+errorThrown);	
				
				$("#geoloc_map_text").append("<p>"+TEXTOS[6]+"<br>Error: "+textStatus+"  "+errorThrown+"</p>");
	
			});					
		
	}).fail(function(jqXHR, textStatus, errorThrown) {
		//alert('Error: "+textStatus+"  "+errorThrown);	
		
		$("#geoloc_map_text").html("<p>"+TEXTOS[6]+"<br>Error: "+textStatus+"  "+errorThrown+"</p>");

	});
		
}

function draw_map_points(position)
{	
	//Center Avila position
	var lat1 = 40.604496;
  	var lon1 = -4.899115;
  	var latlong = lat1+","+lon1;
  	
  	var radio=RADIO_DESDE_USER_MAPA_LOCATION;
  	var radioTierra=6371; //km
	
	//Recoger todos los puntos de interés
	var near_points=new Array();
	
	//Recoger todos los servicios
	var near_services=new Array();
		
	var objajax=$.getJSON(local_url+"point_list.json", function(data) {
		
		var id_cat="";
		if(typeof categ_list[FILTRO]!="undefined")
		{
			switch(getLocalStorage("current_language"))
			{
				default:
				case "es":  id_cat=categ_list[FILTRO][0].es;
							break;
									
				case "en":  id_cat=categ_list[FILTRO][0].en;
							break;
			}
		}

		$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
		
		$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
		
		var q = FILTRO,
			regex = new RegExp(q, "i");
			
		$.each(data.result.items, function(index, d) {   

			var geolocalizacion=d.geolocalizacion.split(/[(,)]/);
			var lat2=parseFloat(geolocalizacion[1]);
			var lon2=parseFloat(geolocalizacion[2]);
			
			var dLat = (lat2-lat1).toRad();
			var dLon = (lon2-lon1).toRad();
			
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
					Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var di = radioTierra * c;
			
			$.each(d.categoria, function(i, cat) {
				if(cat.id.search(regex) != -1) 
				{			
					if($.inArray(d, near_points)==-1)	
					{			
						if(di<=radio)
							near_points.push(d);
					}	
				}
			});		
			
		});
		
		
		
		/*Empresas*/
		$.getJSON(local_url+"empresas_list.json", function(data2) {
		
			var id_cat="";
			if(typeof categ_list[FILTRO]!="undefined")
			{
				switch(getLocalStorage("current_language"))
				{
					default:
					case "es":  id_cat=categ_list[FILTRO][0].es;
								break;
										
					case "en":  id_cat=categ_list[FILTRO][0].en;
								break;
				}
			}
	
			$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
			
			$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
			
			var q = FILTRO,
				regex = new RegExp(q, "i");
				
			$.each(data2.result.items, function(index, empr) {   
	
				var geolocalizacion=empr.geolocalizacion.split(/[(,)]/);
				var lat2=parseFloat(geolocalizacion[1]);
				var lon2=parseFloat(geolocalizacion[2]);
				
				var dLat = (lat2-lat1).toRad();
				var dLon = (lon2-lon1).toRad();
				
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
						Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
						Math.sin(dLon/2) * Math.sin(dLon/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var di = radioTierra * c;
				
				$.each(empr.categoria, function(i, cat) {
					if(cat.id.search(regex) != -1) 
					{			
						if($.inArray(empr, near_points)==-1)	
						{			
							if(di<=radio)
								near_points.push(empr);
						}	
					}
				});
				
			});
			
			
			/*Servicios*/
			$.getJSON(local_url+"services_list.json", function(data3) {
		
				var id_cat="";
				if(typeof categ_list[FILTRO]!="undefined")
				{
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  id_cat=cat_services_list[FILTRO][0].es;
									break;
											
						case "en":  id_cat=cat_services_list[FILTRO][0].en;
									break;
					}
				}
		
				$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[23]+" "+radio+" "+TEXTOS[24]);
				
				$("#geoloc_map_text").append("<span id='geoloc_map_text_02' ><img src='../../styles/images/icons/loader.gif' style='margin:0 5px;width:25px' /></span>");
				
				var q = FILTRO,
					regex = new RegExp(q, "i");
					
				$.each(data3.result.items, function(index, serv) {   
					
					$.each(serv.categoria, function(i, cat) {
						if(cat.id.search(regex) != -1) 
						{			
							if($.inArray(serv, near_services)==-1)	
							{			
								near_services.push(serv);
							}	
						}
					});			
					
				});

						
				//GMAP3
				var myLocation=new google.maps.LatLng(lat1, lon1);	
				var todos_puntos=new Array();
		
				var resultados=near_points.length;
				var enlace_punto="";
				$.each(near_points, function(i, near_d) {
					switch(getLocalStorage("current_language"))
					{
						default:
						case "es":  var informacion=near_d.es;	
									break;
									
						case "en":  var informacion=near_d.en;	
									break;
					}
					
					if((near_d.id).indexOf("EMPR")!=-1)
					{
						enlace_punto="<p><img src='../../styles/images/icons/nearest.png' alt='interes' style='vertical-align: middle;margin: 2px;' /> <a href='empresa.html?id="+near_d.id+"' >"+informacion.nombre+"</a></p>";
					}
					else
					{
						enlace_punto="<p><img src='../../styles/images/icons/nearest.png' alt='interes' style='vertical-align: middle;margin: 2px;' /> <a href='points.html?id="+near_d.id+"' >"+informacion.nombre+"</a></p>";
					}
	
					var coord=near_d.geolocalizacion.split(/[(,)]/);
					var lat=coord[1];
					var lon=coord[2]; 			
					todos_puntos.push(
						{
							latLng:new Array(lat, lon),
							data: enlace_punto,
							options:{
							  icon: "../../styles/images/icons/my_point.png"
							},
							events:
							{
					          click:function(marker, event, context)
									{
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, marker);
											infowindow.setContent(context.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:marker, 
													options:{content: context.data}
												}
											});
										}
									}
					        }
						}
					);	
								
				});
				
				if(resultados==0)
				{
					$("#geoloc_map_text").html("<h3>"+id_cat+"</h3><p>"+TEXTOS[5]+"</p>"); 
				}	
				
				$("#geoloc_map_text").append("<p>"+TEXTOS[19]+"</p>");
				
				$("#my_location_map").height(parseInt($(window).height())-parseInt($("#title_location").height())+"px");		
				
				$("#my_location_map").gmap3({
					  map:{
						options:{
						  center: myLocation,
						  zoom: 9,
						  mapTypeId: google.maps.MapTypeId.ROADMAP
						}
					  },
					  marker:{
						values: todos_puntos,
						events:{ // events trigged by markers 
							click: function(marker, event, context)
									{
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, marker);
											infowindow.setContent(context.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:marker, 
													options:{content: context.data}
												}
											});
										}
									}
						},
						callback: function() {
							 $("#geoloc_map_text_02").html("");
						},
						cluster:{
						  radius: 100,
						  events:{ // events trigged by clusters 
								click: function(cluster, event, context)
									{							
										var info=new Object();
										info.data="";
										if(context.data.markers.length>6)
										{
											info.data=context.data.markers.length+" "+TEXTOS[41];
											
										}
										else
										{
											$.each(context.data.markers, function(i, m) {
												if((m.data).search("href")!=-1)
													info.data+=m.data;
											});
										}
			
										var map = $(this).gmap3("get"),
											infowindow = $(this).gmap3({get:{name:"infowindow"}});
										if (infowindow)
										{
											infowindow.open(map, cluster.main);
											infowindow.setContent(info.data);
										} 
										else {
											$(this).gmap3({
												infowindow:{
													anchor:cluster.main, 
													options:{content: info.data}
												}
											});
										}
									},
							mouseover: function(cluster){
							  $(cluster.main.getDOMElement()).css("border", "0px");
							},
							mouseout: function(cluster){
							  $(cluster.main.getDOMElement()).css("border", "0px");
							}
						  },
						  0: {
							content: "<div class='cluster cluster-1'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  },
						  10: {
							content: "<div class='cluster cluster-2'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  },
						  25: {
							content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
							width: 40,
							height: 55
						  }
						}
					  }
					});
					
				});
					
			});
	
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			//alert('Error: "+textStatus+"  "+errorThrown);	
			
			$("#geoloc_map_text").html("<p>"+TEXTOS[6]+"<br>Error: "+textStatus+"  "+errorThrown+"</p>");

		});
		
	
}

function createMarker(place, title, type) 
{
    //var placeLoc = place.geometry.location;
    var marker=new google.maps.Marker({
		map: map,
		position: place //placeLoc
    }); 
    marker.setTitle(title);
    
    var infowindow=new google.maps.InfoWindow(
    	{ 
    		content: title 
    	});

	google.maps.event.addListener(marker, 'click', function () {
		infowindow.open(map, marker);
	});
	
	switch(type)
    {
    	case "0": marker.setIcon("../../styles/images/icons/my_point.png");   
    			  break; 
		
    	case "1": infowindow.open(map, marker);
				  marker.setIcon("../../styles/images/icons/near_points.png");   
    			  break;
				  
		default: break;

    }
}

function SortByName(a, b){
				
	var aName1 = a.nombre.toLowerCase();
	var bName1 = b.nombre.toLowerCase();
	
	var translate = {
		"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
		"Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
	    "ä": "a", "ö": "o", "ü": "u",
	    "Ä": "A", "Ö": "O", "Ü": "U"   
	};
	
	var translate_re = /[áéíóúÁÉÍÓÚöäüÖÄÜ]/g;
	var aName= ( aName1.replace(translate_re, function(match) { 
	    return translate[match]; 
	}) );
	
	var bName= ( bName1.replace(translate_re, function(match) { 
	    return translate[match]; 
	}) );
	 
	if (aName < bName){
        return -1;
    } else if (aName > bName){
        return 1;
    } else {
        return 0;
    }
  
	//return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function SortByLangName(a, b){
				
	switch(getLocalStorage("current_language"))
	{
		default:
		case "es": 	var aName1 = a.es.nombre.toLowerCase();
					var bName1 = b.es.nombre.toLowerCase();
					break;
					 
		case "en":  var aName1 = a.en.nombre.toLowerCase();
					var bName1 = b.en.nombre.toLowerCase();
					break;
	}
	
	var translate = {
		"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
		"Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
	    "ä": "a", "ö": "o", "ü": "u",
	    "Ä": "A", "Ö": "O", "Ü": "U"   
	};
	
	var translate_re = /[áéíóúÁÉÍÓÚöäüÖÄÜ]/g;
	var aName= ( aName1.replace(translate_re, function(match) { 
	    return translate[match]; 
	}) );
	
	var bName= ( bName1.replace(translate_re, function(match) { 
	    return translate[match]; 
	}) );
		
	if(a.destacado == "")
		a.destacado=0;
		
	if(b.destacado == "")
		b.destacado=0;
		
  	if(parseInt(a.destacado) < parseInt(b.destacado)) { 
        return 1;
    } else if(parseInt(a.destacado) > parseInt(b.destacado)) { 
        return -1;
    } else if (aName < bName){ 
        return -1;
    } else if (aName > bName){ 
        return 1;
    } else  {
        return 0;
    }
    
	//return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function recover_extern_list(operation, params, container) {
	
	$.ajax({

		  url: api_url,
		  
	  	  data: 
	  	  		{ 
	  	  			o: operation, 
	  	  			p: params 
	  	  		},
	  
		  type: 'POST',
		  dataType: 'json',
		  crossDomain: true, 
		  success: function(data) 
		  		   {
		  		   		var cadena="";
		  		   				  		   		
			  			$.each(data.result.routes, function(ind, route)  
						{								
							cadena+='<div onclick="donwload_files(\''+route.id+'\')" >';
									
							cadena+='<div id="ov_box_13_1_f" class="ov_box_13"><img src="../../styles/images/icons/grey2_triangle.png" alt="menu" class="ov_image_14"/></div>';
										
							switch(getLocalStorage("current_language"))
							{
								default:
								case "es":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+route.es.nombre+'</div></div>';											
											break;
								
								case "en":  cadena+='<div id="ov_box_14_1_f" class="ov_box_14"><div id="ov_text_24_1_f" class="ov_text_24">'+route.en.nombre+'</div></div>';
											break;
							}	
						
							cadena+='</div>';

						});
						
						$("#"+container).html(cadena);
	
		  			},
		  error: function(jqXHR, textStatus, errorThrown) {
		  				console.log("Error ajax"); 
						$("#"+container).html("<p>"+TEXTOS[10]+"</p>");
		  		 },
		  async:false,
		});
}

/* DOWNLOAD TO DIR */

function donwload_files(id) {

	ID_ROUTE_DOWNLOAD=id;
	 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemError);
	//window.webkitRequestFileSystem(PERSISTENT, 0, onFileSystemSuccess, onFileSystemError);   

}

function onFileSystemError(error) 
{
	alert("Error File System");  //change to console.log("Error File System"); 
}
function onFileSystemSuccess(fileSystem) 
{

	console.log("File System OK"); 
	
	//Cargado el sistema de archivos, crear los directorios pertinentes para la descarga de los ficheros.
		
	fs=fileSystem.root;
	
	setFilePath();		
	
	console.log(fs)
	console.log(file_path);
	
	fs.getDirectory("DiputacionAvila",{create:true, exclusive:false},function() {
		fs.getDirectory(file_path,{create:true, exclusive:false},downloadRoutesToDir,onError);
	},onError);   
    
}

function setFilePath() {
    var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1; 
	if(isAndroid) {
		file_path = "DiputacionAvila/resources";
		//Android
	}
	else {
		file_path = "DiputacionAvila/resources";
		//IOS
	}
}

function downloadRoutesToDir(d) {

	console.log('created directory '+d.name);

	DATADIR = d;  

	//$("body").prepend("<div id='descarga' onclick='$(this).hide()'><div id='descarga_close'>CERRAR</div></div>");
	$("#ov_download_routes").prepend("<div id='descarga'></div>");
		
	$("#descarga").append("<p>DESCARGANDO ARCHIVOS...</p>");
	$("#descarga").append("<p>Esta acci&oacute;n puede tardar algunos minutos.</p>");
	
	//$("#descarga").append('<progress id="barra_carga" max="98" value="1"></progress>');		
	$("#descarga").append('<p id="porcentaje"> </p>');
	
	//DESCARGA FICHERO JSON
	fs.getDirectory(file_path+"/json/",{create:true, exclusive:false},function() {
		
		fs.getDirectory(file_path+"/json/routes",{create:true, exclusive:false},function() {
										
			var ft = new FileTransfer();		
			
			var dlPath = fs.toURL()+file_path+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json"; 	
			
			console.log(dlPath);
	
			ft.download(extern_url+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json" , dlPath, function() {
					$("#descarga").append("/json/routes/"+ID_ROUTE_DOWNLOAD+".json"+" .... OK<br>");
					//cargar_barra("barra_carga", 100);	
					
					
					//COMIENZA LA DESCARGA DE ARCHIVOS GPX -> Habría que hacerlo recursivamente como con las imágenes
					fs.getDirectory(file_path+"/routes/",{create:true, exclusive:false},function() {
																
						var ft = new FileTransfer();		
								
						$.getJSON(fs.toURL()+file_path+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json", function (data1) {
						
							$.each(data1.result.items, function(ind, dat) {
								
								var dlPath = fs.toURL()+file_path+"/routes/"+dat.gpx+".gpx"; 	
							
								ft.download(extern_url+"/routes/"+dat.gpx+".gpx" , dlPath, function() {
									$("#descarga").append("/routes/"+dat.gpx+".gpx"+" .... OK<br>");
									//cargar_barra("barra_carga", 100);
								}, 
								function(error){
									$("#descarga").append("routes/"+dat.gpx+".gpx"+" .... KO "+error.message+"<br>");
								});	
									
								
							});
									
							console.log(dlPath);

						},function(error){
							$("#descarga").append("Get File "+fs.toURL()+file_path+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json fail " + error.message+"<br>");
						});
						
					}
					,function(error) {
						$("#descarga").append("Get Directory "+fs.toURL()+file_path+"/json/"+". FAIL: " + error.message+"<br>");
					});
	
				}, 
				function(error){
					$("#descarga").append("json/routes/"+ID_ROUTE_DOWNLOAD+".json"+" .... KO "+error.message+"<br>");
				});
				
		}
		,function(error) {
			$("#descarga").append("Get Directory "+fs.toURL()+file_path+"/json/routes/"+". FAIL: " + error.message+"<br>");
		});

	}
	,function(error) {
		$("#descarga").append("Get Directory "+fs.toURL()+file_path+"/json/"+". FAIL: " + error.message+"<br>");
	});

	
	setTimeout(function() {
		//Descarga imagenes
		fs.getDirectory(file_path+"/images/",{create:true, exclusive:false},function() {
					
			fs.getDirectory(file_path+"/images/maps",{create:true, exclusive:false},function() {
								
				var objajax2=$.getJSON(fs.toURL()+file_path+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json", function (data1) {
														
					var imagenes=data1.result.items;

					if(Object.size(imagenes)>0)
					{										
						i=0;
						total_img_gals=1;
												
						//downloadImages(object/array data,  posicion, tamaño, ruta);
						downloadImages(imagenes, i, Object.size(imagenes), fs.toURL()+file_path);
					}	
					
				}).fail(function(jqXHR, textStatus, errorThrown) {							
					console.log("Error al recoger la ruta "+fs.toURL()+file_path+"/json/routes/"+ID_ROUTE_DOWNLOAD+".json");											
				});
					
			},function(error){
				$("#descarga").append("Get Directory "+file_path+"/images/maps fail " + error.code+"<br>");
			});
			
		},function(error){
			$("#descarga").append("Get Directory "+file_path+"/images fail " + error.code+"<br>");
		});
			
	}, 1000);
		

}
function downloadImages(imagenes, i, total, path) {
		
	var imagen_local=(imagenes[i].src_image).split("../../resources/");

	var ft = new FileTransfer();			
	var dlPath = path+"/"+imagen_local[1]; 

	try {	
		ft.download(extern_url+"/"+imagen_local[1], dlPath, function() {
		
				$("#descarga").append(imagen_local[1]+" .... OK<br>");	
				i++;			
				if(i<total)
					downloadImages(imagenes, i, total, path);
			}, 
			function(error){
				$("#descarga").append(imagen_local[1]+" .... KO (err. "+error.message+")<br>");
				intentos++;
				if(i<total && intentos<2)
					downloadImages(imagenes, i, total, path);
				else
				{
					intentos=0;
				}
			}
		);
	}
	catch(e) {
	   $("#descarga_close").show();
	}
	
	if(i>=total-1)
	{
		$("#descarga").append("<p>Completado</p>");
		setTimeout(function() {
			$("#descarga").html("<p>Descarga finalizada</p>");		
		}, 500);
	}		
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function cargar_barra(id, total)
{		
	/*var barra_progreso=$("#"+id);
	var value = barra_progreso.val();  
	value+=parseInt(90/total);
    barra_progreso.val(value);  	*/		
}

function gotFS(fileSystem) 
{
    var reader = fileSystem.root.createReader();
    reader.readEntries(gotList, fail_getFile);  

}
function gotList(entries) {
    var i;
    for (i=0; i<entries.length; i++) {
        if (entries[i].name.indexOf(".json") != -1) {
            console.log(entries[i].name);
        }
    }
}
function success_getFile(parent) {
    console.log("Nombre del padre: " + parent.name);
}
function fail_getFile(error) {
    alert("Ocurrió un error recuperando el fichero: " + error.message);
}
function onError(e){
	$("#descarga_close").show();
	alert("ERROR "+e.code+" - "+e.source+" - "+e.target);
}

/*******************/

function go_to_page(name, id) {
	window.location.href='../'+getLocalStorage('current_language')+'/'+name+'.html?id='+id;
}

function get_var_url(variable){

	var tipo=typeof variable;
	var direccion=location.href;
	var posicion=direccion.indexOf("?");
	
	posicion=direccion.indexOf(variable,posicion) + variable.length; 
	
	if (direccion.charAt(posicion)== "=")
	{ 
        var fin=direccion.indexOf("&",posicion); 
        if(fin==-1)
        	fin=direccion.length;
        	
        return direccion.substring(posicion+1, fin); 
    } 
	else
		return false;
	
}

function getFirstTime()   
{
	if(getLocalStorage("first_time")==null || getLocalStorage("first_time")!="NO")
	{
		window.location.href='./html/'+getLocalStorage("current_language")+'/main_menu.html';
	}
}

function setLanguage()   
{
	if(getLocalStorage("current_language")==null || getLocalStorage("current_language")=="")
	{
		setLocalStorage("current_language",default_language);
	}
}

function setLocalStorage(keyinput,valinput) 
{
	if(typeof(window.localStorage) != 'undefined') { 
		window.localStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("no localStorage"); 
	}
}
function getLocalStorage(keyoutput)
{
	if(typeof(window.localStorage) != 'undefined') { 
		return window.localStorage.getItem(keyoutput); 
	} 
	else { 
		alert("no localStorage"); 
	}
}
function setSessionStorage(keyinput,valinput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		window.sessionStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("no sessionStorage"); 
	}
}
function getSessionStorage(keyoutput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		return window.sessionStorage.getItem(keyoutput); 
	} 
	else { 
		alert("no sessionStorage"); 
	}
}