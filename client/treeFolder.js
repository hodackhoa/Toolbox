var $ = function(id){
	return document.getElementById(id)
};
var csInterface = new CSInterface();
function clearNode(){
	var amountLi = $("listFolder").children.length;
	for(var j=0; j<amountLi ; j++){
		$("listFolder").children[0].remove();
	}
}
function activeFolder(nodeLi){
	var arrListSelect = $("listFolder").children;
	for(var i=0;i<arrListSelect.length;i++){
		if(typeof nodeLi == "string"){
			if(nodeLi.toLowerCase() == (arrListSelect[i].children[1].getAttribute("value")).toLowerCase() ){
				nodeLi = arrListSelect[i];
			}
		}
		arrListSelect[i].style.background = 'none';
		arrListSelect[i].children[1].style.color = '#cdcdcd';
	}
	nodeLi.style.background = '#7b9fa1';
	nodeLi.children[1].style.color = 'black';
}
function showListFolder(arrF){
	var folderTreeInfo = localStorage.getItem("folderTreeInfo");
	var bodytag = document.body;
	for(var i=0; i<arrF.length; i++){
		var iconFolder = document.createElement("img");
		var attrSrc = document.createAttribute("src");
		attrSrc.value = "iconSVG/folder.svg";
		iconFolder.setAttributeNode(attrSrc);

		var contextMenu = document.createElement("div");
		var attrClass2 = document.createAttribute("class");
		attrClass2.value = "contextMenu";
		contextMenu.setAttributeNode(attrClass2);
		var btnContextOpen = document.createElement("h5");
		btnContextOpen.innerHTML = 'Open files in folder';
		var btnContextCopy = document.createElement("h5");
		btnContextCopy.innerHTML = 'Copy to';
		contextMenu.appendChild(btnContextOpen);
		contextMenu.appendChild(btnContextCopy);

		var iconImage = document.createElement("img");
		var attrSrc2 = document.createAttribute("src");
		attrSrc2.value = "iconSVG/file-image.svg";
		iconImage.setAttributeNode(attrSrc2);

		var iconFile = document.createElement("img");
		var attrSrc3 = document.createAttribute("src");
		attrSrc3.value = "iconSVG/file.svg";
		iconFile.setAttributeNode(attrSrc3);

		var iconArchive = document.createElement("img");
		var attrSrc4 = document.createAttribute("src");
		attrSrc4.value = "iconSVG/file-archive.svg";
		iconArchive.setAttributeNode(attrSrc4);

		var iconHdd = document.createElement("img");
		var attrSrc5 = document.createAttribute("src");
		attrSrc5.value = "iconSVG/hdd-solid.svg";
		iconHdd.setAttributeNode(attrSrc5);

		var iconPSD = document.createElement("img");
		var attrSrc6 = document.createAttribute("src");
		attrSrc6.value = "iconSVG/file-psd.svg";
		iconPSD.setAttributeNode(attrSrc6);

		var liNode = document.createElement("li");
		//var width = document.documentElement.clientWidth;
		liNode.innerHTML = (arrF[i][1]==":")? '('+arrF[i]+')' : arrF[i];
		var attrDataLi = document.createAttribute("value");
		attrDataLi.value = arrF[i];
		liNode.setAttributeNode(attrDataLi);

		var divFolder = document.createElement("div");
		var attrClass = document.createAttribute("class");
		attrClass.value = "divFolder";
		divFolder.setAttributeNode(attrClass);

		var objType = arrF[i].split(".");
		if(objType.length > 1){
			switch ((objType[objType.length -1]).toLowerCase()) {
				case "jpg":
					divFolder.appendChild(iconImage);
					break;
				case "png":
					divFolder.appendChild(iconImage);
					break;
				case "tif":
					divFolder.appendChild(iconImage);
					break;
				case "zip":
					divFolder.appendChild(iconArchive);
					//divFolder.style.display = 'none';
					break;
				case "rar":
					divFolder.appendChild(iconArchive);
					break;
				case "psd":
					divFolder.appendChild(iconPSD);
					break;
				default:
					divFolder.appendChild(iconFile);
					divFolder.style.display = 'none';
					break;
			}	
		}
		else if(arrF[i][1] == ":"){
			divFolder.appendChild(iconHdd);
		}
		else{
			divFolder.appendChild(iconFolder);
		}
		// add child to divFOlder
		divFolder.appendChild(liNode);
		divFolder.appendChild(contextMenu);
		
		$("listFolder").appendChild(divFolder);

		divFolder.addEventListener("contextmenu", function(e){
			e.preventDefault();
			objRightClick = e.target;
			if(e.target.tagName == "LI" || e.target.tagName=="IMG"){
				objRightClick = e.target.parentElement;
			}
			var arrListDiv = $("listFolder").children;
			for(var j = 0; j<arrListDiv.length; j++){
				arrListDiv[j].style.cssText = "position: static;";
				arrListDiv[j].children[2].style.cssText = "display: none;";
			}
			objRightClick.style.position = "relative";
			objRightClick.children[2].style.cssText = "display: block; position: absolute; top: 50%; right:10%;";
			activeFolder(objRightClick);

		})
		divFolder.onclick = function(e){
			var objClick = e.target;
			if(e.target.tagName == "LI"){
				objClick = e.target.parentElement;
			}
			if(objClick.tagName == "H5"){
				var nameVal = objClick.parentElement.parentElement.children[1].getAttribute("value");
				switch (objClick.innerHTML) {
					case "Open files in folder":
						var folderTreeInfo = localStorage.getItem("folderTreeInfo");
						var hasOpenFolder = false;
						csInterface.evalScript("openFiles('"+nameVal+"', "+folderTreeInfo+", "+hasOpenFolder+")", function(response){
							localStorage.setItem('folderTreeInfo', response);
							response = JSON.parse(response);
							activeFolder(response.activeItem);
							//activeFolder(objClick.parentElement.parentElement);
							var positionScroll = (window.scrollY==0)? bodytag.scrollTop : window.scrollY;
							localStorage.setItem("positionScroll", positionScroll);
							location.href = "index.html";
						});
					case "Copy to":
						csInterface.evalScript("copyFiles('"+nameVal+"')");
						break;
					default:
						break;
				}
			}
			else{
				activeFolder(objClick);
			}	
		}
		divFolder.ondblclick = function(e){
			var objDbClick = (e.target.tagName == "DIV")? e.target.children[1] : e.target;
			var objType = objDbClick.getAttribute("value").split(".");
			if(objType.length == 2){
				csInterface.evalScript("openFiles('"+objDbClick.getAttribute("value")+"', "+folderTreeInfo+")", function(response){
					localStorage.setItem('folderTreeInfo', response);
					var positionScroll = (window.scrollY==0)? bodytag.scrollTop : window.scrollY;
					//alert(window.scrollY);
					localStorage.setItem("positionScroll", positionScroll);
					location.href = "index.html";
				});
			}
			else{
				csInterface.evalScript("readFolder('"+objDbClick.getAttribute("value")+"', "+folderTreeInfo+")", function(response){
					localStorage.setItem('folderTreeInfo', response);
					var positionScroll = (window.scrollY==0)? bodytag.scrollTop : window.scrollY;
					localStorage.setItem("positionScroll", positionScroll);
					var arrFolder = JSON.parse(response).subFolders;
					clearNode();
					showListFolder(arrFolder);
				})
			}
		}
	}
	var positionScroll = localStorage.getItem('positionScroll');
	window.scrollTo(0,positionScroll);
	if(window.scrollY == 0){
		document.body.scrollTop = positionScroll;
	}
}

