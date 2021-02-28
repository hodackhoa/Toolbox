/* Create an instance of CSInterface. */
var $ = function(id){
	return document.getElementById(id)
};
var csInterface = new CSInterface();

//
function createPaletteColor(arr, hierarchy, hierarchyURI, paletteSecond, language, punchEndPoints){
	for(var i=0; i<arr.length;i++){
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
		labelPalette.setAttributeNS(null,"data-thumbnail", JSON.stringify(arr[i].thumbnailUrl));
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
		//----action Move---
		var actionMove = document.createElement("h5");
		actionMove.innerHTML = 'Move';
		contextMenu.appendChild(actionMove);
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
			$("thumbGr").style.display = "none";
			if(e.target.getAttribute("class")=="parentSwatches"){
				return false;
			}
			//check uri Move to has same 
			var uriMoveTo = sessionStorage.getItem("UriMoveTo");
			if(uriMoveTo != null){
				for(var i=0; i< this.children[2].children.length; i++){
					this.children[2].children[i].style.display = "none";
				}
				var actionMoveHere = document.createElement("h5");
				actionMoveHere.innerHTML = 'Move Here';
				this.children[2].appendChild(actionMoveHere);
				if(this.children[1].getAttribute("data-uri") == uriMoveTo){return;};
			}
			//------------
			objRightClick = e.target;
			if(e.target.tagName == "SVG" || e.target.tagName=="H6"){
				objRightClick = e.target.parentElement;
			}
			hideMenuPalette();
			objRightClick.style.position = "relative";
			objRightClick.children[2].style.cssText = "display: block; position: absolute; top: 2%; right:10%;";
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
		palette.addEventListener("mousemove", function(e){
			e.stopPropagation();
			var arrContext = document.getElementsByClassName("contextMenu");
			var statusContext = false, thumbDelay;
			for(var i=0; i<arrContext.length; i++){
				if(arrContext[i].style.display=="block"){
					statusContext = true;
					break;
				}
			}
			if(this.children[1].getAttribute("data-thumbnail") != 'undefined' && !statusContext && $("inforSwatches").style.display=="none"){
				var thumbnailCurrent = sessionStorage.getItem("thumbnailCurrent");
				if(thumbnailCurrent != null && thumbnailCurrent != this.children[1].innerHTML){
					$("thumbGr").removeAttribute("style");
				}
				var posX = event.clientX + 20;
				if(posX> ($("swatchesCollection").clientWidth/1.3)){
					posX = event.clientX - 120;
				}
	 			var posY = (event.clientY + window.scrollY);
	 			posY = posY - (posY/$("swatchesCollection").clientHeight)*100;
	 			$("thumbGr").style.cssText = "display:block; left:"+(posX + "px")+"; top:"+(posY + "px")+"; animation-name : zoomin; animation-duration: 1s;";
	 			var dataThumb = JSON.parse(this.children[1].getAttribute("data-thumbnail"));
	 			var shortLink =	punchEndPoints.data[dataThumb.serverId].shortLink;
	 			var serverName = punchEndPoints.data[dataThumb.serverId].projectId;
	 			$("thumbnail").src = dataThumb.url.replace("<"+serverName+">", shortLink);
	 			sessionStorage.setItem("thumbnailCurrent", this.children[1].innerHTML);
	 		}
	 		if($("swatchMove").children.length>0){
				$("swatchMove").style.top = window.scrollY+ e.clientY + "px";
				$("swatchMove").style.left = e.clientX + "px";
			}
		})
		//---------------
		palette.addEventListener("mouseout",function(e){
			$("thumbGr").style.cssText = "display:none;";
		})
		//------handle drop swatches palette
		palette.addEventListener("mouseup", function(e){
			var sourceSw = $("swatchMove").children[0];
			if($("swatchMove").children.length>0) { $("swatchMove").children[0].remove();}
			var uriSrc = sessionStorage.getItem("paletteMoveSwSrc");
			var uriDes = this.children[1].getAttribute("data-uri");
			if(uriDes != uriSrc && this.getAttribute("class")=="palette"){
				//remove sw src
				var resPosSrc = findPositionPalette(uriSrc);
				var arrSWBackup = JSON.stringify(resPosSrc.objEnd.arrSwatches);
				var objSource = resPosSrc.objEnd.arrSwatches.splice(sourceSw.getAttribute("data-index"), 1);
				firebasePatchdata(resPosSrc.dataPalette, resPosSrc.dirChild+"/arrSwatches", "PATCH", resPosSrc.objEnd.arrSwatches, {name: "waiting", method:"Edit"},undefined, function(res){
					var resFindPosition = findPositionPalette(uriDes);
					var objEnd = resFindPosition.objEnd;
					var dataPalette = resFindPosition.dataPalette;
					if(objEnd.arrSwatches==undefined){
						objEnd.arrSwatches = [objSource[0]];
					}
					else{
						objEnd.arrSwatches.push(objSource[0]);
					}
					firebasePatchdata(dataPalette, resFindPosition.dirChild+"/arrSwatches", "PATCH", objEnd.arrSwatches, {name: objSource[0].inforSw[language], method:"Edit"}, undefined, function(res){
						if(res=="Error"){
							firebasePatchdata(resPosSrc.dataPalette, resPosSrc.dirChild+"/arrSwatches", "PATCH", JSON.parse(arrSWBackup), {name: "Return", method:"Edit"});
						}
					})
				});
				this.dispatchEvent(new Event("click"));
			}
		})
		if(hierarchy > 0){
			palette.style.marginLeft = (12) + "px";
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
				//svgColor.setAttributeNS(null, "draggable", "true");
				svgColor.setAttributeNS(null, "data-infoSw", arr[i].arrSwatches[j].inforSw[language]);
				svgColor.setAttributeNS(null, "data-rgbColor", JSON.stringify(arr[i].arrSwatches[j].rgbObj));
				svgColor.setAttributeNS(null, "data-uri", dataAttr.value);
				svgColor.setAttributeNS(null, "data-index", j);
				svgColor.setAttributeNS(null, "data-blendMode", arr[i].arrSwatches[j].blendMode);
				svgColor.setAttributeNS(null, "data-opacity", arr[i].arrSwatches[j].opacity);
				svgColor.setAttributeNS(null, "data-clippingMask", arr[i].arrSwatches[j].clippingMask);
				svgColor.setAttributeNS(null, "data-invertMask", arr[i].arrSwatches[j].invertMask);
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
					localStorage.setItem("activeSwatch", JSON.stringify({
						uri: this.getAttribute("data-uri"),
						index: this.getAttribute("data-index")
					}))
				})
				//drag event
				svgColor.addEventListener("mousedown", function(e){
					var statusMouse = sessionStorage.getItem("statusMouse");
					var paletteMoveSwSrc = sessionStorage.setItem("paletteMoveSwSrc", this.getAttribute("data-uri"));
					if(e.button== 0 && statusMouse != "dblClick"){
						var copySw = this.cloneNode(true);
						copySw.style.opacity = "0.5";
						if($("swatchMove").children.length>0) { $("swatchMove").children[0].remove();}
						$("swatchMove").appendChild(copySw);
						$("swatchMove").style.position = "absolute";
						$("swatchMove").style.top = e.clientY + window.scrollY +"px";
						$("swatchMove").style.left = e.clientX + "px";
					}
				})
				svgColor.addEventListener("mouseup", function(e){
					var sourceSw = $("swatchMove").children[0];
					if($("swatchMove").children.length>0) { $("swatchMove").children[0].remove();}
					//
					if(this.getAttribute("data-index") != sourceSw.getAttribute("data-index")){
						var paletteActive = this.getAttribute("data-uri");
						var resFindPosition = findPositionPalette(paletteActive);
						var objEnd = resFindPosition.objEnd;
						var dataPalette = resFindPosition.dataPalette;
						var indexDes = this.getAttribute("data-index");
						var objSource = objEnd.arrSwatches.splice(sourceSw.getAttribute("data-index"), 1);
						var hasAdd = false, arrSwTemp=[];
						for(var i=0; i<objEnd.arrSwatches.length; i++){
							if(i==indexDes && !hasAdd){
								arrSwTemp.push(objSource[0]);
								hasAdd = true;
								i--;
							}
							else{
								arrSwTemp.push(objEnd.arrSwatches[i]);
								if(i== objEnd.arrSwatches.length- 1 && !hasAdd){
									arrSwTemp.push(objSource[0]);
								}
							}

						}
						objEnd.arrSwatches = arrSwTemp;
						firebasePatchdata(dataPalette, resFindPosition.dirChild+"/arrSwatches", "PATCH", arrSwTemp, {name: objSource[0].inforSw[language], method:"Edit"});
					}
				})
			}
			//-----------	
			swatchesDiv.style.marginLeft = "0.4em";
			swatchesDiv.style.display = "none";
			palette.appendChild(swatchesDiv);
		}
		//--------
		palette.addEventListener("click", function(e){
			e.stopPropagation();			
			if(e.target.getAttribute("id")!= "menuSw"){
				$("menuSw").style.display = "none";
			}
			if(e.target.getAttribute("class") =="parentSwatches"){
				return false;
			}
			var uriMoveTo = sessionStorage.getItem("UriMoveTo");
			if(this.children[1].getAttribute("data-uri") == uriMoveTo){return;};
			//------------------
			var language = localStorage.getItem('language').toLowerCase();
			var punchEndPoints = JSON.parse(localStorage.getItem("punchEndPoints"));
			var objClick = e.target;
			if(objClick.tagName == "H5"){
				var paletteActiveORG = this.children[1].getAttribute('data-uri');
				this.children[2].style.display = "none";
				//-----------
				function updateData(action,msg,mode,oldName, paletteActive){
					//-----------------
					var resFindPosition = findPositionPalette(paletteActive);
					var dataPalette = resFindPosition.dataPalette;
					var paletteTemp = resFindPosition.paletteTemp;
					var k = resFindPosition.index;
					paletteActive = resFindPosition.paletteActive;
					var dirChild = resFindPosition.dirChild;
					//---
					var orderIdCurrent = (paletteTemp==null)? dataPalette[k].orderId : 'noID';
					var url =(paletteTemp==null)? dataPalette[k].url : paletteTemp.data[k].url;
					var thumbnailUrl = (paletteTemp==null)? dataPalette[k].thumbnailUrl : paletteTemp.data[k].thumbnailUrl;
					var fileNameORG = (paletteTemp==null)? dataPalette[k].filenameORG : paletteTemp.data[k].filenameORG;
					var hidePalette = (paletteTemp==null)? dataPalette[k].hidePalette : paletteTemp.data[k].hidePalette;
					hidePalette = (hidePalette==undefined)? false : hidePalette;
					var dataForBox = {
						titleMsg: 'Confirm dialog',
						message: msg,
						btnLabel1: 'OK',
						btnLabel2: 'Cancel',
						inputText: oldName,
						inputObj: [
							{name:"Order ID:", value:orderIdCurrent},
							{name:"Thumbnail", value: 6, thumbnail:thumbnailUrl, btnName:"Set", responseBtn:""},
							{name:"Image quality:", value: 6, url:url, btnName:"Upload", responseBtn:""},
							{name:'Filename:', value:fileNameORG}],
						checkBoxObjs: [{name: "Hide Palette", value: hidePalette}],
						mode: mode
					};
					if(action=="Delete"){dataForBox.inputObj = undefined; dataForBox.checkBoxObjs = undefined;}
					csInterface.evalScript("boxMessage("+JSON.stringify(dataForBox)+")",function(response){
						response = JSON.parse(response);
						if(response.action=="OK"){
							//check Name palette 
							var hasSameName = false;
							var arrTemp = (paletteTemp==null)? dataPalette : paletteTemp.data;
							for(var i=0; i< arrTemp.length && response.tabInp!=undefined; i++){						
								if(response.tabInp.toLowerCase() == arrTemp[i].name[language].toLowerCase() && resFindPosition.objEnd != arrTemp[i]){	
									hasSameName = true;
									break;													
								}
							}
							if(hasSameName){
								csInterface.evalScript("alert('Palette has exists!')");
								return false;
							}
							//----------------------
							if(action=="Edit" && (response.inputObj[1].responseBtn != "" || response.inputObj[2].responseBtn != "")){
								var indexBtn, responseBtnKind;
								if(response.inputObj[1].responseBtn!=""){
									indexBtn = 1;
									responseBtnKind = "Thumbnail";
								}
								else{
									indexBtn = 2;
									responseBtnKind = "ImagesCollection";
								}
								uploadImage(response.inputObj[indexBtn].responseBtn, thumbnailUrl, responseBtnKind, function(urlFirebase, imgName){
									process_1(urlFirebase,imgName, responseBtnKind);
								});
							}
							else{
								process_1();
							}
							function process_1(urlFirebase, imgName, responseBtnKind){
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
												csInterface.evalScript("addDataTranslate("+JSON.stringify(objName.name)+","+JSON.stringify(dataTranslate)+", '"+language+"')", function(response){
													response = JSON.parse(response);
													if(response.data != undefined){
														if(!response.hasExists){
															dataTranslateSync("POST", response.data,'dataTranslate/'+ dataTranslate.length);
														}
														editData(response.data);
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
												// push new Url 					
												if(urlFirebase != undefined){																							
													if(responseBtnKind =="ImagesCollection"){	
														var newUrl = {
															idName: imgName,
															serverId: punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive].id
														};																
														var arrUrl=(url==undefined)? [] : url;
														arrUrl.push(newUrl);
														paletteObj.url = arrUrl;
													}
													else{
														// Set thumbnail image															
														var shortLink =	punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive].shortLink;	
														var newUrl = {
															url: urlFirebase.replace(shortLink,("<"+punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive].projectId+">")),
															serverId: punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive].id
														};			
														paletteObj.thumbnailUrl = newUrl;
														//--------
													}
												}
												//---							
												paletteObj.filenameORG = response.inputObj[3].value;
												paletteObj.hidePalette = response.checkBoxObjs[0].value;
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
											firebasePatchdata(dataPalette, dirChild, "PATCH", paletteTemp.data, objInf, paletteObj);
											//patchData(dataPalette, i, "PATCH", paletteObj, objInf);
										}
										//var resFindPos = findPositionPalette();
										if(urlFirebase != undefined){
											var arrUrl = (paletteTemp==null)? dataPalette[k].url : paletteTemp.data[k].url;
											var objThrow = {
												uri: paletteActiveORG,
												totalChildrens: (resFindPosition.objEnd.data!=undefined)? resFindPosition.objEnd.data.length: 0
											}
											csInterface.evalScript("reloadPanel('Preview Image','"+JSON.stringify(arrUrl)+"', '"+dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"')");
										}
										break;
									}
								}
								if(!hasFound){
									localStorage.removeItem('paletteActive');
									firebasePatchdata(dataPalette, "", "PATCH",dataPalette, {name:paletteObj.name[language], type: "Delete"}, paletteObj);
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
						updateData('Delete','Are you sure delete palette?','notify',undefined, paletteActiveORG);
						break;
					case "Make Group":
						var paletteName = this.children[1].innerHTML;
						var lastChar = (paletteName.indexOf("(")== - 1)? paletteName.length : paletteName.indexOf("(");
						csInterface.evalScript("createGroup('"+paletteName.substring(0,lastChar).replace("&amp;", "&")+"')");
						this.children[2].style.display = "none";
						break;
					case "Edit":
						updateData('Edit','Palette name','both',this.children[1].innerHTML.replace("&amp;", "&"), paletteActiveORG);
						break;
					case "Move":
						var resFindPos = findPositionPalette(paletteActiveORG);
						var uri = this.children[1].getAttribute("data-uri");
						sessionStorage.setItem("UriMoveTo", uri);
						// var arrContextmenu = document.getElementsByClassName("contextMenu");
						// for(var i=0; i<arrContextmenu.length; i++){
						// 	for(var j=0; j< arrContextmenu[i].children.length; j++){
						// 		arrContextmenu[i].children[j].style.display = "none";
						// 	}
						// 	var actionMoveHere = document.createElement("h5");
						// 	actionMoveHere.innerHTML = 'Move Here';
						// 	arrContextmenu[i].appendChild(actionMoveHere);
						// }	
						this.children[1].style.color = "#696868";					
						break;
					case "Move Here":												
						var uriDes = this.children[1].getAttribute("data-uri");
						var resFindMoveTo = findPositionPalette(sessionStorage.getItem("UriMoveTo"));
						//backup data---
						sessionStorage.setItem("dataPaletteBackup", JSON.stringify(resFindMoveTo.dataPalette));
						sessionStorage.setItem("paletteTempBackup", JSON.stringify(resFindMoveTo.paletteTemp));
						//------------------------
						csInterface.evalScript("SortPaletteManual("+JSON.stringify(resFindMoveTo.objEnd)+",'"+language+"')",function(pos){
							if(pos!="null"){
								var paletteProcessing = (resFindMoveTo.paletteTemp==null)? {data: resFindMoveTo.dataPalette} : resFindMoveTo.paletteTemp;
								objMoveTo = paletteProcessing.data.splice(resFindMoveTo.index,1)[0];
								var dirChildRemove = resFindMoveTo.dirChild.split("/");
								dirChildRemove.pop();
								dirChildRemove = dirChildRemove.join("/");						
								firebasePatchdata(resFindMoveTo.dataPalette, dirChildRemove, "PATCH", paletteProcessing.data, {name: "waiting", method:"Edit"},undefined, function(res){
									var resFindPos = findPositionPalette(uriDes);
									var objEnd = resFindPos.objEnd;									
									var paletteTemp = (resFindPos.paletteTemp==null)? {data: resFindPos.dataPalette} : resFindPos.paletteTemp;									
									// process add palette to new position
									var newArr = [], hasChange=false;
									var index = (pos=="Backward")? (resFindPos.index + 1) : resFindPos.index;
									var hasSameName = false;
									for(var i=0; i< paletteTemp.data.length; i++){
										//-------
										if(paletteTemp.data[i].name[language]==objMoveTo.name[language]&& pos!="Inside"){
											hasSameName = true;
											break;
										}
										//----------------
										if( (i == index && !hasChange)){
											if(pos == "Inside"){
												var arrTemp = paletteTemp.data[i].data;
												arrTemp = (arrTemp==undefined)? [] : arrTemp;
												for(var j=0; j<arrTemp.length; j++){
													if(arrTemp[j].name[language]==objMoveTo.name[language]){
														hasSameName = true;
														break;
													}
												}
												arrTemp.push(objMoveTo);
												paletteTemp.data[i].data = arrTemp;
												newArr.push(paletteTemp.data[i]);
											}
											else{
												newArr.push(objMoveTo);
												i--;									
											}
											hasChange = true;
										}
										else{
											newArr.push(paletteTemp.data[i]);
										}
										if(i==paletteTemp.data.length - 1 && !hasChange){
											newArr.push(objMoveTo);
										}
									}
									// process same name
									if(hasSameName){
										csInterface.evalScript("alert('Same name', 'Error')");
										var dirChildRestore = resFindMoveTo.dirChild.split("/");
										dirChildRestore.pop();
										var paletteTempBackup = JSON.parse(sessionStorage.getItem("paletteTempBackup"));
										var dataPaletteBackup = JSON.parse(sessionStorage.getItem('dataPaletteBackup'));
										firebasePatchdata(dataPaletteBackup, dirChildRestore.join("/"), "PATCH", paletteTempBackup.data, {name: "Return", method:"Edit"});
									}
									else{
										paletteTemp.data = newArr;
										//-------------------
										var dataPalette =(resFindPos.paletteTemp==null)? paletteTemp.data : resFindPos.dataPalette;
										var dirChild = resFindPos.dirChild.split("/");
										var objSend = paletteTemp.data;								
										if(pos == "Inside"){
											dirChild = dirChild.join("/")+"/data";
											objSend = objEnd.data;
										}
										else{
											dirChild.pop();
											dirChild = dirChild.join("/");
										}
										firebasePatchdata(dataPalette, dirChild, "PATCH", objSend, {name: objMoveTo.name[language], method:"Edit"}, undefined, function(res){
											sessionStorage.removeItem("UriMoveTo");
											if(res=="Error"){
												firebasePatchdata(dataPalette, resFindMoveTo.dirChild, "PATCH", objMoveTo, {name: "Return", method:"Edit"});
											}
										})
									}
								});
								//-----------------
							}					
						});						
						break;
					case "View":
						var resFindPos = findPositionPalette(paletteActiveORG);
						var arrUrl = (resFindPos.paletteTemp==null)? resFindPos.dataPalette[resFindPos.index].url : resFindPos.paletteTemp.data[resFindPos.index].url;
						var objThrow = {
							uri: this.children[1].getAttribute("data-uri"),
							totalChildrens: (resFindPos.objEnd.data!=undefined)? resFindPos.objEnd.data.length: 0
						}
						csInterface.evalScript("reloadPanel('Preview Image','"+JSON.stringify(arrUrl)+"', '"+resFindPos.dirChild+"','"+JSON.stringify(objThrow)+"','"+language+"')");
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
				$("thumbGr").style.display = "none";
				//alert(objClick.children[1].getAttribute('data-uri'));
			}	
		});
		//callBack--------------
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
			createPaletteColor(arr[i].data, hierarchy, hierarchyURI, paletteSecond,language, punchEndPoints);
			paletteSecond = palette.parentElement;
			hierarchy--;
			hierarchyURI = hierarchyURI.split("/");
			hierarchyURI.splice(hierarchyURI.length - 1, 1);
			hierarchyURI = hierarchyURI.join("/");
		}
	}
}
//------------
function findPositionPalette(paletteActive){
	var language = localStorage.getItem('language').toLowerCase();
	var dataPalette = localStorage.getItem('dataPaletteOriginal');
	dataPalette = JSON.parse(dataPalette);
	paletteActive = paletteActive.split("/");
	if(paletteActive[0]==""){
		paletteActive.splice(0,1);
	}
	var arrData = dataPalette;
	var paletteTemp = null, k = null, dirChild="", objEnd;
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
function clearNode(){
	var palettes = $("listPalette").children.length;
	for(var j=0; j<palettes ; j++){
		$("listPalette").children[0].remove();
	}
}
function activeFolder(nodeLi){
	var arrListSelect = document.getElementsByClassName("palette");
	for(var i=0;i<arrListSelect.length;i++){
		//arrListSelect[i].style.background = 'none';
		if(arrListSelect[i].children[1].getAttribute('data-uri')!= sessionStorage.getItem('UriMoveTo')){
			arrListSelect[i].children[1].style.color = '#a7a7a7';
		}
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
};
// function Hide Palette
function hidePalettes(arrData, hierarchy, callback){
	var arrPaletteHide=[], hasHidden = false, count = (- 1);
	for(var i=0;i<arrData.length; i++){
		count++;
		if(arrData[i].hidePalette != undefined && arrData[i].hidePalette){
			arrPaletteHide.push({name: arrData[i].name, hasHidden: true, index: count});
			arrData.splice(i,1);
			i--;
			hasHidden = true;
			continue;
		}
		if(arrData[i].data !=undefined && arrData[i].data.length>0){
			hierarchy++;
			hidePalettes(arrData[i].data, hierarchy, function(res){
				if(res.length > 0){
					var hasExist = false;
					for(var j=0; j<arrPaletteHide.length; j++){
						if(arrPaletteHide[j].name == arrData[i].name){
							arrPaletteHide[j].data = res;
							hasExist = true;
							break;
						}
					}
					if(!hasExist){
						arrPaletteHide.push({name: arrData[i].name, data: res, index: i});
					}
					hasHidden = true;
				}
				hierarchy--;
			});
		}
		// if(i == (arrData.length - 1) && hierarchy==0 && !hasHidden){
		// 	callback(arrPaletteHide, arrData);
		// }
	}
	callback(arrPaletteHide, arrData);
	// if(hasHidden){
	// 	callback(arrPaletteHide, arrData);
	// }
};
//---funtion GET PATCH
function getData(language, punchEndPoints, callback){
	//-------------------
	$("loadingGr").style.display = "block";
	var refData = firebase.database().ref('dataPalette');
	refData.once('value').then(function(response){
		console.log(response.val())
		$("loadingGr").style.display = "none";
		var dataPalette = response.val();
		// hide palette
		localStorage.setItem("dataPaletteOriginal", JSON.stringify(dataPalette));
		hidePalettes(dataPalette,0, function(res1, res2){
			localStorage.setItem("palettesHide", JSON.stringify(res1));
			// res2.sort(function(a,b){
			// 	return (a.orderId>b.orderId)? 1 : (- 1) ;
			// });
			localStorage.setItem("dataPalette", JSON.stringify(res2));
			createPaletteColor(res2,0,"",undefined,language.toLowerCase(), punchEndPoints);
			reloadActive();
			callback();
		});
		//editMockAPI('https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch');
	});
}

//------PUT DATA---------
function firebasePatchdata(dataPalette, dirChild, type, obj, objInfo, objDel, callback){
	var punchEndPoints = localStorage.getItem("punchEndPoints");
	var currentScroll = localStorage.getItem('currentScroll');
	currentScroll = (currentScroll==null)? window.scrollY : parseInt(currentScroll);
	// $("loadingGr").style.display = "block";
	// $("listPalette").style.display = "none";
	//-------
	// delete Images from firebase storage
	if(objDel != undefined){
		var arrUrl = [];
		putAllUrl(objDel);
		deleteImageFirebase("Punch", arrUrl,0, function(){
			process_2();
		});
	}
	else{
		process_2();
	}
	function putAllUrl(objDel){
		if(objDel.url!= undefined){
			arrUrl = arrUrl.concat(objDel.url);
		}
		if(objDel.thumbnailUrl != undefined && objDel.thumbnailUrl!=""){
			var newObj = {
				idName : objDel.thumbnailUrl.url.split(">")[1].split(".jpg")[0],
				serverId: objDel.thumbnailUrl.serverId
			}
			arrUrl.push(newObj);
		}
		if(objDel.data != undefined){
			for(var i=0;i<objDel.data.length;i++){
				putAllUrl(objDel.data[i]);
			}
		}
	}
	function process_2(){
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
				if(callback!=undefined){
					callback("Success");
				}
			}).catch(function(err){
				alert(err);
				callback("Error");
			});
		}
	}
	
	function updatePalette(msg, hexValue){
		var language = localStorage.getItem('language').toLowerCase();
		if(language==null){language="EN";}
		$("loadingGr").style.display = "none";
		$("listPalette").style.display = "block";
		clearNode();
		localStorage.setItem("dataPaletteOriginal", JSON.stringify(dataPalette));
		hidePalettes(dataPalette, 0, function(res1,res2){
			localStorage.setItem("palettesHide", JSON.stringify(res1));
			// res2.sort(function(a,b){
			// 	return (a.orderId>b.orderId)? 1 : (- 1) ;
			// });
			localStorage.setItem("dataPalette", JSON.stringify(res2));
			createPaletteColor(res2 ,0,"", undefined,language, JSON.parse(punchEndPoints));
			try{reloadActive();}catch(err){};
			var nameObj = (objInfo.name==undefined)? obj.name[language] : objInfo.name;
			csInterface.evalScript("(function(){return $.getenv('USERNAME');})()",function(userName){
				showMessage(nameObj + msg +" ("+userName+")", hexValue,"send");
				//window.scrollTo(0,currentScroll);
			});
		});
		
	}
}
/*function patchData(dataPalette, index, type, obj, objInfo){
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
}*/
//---
function showMessage(msg,hexValue,mode, callBack){
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
		var refData = firebase.database().ref('messageListener');
		refData.set(obj).then(function(){
			callBack();
		})
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
	var refData = firebase.database().ref('messageListener');
	refData.on('value', function(response){
		var msgUpdate = localStorage.getItem("msgUpdate");
		var macAddress = localStorage.getItem("macAddress");
		var objMsg = response.val();
		localStorage.setItem("msgUpdate", JSON.stringify(objMsg));
		if(msgUpdate!=null && objMsg.macAddress!=macAddress && JSON.parse(msgUpdate).logTime != objMsg.logTime){
			if(objMsg.msg=="Server changing"){
				localStorage.removeItem('punchEndPoints');
			}
			if(objMsg.msg.search("RemoveIMG") != (- 1)){
				csInterface.evalScript("DeletePSDFile('"+objMsg.msg.split("|")[1]+"')");
			}
			showMessage(objMsg.msg, objMsg.hexValue,"receive");
			setTimeout(function(){location.reload();}, 2000);
		}
	});
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
function uploadImage(imgName, oldThumb,upLoadType, callback){
	$("loadingGr").style.display = "block";
	$("listPalette").style.display = "none";
	//---------
	if(oldThumb != undefined && upLoadType == 'Thumbnail'){
		var idName = oldThumb.url.split(">")[1].split(".jpg")[0];
		deleteImageFirebase("Punch", [{idName: idName, serverId: oldThumb.serverId}], 0, function(){
			processStep_1();
		})
	}
	else{
		processStep_1();
	}
	function processStep_1(){
		var xhr = new XMLHttpRequest();
		var res = null;
		xhr.open("GET",'images/imgTemp/'+imgName+".jpg", true);
		xhr.responseType ='blob';
		xhr.onload = function(){
			console.log(xhr.response);
			var metadata = {
			  contentType: 'image/jpeg'
			};
			var punchEndPoints = localStorage.getItem("punchEndPoints");
			punchEndPoints = JSON.parse(punchEndPoints);
			var newConfig = punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive];
			firebase.app("bucketStorage").delete().then(function(){
				firebase.initializeApp(newConfig, "bucketStorage");
				var storeRef = firebase.app("bucketStorage").storage().ref();
				var imgUp = storeRef.child("Punch/"+imgName+".jpg").put(xhr.response, metadata);
				console.log(imgUp);
				imgUp.on('state_changed',null, null, function(){
					imgUp.snapshot.ref.getDownloadURL().then(function(url) {
						console.log(url);
						callback(url, imgName);
					});
				})
			})
		}
		xhr.send();
	}
};
function deleteImageFirebase(url,arrId,count,callback){
	if(arrId == undefined || arrId.length==0){
		return callback();
	}
	var punchEndPoints = JSON.parse(localStorage.getItem("punchEndPoints"));
	var configBucket = punchEndPoints.data[arrId[count].serverId];
	firebase.app("bucketStorage").delete().then(function(){
		firebase.initializeApp(configBucket, "bucketStorage");
		var storageRef = firebase.app("bucketStorage").storage().ref().child(url + "/" + arrId[count].idName+".jpg");
		storageRef.delete().then(function(){
			if(arrId[count].psdFile != undefined){
				DeleteZipFile(punchEndPoints, arrId[count], function(){
					process_1();
				})
			}
			else{
				process_1();
			}
		}).catch(function(err){
			alert(err.e);
			if(arrId[count].psdFile != undefined){
				DeleteZipFile(punchEndPoints, arrId[count], function(){
					process_1();
				})
			}
			else{
				process_1();
			}
		});
	});
	function process_1(){
		count++;
		if(count < arrId.length){
			deleteImageFirebase(url, arrId, count, callback);
		}
		else{
			callback();
		}
	}
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
			callback();
		});
	});
}
function updateToolbox(){
	var refData = firebase.database().ref('messageListener/updateTool');
	refData.on('value', function(response){
		if(response.val().status){
			var storeRef = firebase.app("bucketStorage").storage().ref("App/"+ response.val().filename);
			storeRef.getDownloadURL().then(function(url){
				csInterface.evalScript("updateToolbox('"+url+"','"+response.val().version+"')", function(res){
					if(res != ""){
						csInterface.requestOpenExtension("com.previewImage.panel");
						csInterface.closeExtension();
					}	
				});
			})
		}
	});
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
	var refData = firebase.app("punchEndpoints").database().ref("punchEndpoint");
	refData.once('value').then(function(response){
		callback(response.val());
	});
};
function getThumbUrl(punchEndPoints, objUrl, callback){
	if(objUrl != undefined){
		firebase.app("bucketStorage").delete().then(function(){
			var newConfig = punchEndPoints.data[objUrl.serverId];
			firebase.initializeApp(newConfig, "bucketStorage");
			var storeRef = firebase.app("bucketStorage").storage().ref("Punch/"+objUrl.idName+ ".jpg");
			storeRef.getDownloadURL().then(function(url){
				callback(url);
			});
		});
	}
	else{
		callback();
	}
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
	var configEndpoints = {
		"apiKey": "AIzaSyBuW9xz0frALas8jfPRI8FNjKdAV86OhzU",
		"authDomain": "punch-end-points.firebaseapp.com",
		"databaseURL": "https://punch-end-points-default-rtdb.firebaseio.com",
		"projectId": "punch-end-points",
		"storageBucket": "punch-end-points.appspot.com",
		"messagingSenderId": "124727951574"
    };
    firebase.initializeApp(configEndpoints,"punchEndpoints");
    //------
	var config = null, configBucket=null;
	var punchEndPoints = localStorage.getItem('punchEndPoints');
	if(punchEndPoints != null){
		//alert(punchEndPoints)
		csInterface.evalScript("writeLog('"+punchEndPoints+"')");
		punchEndPoints = JSON.parse(punchEndPoints);
		config = punchEndPoints.data[punchEndPoints.activeServer.databaseActive];
		configBucket = punchEndPoints.data[punchEndPoints.activeServer.bucketStorageActive];
		initData();
	}
	else{
		getEndpoints(function(response){
			config = response.data[response.activeServer.databaseActive];
			configBucket = response.data[response.activeServer.bucketStorageActive];
			localStorage.setItem('punchEndPoints', JSON.stringify(response));
			punchEndPoints = response;
			initData();
		})
	}
	function initData(){
		//config firebase API database
		firebase.initializeApp(config);
		firebase.initializeApp(configBucket, "bucketStorage");
		//--------------------
		//Listener Update data & update Toolbox
		updateToolbox();
		listenerStatus();
		//Get Data Tranlates
		dataTranslateSync("GET");
		//---LOAD language----
		var language = localStorage.getItem("language");
		if(language == null){
			language = "EN";
			localStorage.setItem("language", language);
		}
		$('convertLanguage').innerHTML = language;
		//Get Data palettes ---------
		getData(language, punchEndPoints, function(){
			//jump to back scroll 
			var currentScroll = localStorage.getItem('currentScroll');
			currentScroll = (currentScroll==null)? window.scrollY : parseInt(currentScroll);
			window.scrollTo(0,currentScroll);
		});
		//postMockAPI('https://5e605a2dcbbe0600146cb8d7.mockapi.io/punch')
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
		$("searchInp").focus();
		$("searchInp").value = "";
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
					csInterface.evalScript("addDataTranslate("+JSON.stringify(obj.name)+","+JSON.stringify(dataTranslate)+", '"+language+"')", function(response){
						response = JSON.parse(response);
						if(response.data != undefined){
							if(!response.hasExists){
								dataTranslateSync("POST", response.data,'dataTranslate/'+ dataTranslate.length);
							}
							obj.name = response.data;
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
	$("addSwatches").addEventListener("click", function(){
		var objNewSwSender = localStorage.getItem('objNewSwSender');
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
			checkBoxObjs : [{name:"Create Clipping Mask", value:false},{name:"Invert Mask", value:true}],
			btnLabel1: 'OK',
			btnLabel2: 'Cancel',
			mode: 'both'
		};
		var objPaletteActive = {value:paletteActive};
		csInterface.evalScript("addSwatches("+JSON.stringify(dataForBox)+",undefined,"+JSON.stringify(objPaletteActive)+", "+objNewSwSender+")",function(response){
			localStorage.removeItem("objNewSwSender");
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
					csInterface.evalScript("addDataTranslate("+JSON.stringify(response.inforSw)+","+JSON.stringify(dataTranslate)+", '"+language+"')",function(response2){
						response2 = JSON.parse(response2);
						if(response2.data!=undefined){
							if(!response2.hasExists){
								dataTranslateSync("POST", response2.data,'dataTranslate/'+ dataTranslate.length);
							}
							response.inforSw = response2.data;
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
	});
	//handle action swatches DELETE & EDIT & Re-Color
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
						break;
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
					checkBoxObjs : [{name:"Create Clipping Mask", value:paletteTemp.arrSwatches[activeSwatch.index].clippingMask}, {name:"Invert Mask", value:paletteTemp.arrSwatches[activeSwatch.index].invertMask}],
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
							csInterface.evalScript("addDataTranslate("+JSON.stringify(response.inforSw)+","+JSON.stringify(dataTranslate)+", '"+language+"')",function(response2){
								response2 = JSON.parse(response2);
								if(response2.data!=undefined){
									if(!response2.hasExists){
										dataTranslateSync("POST", response2.data, 'dataTranslate/'+ dataTranslate.length);
									}
									response.inforSw = response2.data;
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
			else{
				var rgbObj = paletteTemp.arrSwatches[activeSwatch.index].rgbObj;
				csInterface.evalScript("changeColorFill("+JSON.stringify(rgbObj)+")");
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
		var language = localStorage.getItem('language');
		csInterface.evalScript("renameLayes("+dataTranslate+", '"+language+"')", function(response){
			response = JSON.parse(response);
			if(response != null && response.dataTranslate!=undefined){
				for(var i=0; i< response.dataTranslate.length; i++){
					if(response.dataTranslate[i].en=="" && response.dataTranslate[i].vn=="" && response.dataTranslate[i].jp==""){
						response.dataTranslate.splice(i,1);
						i--;
					}
				}
				dataTranslateSync("POST",response.dataTranslate, 'dataTranslate', function(){
					showMessage("Update data!", "#e5c200", "send");
					dataTranslateSync("GET");
				});
			}
		});
	};
	// COntrol hide palettes
	$("btnViewHidePalettes").onclick = function(){
		var palettesHide = localStorage.getItem("palettesHide");
		palettesHide = (palettesHide==null)? "[]" : palettesHide;
		var language = localStorage.getItem("language");
		csInterface.evalScript("showPalettesHide("+palettesHide+", '"+language.toLowerCase()+"')", function(response){
			response = JSON.parse(response);
			var i = 0;
			changeHidden(response, function(){
				showMessage("Change hidden status", "#33c7f2","send",function(){
					setTimeout(function(){ location.reload();}, 2000);
				});
			});
			function changeHidden(arrData, callback){
				var ref = firebase.database().ref('dataPalette'+ "/" + arrData[i].url + "/hidePalette");
				var valueSend = (arrData[i].hidden)? true : null;
				ref.set(valueSend).then(function(){
					i++;
					if(i< arrData.length){
						changeHidden(arrData);
					}
					else{
						callback();
					}
				})
			}
		})
	}
	// setting COnfig
	$("settingConfig").onclick=function(){
		var punchEndPoints = localStorage.getItem('punchEndPoints');
		csInterface.evalScript("ConfigSetSw("+punchEndPoints+")",function(response){
			response = JSON.parse(response);
			if(response != null){
				var refEndpoint = firebase.app("punchEndpoints").database().ref("punchEndpoint/activeServer");
				refEndpoint.set(response.activeServer).then(function(){ 
					showMessage("Server changing...", "#c2b200","send", function(){
						csInterface.evalScript("reloadPanel('Preview Image','Reset')");
						localStorage.removeItem('punchEndPoints');
						location.reload();
					});
				}).catch(function(err){
					alert(err)
				});
			}
		})
	}
	//Hidden contextMenu
	var bodyTag = document.getElementsByTagName("body")[0];
	bodyTag.addEventListener("mouseover", function(e){
		if($("swatchMove").children.length>0){
			$("swatchMove").style.top = window.scrollY+ e.clientY + "px";
			$("swatchMove").style.left = e.clientX + "px";
		}
 		if(e.target.tagName == "rect" || e.target.tagName == "path"){
 			e.stopPropagation();
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
 			// show thumbnail
 			
 		}
 		else{
 			var arrDivPalette = document.getElementsByClassName("palette");
 			for(var i=0; i<arrDivPalette.length;i++){
 				arrDivPalette[i].style.background = 'inherit';
 			}
 		}
	});
	bodyTag.addEventListener("click", function(e){
		hideMenuPalette();
		if(e.target.getAttribute("id")!= "menuSw"){
			$("menuSw").style.display = "none";
		}
		if(e.target.getAttribute("id")=="navBar" || e.target.getAttribute("id")=='languageControl'){
			localStorage.removeItem("paletteActive");
			var arrPalette = document.getElementsByClassName("palette");
			for(var i=0;i<arrPalette.length;i++){
				if(arrPalette[i].children[1].getAttribute('data-uri') != sessionStorage.getItem('UriMoveTo')){
					arrPalette[i].children[1].style.color = '#a7a7a7';
				}
			}
		}
	})
	bodyTag.addEventListener("mouseup", function(e){
		if($("swatchMove").children.length>0){
			$("swatchMove").children[0].remove();
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
//istener create Layer solidColor
setInterval(function(){
	csInterface.evalScript("syncDataExtension()", function(res){
		if(res != ""){
			if(res.search("IMG")!=(- 1) || res=="Reload"){
				showMessage(res, "#009aa4","send", function(){
					location.reload();
				});
			}
			else{
				localStorage.setItem("objNewSwSender", res);
				$("addSwatches").dispatchEvent(new Event("click"));
			}
		}
	});
}, 500);
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
//////
// Funtion short RGB object
/*dataPalette = changeDataSW(dataPalette);
function changeDataSW(arrData){
	for(var i=0; i< arrData.length; i++){
		if(arrData[i].arrSwatches != undefined){
			for(var j=0; j< arrData[i].arrSwatches.length; j++){
				arrData[i].arrSwatches[j].rgbObj.red = parseInt(arrData[i].arrSwatches[j].rgbObj.red.toFixed());
				arrData[i].arrSwatches[j].rgbObj.green = parseInt(arrData[i].arrSwatches[j].rgbObj.green.toFixed());
				arrData[i].arrSwatches[j].rgbObj.blue = parseInt(arrData[i].arrSwatches[j].rgbObj.blue.toFixed());
			}
		}
		if(arrData[i].data != undefined && arrData[i].data.length>0){
			changeDataSW(arrData[i].data);
		}
	}
	return arrData;
}*/
/*dataPalette = changeDataSW(dataPalette);
function changeDataSW(arrData){
	for(var i=0; i< arrData.length; i++){
		if(arrData[i].url != undefined){
			var arrTemp = [];
			if(arrData[i].url!="" && arrData[i].url!="100"){
				var arrUrl = arrData[i].url.split("|");
				for(var j=0; j<arrUrl.length; j++){
					if(arrUrl[j].search("<7026>") != (- 1)){
						var objUrl = {
							idName: arrUrl[j].split(".jpg")[0].replace("<7026>", ""),
							serverId: 0
						}
						arrTemp.push(objUrl);
					}
				}
			}
			arrData[i].url = arrTemp;
		}
		if(arrData[i].data != undefined && arrData[i].data.length>0){
			changeDataSW(arrData[i].data);
		}
	}
	return arrData;
}*/