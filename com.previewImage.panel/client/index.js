/* Create an instance of CSInterface. */
var $ = function(id){
	return document.getElementById(id)
};
var csInterface = new CSInterface();
//Make a reference to your HTML button and add a click handler. */
//var openButton = document.querySelector("#open-button");
function showImage(objUrl,punchEndpoints, callback){
	$("panelLayer").style.display = "none";
	if(objUrl!=undefined){
		var imgTag = new Image();
		imgTag.id = "imgCurrent";
		csInterface.evalScript("GetTempImage('"+objUrl.idName+"', 'jpg')", function(dirImg){
			if(dirImg != ""){
				dirImg = dirImg.replace(/\\/gi,"/");
				localStorage.setItem("ImgDownloaded", dirImg);
				$("imgGr").appendChild(imgTag);
				imgTag.onload = function(){
					$("imgLoading").style.display = "none";
					callback();
				}
				imgTag.src = dirImg;
			}
			else{
				var newConfig = punchEndpoints.data[objUrl.serverId];
				firebase.app("bucketStorage").delete().then(function(){
					firebase.initializeApp(newConfig, "bucketStorage");
					var storeRef = firebase.app("bucketStorage").storage().ref("Punch/"+objUrl.idName+".jpg");
					storeRef.getDownloadURL().then(function(url) {
						downloadImage(url, objUrl.idName, "View",function(res){
							res = res.replace(/\\/gi,"/");
							localStorage.setItem("ImgDownloaded", res);
							$("imgGr").appendChild(imgTag);
							imgTag.onload = function(){
								$("imgLoading").style.display = "none";
								callback();
							}
							imgTag.src = res;
						})
					});
				})
			}
		});
		
	}
	else{
		$("imgLoading").style.display = "none";
		var inf = document.createElement("h4");
		inf.innerHTML = "No Image";
		$("imgGr").appendChild(inf);
		$("imgGr").style.textAlign = 'center';
		$("infor").style.display = "none";
		$("control").style.display = "none";
	}
};
function createCanvasImg(objUrl){	
	var hexValSender ="";
	var canvas = document.createElement("canvas");
	var attrId = document.createAttribute("id");
	attrId.value = "canvasImage";
	canvas.setAttributeNode(attrId);
	var context = canvas.getContext('2d');
	canvas.width = $("imgCurrent").width;
	canvas.height = $("imgCurrent").height;
	context.drawImage($("imgCurrent"),0,0,canvas.width,canvas.height);
	$("imgGr").appendChild(canvas);
	// create SVGcolor
	$("infor").style.width = $("imgCurrent").width + "px";
	var divPick = $("colorPicker");
	// divPick.setAttribute("id", "colorPicker");
	// divPick.style.width = $("imgCurrent").width + "px";
	if(divPick.children.length ==0){
		var svgColor = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgColor.setAttributeNS(null, "id", "svgColor");
		var rectNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rectNode.setAttributeNS(null, 'fill', "#4d4d4d");
		rectNode.setAttributeNS(null, 'width', '50');
		rectNode.setAttributeNS(null, 'height', '50');
		svgColor.appendChild(rectNode);
		// 
		var infoHex = document.createElement("h5");
		infoHex.setAttribute("id", "infoHex");
		infoHex.innerHTML = "#4D4D4D";
		divPick.appendChild(svgColor);
		divPick.appendChild(infoHex);
	}
	else{
		var svgColor = $("svgColor");
		var rectNode = svgColor.getElementsByTagName('rect')[0];
		var infoHex = $("infoHex");
	}
	function getRBGPoint(){
		var minusX = (document.body.clientWidth - $("imgCurrent").width - $("panelLayer").clientWidth)/2;
		var minusY = (document.body.clientHeight - ($("imgCurrent").height + 60))/2  - window.scrollY;
		var data = context.getImageData(event.clientX - minusX, event.clientY - (minusY+60), 1, 1).data;
		localStorage.setItem("rgbPosition", JSON.stringify(data));
		var newArr = []
		for(var i=0; i< data.length; i++){
			var codeColor = parseInt(data[i]).toString(16);
			if(codeColor.length<2){
				codeColor = "0" + codeColor;
			}
			newArr.push(codeColor);
		}
		hexValSender = "#" + newArr[0] + newArr[1]+ newArr[2];
		infoHex.innerHTML = hexValSender.toUpperCase();
		rectNode.setAttribute("fill", hexValSender);
		//csInterface.evalScript("showForegroundColor('"+hexVal+"')");
	}
	//------
	canvas.addEventListener("mousemove", function(){
		getRBGPoint();
	});
	canvas.onmouseleave = function(){
		document.body.style.background = '#4d4d4d';
	}
	canvas.onclick = function(){
		$("MenuImages").style.display = "none";
		csInterface.evalScript("showForegroundColor('"+hexValSender+"')");
	}
	canvas.ondblclick = function(){
		//this.removeEventListener("mousemove", function(){getRBGPoint();});
		$("MenuImages").style.display = "none";
		var rgbPosition = localStorage.getItem("rgbPosition");
		csInterface.evalScript("createColorLayer("+rgbPosition+")")
	}
	canvas.addEventListener("contextmenu", function(e){
		e.preventDefault();
		$("OpenPsd").style.display=($("panelLayer").style.display=="none")? "block" : "none";
		$("clearCache").style.display= $("panelLayer").style.display;
		$("psdUpload").innerHTML=(objUrl.psdFile != undefined)? "Delete PSD File" : "Upload PSD file";
		var posY = event.clientY + window.scrollY;
		$("MenuImages").style.cssText = "display:block; top:"+(posY)+"px; left:"+(event.clientX+15)+"px;";
	})
};
//
function downloadImage(url,filename, mode,callback){
	$("OpenInPS").style.visibility = 'hidden';
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url,true);
	xhr.responseType = "blob";
	xhr.onload = function(){
		if(xhr.readyState==4 && xhr.status==200){
			var fileSize = xhr.response.size;
			csInterface.evalScript("DownloadImage('"+url+"', "+fileSize+", 'jpg','"+filename+"')", function(res){
				$("OpenInPS").style.visibility = "visible";
				callback(res);
			});
		}
	}
	xhr.send();
};
function getEndpoints(callback){
	var config = {
		"apiKey": "AIzaSyBuW9xz0frALas8jfPRI8FNjKdAV86OhzU",
		"authDomain": "punch-end-points.firebaseapp.com",
		"databaseURL": "https://punch-end-points-default-rtdb.firebaseio.com",
		"projectId": "punch-end-points",
		"storageBucket": "punch-end-points.appspot.com",
		"messagingSenderId": "124727951574"
    };
    firebase.initializeApp(config,"punchEndpoints");
	var refData = firebase.app("punchEndpoints").database().ref("punchEndpoint");
	refData.once('value').then(function(response){
		callback(response.val());
	});
};
function DeleteZipFile(punchEndpoints,objUrl, callback){
	var configBucket = punchEndpoints.data[objUrl.psdFile.serverId];
	firebase.app("bucketStorage").delete().then(function(){
		firebase.initializeApp(configBucket, "bucketStorage");
		var storageRef = firebase.app("bucketStorage").storage().ref().child("Punch/" + objUrl.idName + ".zip");
		storageRef.delete().then(function(){
			storageRef = firebase.app("bucketStorage").storage().ref().child("Punch/" + objUrl.idName + ".json");
			storageRef.delete().then(function(){
				callback();
			});			
		}).catch(function(err){
			alert(err.e);
		});
	});
}
///////////////////////////
function createPaletteColor(arr, hierarchy, hierarchyURI, paletteSecond,language,dirChild,objThrow,arrLink,count){
	for(var i=0; i<arr.length;i++){
		var palette = document.createElement('div');
		var attrClass = document.createAttribute('class');
		attrClass.value = 'palette';
		palette.setAttributeNode(attrClass);
		var attrId = document.createAttribute('id');

		attrId.value = arr[i].name;
		palette.setAttributeNode(attrId);
		var imgPalette = document.createElement('img');
		var srcAttr = document.createAttribute("src");
		srcAttr.value = "iconSVG/palette-solid.svg";
		imgPalette.setAttributeNode(srcAttr);

		var labelPalette = document.createElement('h6');
		var dataAttr = document.createAttribute('data-uri');
		dataAttr.value = hierarchyURI + "/" + i;
		labelPalette.setAttributeNode(dataAttr);
		var namePalette =(typeof arr[i].name=="string")? arr[i].name:arr[i].name[language];
		labelPalette.innerHTML = (namePalette.length>20)? namePalette.substr(0,20):namePalette;
		//create context Menu
		var contextMenu = document.createElement("div");
		var attrClass2 = document.createAttribute("class");
		attrClass2.value = "contextMenu";
		contextMenu.setAttributeNode(attrClass2);
		//----action Create Group
		var actionCreate = document.createElement("h5");
		actionCreate.innerHTML = 'Make Group';
		contextMenu.appendChild(actionCreate);
		//----action import swatches
		var actionImportSw = document.createElement("h5");
		actionImportSw.innerHTML = 'Clone Swatches';
		contextMenu.appendChild(actionImportSw);

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
			var objRightClick = e.target;
			if(e.target.tagName == "SVG" || e.target.tagName=="H6"){
				objRightClick = e.target.parentElement;
			}
			hideMenuPalette();
			objRightClick.style.position = "relative";
			objRightClick.children[2].style.cssText = "display: block; position: absolute; top: 50%; right:10%;";
			activeFolder(this);
			sessionStorage.setItem('paletteActive', this.children[1].getAttribute('data-uri'));
		})
		//---------------
		if(hierarchy > 0){
			palette.style.marginLeft = (hierarchy*8) + "px";
			paletteSecond.appendChild(palette);
		}
		else{
			$("documentPS").appendChild(palette);
		}
		//Show list swatches
		var swatchesDiv = document.createElement("div");
		var attSwDiv = document.createAttribute("class");
		attSwDiv.value = "parentSwatches";
		swatchesDiv.setAttributeNode(attSwDiv);
		swatchesDiv.style.position = "relative";

		if(arr[i].artLayers.length > 0){
			arr[i].artLayers = arr[i].artLayers.reverse();
			for(var j=0; j< arr[i].artLayers.length; j++){
				var svgColor = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svgColor.setAttributeNS(null, "class", "svgColor");
				var objName = arr[i].artLayers[j].name;
				objName=(typeof objName=="string")? {en: objName, vn:objName, jp:objName} : objName;
				svgColor.setAttributeNS(null, "data-infoSw", objName[language]);
				svgColor.setAttributeNS(null, "data-rgbColor", JSON.stringify(arr[i].artLayers[j].color.rgb));
				svgColor.setAttributeNS(null, "data-blendMode", arr[i].artLayers[j].blendMode);
				svgColor.setAttributeNS(null, "data-opacity", arr[i].artLayers[j].opacity);
				svgColor.setAttributeNS(null, "data-clippingMask", arr[i].artLayers[j].clippingMask);
				svgColor.setAttributeNS(null, "data-invertMask", arr[i].artLayers[j].invertMask);
				svgColor.setAttributeNS(null, "data-name", JSON.stringify(objName));
				svgColor.setAttributeNS(null, "data-index", j);
				var pathNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				var rectNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				rectNode.setAttributeNS(null, 'fill', "#"+ arr[i].artLayers[j].color.rgb.hexValue);
				rectNode.setAttributeNS(null, 'width', '19');
				rectNode.setAttributeNS(null, 'height', '19');
				pathNode.setAttributeNS(null, 'd', 'M19,1v18H1V1H19 M20,0H0v20h20V0L20,0z');
				pathNode.setAttributeNS(null, 'fill', '#343434');
				svgColor.appendChild(rectNode);
				svgColor.appendChild(pathNode);
				//create div right menu
				swatchesDiv.appendChild(svgColor);
				//add image Element
				if(arr[i].artLayers[j].imgDir != "" && arr[i].artLayers[j].imgDir != null){
					var imgDir = arr[i].artLayers[j].imgDir;
					var imgElement = document.createElement("img");
					imgElement.setAttributeNS(null, "class", "imgElement");
					var idElement = imgDir.split("/").reverse()[0];
					imgElement.setAttributeNS(null, "id", idElement);
					imgElement.src = imgDir;
					$("imgGr").appendChild(imgElement);
					svgColor.setAttributeNS(null, "data-imgDir", idElement);
					delete arr[i].artLayers[j].imgDir;
				}
				//-----ADD event for swatches
				svgColor.addEventListener("click", function(e){
					e.stopPropagation();
					csInterface.evalScript("changeForeground('"+this.children[0].getAttribute("fill")+"')");
				})
				svgColor.ondblclick = function(e){
					e.stopPropagation();
					var inforSw = this.getAttribute('data-infoSw');
					var lastChar = (inforSw.indexOf("(")== - 1)? inforSw.length : inforSw.indexOf("(");
					inforSw = inforSw.substring(0, lastChar);
					csInterface.evalScript("makeSolidColor('"+inforSw+"',0,0,0, "+this.getAttribute('data-rgbColor')+", "+this.getAttribute('data-invertMask')+" ,'"+this.getAttribute('data-blendMode')+"', "+this.getAttribute('data-opacity')+", "+JSON.parse(this.getAttribute('data-clippingMask'))+")");
				}
				svgColor.addEventListener("contextmenu", function(e){
					//e.stopPropagation();
					e.preventDefault();
					var menuSw = document.getElementById("menuSw");
					menuSw.style.top = window.scrollY+ e.clientY + "px";
					var posX = event.clientX;
					if(posX> (palette.clientWidth/1.3)){
						posX = event.clientX - 50;
					}
					menuSw.style.left = posX + "px"; 
					menuSw.style.display = "block";
					handleEditSw(this,arrLink,count);			
				})
			}
			// reverse as original
			arr[i].artLayers = arr[i].artLayers.reverse();
			//-----------	
			swatchesDiv.style.marginLeft = "0.4em";
			swatchesDiv.style.display = "none";
			palette.appendChild(swatchesDiv);
		}
		//--------
		palette.onclick =  function(e){
			e.stopPropagation();
			if(e.target.getAttribute("class") =="parentSwatches"){
				return false;
			}
			var objClick = e.target;
			if(objClick.tagName == "H5"){
				this.children[2].style.display = "none";
				//----------
				switch (objClick.innerHTML) {
					case "Make Group":
						var paletteName = this.children[1].innerHTML;
						var lastChar = (paletteName.indexOf("(")== - 1)? paletteName.length : paletteName.indexOf("(");
						csInterface.evalScript("createGroup('"+paletteName.substring(0,lastChar).replace("&amp;", "&")+"')");
						break;
					case "Clone Swatches":
						//alert(this.children[3].children.length)
						if(this.children[3] != undefined){
							var dataTranslate = sessionStorage.getItem("dataTranslate");
							csInterface.evalScript("boxCloneSwatches("+JSON.stringify(objThrow)+",'"+dirChild+"')",function(paletteName){
								if(paletteName != "null"){
									var newArrSw = [];
									for(var i=0; i< this.children[3].children.length; i++){
										var rgbColor = JSON.parse(this.children[3].children[i].getAttribute("data-rgbColor"));
										var nameSw = JSON.parse(this.children[3].children[i].getAttribute("data-name"));										
										var objSw = {
											inforSw: nameSw,
											clippingMask: JSON.parse(this.children[3].children[i].getAttribute("data-clippingMask")),
											opacity:parseInt(this.children[3].children[i].getAttribute("data-opacity")),
											blendMode: this.children[3].children[i].getAttribute("data-blendMode"),
											rgbObj: {
												blue: parseInt(parseInt(rgbColor.blue).toFixed()),
												green: parseInt(parseInt(rgbColor.green).toFixed()),
												red: parseInt(parseInt(rgbColor.red).toFixed()),
												hexValue: rgbColor.hexValue
											}
										}
										newArrSw.push(objSw);							
									}
									//-----------
									var objSend = newArrSw;
									var customDirchild = dirChild;
									
									if(paletteName!=""){
										var objName = {name:paletteName};
										compare(objName, JSON.parse(dataTranslate), "name", language);
										if(objName.name.en == "" || objName.name.vn=="" || objName.name.jp==""){
											csInterface.evalScript("alert('Name not available')", function(){return;});
										}
										else{
											var CloneSwatchesCount = sessionStorage.getItem("CloneSwatchesCount");
											CloneSwatchesCount = (CloneSwatchesCount==null)? objThrow.totalChildrens : (parseInt(CloneSwatchesCount) + 1);
											var newPalette = {
												type:"palette",
												name: objName.name,
												arrSwatches: newArrSw
											}
											objSend = newPalette;
											customDirchild = customDirchild+"/data/"+CloneSwatchesCount;
											sessionStorage.setItem("CloneSwatchesCount", CloneSwatchesCount);
											putData(objSend,customDirchild);
										}
									}
									else{
										customDirchild = customDirchild+"/arrSwatches";
										var refData = firebase.app("database").database().ref('dataPalette'+ customDirchild);
										refData.once('value').then(function(response){
											if(response.val()!=null){
												objSend = response.val().concat(objSend);
											}
											putData(objSend,customDirchild);
										})
									}						
								}																																																					
							}.bind(this));	
							//send data to database
							function putData(objSend,customDirchild){
								var refData = firebase.app("database").database().ref('dataPalette'+ customDirchild);
								refData.set(objSend).then(function(){
									csInterface.evalScript("previewImage('edit', undefined, '"+dirChild+"',null, null, 'Reload')", function(res){																			
										//location.reload();
									})
								}).catch(function(err){
									alert(err);
								});
							}					
						}
						break;
					default:
						break;
				}
			}
			else{
				sessionStorage.setItem('paletteActive', this.children[1].getAttribute('data-uri'));
				activeFolder(this);
				expandChild(this);
				hideMenuPalette();
				$("PsControl").style.top = $("documentPS").clientHeight + 5 + "px";
			}	
		}
		//callBack--------------
		if(arr[i].type=='LayerSet' && arr[i].layerSets.length > 0){
			//alert("run");
			hierarchy++;
			//hierarchyURI +=  "/" + arr[i].name;
			hierarchyURI +=  "/" + i;
			var paletteSecond = document.createElement("div");
			var classAttr2 = document.createAttribute("class");
			paletteSecond.style.display = "none";
			classAttr2.value = "palette_" + hierarchy;
			paletteSecond.setAttributeNode(classAttr2);
			var parentPalette = palette;
			parentPalette.appendChild(paletteSecond);
			createPaletteColor(arr[i].layerSets, hierarchy, hierarchyURI, paletteSecond, language,dirChild,objThrow,arrLink,count);
			paletteSecond = palette.parentElement;
			hierarchy--;
			hierarchyURI = hierarchyURI.split("/");
			hierarchyURI.pop();
			hierarchyURI = hierarchyURI.join("/");
		}
	}
}
function findPositionPalette(paletteActive){
	var language = localStorage.getItem('language').toLowerCase();
	var dataPalette = sessionStorage.getItem('dataPSDlayers');
	dataPalette = JSON.parse(dataPalette).layerSets;
	paletteActive = paletteActive.split("/");
	if(paletteActive[0]==""){
		paletteActive.splice(0,1);
	}
	var arrData = dataPalette;
	var paletteTemp = null, k = null, dirChild="", objEnd;
	for(var i=0; i<paletteActive.length; i++){
		for(var j=0; j<arrData.length; j++){
			if(paletteActive[i]== arrData[j].name){
				dirChild += "/"+ j;
				k = j;
				if(i != paletteActive.length - 1){								
					paletteTemp = arrData[j];
					if(arrData[j].layerSets!=undefined){
						arrData = arrData[j].layerSets;
						dirChild += "/data";
					}
					else{
						arrData = [];
					}
				}
				else {
					objEnd = arrData[j];
				}
				break;
			}
		}
	}
	return {dataPalette: dataPalette, paletteTemp: paletteTemp, index: k, paletteActive: paletteActive, dirChild: dirChild, objEnd:objEnd};
};
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
};
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
function clearLayers(){
	var total = $("documentPS").children.length;
	for(var i=0; i< total; i++){
		$("documentPS").children[0].remove();
	}
	
	var totalImg = $("imgGr").children.length;
	for(var i=0; i< totalImg; i++){
		$("imgGr").children[0].remove();
	}
}
function clearNode(node){
	var palettes = node.children.length;
	for(var j=0; j<palettes ; j++){
		node.children[0].remove();
	}
}
// handle menu swatches
function handleEditSw(nodeSw,arrLink,count){
	var arrActionSw = $("menuSw").children;
	for(var i=0; i< arrActionSw.length; i++){
		arrActionSw[i].onclick = function(e){				
			var language = sessionStorage.getItem("language");
			var dataTranslate = JSON.parse(sessionStorage.getItem("dataTranslate"));
			var dataPSDlayers = JSON.parse(sessionStorage.getItem("dataPSDlayers"));
			var activeSwatch = {
				inforSw: nodeSw.getAttribute("data-infoSw"),
				rgbColor: JSON.parse(nodeSw.getAttribute("data-rgbColor")),
				blendMode: nodeSw.getAttribute("data-blendMode"),
				opacity: parseInt(nodeSw.getAttribute("data-opacity")),
				clippingMask: JSON.parse(nodeSw.getAttribute("data-clippingMask")),
				uri: nodeSw.getAttribute("data-uri"),
				index: parseInt(nodeSw.getAttribute("data-index"))	
			}
			var paletteActive = sessionStorage.getItem("paletteActive");
			paletteActive = paletteActive.split("/");
			paletteActive.shift();
			var objLayerSet = dataPSDlayers;
			for(var i=0; i<paletteActive.length;i++){
				objLayerSet = objLayerSet.layerSets[paletteActive[i]];
			}
			//alert(objLayerSet.artLayers[activeSwatch.index].name);
			if(this.innerHTML=="Re-Color"){
				csInterface.evalScript("changeColorFill("+JSON.stringify(activeSwatch.rgbColor)+")");
			}
			else if(this.innerHTML=="Edit"){				
				var dataForBox = {
					titleMsg: 'Edit Swatch',
					message: 'Information for swatches',
					inputText: activeSwatch.inforSw,
					listObj: {
						label: "Blend mode:", 
						arrItems:["Normal","Dissolve","Multiply","Color Burn","Linear Burn","Darker Color","Lighten","Screen","Color Dodge","Linear Dodge","Lighter Color","Overlay","Soft Light","Hard Light","Vivid Light","Linear Light","Pin Light","Hard Mix","Difference","Exclusion","Subtract","Divide","Hue","Saturation","Color","Luminosity"], 
						selectedItem: ((activeSwatch.blendMode=="undefined")? "Normal" : activeSwatch.blendMode)
					},
					inputObj:[{name: "Opacity:", value:activeSwatch.opacity}],
					checkBoxObjs : [{name:"Create Clipping Mask", value:activeSwatch.clippingMask}, {name:"Invert Mask", value:true}],
					btnLabel1: 'OK',
					btnLabel2: 'Cancel',
					mode: 'both'
				};
				var rgbObj = activeSwatch.rgbColor;
				var objNewSwSender = {nameSwatch: activeSwatch.inforSw, rgbPosition:[rgbObj.red, rgbObj.green, rgbObj.blue]};
				csInterface.evalScript("addSwatches("+JSON.stringify(dataForBox)+", undefined, "+JSON.stringify({value:'Root'})+", "+JSON.stringify(objNewSwSender)+")", function(response){
					response = JSON.parse(response);
					//----check name swatches
					var objName = {name: response.inforSw};
					compare(objName, dataTranslate, "name", language);
					if(objName.name.en=="" || objName.name.vn=="" || objName.name.jp==""){
						csInterface.evalScript("addDataTranslate("+JSON.stringify(objName.name)+", '"+language+"')", function(response2){
							response2 = JSON.parse(response2);
							if(response2!=null){
								dataTranslateSync("POST", response2,'dataTranslate/'+ dataTranslate.length);
								dataTranslate.push(response2);
								sessionStorage.setItem("dataTranslate",dataTranslate);
								process_1({name:response2});
							}
						});
					}
					else{
						process_1(objName);
					}
					function process_1(objName){
						var objPsd = arrLink[count].psdFile;			
						var objSwSelect = objLayerSet.artLayers[objLayerSet.artLayers.length - (activeSwatch.index+1)];
						objSwSelect.name = objName.name;
						objSwSelect.opacity = response.opacity;
						objSwSelect.clippingMask = response.clippingMask;
						objSwSelect.blendMode = response.blendMode;
						objSwSelect.invertMask = response.invertMask;
						uploadJsonPSD(dataPSDlayers, objPsd, function(){
							$("labelInfo").innerHTML = "Update success!";
							$("labelInfo").style.color = "#e9af00";
							setTimeout(function(){
								$("labelInfo").innerHTML = "Auto Swatches";
								$("labelInfo").style.color = "#d4d4d4";
							},2000);
							// change view current swatches
							nodeSw.setAttribute("data-infoSw", objName.name[language]);
							nodeSw.setAttribute("data-opacity", response.opacity);
							nodeSw.setAttribute("data-blendMode", response.blendMode);
							nodeSw.setAttribute("data-clippingMask", response.clippingMask);
							nodeSw.setAttribute("data-invertMask", response.invertMask);
							//----------
							sessionStorage.setItem("dataPSDlayers", JSON.stringify(dataPSDlayers));	
						})
					}
				});
			}
		}
	}
}
// fetch dataTranslate from firebase
function dataTranslateSync(method, obj, url,callback){
	var refData = null;
	if(method == "GET"){
		refData = firebase.app("database").database().ref('dataTranslate');
		refData.once('value').then(function(response){
			sessionStorage.setItem("dataTranslate", JSON.stringify(response.val()));
		});
	}
	else{
		refData = firebase.app("database").database().ref(url);
		refData.set(obj).then(function(){
			refData = firebase.database().ref('dataTranslate');
			refData.once('value').then(function(response2){
				sessionStorage.setItem("dataTranslate", JSON.stringify(response2.val()));
				callback();
			});
		});
	}
};
function uploadJsonPSD(dataPSDlayers, objPsd, callback){
	csInterface.evalScript("PsdJsonData("+JSON.stringify(dataPSDlayers)+", '"+objPsd.idName+"')", function(res){
		res = JSON.parse(res);
		var xhr = new XMLHttpRequest();
		xhr.open("GET",res.uri, true);
		xhr.responseType ='blob';
		xhr.onload = function(){
			var metadata = {
			 	contentType: 'json'
			};
			var storeRef = firebase.app("bucketStorage").storage().ref();
			storeRef.child("Punch/"+objPsd.idName+".json").put(xhr.response, metadata).then(function(){
				callback();	
			}).catch(function(err){alert(err)});
		}
		xhr.send();
	});
}
//------------------------------
window.onload = function(){
	var count = 0;
	var arrLink = [], dirChild,objThrow, punchEndpoints=null;
	$("imgLoading").style.display = "block";
	csInterface.evalScript("previewImage()", function(response){
		switch(response){
			case "Reset":
				getEndpoints(function(punchEndpoints){
					var configBucket = punchEndpoints.data[punchEndpoints.activeServer.bucketStorageActive];
					var configDatabase = punchEndpoints.data[punchEndpoints.activeServer.databaseActive];
					firebase.initializeApp(configDatabase, "database");
					firebase.initializeApp(configBucket, "bucketStorage");
					localStorage.setItem("punchEndpoints", JSON.stringify(punchEndpoints));
					csInterface.closeExtension();
				})
			break;
			//------------
			case "Reload Toolbox":
				csInterface.requestOpenExtension("com.sam.toolbox.panel");
				csInterface.closeExtension();
				break;
			//---------------
			default:
				var tempServer = localStorage.getItem("punchEndpoints");
				if(tempServer == null){
					getEndpoints(function(res){
						punchEndpoints = res;
						process_1();
					})
				}
				else{
					punchEndpoints = JSON.parse(localStorage.getItem("punchEndpoints"));
					process_1();
				}
				function process_1(){	
					var configBucket = punchEndpoints.data[punchEndpoints.activeServer.bucketStorageActive];
					var configDatabase = punchEndpoints.data[punchEndpoints.activeServer.databaseActive];
					firebase.initializeApp(configDatabase, "database");
					firebase.initializeApp(configBucket, "bucketStorage");
					arrLink = (response.split("*")[0]=="undefined")? [] : JSON.parse(response.split("*")[0]);
					dirChild = response.split("*")[1];
					objThrow = (response.split("*")[2]=="undefined")? null : JSON.parse(response.split("*")[2])
					sessionStorage.setItem("language", response.split("*")[3]);
					showImage(arrLink[count],punchEndpoints, function(){
						$("control").style.top = window.innerHeight/2 + "px";
						createCanvasImg(arrLink[count]);
					});
					$('pageNum').innerHTML = (count+1) + " of " + arrLink.length;
				}
		}
	})
	
	$("next").onclick = function(){
		if(count == arrLink.length - 1){count = - 1;}
		if(count < (arrLink.length - 1)){
			count++;
			$("imgLoading").style.display = "block";
			$("imgCurrent").remove();
			$("canvasImage").remove();
			clearLayers();
			showImage(arrLink[count],punchEndpoints, function(){
				createCanvasImg(arrLink[count]); 
			});
			$('pageNum').innerHTML = (count+1) + " of " + arrLink.length;
		}
	}
	$("previous").onclick = function(){
		if(count == 0){count = arrLink.length;}
		if(count > 0){
			count--;
			$("imgLoading").style.display = "block";
			$("imgCurrent").remove();
			$("canvasImage").remove();
			clearLayers();
			showImage(arrLink[count],punchEndpoints, function(){
				createCanvasImg(arrLink[count]);
			});
			$('pageNum').innerHTML = (count+1) + " of " + arrLink.length;
		}
	}
	$("DelImg").onclick = function(){
		var language = sessionStorage.getItem("language");
		var idImg = arrLink[count].idName + ".jpg";
		var nameFile = arrLink[count].idName;
		var dataForBox = {
			titleMsg: 'Confirm Delete',
			message: 'Do you want to delete image ' + arrLink[count].idName,
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'notify'
		};
		csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")", function(resAction){
			resAction = JSON.parse(resAction);
			if(resAction.action == "OK"){
				$("infor").style.display = "none";
				$("imgGr").style.display = "none";
				$("control").style.display = "none";
				$("imgLoading").style.display = "block";
				$("Preview").style.height = "100vh";
				//-----------
				var storageRef = firebase.app("bucketStorage").storage().ref().child("Punch/" + idImg);
				storageRef.delete().then(function(){
					if(arrLink[count].psdFile != undefined){
						DeleteZipFile(punchEndpoints, arrLink[count], function(){
							processStep2();
						})
					}
					else{
						processStep2();
					}
					function processStep2(){
						arrLink.splice(count,1);
						var refData = firebase.app("database").database().ref('dataPalette'+ dirChild + "/url");
						refData.set(arrLink).then(function(){
							var msg = "RemoveIMG" + "|" + nameFile;
							csInterface.evalScript("previewImage('edit', '"+JSON.stringify(arrLink)+"', '"+dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"', '"+msg+"')", function(res){
								location.reload();
							})
						});
					}
				}).catch(function(err){
					alert(err.e);
				});
			}
		});
	}
	$("OpenInPS").onclick = function(){
		var nameFile = localStorage.getItem("ImgDownloaded");
		csInterface.evalScript("OpenInPS('"+nameFile+"')");
	}
	//Upload PSD file
	$("psdUpload").onclick = function(){
		$("MenuImages").style.display = "none";
		var nameFile = arrLink[count].idName;
		var language = sessionStorage.getItem("language");	
		// delete file PSD
		if(arrLink[count].psdFile != undefined){
			var dataForBox = {
				titleMsg: 'Confirm Delete',
				message: 'Do you want to delete image ' + nameFile+".psd",
				btnLabel1: 'OK',
				btnLabel2: 'Cancel',
				mode: 'notify'
			};
			csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")", function(resAction){
				resAction = JSON.parse(resAction);
				if(resAction.action == "OK"){
					$("popup").style.display = "flex";
					DeleteZipFile(punchEndpoints,arrLink[count],function(){
						var refData = firebase.app("database").database().ref('dataPalette'+ dirChild + "/url/" + count+"/psdFile");
						refData.set(null).then(function(){
							delete arrLink[count].psdFile;
							csInterface.evalScript("DeletePSDFile('"+nameFile+"')", function(){
								var msg = "RemoveIMG" + "|" + nameFile;
								csInterface.evalScript("previewImage('edit', '"+JSON.stringify(arrLink)+"', '"+dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"','"+msg+"')", function(res){
									$("popup").style.display = "none";
									location.reload();
								});
							})
						})
					});
				}
			})
		}
		//upload file PSD
		else{
			csInterface.evalScript("UploadPSDfile('"+nameFile+"')", function(res){						
				if(res != ""){
					$("popup").style.display = "flex";
					res = JSON.parse(res);
					var xhr = new XMLHttpRequest();
					xhr.open("GET",res.uri, true);
					xhr.responseType ='blob';
					xhr.onload = function(){
						var metadata = {
						 	contentType: 'zip'
						};
						var configBucket = punchEndpoints.data[punchEndpoints.activeServer.bucketStorageActive];
						firebase.app("bucketStorage").delete().then(function(){
							firebase.initializeApp(configBucket, "bucketStorage");
							var storeRef = firebase.app("bucketStorage").storage().ref();
							var imgUp = storeRef.child("Punch/"+nameFile+".zip").put(xhr.response, metadata).then(function(){
								var objPsd = {
									idName: nameFile,
									size: res.fileSize,
									serverId: punchEndpoints.activeServer.bucketStorageActive
								}
								var objUrl = arrLink[count];
								objUrl.psdFile = objPsd;
								var refData = firebase.app("database").database().ref('dataPalette'+ dirChild + "/url"+"/"+ count);
								refData.set(objUrl).then(function(){
									csInterface.evalScript("RemoveZipFile('"+nameFile+"')", function(){
										csInterface.evalScript("previewImage('edit', '"+JSON.stringify(arrLink)+"', '"+dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"', 'Update IMG')", function(res){
											$("popup").style.display = "none";
											location.reload();
										});
									})
								})
							});
							
						})
					}
					xhr.send();
					//var storageRef = firebase.app("bucketStorage").storage().ref();
				}
			});
		}
	}
	$("OpenPsd").onclick = function(){
		$("MenuImages").style.display = "none";
		var objPsd = arrLink[count].psdFile;
		var language = sessionStorage.getItem("language");
		language = (language==null)? "en" : language;
		if(objPsd!=undefined){
			$("popup").style.display = "flex";
			var tabMain = document.getElementsByTagName("main")[0];
			csInterface.evalScript("GetTempImage('"+objPsd.idName+"', 'psd')", function(psdDir){
				var hasJsonPsd = true;
				var newConfig = punchEndpoints.data[objPsd.serverId];
				firebase.app("bucketStorage").delete().then(function(){
					firebase.initializeApp(newConfig, "bucketStorage");
					var storeRef = firebase.app("bucketStorage").storage().ref("Punch/"+objPsd.idName+".json");
					storeRef.getDownloadURL().then(function(url){
						var xhr = new XMLHttpRequest();
						xhr.responseType="text";
						xhr.onload =  function(){
							process_1(xhr.response);
						}
						xhr.open("GET",url,true);
						xhr.send();
					}).catch(function(err){
						hasJsonPsd = false;
						process_1();
					})
				});
				function process_1(dataPSDlayers){
					if(psdDir != ""){
						psdDir = psdDir.replace(/\\/gi, "/");
						var parentStr = psdDir.split(".psd")[0];
						var refData = firebase.app("database").database().ref('dataTranslate');
						refData.once('value').then(function(dataTrans){
							dataTrans = JSON.stringify(dataTrans.val());
							// save session data translate
							sessionStorage.setItem("dataTranslate", dataTrans);
							//------------
							csInterface.evalScript("viewLayers('"+psdDir+"',"+dataPSDlayers+", "+dataTrans+")", function(res){
								res = JSON.parse(res);
								createPaletteColor(res.layerSets,0,"",undefined,language, dirChild, objThrow,arrLink,count);
								sessionStorage.setItem("dataPSDlayers", JSON.stringify(res));
								$("popup").style.display = "none";
								$("panelLayer").style.display = "block";
								window.dispatchEvent(new Event("resize"));
								if(!hasJsonPsd){
									uploadJsonPSD(res,objPsd,function(){});
								}							
							});	
						});				
					}
					else{						
						var storeRef = firebase.app("bucketStorage").storage().ref("Punch/"+objPsd.idName+".zip");
						storeRef.getDownloadURL().then(function(url){
							csInterface.evalScript("DownloadImage('"+url+"', "+objPsd.size+", 'zip','"+objPsd.idName+"')", function(res){
								res = res.replace(/\\/gi, "/");
								var refData = firebase.app("database").database().ref('dataTranslate');
								refData.once('value').then(function(dataTrans){
									dataTrans = JSON.stringify(dataTrans.val());
									// save session data translate
									sessionStorage.setItem("dataTranslate", dataTrans);
									//-------------------
									csInterface.evalScript("viewLayers('"+res+"',"+dataPSDlayers+","+dataTrans+")", function(res2){
										res2 = JSON.parse(res2);										
										createPaletteColor(res2.layerSets,0,"",undefined,language,dirChild,objThrow, arrLink,count);
										sessionStorage.setItem("dataPSDlayers", JSON.stringify(res2));
										$("popup").style.display = "none";
										$("panelLayer").style.display = "block";
										window.dispatchEvent(new Event("resize"));
										if(!hasJsonPsd){
											uploadJsonPSD(res2,objPsd,function(){});
										}
									});
								});
							});
						});
					}
				}
			})
		}
		else{
			csInterface.evalScript("alert('Not found psd file', 'Message')");
		}
	}
	// clear log cache
	$("clearCache").addEventListener("click", function(){
		$("MenuImages").style.display = "none";
		csInterface.evalScript("CacheClr("+JSON.stringify(arrLink[count])+")");
	})
	// deleteJSON PSD
	$("removeJsonPSD").addEventListener("click", function(){
		var nameFile = arrLink[count].idName;
		var dataForBox = {
			titleMsg: 'Confirm Delete',
			message: 'Do you want to delete ' + nameFile+".json ?",
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'notify'
		};
		csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")", function(resAction){
			resAction = JSON.parse(resAction);
			if(resAction.action == "OK"){
				var storageRef = firebase.app("bucketStorage").storage().ref().child("Punch/" + nameFile + ".json");
				storageRef.delete().then(function(){
					location.reload();
				}).catch(function(err){alert(err);});	
			}
		});	
	})
	// handle sort img
	$("sortImg").onclick=function(){
		if(count>0){
			var language = sessionStorage.getItem("language");
			var nameFile = arrLink[count].idName;
			var imgCurrent = arrLink[count];
			arrLink[count] = arrLink[count - 1];
			arrLink[count - 1] = imgCurrent;
			var refData = firebase.app("database").database().ref('dataPalette'+ dirChild + "/url");
			refData.set(arrLink).then(function(){
				var msg = "UpdateIMG" + "|" + nameFile;
				csInterface.evalScript("previewImage('edit', '"+JSON.stringify(arrLink)+"', '"+dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"', '"+msg+"')", function(res){
					location.reload();
				})
			});
		}
		else{
			csInterface.evalScript("alert('The image cannot be sorted', 'Message')");
		}
	}
	window.addEventListener("resize", function(){
		$("infor").style.width = $("imgCurrent").width + "px";
		$("canvasImage").width = $("imgCurrent").width;
		$("canvasImage").height = $("imgCurrent").height;
		var context = $("canvasImage").getContext('2d');
		context.drawImage($("imgCurrent"),0,0,$("canvasImage").width, $("canvasImage").height);
		// center button arrow
		$("control").style.top = window.innerHeight/2 + window.scrollY+ "px";
	});
	//- hover palette
	document.body.addEventListener("mouseover", function(e){
 		if(e.target.tagName == "rect" || e.target.tagName == "path"){
 			e.stopPropagation();
 			$("contentInfSw").innerHTML = e.target.parentElement.getAttribute("data-infoSw");
 			$("inforSwatches").style.display = "block";
 			$("inforSwatches").style.position = "absolute";
 			var mi1 = e.clientX - (document.body.clientWidth - $("panelLayer").clientWidth);
 			var xMove = event.clientX - (mi1/9);
 			$("inforSwatches").style.top = 15+ window.scrollY+ event.clientY + "px";
 			$("inforSwatches").style.left = xMove+ "px";
 			$("inforSwatches").style.boxShadow = '0 0 3px #131313';
 			// show image element
 			var idElement =  e.target.parentElement.getAttribute('data-imgDir');
			if(idElement != null){
				var arrElements = document.getElementsByClassName("imgElement");
	 			for(var i=0;i<arrElements.length;i++){
	 				arrElements[i].style.display= "none";
	 			}
				$(idElement).style.display = "block";
			}
			// show color preview
			var svgColor = $("svgColor");
			var rectNode = svgColor.getElementsByTagName('rect')[0];
			var hexValue = JSON.parse(e.target.parentElement.getAttribute("data-rgbColor")).hexValue;
			rectNode.setAttribute("fill", "#"+hexValue);
			$("infoHex").innerHTML = "#"+ hexValue;
 		}
 		else{
 			$("contentInfSw").innerHTML = "";
 			$("inforSwatches").style.display = "none";
 			//hide element Image
 			var arrElements = document.getElementsByClassName("imgElement");
 			for(var i=0;i<arrElements.length;i++){
 				arrElements[i].style.display= "none";
 			}
 		}
 		if(e.target.getAttribute("class") == "palette"){
 			e.stopPropagation();
 			var arrDivPalette = document.getElementsByClassName("palette");
 			for(var i=0; i<arrDivPalette.length;i++){
 				arrDivPalette[i].style.background = 'inherit';
 			}
 			e.target.style.background = "#3d3c3c";
 			// show thumbnail
 			
 		}
 		else{
 			var arrDivPalette = document.getElementsByClassName("palette");
 			for(var i=0; i<arrDivPalette.length;i++){
 				arrDivPalette[i].style.background = 'inherit';
 			}
 		}
	});	
	document.body.addEventListener("click", function(e){
		hideMenuPalette();
		if(e.target.getAttribute("id")!= "menuSw"){
			$("menuSw").style.display = "none";
		}
		if(e.target.getAttribute("id")=="navBar" || e.target.getAttribute("id")=='languageControl'){
			sessionStorage.removeItem("paletteActive");
			var arrPalette = document.getElementsByClassName("palette");
			for(var i=0;i<arrPalette.length;i++){
				arrPalette[i].children[1].style.color = '#a7a7a7';
			}
		}
	})
	// handle onscroll
	document.body.onscroll = function(){
		$("PsControl").style.top = $("documentPS").clientHeight + 5 + "px";
		$("control").style.top = window.innerHeight/2 + window.scrollY+ "px";
		$("inforSwatches").style.display="none";
	}
	//
}
// function extends
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