window.onload = function(){
	//var height = document.documentElement.clientHeight;
	/*var request = new XMLHttpRequest();
	request.open("GET", "http://5d42d147bc64f90014a56f32.mockapi.io/products");
	request.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var jsonResponse = JSON.parse(this.responseText)
			console.log(jsonResponse);
			var i=0;
			setInterval(function(){
				$("codePanama").value = jsonResponse[i].name;
				i = (i == (jsonResponse.length -1))? 0 : (i+1);
			},1000)
			
		}
	}
	request.send();*/

	//LOAD VERSION
	var versionInfor = localStorage.getItem('versionInfor');
	$('treeVersion').innerHTML = 'Version '+ versionInfor;
	//-------------------------
	//-----------
	//localStorage.removeItem('folderTreeInfo');
	var dataStore = localStorage.getItem('folderTreeInfo');
	dataStore = (dataStore=="EvalScript error.")? null : dataStore;
	if(dataStore==null){
		//var rootDir = JSON.parse(localStorage.getItem('directoryData')).folderTreeDir;
		//rootDir = (rootDir=="")? "~/Desktop" : rootDir;
		dataStore = {
			currentDirectory: 'root/',
			subFolders : []
		}
		dataStore = JSON.stringify(dataStore);
	}
	csInterface.evalScript("readFolder(undefined,"+dataStore+")", function(response){
		localStorage.setItem('folderTreeInfo', response);
		response = JSON.parse(response);
		var arrFolder = response.subFolders;
		showListFolder(arrFolder);
		activeFolder(response.activeItem);
	});
	$("backFolder").onclick = function(){
		var folderTreeInfo = localStorage.getItem("folderTreeInfo");
		if(folderTreeInfo!=null){
			csInterface.evalScript("readFolder('back', "+folderTreeInfo+")", function(response){
				localStorage.setItem('folderTreeInfo', response);
				response = JSON.parse(response);
				var arrFolder = response.subFolders;
				clearNode();
				showListFolder(arrFolder);
				activeFolder(response.activeItem);
			})
		}
	}
	var bodyTag = document.getElementsByTagName("body")[0];
	bodyTag.addEventListener("click", function(e){
		var arrContext = document.getElementsByClassName("contextMenu");
		for(var i=0; i<arrContext.length; i++){
			arrContext[i].style.cssText = "display: none;";
		}
		var arrListDiv = document.getElementsByClassName("divFolder");
		for(var j=0; j<arrListDiv.length; j++ ){
			arrListDiv[j].style.position = "static";
		}
	})
	$("inpSearch").onkeyup = function(){
		var keyStr = $("inpSearch").value;
		if(keyStr!=""){
			var arrDiv = document.getElementsByClassName("divFolder");
			var folderTreeInfo = localStorage.getItem("folderTreeInfo");
			folderTreeInfo = JSON.parse(folderTreeInfo);
			var arrFolder = folderTreeInfo.subFolders;
			for(var i=0; i< arrDiv.length; i++){
				if(arrFolder[i].toLowerCase().includes(keyStr.toLowerCase()) && arrDiv[i].style.display!="none"){
					activeFolder(arrFolder[i]);
					var positionScroll = (i+1)*20;
					window.scrollTo(0,positionScroll);
					if(window.scrollY == 0){
						document.body.scrollTop = positionScroll;
					}
					folderTreeInfo.activeItem = arrFolder[i];
					localStorage.setItem("folderTreeInfo", JSON.stringify(folderTreeInfo));
					localStorage.setItem("positionScroll", positionScroll);
					break;
				}
			}
		}
	}
	$("inpSearch").onchange=function(){
		$("inpSearch").value = "";
	}
	bodyTag.onscroll = function(){
		if(window.scrollY >20){
			//$("navFolder").style.borderBottom = "5px solid #12b9d2";
			$("navFolder").style.boxShadow = "0 2px 8px #232323";
		}
		else{
			//$("navFolder").style.borderBottom = "none";
			$("navFolder").style.boxShadow = "none";
		}
	}
}