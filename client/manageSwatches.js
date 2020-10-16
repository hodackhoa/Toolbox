/* Create an instance of CSInterface. */
var $ = function(id){
	return document.getElementById(id)
};
var csInterface = new CSInterface();

//
function createPaletteColor(arr, hierarchy, hierarchyURI, paletteSecond, language){
	for(var i=0; i<arr.length; i++){
		var palette = document.createElement('div');
		var attrClass = document.createAttribute('class');
		attrClass.value = 'palette';
		palette.setAttributeNode(attrClass);
		var attrId = document.createAttribute('id');
		attrId.value = arr[i].name[language];
		palette.setAttributeNode(attrId);
		var imgPalette = document.createElement('img');
		var srcAttr = document.createAttribute("src");
		srcAttr.value = "iconSVG/palette-solid.svg";
		imgPalette.setAttributeNode(srcAttr);

		var labelPalette = document.createElement('h6');
		var dataAttr = document.createAttribute('data-uri');
		dataAttr.value = hierarchyURI + "/" + arr[i].name[language];
		labelPalette.setAttributeNode(dataAttr);
		labelPalette.innerHTML = arr[i].name[language];
		//create context Menu
		var contextMenu = document.createElement("div");
		var attrClass2 = document.createAttribute("class");
		attrClass2.value = "contextMenu";
		contextMenu.setAttributeNode(attrClass2);
			//----action Create Group
		var actionCreate = document.createElement("h5");
		actionCreate.innerHTML = 'Make Group';
		contextMenu.appendChild(actionCreate);
			//----action Detele---
		var actionDel = document.createElement("h5");
		actionDel.innerHTML = 'Delete';
		contextMenu.appendChild(actionDel);
		//----action Edit---
		var actionEdit = document.createElement("h5");
		actionEdit.innerHTML = 'Edit';
		contextMenu.appendChild(actionEdit);
		//----Preview sample-------
		var actionPreview = document.createElement("h5");
		actionPreview.innerHTML = 'View';
		contextMenu.appendChild(actionPreview);

		palette.appendChild(imgPalette);
		palette.appendChild(labelPalette);
		palette.appendChild(contextMenu);
		//---handle palette-----------
		palette.addEventListener("contextmenu", function(e){
			e.preventDefault();
			e.stopPropagation();
			if(e.target.getAttribute("class")=="parentSwatches"){
				return false;
			}
			objRightClick = e.target;
			if(e.target.tagName == "SVG" || e.target.tagName=="H6"){
				objRightClick = e.target.parentElement;
			}
			hideMenuPalette();
			/*var arrListDiv = $("listPalette").children;
			for(var j = 0; j<arrListDiv.length; j++){
				arrListDiv[j].style.cssText = "position: static;";
				arrListDiv[j].children[2].style.cssText = "display: none;";
			}*/
			objRightClick.style.position = "relative";
			objRightClick.children[2].style.cssText = "display: block; position: absolute; top: 50%; right:10%;";
			//menuSw.style.top = window.scrollY+ e.clientY + "px"; 
			//menuSw.style.left = (e.clientX) + "px"; 
			//
			activeFolder(this);
			localStorage.setItem('paletteActive', this.children[1].getAttribute('data-uri'));
		})
		palette.ondblclick = function(){
			//alert(this.children[1].innerHTML);
			//csInterface.evalScript("createGroup('"+this.children[1].innerHTML+"')");
		}
		if(hierarchy > 0){
			palette.style.marginLeft = (hierarchy*8) + "px";
			paletteSecond.appendChild(palette);
		}
		else{
			$("listPalette").appendChild(palette);
		}
		//Show list swatches
		var swatchesDiv = document.createElement("div");
		var attSwDiv = document.createAttribute("class");
		attSwDiv.value = "parentSwatches";
		swatchesDiv.setAttributeNode(attSwDiv);
		swatchesDiv.style.position = "relative";

		if(arr[i].arrSwatches!=undefined){
			for(var j=0; j< arr[i].arrSwatches.length; j++){
				var svgColor = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svgColor.setAttributeNS(null, "class", "svgColor");
				svgColor.setAttributeNS(null, "data-infoSw", arr[i].arrSwatches[j].inforSw[language]);
				svgColor.setAttributeNS(null, "data-rgbColor", JSON.stringify(arr[i].arrSwatches[j].rgbObj));
				svgColor.setAttributeNS(null, "data-uri", dataAttr.value);
				svgColor.setAttributeNS(null, "data-index", j);
				svgColor.setAttributeNS(null, "data-blendMode", arr[i].arrSwatches[j].blendMode);
				svgColor.setAttributeNS(null, "data-opacity", arr[i].arrSwatches[j].opacity);
				svgColor.setAttributeNS(null, "data-clippingMask", arr[i].arrSwatches[j].clippingMask);
				var pathNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				var rectNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rectNode.setAttributeNS(null, 'fill', "#"+ arr[i].arrSwatches[j].rgbObj.hexValue);
				rectNode.setAttributeNS(null, 'width', '19');
				rectNode.setAttributeNS(null, 'height', '19');
				pathNode.setAttributeNS(null, 'd', 'M19,1v18H1V1H19 M20,0H0v20h20V0L20,0z');
				pathNode.setAttributeNS(null, 'fill', '#343434');
				svgColor.appendChild(rectNode);
				svgColor.appendChild(pathNode);
				//create div right menu


				swatchesDiv.appendChild(svgColor);

				//-----ADD event for swatches
				svgColor.addEventListener("click", function(e){
					e.stopPropagation();
					csInterface.evalScript("changeForeground('"+this.children[0].getAttribute("fill")+"')");
					//$("contentInfSw").innerHTML = this.getAttribute("data-infoSw");
					//alert(this.children[0].getAttribute("fill"));
				})
				svgColor.ondblclick = function(e){
					e.stopPropagation();
					var inforSw = this.getAttribute('data-infoSw');
					var lastChar = (inforSw.indexOf("(")== - 1)? inforSw.length : inforSw.indexOf("(");
					inforSw = inforSw.substring(0, lastChar);
					csInterface.evalScript("makeSolidColor('"+inforSw+"',0,0,0, "+this.getAttribute('data-rgbColor')+",true,'"+this.getAttribute('data-blendMode')+"', "+this.getAttribute('data-opacity')+", "+JSON.parse(this.getAttribute('data-clippingMask'))+")");
				}
				svgColor.addEventListener("contextmenu", function(e){
					//e.stopPropagation();
					e.preventDefault();
					var menuSw = document.getElementById("menuSw");
					menuSw.style.top = window.scrollY+ e.clientY + "px"; 
					menuSw.style.left = (e.clientX) + "px"; 
					menuSw.style.display = "block";
					localStorage.setItem("activeSwatch", JSON.stringify({
						uri: this.getAttribute("data-uri"),
						index: this.getAttribute("data-index")
					}))
				})
			}
			//-----------	
			swatchesDiv.style.marginLeft = "0.4em";
			swatchesDiv.style.display = "none";
			palette.appendChild(swatchesDiv);
		}
		//--------
		palette.onclick =  function(e){
			e.stopPropagation();
			//alert(hierarchy + "  "+this.children[1].getAttribute('data-uri'));
			if(e.target.getAttribute("id")!= "menuSw"){
				$("menuSw").style.display = "none";
			}
			if(e.target.getAttribute("class") =="parentSwatches"){
				return false;
			}
			var language = localStorage.getItem('language').toLowerCase();
			var objClick = e.target;
			if(objClick.tagName == "H5"){
				var paletteActive = this.children[1].getAttribute('data-uri');
				this.children[2].style.display = "none";
				//----------
				var dataPalette = localStorage.getItem('dataPaletteOriginal');
				dataPalette = JSON.parse(dataPalette);
				paletteActive = paletteActive.split("/");
				if(paletteActive[0]==""){
					paletteActive.splice(0,1);
				}
				var arrData = dataPalette;
				var paletteTemp = null, k = null, dirChild="";
				for(var i=0; i<paletteActive.length; i++){
					for(var j=0; j<arrData.length; j++){
						if(paletteActive[i]== arrData[j].name[language]){
							dirChild += "/"+ j;
							k = j;
							if(i != paletteActive.length - 1){
								paletteTemp = arrData[j];
								if(arrData[j].data!=undefined){
									arrData = arrData[j].data;
									dirChild += "/data";
								}
								else{
									arrData = [];
								}
								//arrData = (arrData[j].data==undefined)? [] : arrData[j].data;
							}
							break;
						}
					}
				}
				//-----------
				function updateData(action,msg,mode,oldName){
					//-----------------
					var orderIdCurrent = (paletteTemp==null)? dataPalette[k].orderId : 'noID';
					var url =(paletteTemp==null)? dataPalette[k].url : paletteTemp.data[k].url;
					var fileNameORG = (paletteTemp==null)? dataPalette[k].filenameORG : paletteTemp.data[k].filenameORG;
					var dataForBox = {
						titleMsg: 'Confirm dialog',
						message: msg,
						btnLabel1: 'OK',
						btnLabel2: 'Cancel',
						inputText: oldName,
						inputObj: [{name:"Order ID:", value:orderIdCurrent}, {name:"Url:", value:url, btnName:"Upload",responseBtn:""}, {name:'Filename:', value:fileNameORG}],
						mode: mode
					};
					csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")",function(response){
						response = JSON.parse(response);
						if(response.action=="OK"){
							if(response.inputObj[1].responseBtn != ""){
								uploadImage(response.inputObj[1].responseBtn, function(urlFirebase){
									process_1(urlFirebase);
								});
							}
							else{
								process_1();
							}
							function process_1(urlFirebase){
								var paletteObj = null, hasFound = false;
								if(paletteTemp==null){
									paletteObj = dataPalette[k];
									if(action=="Delete"){
										dataPalette.splice(k, 1);
									}
								}
								else {
									paletteObj = paletteTemp.data[k];
									if(action=="Delete"){
										paletteTemp.data.splice(k,1);
									}
								}
								//Update data
								for(var i=0; i<dataPalette.length; i++){
									if(paletteActive[0] == dataPalette[i].name[language]){
										hasFound = true;
										var objInf = {method:'Delete'};
										if(action=="Edit"){
											var dataTranslate = JSON.parse(localStorage.getItem('dataTranslate'));
											var objName = {
												name: response.tabInp
											}
											compare(objName, dataTranslate, "name", language);

											if(objName.name.en == "" || objName.name.vn=="" || objName.name.jp==""){
												csInterface.evalScript("addDataTranslate("+JSON.stringify(objName.name)+", '"+language+"')", function(response){
													response = JSON.parse(response);
													if(response != null){
														dataTranslateSync("POST", response,'dataTranslate/'+ dataTranslate.length);
														editData(response);
													}
												});
											}	
											else{
												editData(objName.name);
											}
											function editData(objNewName){
												paletteObj.name = objNewName;
												if(paletteObj.orderId!=undefined){
													paletteObj.orderId = parseInt(response.inputObj[0].value);
												}						
												var arrUrl=(response.inputObj[1].value=="")? [] : response.inputObj[1].value.split("|");
												if(urlFirebase != undefined){
													urlFirebase = urlFirebase.replace("https://firebasestorage.googleapis.com/v0/b/server-001-942d3.appspot.com/o/Punch%2F", "<7026>");
													arrUrl.push(urlFirebase);
												}
												paletteObj.url = arrUrl.join("|");

												paletteObj.filenameORG = response.inputObj[2].value;
												objInf.method = 'Edit';
												paletteActive[paletteActive.length - 1] = response.tabInp;
												localStorage.setItem('paletteActive', "/"+paletteActive.join("/"));
												firebasePatchdata(dataPalette, dirChild, "PATCH", paletteObj, objInf);
												//patchData(dataPalette, i, "PATCH", paletteObj, objInf);
											}
										}
										else{
											dirChild = dirChild.split("/");
											dirChild = dirChild.reverse().slice(1).reverse().join("/");
											objInf.name = paletteObj.name[language];
											firebasePatchdata(dataPalette, dirChild, "PATCH", paletteTemp.data, objInf);
											//patchData(dataPalette, i, "PATCH", paletteObj, objInf);
										}
										break;
									}
								}
								if(!hasFound){
									localStorage.removeItem('paletteActive');
									firebasePatchdata(dataPalette, "", "PATCH",dataPalette, {name:paletteObj.name[language], type: "Delete"});
									//patchData(dataPalette,null, "DELETE",paletteObj);
								}
								//localStorage.removeItem('paletteActive');
								//localStorage.setItem('dataPalette', JSON.stringify(dataPalette));
							}
						}
					})
				}
				switch (objClick.innerHTML) {
					case "Delete":
						updateData('Delete','Are you sure delete palette?','notify');
						break;
					case "Make Group":
						var paletteName = this.children[1].innerHTML;
						var lastChar = (paletteName.indexOf("(")== - 1)? paletteName.length : paletteName.indexOf("(");
						csInterface.evalScript("createGroup('"+paletteName.substring(0,lastChar)+"')");
						this.children[2].style.display = "none";
						break;
					case "Edit":
						updateData('Edit','New palette name','both',this.children[1].innerHTML);
						break;
					case "View":
						var objPalette = (paletteTemp==null)? dataPalette[k].url : paletteTemp.data[k].url;
						csInterface.evalScript("reloadPanel('Preview Image','"+objPalette+"')");
						break;
					default:
						break;
				}
			}
			else{
				localStorage.setItem('paletteActive', this.children[1].getAttribute('data-uri'));
				activeFolder(this);
				expandChild(this);
				hideMenuPalette();
				//alert(objClick.children[1].getAttribute('data-uri'));
			}	
		}
		//callBack--------------
		//if(arr[i].type=='palette' && arr[i].data.length>0){
		if(arr[i].type=='palette' && arr[i].data != undefined){
			//alert("run");
			hierarchy++;
			hierarchyURI +=  "/" + arr[i].name[language];
			var paletteSecond = document.createElement("div");
			var classAttr2 = document.createAttribute("class");
			paletteSecond.style.display = "none";
			classAttr2.value = "palette_" + hierarchy;
			paletteSecond.setAttributeNode(classAttr2);
			var parentPalette = palette;
			parentPalette.appendChild(paletteSecond);
			createPaletteColor(arr[i].data, hierarchy, hierarchyURI, paletteSecond,language);
			paletteSecond = palette.parentElement;
			hierarchy--;
			hierarchyURI = hierarchyURI.split("/");
			hierarchyURI.splice(hierarchyURI.length - 1, 1);
			hierarchyURI = hierarchyURI.join("/");
		}
	}
}
//------------
function clearNode(){
	var palettes = $("listPalette").children.length;
	for(var j=0; j<palettes ; j++){
		$("listPalette").children[0].remove();
	}
}
function activeFolder(nodeLi){
	var arrListSelect = document.getElementsByClassName("palette");
	//alert(arrListSelect.length);
	for(var i=0;i<arrListSelect.length;i++){
		//arrListSelect[i].style.background = 'none';
		arrListSelect[i].children[1].style.color = '#a7a7a7';
	}
	//nodeLi.style.background = '#636363';
	nodeLi.children[1].style.color = '#c39f0d';
}
function expandChild(node){
	var parentOfNode = node.parentElement.children;
	for(var i=0; i< parentOfNode.length; i++){
		//alert(parentOfNode[i] === node);
		if(parentOfNode[i].children[3] != undefined && parentOfNode[i] !== node){
			parentOfNode[i].children[3].style.display = "none";
		}
		if(parentOfNode[i].children[4] != undefined && parentOfNode[i] !== node){
			parentOfNode[i].children[4].style.display = "none";
		}
	}
	if(node.children[3] != undefined){
		node.children[3].style.display=(node.children[3].style.display=="block")? "none" : "block";
	}
	if(node.children[4] != undefined){
		node.children[4].style.display=(node.children[4].style.display=="block")? "none" : "block";
	}
	//alert(node.children[3].style.display);
}
//------Funtion reload
// RELOAD status palette 
function reloadActive(indexSw,callback){
	var paletteActive = localStorage.getItem('paletteActive');
	paletteActive = paletteActive.split("/");
	if(paletteActive[0]==""){
		paletteActive.splice(0,1);
	}
	var arrPalette = $("listPalette").children;
	var lastPal = null;
	for(var i=0; i<paletteActive.length; i++){
		for(var j=0; j<arrPalette.length; j++){
			if(arrPalette[j].getAttribute("id") == paletteActive[i]){
				for(var k=0; k<arrPalette[j].children.length; k++){
					if(arrPalette[j].children[3]!=undefined){
						arrPalette[j].children[3].style.display = "block";
					}
					if(arrPalette[j].children[4]!=undefined){
						arrPalette[j].children[4].style.display = "block";
					}
				}
				lastPal = arrPalette[j];
				if(arrPalette[j].children[3] != undefined && arrPalette[j].children[3].getAttribute("class")!="parentSwatches"){
					arrPalette = arrPalette[j].children[3].children;
				}
				else if(arrPalette[j].children[4]!=undefined){
					arrPalette = arrPalette[j].children[4].children;
				}
				break;
			}
		}
	}
	lastPal.children[1].style.color = "#c39f0d";
	if(indexSw != undefined){
		lastPal.children[3].children[indexSw].getElementsByTagName("path")[0].style.fill = "red";
		callback(lastPal.children[3].children[indexSw].getElementsByTagName("path")[0]);
	}
}
//---funtion GET PATCH
function getData(language, callback){
	//-------------------
	$("loadingGr").style.display = "block";
	//------------
	/*var request = new XMLHttpRequest();
	var url = 'https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch';
	request.open('GET', url, true);
	request.onload = function(){
		if(request.readyState==4 && request.status==200){
			console.log(request);
			$("loadingGr").style.display = "none";
			//console.log(request.responseText);
			var orderPalette = localStorage.getItem("orderPalette");
			var dataPalette = JSON.parse(request.responseText);
			dataPalette.sort(function(a,b){
				return (a.orderId>b.orderId)? 1 : (- 1) ;
			})
			localStorage.setItem("dataPalette", JSON.stringify(dataPalette));
			createPaletteColor(dataPalette,0,"",undefined,language.toLowerCase());
			reloadActive();
			//editMockAPI('https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch');
		}
	}
	request.send();*/
	var refData = firebase.database().ref('dataPalette');
	refData.once('value').then(function(response){
		console.log(response.val())
		$("loadingGr").style.display = "none";
		var dataPalette = response.val();
		//csInterface.evalScript("alert('"+JSON.stringify(dataPalette)+"')");
		localStorage.setItem("dataPaletteOriginal", JSON.stringify(dataPalette));
		dataPalette.sort(function(a,b){
			return (a.orderId>b.orderId)? 1 : (- 1) ;
		})
		localStorage.setItem("dataPalette", JSON.stringify(dataPalette));
		createPaletteColor(dataPalette,0,"",undefined,language.toLowerCase());
		reloadActive();
		callback();
		//editMockAPI('https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch');
	});
}

