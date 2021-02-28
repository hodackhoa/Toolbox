/* Create an instance of CSInterface. */
var $ = function(id){
	return document.getElementById(id)
};
var csInterface = new CSInterface();
//Make a reference to your HTML button and add a click handler. */
//var openButton = document.querySelector("#open-button");
function showTime(){
  csInterface.evalScript("logTime()", function(oldStr){
    //if(oldStr!= "nothing"){
    	//window.clearInterval(window.showTimeFirst);
		var arroldStr = oldStr.split(" : ");
		var second = Number(arroldStr[2]);
		var hour = arroldStr[0];
		var minute = arroldStr[1];
		var hasImgs = true;
		window.myLoopTime = setInterval(function(){
        second++;
        if(second==60){
          second = 0;
          minute = Number(minute) + 1;
          if(minute==60){
            minute = 0;
            hour = Number(hour) + 1;
            hour = (hour.toString().length>1)? hour : ("0" + hour);
          }
          minute = (minute.toString().length>1)? minute : ("0" + minute);
        }
        second = (second.toString().length>1)? second : ("0" + second);
        if(hour != "nothing"){
        	$("timer").innerHTML = hour + " : " + minute + " : "+ second;
        	if(Number(minute)>0 || (Number(minute)==0 && Number(hour)>0)){
        		if(Number(second) > 30 || (Number(second)<30 && Number(minute)>1)){
        			$("timer").style.color = "#f2a935";
        			$("timer").style.border = "1px solid #f2a935";
        		}
        	}
        	else{
        		$("timer").style.color = "#00ffde";
        		$("timer").style.border = "1px solid #00ffde";
        	}
        	
        }
        var timeStr = $("timer").innerHTML;
        csInterface.evalScript("logTime('"+timeStr+"')", function(str){
          if(str!="null"){
            second =-1;
            minute = "00";
            hour = "00";
          }
        });
      }, 1000)
    //}
  })
}
function styleHover(str, numChange){
	str = str.replace('rgb(','').replace(')','');
	var arrRGB = str.split(',');
	var k=1, newValue=null;
	for(var i=0;i<arrRGB.length;i++){
		arrRGB[i] = parseInt(arrRGB[i]);
		var newValue = arrRGB[i] + (k*numChange);
		if(newValue > 255){
			if((arrRGB[i]+ numChange)>255 ){
				newValue = arrRGB[i];
				k++;
			}
			else{
				newValue = arrRGB[i]+ numChange;
			}
		}
		else{
			k = (k>1)? (k-1) : k;
		}
		arrRGB[i] = newValue;
	}
	str = 'rgb(' + arrRGB[0]+','+arrRGB[1]+','+arrRGB[2]+')';
	return str;
}
function loadTemplates(arrTemplates,mode){
	for(var i=0; i<arrTemplates.length; i++){
		var btnTemp = document.createElement("BUTTON");
		var attClass = document.createAttribute('class');
		attClass.value = 'btnTemplate';
		btnTemp.setAttributeNode(attClass);

		var attID = document.createAttribute('id');
		attID.value = i;
		btnTemp.setAttributeNode(attID);

		btnTemp.innerHTML = arrTemplates[i].nameTemplate;
		btnTemp.style.background = 'rgb('+arrTemplates[i].bgColor[0]+','+arrTemplates[i].bgColor[1]+','+arrTemplates[i].bgColor[2]+')';
		btnTemp.style.color = 'rgb('+arrTemplates[i].textColor[0]+','+arrTemplates[i].textColor[1]+','+arrTemplates[i].textColor[2]+')';
		btnTemp.style.display=(arrTemplates[i].hidden)? 'none' : 'block';

		$("makeMargin").appendChild(btnTemp);
		var currentColor = '';
		btnTemp.addEventListener('mouseover', function(){
			currentColor = this.style.background;
			//alert(styleHover(currentColor) );
			this.style.background = styleHover(currentColor, 30);
		})
		btnTemp.addEventListener('mouseout', function(){
			this.style.background = currentColor;
		})
		btnTemp.addEventListener('click', function(e){
			//var additBotMar = $("checkedBot").checked;
			var additBotMar = true;
			var templateRun = arrTemplates[parseInt(e.target.id)];
			var countStep=0;
			var countVariant = Object.keys(templateRun.variants);
			var varriantRun = templateRun.variants[countVariant[countStep]];
			//localStorage.setItem('idTempRun', e.target.id);
			var directoryData = localStorage.getItem('directoryData');
			//Start Run ----------------
			if(templateRun.saveAtTime){
				csInterface.evalScript("progressBox(100, '',"+(100/countVariant.length)+")");
			}
			multiCanvas(templateRun, varriantRun, additBotMar,e.target.id, countStep, countVariant, directoryData);			
		})
	}
	if(mode=='edit'){
		location.reload();
	}
}
// function multiCanvas-------
function multiCanvas(templateRun, varriantRun, additBotMar,idRun, countStep, countVariant, directoryData){
	//csInterface.evalScript("progressBox("++")");
	var templateThrow = JSON.stringify(templateRun);
	varriantRun = JSON.stringify(varriantRun);
	var hasCloseDoc = (countStep+2)>countVariant.length;
	csInterface.evalScript("marginAuto("+templateThrow+","+varriantRun+","+additBotMar+","+idRun+","+hasCloseDoc+","+directoryData+")", function(){
		countStep++;	
		if(countStep<countVariant.length && templateRun.saveAtTime){
			varriantRun = templateRun.variants[countVariant[countStep]];
			multiCanvas(templateRun, varriantRun, additBotMar,idRun, countStep, countVariant, directoryData);	
		}
		else{
			if(!templateRun.saveAtTime){
				var objStep = {
					templateRun: templateRun,
					varriantRun: JSON.parse(varriantRun),
					additBotMar: additBotMar,
					idRun: idRun,
					countStep: countStep,
					hasCloseDoc: hasCloseDoc,
					countVariant: countVariant,
					directoryData: JSON.parse(directoryData)
				}
				localStorage.setItem("partialHandling", JSON.stringify(objStep));
				location.reload();
			}
		}
	});
}
///----Check Box handle----------------------
/*$("labelCheckBot").onclick = function(e){
	var checkBot  = e.target.parentElement.children[0];
	if(!checkBot.checked){
		setTimeout(function(){
			$("checkedBot").checked = true;
		}, 3000)
	}
}
$("checkedBot").onclick = function(e){
	if(!e.target.checked){
		setTimeout(function(){
			$("checkedBot").checked = true;
		}, 3000)
	}
}*/
//--------------------------------
$("btnSave").onclick = function(){
	var objStep = localStorage.getItem('partialHandling');
	if(objStep==null){
		var directoryData = localStorage.getItem('directoryData');
		csInterface.evalScript("savePSD("+directoryData+",null,null,null,true)");
	}
	else{
		objStep = JSON.parse(objStep);
		directoryData = JSON.stringify(objStep.directoryData);
		csInterface.evalScript("savePSD("+directoryData+","+JSON.stringify(objStep.templateRun)+","+JSON.stringify(objStep.varriantRun)+","+objStep.idRun+","+objStep.hasCloseDoc+")",function(){
			if(objStep.hasCloseDoc){
				localStorage.removeItem('partialHandling');
				location.reload();
			}
			else{
				objStep.varriantRun = objStep.templateRun.variants[objStep.countVariant[objStep.countStep]];
				multiCanvas(objStep.templateRun, objStep.varriantRun, objStep.additBotMar,objStep.idRun, objStep.countStep, objStep.countVariant, directoryData);
			}
		});	
	}
}
window.onload = function(){
	//localStorage.removeItem("currentPanel");
	//showTime();
	//------------UPDATE------------
	/*$('update').onclick=function(){
		var config = {
		    apiKey: "AIzaSyC09PsxWO8RS9ed8EBR3tgaB_BkH75l4IQ",
			authDomain: "exam-9d599.firebaseapp.com",
			databaseURL: "https://exam-9d599.firebaseio.com",
			projectId: "exam-9d599",
			storageBucket: "exam-9d599.appspot.com",
			messagingSenderId: "590297637976",
			appId: "1:590297637976:web:7c5d0ecc04fa806bf5962d",
			measurementId: "G-9W1G2TFC65"
		};
		firebase.initializeApp(config);
		var storage = firebase.storage();
		storage.ref('marginApp/EvoMargin.exe').getDownloadURL().then(function(url){
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.onload = function(event){
				var blob = xhr.response;
				console.log(blob);
				window.open(blob);
			};
			xhr.open('GET', url);
			xhr.send();
		}).catch(function(err){
			console.log(err);
		});
		
		//var storageRef = firebase.storage().ref();
		//var staRef = storageRef.child('marginApp/EvoMargin.exe');
	}*/
	// DECLARE VERSION------------
	var versionInfor = null;
	csInterface.evalScript("getVersionInfo()", function(res){
		versionInfor = res;
		localStorage.setItem('versionInfor', versionInfor);
		$('inforVersion').innerHTML = 'Version '+ versionInfor;
		// LOAD PANEL CURRENT
		var currentPanel = localStorage.getItem('currentPanel');
		if(currentPanel!=null && currentPanel!='index'){
			location.href = currentPanel +'.html';
		}
	})
	
	//-----------
	//localStorage.removeItem('directoryData');
	var objStep = localStorage.getItem('partialHandling');
	objStep = JSON.parse(objStep);
	if(objStep!=null){
		$("extendsTool").style.display = 'block';
		$("makeMargin").style.display = 'none';
		$('inforVariant').children[0].children[0].innerHTML = objStep.templateRun.nameTemplate;
		$('inforVariant').children[1].innerHTML = objStep.countVariant[objStep.countStep - 1];
	}
	else{
		$('inforVariant').style.display = 'none';
		$("extendsTool").style.display = 'none';

		var xhr = new XMLHttpRequest();
		xhr.open('GET','http://5e605a2dcbbe0600146cb8d7.mockapi.io/marginData',true);
		xhr.responseType = 'json';
		xhr.onload = function(){
			if(xhr.readyState==4 && xhr.status==200){
				localStorage.setItem('dimension', JSON.stringify(xhr.response[0]));
				loadTemplates(xhr.response[0].data.templates);
				var directoryData = localStorage.getItem("directoryData");
				$('popupDir').children[0].innerHTML=(directoryData==null)?'Directory has been not set':JSON.parse(directoryData).psdDirectory;
			}
		}
		xhr.send();
		/*var database = localStorage.getItem("dimension");
		if(database != null && database !='No Data'&&database!='EvalScript error.'){
			database = JSON.parse(database);
			var directoryData = (database.directoryData==undefined)? null : database.directoryData;
			localStorage.setItem('directoryData', JSON.stringify(directoryData));
			$('popupDir').children[0].innerHTML=(database.directoryData==null)?'Directory has been not set':database.directoryData.psdDirectory;
			loadTemplates( database.templates);
		}
		else{
			var notification = document.createElement('h5');
			notification.innerHTML = 'Click "Setting" to create template';
			notification.style.color =  '#828282';
			$("makeMargin").appendChild(notification);
			var dataDirectory = localStorage.getItem('directoryData');
			dataDirectory = (dataDirectory==null||dataDirectory=='null')? 'Directory has been not set' : (JSON.parse(dataDirectory)).psdDirectory;
			$('popupDir').children[0].innerHTML = dataDirectory;
		}*/
	}
	//$("checkedBot").checked = true;
	$("restoreHis").onclick = function(){
		csInterface.evalScript("hisBack('stateNoMask')", function(){
			localStorage.removeItem('partialHandling');
			location.reload();
		});
	}
	//--------Handle Other Tools----------
	$("shadowBtn").onclick = function(){
		var objStep = localStorage.getItem('partialHandling');
		objStep = (objStep==null)? {varriantRun:{desaturationShadow:false}} : JSON.parse(objStep);
		var desaturShadow = objStep.varriantRun.desaturationShadow;
		csInterface.evalScript("makeShadow("+desaturShadow+")");
	}
	$('makePathBtn').onclick = function(){
		csInterface.evalScript("makePath()");
	}
	// listen created guides
	setInterval(function(){
		csInterface.evalScript("clearGuides()", function(amountGuides){
			if(amountGuides!="undefined" && amountGuides!= "EvalScript error."){
				$("clrGuide").children[0].innerHTML = "("+amountGuides+")";
			}
			else{
				$("clrGuide").children[0].innerHTML = "";
			}
		});
	},1000)
	
	$("clrGuide").onclick = function(){
		csInterface.evalScript("clearGuides('clrGuides')");
	}
	//handle Menu tool--
	document.body.onclick = function(e){
		if(e.target.parentElement.id == "controlMenuTools"){
			$('menuTool').style.display = ($('menuTool').style.display=='block')? 'none' : 'block';
		}
		else if(e.target.parentElement.id == "menuPanel"){
			$('listPanel').style.display = ($('listPanel').style.display=='block')? 'none' : 'block';
		}
		else{
			$('menuTool').style.display = 'none';
			$('listPanel').style.display = 'none';
		}
	}
	var arrGrTools = $('extendsTool').getElementsByClassName('groupTools');
	for(var i=0; i< $("menuTool").children.length; i++){
		arrGrTools[i].style.display = 'none';
		$("menuTool").children[i].onclick = function(e){
			for(var j=0; j< arrGrTools.length; j++){
				arrGrTools[j].style.display = 'none';
				if(e.target.getAttribute('data-content') == arrGrTools[j].id){
					arrGrTools[j].style.display = 'flex';
				}
			}
		}
	}
	arrGrTools[0].style.display = 'flex';
	// Handle Menu Panel
	for(var i=0; i<$('listPanel').children.length; i++){
		$('listPanel').children[i].onclick = function(e){
			if(e.target.getAttribute('data-content')=="manageSwatches"){
				location.href = "manageSwatches.html";
			}
			else{
				location.href = "index.html";
			}
			localStorage.setItem('currentPanel', e.target.getAttribute('data-content') );
		}
	}
	//---HANDLE ACTION BUTTON------------
	//-----Setting-------------
	$("settingConfig").onclick = function(){
		var dataDimension = localStorage.getItem("dimension");
		var directoryData = localStorage.getItem("directoryData");
		dataDimension = (dataDimension== null||dataDimension=='No Data'||dataDimension=='EvalScript error.')? "null" : dataDimension;
		var dataTemp = (dataDimension== "null")? {templates:[]} : JSON.parse(dataDimension).data;
		var countVariant = null;
		for(var i=0; i<dataTemp.templates.length; i++){
			if(dataTemp.templates[i].nameTemplate==dataTemp.activeTemplate){
				countVariant = Object.keys(dataTemp.templates[i].variants).length;
				break;
			}
		}
		csInterface.evalScript("generalSetting("+dataDimension+","+countVariant+", '"+directoryData+"')", function(res){
			if(res != ""){
				res = JSON.parse(res);						
				dataDimension = JSON.parse(dataDimension);
				dataDimension.data = res;
				var xhr = new XMLHttpRequest();
				xhr.open("PUT",'http://5e605a2dcbbe0600146cb8d7.mockapi.io/marginData/0',true);
				xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
				xhr.onload=function(){
					if(xhr.readyState == 4 && xhr.status == 200){
						directoryData = localStorage.setItem('directoryData', JSON.stringify(res.directoryData));
						location.reload();
					}
					else{
						csInterface.evalScript("alert('Error')");
					}
				}
				xhr.send(JSON.stringify(dataDimension));

				// localStorage.setItem("dimension", res);
				// res = (res=='No Data')? '{"templates": []}' : res;
				// loadTemplates( (JSON.parse(res)).templates, 'edit');
			}
		});
	}
	//------ Backup and restore-------
	$('backupDataBtn').onclick = function(){
		var statusData = localStorage.getItem('dimension');
		statusData=(statusData==null || statusData=='No Data')? 'NoData' : 'HasData'
		var data = {
			titleMsg: 'Backup/Restore',
			message: 'Enter the key name',
			btnLabel1: 'Backup',
			btnLabel2: 'Restore',
			mode: 'both',
			statusData: statusData
		};
		data = JSON.stringify(data);
		csInterface.evalScript("boxMessage("+data+")",function(res){
			var dateReturn = JSON.parse(res);
			var url = 'http://5e605a2dcbbe0600146cb8d7.mockapi.io/marginData';
			var request = new XMLHttpRequest();
			request.open('GET',url+ '?search='+ dateReturn.tabInp, true);
			request.onload = function(){
				var arrRes = JSON.parse(request.responseText);
				var response = [];
				for(var i=0; i<arrRes.length; i++){
					if(arrRes[i].name == dateReturn.tabInp){
						response = [arrRes[i]];
						break;
					}
				}
				if(request.readyState==4 && request.status==200){
					if(response.toString()==""){
						if(dateReturn.action=='Backup'){
							var objTemp = {
								name: dateReturn.tabInp,
								data: JSON.parse(localStorage.getItem('dimension'))
							}
							var xhr = new XMLHttpRequest();
							xhr.open('POST',url,true);
							xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
							xhr.onload=function(){
								if(xhr.readyState == 4 && xhr.status == 201){
									alert('The data has been stored successfully')
								}
								else{
									alert('Error backup data,Please try again!')
								}
							}
							xhr.send(JSON.stringify(objTemp));
						}
						else if(dateReturn.action=='Restore'){
							alert('The key name not exist');
						}
					}
					else{
						if(dateReturn.action=='Backup'){
							var objTemp={
								data: JSON.parse(localStorage.getItem('dimension'))
							}
							var xhr = new XMLHttpRequest();
							xhr.open('PUT',url+"/"+response[0].id,true);
							xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
							xhr.onload=function(){
								if(xhr.readyState == 4 && xhr.status == 200){
									alert('The data has been update successfully')
								}
								else{
									alert('Error update data, Please try again!')
								}
							}
							xhr.send(JSON.stringify(objTemp));
						}
						else if(dateReturn.action=='Restore'){
							localStorage.setItem('dimension', JSON.stringify(response[0].data) );
							alert('The data has been restore');
							location.href = "index.html";
						}
					}
				}
				else{
					alert("No response, Please check Network connection");
				}
			}
			request.send();
		})
	}
	//------Reset Data-----------------
	$('deleteDataBtn').onclick = function(){
		var data = {
			titleMsg: 'Reset Confirm',
			message: 'Do you want to clear data?',
			btnLabel1: 'Cancel',
			btnLabel2: 'Agree',
			mode: 'notify'
		};
		data = JSON.stringify(data);
		csInterface.evalScript("boxMessage("+data+")",function(response){
			response = JSON.parse(response);
			if(response.action == 'Agree'){
				localStorage.removeItem('dimension');
				//localStorage.removeItem('directoryData');
				location.href = "index.html";
			}
		})
	}
	$("timer").onclick = function(e){
		$("timer").style.display = 'none';
		$("controlShowtimer").style.display = 'block';
	}
	$("controlShowtimer").onclick = function(){
		$("timer").style.display = 'block';
		$("controlShowtimer").style.display = 'none';
	}
	var statusHasImage = setInterval(function(){
		csInterface.evalScript("statusHasImage()", function(response){
			if(parseInt(response) == 0){
				location.href = "TreeFolder.html";
			}
		})
	}, 1000);
	$('treeHandle').onclick=function(){
		location.href = "TreeFolder.html";
	}
}