//------PUT DATA---------
function firebasePatchdata(dataPalette, dirChild, type, obj, objInfo){
	var currentScroll = localStorage.getItem('currentScroll');
	currentScroll = (currentScroll==null)? window.scrollY : parseInt(currentScroll);
	$("loadingGr").style.display = "block";
	$("listPalette").style.display = "none";
	//-------
	var refData = firebase.database().ref("dataPalette" + dirChild);
	if(type=="PATCH"){
		refData.set(obj).then(function(){
			if(objInfo.method=="Add"){
				updatePalette(" Added","#007d00");
			}
			else if(objInfo.method=="Edit"){
				updatePalette(" was updated","#009aa4");
			}
			else {
				updatePalette(" was deleted","#b90000");
			}
		});
	}
	
	function updatePalette(msg, hexValue){
		var language = localStorage.getItem('language').toLowerCase();
		if(language==null){language="EN";}
		$("loadingGr").style.display = "none";
		$("listPalette").style.display = "block";
		clearNode();
		localStorage.setItem("dataPaletteOriginal", JSON.stringify(dataPalette));
		dataPalette.sort(function(a,b){
			return (a.orderId>b.orderId)? 1 : (- 1) ;
		})
		localStorage.setItem("dataPalette", JSON.stringify(dataPalette));
		createPaletteColor(dataPalette,0,"", undefined,language);
		try{reloadActive();}catch(err){};
		var nameObj = (objInfo.name==undefined)? obj.name[language] : objInfo.name;
		csInterface.evalScript("(function(){return $.getenv('USERNAME');})()",function(userName){
			showMessage(nameObj + msg +" ("+userName+")", hexValue,"send");
			window.scrollTo(0,currentScroll);
		});
	}
}
function patchData(dataPalette, index, type, obj, objInfo){
	//----//
	var currentScroll = localStorage.getItem('currentScroll');
	currentScroll = (currentScroll==null)? window.scrollY : parseInt(currentScroll);
	$("loadingGr").style.display = "block";
	$("listPalette").style.display = "none";
	//---------------------
	var request = new XMLHttpRequest();
	var url = 'https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch';
	if(type =="PATCH"){
		request.open("DELETE", url+"/"+dataPalette[index].id, true);
		request.onload = function(){
			if(request.readyState==4 && request.status==200){
				var xhr = new XMLHttpRequest();
				xhr.open("POST",url, true);
				xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
				xhr.onload = function(){
					if(xhr.readyState==4 && xhr.status==201){
						var xhr2 = new XMLHttpRequest();
						xhr2.open('GET', url, true);
						xhr2.onload = function(){
							if(xhr2.readyState==4 && xhr2.status==200){
								dataPalette = JSON.parse(xhr2.responseText);
								dataPalette.sort(function(a,b){
									return (a.orderId>b.orderId)? 1 : (- 1) ;
								});
								if(objInfo!=undefined && objInfo.method=="Edit"){
									updatePalette(" was updated","#009aa4");
								}
								else{
									updatePalette(" was deleted","#b90000");
								}
								//location.reload();
							}
							//else{alert("err GET");}
						}
						xhr2.send();
					}
					//else{alert("err POST");}
				}
				xhr.send(JSON.stringify(dataPalette[index]));
			}
			else{
				alert("Error " +  dataPalette[index].id);
			}
		}
		request.send(null);
	}
	else if(type == "DELETE"){
		request.open("DELETE", url+"/"+obj.id, true);
		request.onload = function(){
			if(request.readyState==4 && request.status==200){
				updatePalette(" was deleted","#b90000");
			}
		}
		request.send(null);
	}
	else if(type=="PUT"){
		request.open("PUT",url+"/"+dataPalette[index].id, true);
		request.setRequestHeader('Content-type','application/json; charset=utf-8');
		request.onload = function(){
			if(request.readyState==4 && request.status==200){
				//alert("success");
				updatePalette(" Added","#007d00");
				//location.reload();
			}
			else{
				alert(request.status);
			}
		}
		request.send(JSON.stringify(dataPalette[index]));
	}
	else{
		request.open("POST", url, true);
		request.setRequestHeader('Content-type','application/json; charset=utf-8');
		request.onload = function(){
			obj.id = JSON.parse(request.responseText).id;
			updatePalette(" Added","#007d00");
		}
		request.send(JSON.stringify(obj));
	}
	function updatePalette(msg, hexValue){
		var language = localStorage.getItem('language').toLowerCase();
		if(language==null){language="EN";}
		$("loadingGr").style.display = "none";
		$("listPalette").style.display = "block";
		clearNode();
		createPaletteColor(dataPalette,0,"", undefined,language);
		try{reloadActive();}catch(err){};
		showMessage(obj.name[language] + msg, hexValue,"send");
		localStorage.setItem("dataPalette", JSON.stringify(dataPalette));
		window.scrollTo(0,currentScroll);
	}
}
//---
function showMessage(msg,hexValue,mode){
	$("inforStatus").innerHTML = msg;
	$("inforStatus").style.color = hexValue;
	// send  msg server----
	if(mode=="send"){
		var obj = {
			updateTool: {status:false,version:localStorage.getItem('versionInfor'), url:""},
			msg: msg,
			hexValue: hexValue,
			macAddress: localStorage.getItem("macAddress"),
			logTime: (new Date()).toGMTString(),
		};
		var xhr = new XMLHttpRequest();
		xhr.open("PUT","https://5f34126b9124200016e18691.mockapi.io/messageListener/0",true);
		xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
		xhr.onload = function(){
			if(xhr.readyState==4 && xhr.status==200){
				//alert("has send");
			}
		}
		//xhr.send(JSON.stringify(obj));
	}
	///---------------
	if(mode=="receive"){
		$("navBar").style.background = hexValue;
		$("inforStatus").style.color = "#ffffff";
	}
	setTimeout(function(){
		$("inforStatus").innerHTML = "Punch Project";
		$("inforStatus").style.color = "#cacaca";
		$("navBar").style.background = "#292151";
	}, 2000);
}
//
function listenerStatus(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET","https://5f34126b9124200016e18691.mockapi.io/messageListener/0");
	xhr.onload = function(){
		if(xhr.readyState==4 && xhr.status==200){
			var msgUpdate = localStorage.getItem("msgUpdate");
			var macAddress = localStorage.getItem("macAddress");
			var objMsg = JSON.parse(xhr.responseText);
			if(msgUpdate!=null && objMsg.macAddress!=macAddress && JSON.parse(msgUpdate).logTime != objMsg.logTime){
				if(objMsg.msg=="Server changing"){
					localStorage.removeItem('punchEndPoints');
				}
				showMessage(objMsg.msg, objMsg.hexValue,"receive");
				setTimeout(function(){location.reload();}, 2000);
			}
			localStorage.setItem("msgUpdate", JSON.stringify(objMsg));
			setTimeout(function(){listenerStatus();}, 500);
		}
	}
	xhr.send();
}
//--hide context menu palette
function hideMenuPalette(){
	var arrContext = document.getElementsByClassName("contextMenu");
	for(var i=0; i<arrContext.length; i++){
		arrContext[i].style.cssText = "display: none;";
	}
	var arrListDiv = document.getElementsByClassName("palette");
	for(var j=0; j<arrListDiv.length; j++ ){
		arrListDiv[j].style.position = "static";
	}
};
// get data from firebase
function dataTranslateSync(method, obj, url,callback){
	var refData = null;
	if(method == "GET"){
		refData = firebase.database().ref('dataTranslate');
		refData.once('value').then(function(response){
			localStorage.setItem("dataTranslate", JSON.stringify(response.val()));
		});
	}
	else{
		refData = firebase.database().ref(url);
		refData.set(obj).then(function(){
			refData = firebase.database().ref('dataTranslate');
			refData.once('value').then(function(response2){
				localStorage.setItem("dataTranslate", JSON.stringify(response2.val()));
				callback();
			});
		});
	}
	/*var refData = firebase.database().ref('dataTranslate/199');
	refData.set({name:"tyuy"});*/
};
function uploadImage(imgName,callback){
	$("loadingGr").style.display = "block";
	$("listPalette").style.display = "none";
	//---------
	var xhr = new XMLHttpRequest();
	var res = null;
	xhr.open("GET",'images/imgTemp/'+imgName+".jpg", true);
	xhr.responseType ='blob';
	xhr.onload = function(){
		console.log(xhr.response);
		var metadata = {
		  contentType: 'image/jpeg'
		};
		var storeRef = firebase.storage().ref();
		var imgUp = storeRef.child("Punch/"+imgName+".jpg").put(xhr.response, metadata);
		console.log(imgUp);
		imgUp.on('state_changed',null, null, function(){
			imgUp.snapshot.ref.getDownloadURL().then(function(url) {
				console.log(url);
				callback(url);
			});
		})
	}
	xhr.send();
};
function updateToolbox(){
	var xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.open("GET", "https://5f34126b9124200016e18691.mockapi.io/messageListener", true);
	xhr.onload = function(){
		if(xhr.readyState==4 && xhr.status == 200){
			var currentVersion = localStorage.getItem('versionInfor');
			var objMsg = xhr.response[0], listenUpdate = true;
			csInterface.evalScript("installToolbox('CheckLog')", function(logver){
				if(logver!=objMsg.updateTool.version && objMsg.updateTool.status){
					downloadTool(function(size){
						csInterface.evalScript("installToolbox("+size+")", function(){
							//
						});
					});
				}
				else{
					localStorage.setItem('versionInfor', objMsg.updateTool.version);
				}
			});
		}
	}
	xhr.send();
	//  method download toolbox
	function downloadTool(callback){
		var storage = firebase.storage();
		storage.ref('App/Toolbox.exe').getDownloadURL().then(function(url){
			var xhr = new XMLHttpRequest();
			xhr.responseType = "blob";
			xhr.open("GET", url, true);
			xhr.onload = function(){
				if(xhr.readyState==4 && xhr.status == 200){
					var objUrl = window.URL.createObjectURL(xhr.response);
					$("updateLink").href = objUrl;
					callback(xhr.response.size);
				}
			}
			xhr.send();
		})
	}
};
function getEndpoints(callback){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'https://5f34126b9124200016e18691.mockapi.io/PunchEndpoints/0',true);
	xhr.responseType='json';
	xhr.onload = function(){
		if(xhr.readyState==4 && xhr.status==200){
			callback(xhr.response);
		}
	}
	xhr.send();
}
//----------------------------
window.onload =function(){
	var versionInfor = localStorage.getItem('versionInfor');
	$('inforVersion').innerHTML = 'Version '+ versionInfor;
	//---Get current Username
	csInterface.evalScript("getMACAddress()", function(response){
		localStorage.setItem("macAddress", response);
	});
	//check Endpoint
	var config = null;
	var punchEndPoints = localStorage.getItem('punchEndPoints');
	if(punchEndPoints != null){
		punchEndPoints = JSON.parse(punchEndPoints);
		config = punchEndPoints.data[punchEndPoints.activedServer];
		initData();
	}
	else{
		getEndpoints(function(response){
			config = response.data[response.activedServer];
			localStorage.setItem('punchEndPoints', JSON.stringify(response));
			initData();
		})
	}
	
	function initData(){
		//config firebase API
		firebase.initializeApp(config);
		//--------------------
		//Get Data ---------
		updateToolbox();
		dataTranslateSync("GET");
		//---LOAD language----
		var language = localStorage.getItem("language");
		if(language == null){
			language = "EN";
			localStorage.setItem("language", language);
		}
		$('convertLanguage').innerHTML = language;
		getData(language, function(){
			//jump to back scroll 
			var currentScroll = localStorage.getItem('currentScroll');
			currentScroll = (currentScroll==null)? window.scrollY : parseInt(currentScroll);
			window.scrollTo(0,currentScroll);
		});
		//postMockAPI('https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch')
		//Listener Update data
		listenerStatus();
	}
	
	//Import/ Export DATA
	$("importData").onclick = function(){
		csInterface.evalScript("chooseFile()", function(response){
			if(response!=""){
				localStorage.setItem("dataPalette", response);
				location.reload();
			}
		})
	}
	$("exportData").onclick = function(){
		var data = {
			titleMsg: 'Backup Data',
			message: 'Enter the sercure code',
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'both'
		};
		csInterface.evalScript("boxMessage("+JSON.stringify(data)+")", function(response){
			response = JSON.parse(response);
			if(response.action=="OK"){
				if(response.tabInp=="Khoa@7026"){
					editMockAPI("https://5e605a2dcbbe0600146cb8d7.mockapi.io/Cache","POST");
				}
				else{
					alert("Wrong code or permission is deny!");
				}
			}
		});
	}
	// Handle search
	$('searchBtn').onclick = function(){
		$('searchGr').style.display=($('searchGr').style.display=='flex')? "none" : 'flex';
	}
	//Declare variable local
	var activeSwatch = null, countSearch =0;
	$("nextSearch").onclick = function(){
		countSearch++;
		searchData(function(res){
			if(res == "/"){
				countSearch = 0;
				searchData();
			}
		});
	}

	$("searchInp").addEventListener("keyup", function(){
		countSearch = 0;
		searchData();
	});
	function searchData(callback){
		// reset color active---
		if(activeSwatch != null){
			activeSwatch.style.fill = "#343434";
		}
		//--------
		var dataPalette=JSON.parse(localStorage.getItem("dataPalette"));
		var dir = [];
		var keyword = $("searchInp").value;
		var language = localStorage.getItem("language").toLowerCase();
		//clear old active
		var arrPalette = document.getElementsByClassName("palette");
		for(var i=0;i<arrPalette.length;i++){
			arrPalette[i].children[1].style.color = '#a7a7a7';
			if(arrPalette[i].children[3]!=undefined){
				arrPalette[i].children[3].style.display = "none";
			}
			if(arrPalette[i].children[4]!=undefined){
				arrPalette[i].children[4].style.display = "none";
			}
		}
		//-----------------
		var hasFound = false, arrPosition=[], count = countSearch;
		search(dataPalette);
		function search(arrData){
			for(var i=0;i<arrData.length || hasFound; i++){
				if(hasFound){
					dir.push(arrData[i - 1].name[language]);
					arrPosition.push({arrSw:arrData[i - 1].arrSwatches, index: i});
					break;
				}
				if(arrData[i].name[language].toLowerCase().search(keyword.toLowerCase()) != (- 1)){
					if(count>0){
						count--;
						continue;
					}
					dir.push(arrData[i].name[language]);
					arrPosition.push({arrSw:arrData[i].arrSwatches, index: i});
					hasFound = true;
					break;
				}
				else{
					if(arrData[i].arrSwatches != undefined){
						for(var j=0 ; j<arrData[i].arrSwatches.length; j++){
							if(arrData[i].arrSwatches[j].inforSw[language].toLowerCase().search(keyword.toLowerCase()) != (- 1)){
								if(count>0){
									count--;
									continue;
								}
								dir.push(arrData[i].name[language]);
								arrPosition.push({arrSw:arrData[i].arrSwatches, index: i , indexSw: j});
								hasFound = true;
								break;
							}
						}
					}
					if(hasFound){
						break;
					}
					else if(arrData[i].data != undefined && arrData[i].data.length > 0){
						search(arrData[i].data);
					}
				}
			}
		}
		dir = "/" + dir.reverse().join("/");
		//alert(dir);
		if(dir != "/"){
			localStorage.setItem("paletteActive",dir);
			reloadActive(arrPosition[0].indexSw, function(res){
				activeSwatch = res;
			});
		}
		// jump positon
		arrPosition = arrPosition.reverse();
		var position = 0;
		for(var i=0;i<arrPosition.length; i++){
			var spaceArrSw = 0;
			if(arrPosition[i].arrSw != undefined){
				spaceArrSw = parseInt(arrPosition[i].arrSw.length/12) * 16;
			}
			position += (arrPosition[i].index * 16) + spaceArrSw;
		}
		window.scrollTo(0, position);
		callback(dir);
	}
	// Handle Menu Panel
	document.body.onclick = function(e){
		if(e.target.parentElement.id == "menuPanel"){
			$('listPanel').style.display = ($('listPanel').style.display=='block')? 'none' : 'block';
		}
		else{
			$('listPanel').style.display = 'none';
		}
	}
	for(var i=0; i<$('listPanel').children.length; i++){
		$('listPanel').children[i].onclick = function(e){
			if(e.target.getAttribute('data-content')=="swatchesPanel"){
				location.href = "manageSwatches.html";
			}
			else{
				location.href = "index.html";
			}
			localStorage.setItem('currentPanel', e.target.getAttribute('data-content') );
		}
	}
	//LOAD Palette color
	//localStorage.removeItem('paletteActive');
	/*var dataPalette = localStorage.getItem('dataPalette');
	if(dataPalette!="null" && dataPalette != null){
		createPaletteColor(JSON.parse(dataPalette),0,"");
	}
	else{
		localStorage.removeItem('dataPalette');
	}
	//LOAD swatches
	var listPalette = localStorage.getItem('listPalette');
	if(listPalette != null && listPalette!="null"){
		createSwatches(JSON.parse(listPalette));
	}
	else{
		localStorage.removeItem('listPalette');
	}*/
	//handle Add palette color
	$('addGrSw').onclick = function(){
		var dataPalette = localStorage.getItem('dataPaletteOriginal');
		dataPalette=(dataPalette==null)? [] : (JSON.parse(dataPalette));
		var dataForBox = {
			titleMsg: 'New Palette',
			message: 'Enter the palette name',
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'both'
		};
		csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")", function(response){
			response = JSON.parse(response);
			if(response.action=="OK"){
				var namePalette = response.tabInp;
				var dataTranslate = JSON.parse(localStorage.getItem('dataTranslate'));
				var language = localStorage.getItem("language").toLowerCase();

				var paletteActive = localStorage.getItem('paletteActive');
				var obj = {
					name: namePalette,
					type: 'palette',
					data: []
				}
				compare(obj, dataTranslate, "name", language);
				if(obj.name.en=="" || obj.name.vn=="" || obj.name.jp==""){
					csInterface.evalScript("addDataTranslate("+JSON.stringify(obj.name)+", '"+language+"')", function(response){
						if(response!=null){
							response = JSON.parse(response);
							dataTranslateSync("POST", response,'dataTranslate/'+ dataTranslate.length);
							obj.name = response;
							editData();
						}
					})
				}
				else{
					editData();
				}
				function editData(){
					if(paletteActive!=null){
						paletteActive = paletteActive.split("/");
						if(paletteActive[0]==""){
							paletteActive.splice(0,1);
						}
						var paletteTemp = {};
						var arrData = dataPalette;
						var dirChild = "";
						for(var i=0; i<paletteActive.length; i++){
							for(var j=0; j<arrData.length; j++){
								if(paletteActive[i]== arrData[j].name[language]){
									dirChild += "/"+j+ "/data";
									paletteTemp = arrData[j];
									arrData = (arrData[j].data==undefined)? [] : arrData[j].data;
									break;
								}
							}
							if(i+1 == paletteActive.length){
								dirChild += "/"+ arrData.length;
							}
						}
						//-------check name palette--------
						paletteTemp.data = (paletteTemp.data==undefined)? [] : paletteTemp.data;
						for(var i=0;i<paletteTemp.data.length; i++){
							if(obj.name[language].toLowerCase()==paletteTemp.data[i].name[language].toLowerCase()){
								csInterface.evalScript("messageOnly( '"+obj.name[language]+" palette a already exist in "+paletteTemp.name[language].toUpperCase()+" !', 'Error')");
								return;
							}
						}
						paletteTemp.data.push(obj);
						//--PUT data---
						firebasePatchdata(dataPalette, dirChild, "PATCH",obj, {name:obj.name[language], method: 'Add'});
						/*for(var i=0; i<dataPalette.length; i++){
							if(paletteActive[0] == dataPalette[i].name[language]){
								//alert(JSON.stringify(dirChild));
								firebasePatchdata(dataPalette, i, "PATCH",obj, {name:obj.name[language], method: 'Add'});
								//patchData(dataPalette, i, "PUT",obj);
								break;
							}
						}*/
						//---------
						localStorage.setItem("paletteActive", "/"+paletteActive.join("/")+"/"+obj.name[language]);
					}
					else{
						//-------check name palette--------
						for(var i=0;i<dataPalette.length; i++){
							if(obj.name[language].toLowerCase()==dataPalette[i].name[language].toLowerCase()){
								csInterface.evalScript("messageOnly('"+obj.name[language]+" palette has exist!', 'Error')");
								return;
							}
						}
						obj.orderId = dataPalette[dataPalette.length - 1].orderId + 1,
						dataPalette.push(obj);
						var orderPalette = localStorage.getItem("orderPalette");
						localStorage.setItem("paletteActive","/"+obj.name[language]);
						firebasePatchdata(dataPalette,("/" + (dataPalette.length - 1)) , "PATCH",obj, {name:obj.name[language], method: 'Add'});
						//patchData(dataPalette,null,"POST",obj);
						//---Post data---------
						/*var request = new XMLHttpRequest();
						request.open("POST", "https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch", true);
						request.setRequestHeader('Content-type','application/json; charset=utf-8');
						request.onload = function(){
							if(request.readyState==4 && request.status==201){
								//alert(JSON.parse(request.responseText).id);
								obj.id = JSON.parse(request.responseText).id;
								showMessage("Added palette");
								localStorage.setItem("paletteActive","/"+obj.name);
								location.reload();
							}
						}
						request.send(JSON.stringify(obj));*/
					}
					//createPaletteColor(dataPalette,0,"");
				}
			}
		});
	}
	//Handle Add swatches
	$("addSwatches").onclick = function(){
		var dataPalette = localStorage.getItem('dataPaletteOriginal');
		dataPalette=(dataPalette==null)? [] : (JSON.parse(dataPalette));
		var paletteActive = localStorage.getItem('paletteActive');
		var language = localStorage.getItem("language").toLowerCase();
		var dataTranslate = JSON.parse(localStorage.getItem("dataTranslate"));
		var dataForBox = {
			titleMsg: 'New Swatches',
			message: 'Information for swatches',
			listObj: {label: "Blend mode:", arrItems:["Normal","Dissolve","Multiply","Color Burn","Linear Burn","Darker Color","Lighten","Screen","Color Dodge","Linear Dodge","Lighter Color","Overlay","Soft Light","Hard Light","Vivid Light","Linear Light","Pin Light","Hard Mix","Difference","Exclusion","Subtract","Divide","Hue","Saturation","Color","Luminosity"]},
			inputObj:[{name: "Opacity:", value:100}],
			checkBoxObjs : [{name:"Create Clipping Mask", value:false}],
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'both'
		};
		var objPaletteActive = {value:paletteActive};
		csInterface.evalScript("addSwatches("+JSON.stringify(dataForBox)+",undefined,"+JSON.stringify(objPaletteActive)+")",function(response){
			if(paletteActive!=null && response != ""){
				response = JSON.parse(response);
				paletteActive = paletteActive.split("/");
				if(paletteActive[0]==""){
					paletteActive.splice(0,1);
				}
				var paletteTemp = {};
				var arrData = dataPalette, dirChild = "";
				for(var i=0; i<paletteActive.length; i++){
					for(var j=0; j<arrData.length; j++){
						if(paletteActive[i]== arrData[j].name[language]){
							dirChild += "/" + j;
							if(i+1 == paletteActive.length){
								dirChild += "/arrSwatches" + "/" + ((arrData[j].arrSwatches==undefined)? 0 : arrData[j].arrSwatches.length);
							}
							else{
								dirChild += "/data";
							}
							paletteTemp = arrData[j];
							arrData =(arrData[j].data==undefined)? [] : arrData[j].data;
							break;
						}
					}
				}
				compare(response, dataTranslate, "inforSw", language);
				if(response.inforSw.en=="" || response.inforSw.vn=="" || response.inforSw.jp==""){
					csInterface.evalScript("addDataTranslate("+JSON.stringify(response.inforSw)+", '"+language+"')",function(response2){
						response2 = JSON.parse(response2);
						if(response2!=null){
							dataTranslateSync("POST", response2,'dataTranslate/'+ dataTranslate.length);
							response.inforSw = response2;
							editData();
						}
					})
				}
				else{
					editData();
				}
				function editData(){
					var arrSwatches=(paletteTemp.arrSwatches == undefined)? [] : paletteTemp.arrSwatches;
					arrSwatches.push(response);
					paletteTemp.arrSwatches = arrSwatches;
					//Put ---server
					firebasePatchdata(dataPalette, dirChild, "PATCH",response,{name: response.inforSw[language], method: 'Add'});
					/*for(var i=0; i< dataPalette.length; i++){
						if(paletteActive[0] == dataPalette[i].name[language]){
							firebasePatchdata(dataPalette, i, "PATCH",paletteTemp,{name: response.inforSw[language], method: 'Add'});
							//patchData(dataPalette, i, "PUT",{name: response.inforSw});
							break;
						}
					}*/
				}
			}
		});
	}
	//handle action swatches DELETE & EDIT
	var arrActionSw = $("menuSw").children;
	for(var i=0; i< arrActionSw.length; i++){
		arrActionSw[i].onclick = function(e){
			var activeSwatch = localStorage.getItem("activeSwatch");
			activeSwatch = JSON.parse(activeSwatch);
			var paletteActive = activeSwatch.uri;
			var dataPalette = localStorage.getItem('dataPaletteOriginal');
			dataPalette = JSON.parse(dataPalette);
			var language = localStorage.getItem("language").toLowerCase();
			var dataTranslate = JSON.parse(localStorage.getItem("dataTranslate"));

			paletteActive = paletteActive.split("/");
			if(paletteActive[0]==""){
				paletteActive.splice(0,1);
			}
			var arrData = dataPalette;
			var paletteTemp = null, k = null, dirChild="";
			for(var i=0; i<paletteActive.length; i++){
				for(var j=0; j<arrData.length; j++){
					if(paletteActive[i]== arrData[j].name[language]){
						dirChild += "/" + j;
						k = j;
						paletteTemp = arrData[j];
						arrData = (arrData[j].data==undefined)? [] : arrData[j].data;
					}
				}
				dirChild += (i+1 == paletteActive.length)? "/arrSwatches" : "/data";
			}
			// add index swatches to dirChild
			dirChild += "/" + activeSwatch.index;

			if(this.innerHTML=="Detele"){
				if(paletteTemp!=null){
					var dataForBox = {
						titleMsg: 'Confirm dialog',
						message: 'Are you sure delete swatch?',
						btnLabel1: 'OK',
						btnLabel2: 'Cancel',
						mode: 'notify'
					};
					csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")",function(response){
						response = JSON.parse(response);
						if(response.action=="OK"){
							var swDel = paletteTemp.arrSwatches[activeSwatch.index];
							paletteTemp.arrSwatches.splice(activeSwatch.index, 1);
							//update data-----------------------------
							dirChild = dirChild.split("/");
							dirChild = dirChild.reverse().slice(1).reverse().join("/");
							firebasePatchdata(dataPalette, dirChild, "PATCH", paletteTemp.arrSwatches, {name: swDel.inforSw[language], method:"Detele"});
							localStorage.removeItem('activeSwatch');
							/*for(var k=0; k<dataPalette.length; k++){
								if(paletteActive[0] == dataPalette[k].name[language]){
									firebasePatchdata(dataPalette, k, "PATCH", paletteTemp, {name: swDel.inforSw[language], method:"Detele"});
									//patchData(dataPalette, k, "PATCH", paletteTemp, {name: swDel.inforSw, method:"Detele"});
									break;
								}
							}
							localStorage.removeItem('activeSwatch');*/
						}
					})
				}
			}
			else if(this.innerHTML=="Edit"){
				var dataForBox = {
					titleMsg: 'Edit Swatch',
					message: 'Information for swatches',
					inputText: paletteTemp.arrSwatches[activeSwatch.index].inforSw[language],
					listObj: {
						label: "Blend mode:", 
						arrItems:["Normal","Dissolve","Multiply","Color Burn","Linear Burn","Darker Color","Lighten","Screen","Color Dodge","Linear Dodge","Lighter Color","Overlay","Soft Light","Hard Light","Vivid Light","Linear Light","Pin Light","Hard Mix","Difference","Exclusion","Subtract","Divide","Hue","Saturation","Color","Luminosity"], 
						selectedItem: paletteTemp.arrSwatches[activeSwatch.index].blendMode
					},
					inputObj:[{name: "Opacity:", value:paletteTemp.arrSwatches[activeSwatch.index].opacity}],
					checkBoxObjs : [{name:"Create Clipping Mask", value:paletteTemp.arrSwatches[activeSwatch.index].clippingMask}],
					btnLabel1: 'OK',
					btnLabel2: 'Cancel',
					mode: 'both'
				};
				var rgbObj = paletteTemp.arrSwatches[activeSwatch.index].rgbObj;
				csInterface.evalScript("addSwatches("+JSON.stringify(dataForBox)+", "+JSON.stringify(rgbObj)+")",function(response){
					if(response!=""){
						response = JSON.parse(response);
						compare(response, dataTranslate, "inforSw", language);
						if(response.inforSw.en=="" || response.inforSw.vn=="" || response.inforSw.jp==""){
							csInterface.evalScript("addDataTranslate("+JSON.stringify(response.inforSw)+", '"+language+"')",function(response2){
								response2 = JSON.parse(response2);
								if(response2!=null){
									response.inforSw = response2;
									dataTranslateSync("POST", response2, 'dataTranslate/'+ dataTranslate.length);
									editData();
								}
							})
						}
						else{
							editData();
						}
						function editData(){
							paletteTemp.arrSwatches[activeSwatch.index] = response;	
							firebasePatchdata(dataPalette, dirChild, "PATCH", response, {name: response.inforSw[language], method:"Edit"});					
							/*for(var i=0; i<dataPalette.length; i++){
								if(paletteActive[0] == dataPalette[i].name[language]){
									firebasePatchdata(dataPalette, i, "PATCH", paletteTemp, {name: response.inforSw[language], method:"Edit"});
									//patchData(dataPalette, i, "PATCH",paletteTemp, {name: response.inforSw, method:"Edit"});
									break;
								}
							}*/
							localStorage.removeItem('activeSwatch');
							//localStorage.setItem('dataPalette', JSON.stringify(dataPalette));
							//location.reload();
						}
					}
				});
			}
		}
	}
	//control language
	$('convertLanguage').onclick = function(){
		if(this.innerHTML == "EN"){
			this.innerHTML = "VN";
		}
		else if(this.innerHTML == "JP"){
			this.innerHTML = "EN";
		}
		else{
			this.innerHTML = "JP";
		}
		localStorage.setItem('language', this.innerHTML);
		location.reload();
	}
	// Rename Layers
	$("btnRenameTrans").onclick = function(){
		var dataTranslate =localStorage.getItem("dataTranslate");
		var punchEndPoints = localStorage.getItem('punchEndPoints');
		var language = localStorage.getItem('language');
		csInterface.evalScript("renameLayes("+dataTranslate+", '"+language+"', "+punchEndPoints+")", function(response){
			response = JSON.parse(response);
			if(response != null){
				if(response.dataTranslate != undefined){
					for(var i=0; i< response.dataTranslate.length; i++){
						if(response.dataTranslate[i].en=="" && response.dataTranslate[i].vn=="" && response.dataTranslate[i].jp==""){
							response.splice(i,1);
							i--;
						}
					}
					dataTranslateSync("POST",response.dataTranslate, 'dataTranslate', function(){
						showMessage("Update data!", "#e5c200", "send");
						dataTranslateSync("GET");
					});
				}
				if(response.punchEndPoints != undefined){
					//alert(response.punchEndPoints.activedServer);
					var xhr = new XMLHttpRequest();
					xhr.open("PUT","https://5f34126b9124200016e18691.mockapi.io/PunchEndpoints/0", true);
					xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
					xhr.onload = function(){
						if(xhr.readyState==4 && xhr.status==200){
							showMessage("Server changing...", "#c2b200","send");
							localStorage.removeItem('punchEndPoints');
							location.reload();
						}
					}
					xhr.send(JSON.stringify(response.punchEndPoints));
				}
			}
		});
	}
	//Hidden contextMenu
	var bodyTag = document.getElementsByTagName("body")[0];
	bodyTag.addEventListener("mouseover", function(e){
 		if(e.target.tagName == "rect" || e.target.tagName == "path"){
 			$("contentInfSw").innerHTML = e.target.parentElement.getAttribute("data-infoSw");
 			$("inforSwatches").style.display = "block";
 			$("inforSwatches").style.position = "absolute";
 			var xMove = (80-event.clientX)/5;
 			//alert(xMove);
 			$("inforSwatches").style.top = window.scrollY+ 15+ event.clientY + "px";
 			$("inforSwatches").style.left = window.scrollX+ (xMove)+ event.clientX + "px";
 			$("inforSwatches").style.boxShadow = '0 0 3px #131313';
 		}
 		else{
 			$("contentInfSw").innerHTML = "";
 			$("inforSwatches").style.display = "none";
 		}
 		if(e.target.getAttribute("class") == "palette"){
 			e.stopPropagation();
 			var arrDivPalette = document.getElementsByClassName("palette");
 			for(var i=0; i<arrDivPalette.length;i++){
 				arrDivPalette[i].style.background = 'inherit';
 			}
 			e.target.style.background = "#3d3c3c";
 		}
 		else{
 			var arrDivPalette = document.getElementsByClassName("palette");
 			for(var i=0; i<arrDivPalette.length;i++){
 				arrDivPalette[i].style.background = 'inherit';
 			}
 		}
	})
	bodyTag.addEventListener("click", function(e){
		hideMenuPalette();
		if(e.target.getAttribute("id")!= "menuSw"){
			$("menuSw").style.display = "none";
		}
		if(e.target.getAttribute("id")=="navBar" || e.target.getAttribute("id")=='languageControl'){
			localStorage.removeItem("paletteActive");
			var arrPalette = document.getElementsByClassName("palette");
			for(var i=0;i<arrPalette.length;i++){
				arrPalette[i].children[1].style.color = '#a7a7a7';
			}
		}
	})
	//---scroll----
	bodyTag.onscroll = function(){
		localStorage.setItem('currentScroll', window.scrollY);
		if(window.scrollY>20){
			$("navBar").style.boxShadow = "0 2px 8px #232323";
		}
		else{
			$("navBar").style.boxShadow = "none";
		}
	}
}
//----- Edit MOCK API
function postMockAPI(url,type){
	csInterface.evalScript("loadDataManual()",function(response){
		response = JSON.parse(response);
		var dataPalette = JSON.parse(response.dataPalette);
		var dataTranslate = JSON.parse(response.dataTranslate);
		updateDatabase(dataPalette, dataTranslate, url, 'POST');
	});
};
function editMockAPI(url,method){
	var dataPalette = JSON.parse(localStorage.getItem("dataPalette"));
	var dataTranslate = JSON.parse(localStorage.getItem("dataTranslate"));
	updateDatabase(dataPalette, dataTranslate, url, method);
	//location.reload();
}
function updateDatabase(dataPalette, dataTranslate, url, method){
	addChild(dataPalette, dataTranslate);
	putData(0);
	function putData(index){
		var xhr = new XMLHttpRequest();
		var statusCode=201, strId="";

		if(method=="PUT"){
			strId = "/" + dataPalette[index].id;
			statusCode = 200;
		}

		xhr.open(method, url + strId, true);
		xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
		xhr.onload = function(){
			if(xhr.readyState==4 && xhr.status==statusCode){
				console.log("done");
				index++;
				if(index < dataPalette.length){
					putData(index);
				}
				else{
					alert("success");
				}
			}
			else{
				console.log('err');
			}
		}
		xhr.send(JSON.stringify(dataPalette[index]));
	}
}
function addChild(arrData, dataTranslate){
	for(var i=0; i<arrData.length; i++){
		compare(arrData[i], dataTranslate, "name", "en");
		if(arrData[i].arrSwatches != undefined){
			for(var j = 0; j<arrData[i].arrSwatches.length; j++){
				compare(arrData[i].arrSwatches[j], dataTranslate, "inforSw", "en");
			}
		}
		if(arrData[i].data.length > 0){
			addChild(arrData[i].data, dataTranslate);
		}
	}
}
function compare(obj, dataTranslate, property, language){
	var strName = (typeof obj[property] == "string")? obj[property] : obj[property][language];
	var orgName = strName;
	var indexBracket = strName.search(/\(/);
	var strBracket = "", numOfStr = "";
	if(indexBracket != (- 1)){
		strName = orgName.split("(")[0];
		strBracket = orgName.substr(indexBracket);
	}
	strName = strName.trim();
	if(strName.search(/\d/) != (- 1)){
		numOfStr =" " + strName.match(/\d/g).join("");
		strName = strName.replace(/\d/g,"").trim();
	}
	var arrStrName = strName.split("_");
	var objArr={ en:[], vn:[], jp:[]};
	for(var i =0; i<arrStrName.length; i++){
		var hasFound = false, subIndex = null;
		var objName_1 = arrStrName[i].toLowerCase();
		var objName_2 = objName_1 + "s";
		var objName_3 = removeSign(objName_1);
		for(var j=0; j<dataTranslate.length; j++){
			var transObj = dataTranslate[j][language].toLowerCase();
			if( objName_1==transObj || objName_2==transObj){
				objArr.en.push(dataTranslate[j].en);
				objArr.vn.push(dataTranslate[j].vn);
				objArr.jp.push(dataTranslate[j].jp);
				hasFound = true;
				break;
			}
			else if(objName_3==removeSign(transObj)){
				subIndex = j;
			}
		}
		if(!hasFound){
			if(subIndex != null){
				objArr.en.push(dataTranslate[subIndex].en);
				objArr.vn.push(dataTranslate[subIndex].vn);
				objArr.jp.push(dataTranslate[subIndex].jp);
			}
			else{
				objArr[language].push(arrStrName[i]);
			}
		}
	}
	if(!hasFound && arrStrName[0]!=""){
		numOfStr ="";
		strBracket="";
	}
	obj[property] = {
		en: objArr.en.join("_") + numOfStr + strBracket,
		vn: objArr.vn.join("_") + numOfStr + strBracket,
		jp: objArr.jp.join("_") + numOfStr + strBracket
	}
}
function removeSign(str){
    str=str.toLowerCase()
    str=str.replace(/ã|ạ|ả|â|ă|ẩ|ẫ|ậ|ẳ|ẵ|ặ|à|á|ắ|ằ|ầ|ắ/gi, 'a')
    str=str.replace(/ọ|ỏ|õ|ô|ổ|ỗ|ộ|ơ|ở|ỡ|ợ|ò|ó|ờ|ớ|ồ|ố/gi, 'o')
    str=str.replace(/ẻ|ẽ|ẹ|ê|ể|ễ|ệ|è|é|ề|ế/gi, 'e')
    str=str.replace(/ũ|ủ|ư|ụ|ử|ữ|ự|ù|ú|ừ|ứ/gi, 'u')
    str=str.replace(/ỷ|ỹ|ỵ|ỳ|ý/gi, 'y')
    str=str.replace(/ỉ|ĩ|ị|ì|í/gi, 'i')
    str=str.replace(/đ/gi, 'd')
    return(str);
}