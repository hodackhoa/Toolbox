function previewImage(mode, urlStr, dirChild, objThrow,language, msg){
    var logImg = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/linkImg.log");
    if(mode=="edit"){
        if(urlStr != undefined){
            logImg.open("w");
            logImg.write(urlStr + "*" + dirChild +"*"+objThrow+"*"+language);
            logImg.close();
        }
        sendLog(msg);
    }
    else{
        logImg.open("r");
        var linkImg = logImg.read();
        logImg.close();
        return linkImg;
    }
};
function rgbColor(hexValue, red,green,blue){
    var solidObj = new SolidColor();
    var rgbObj = new RGBColor();
    rgbObj.hexValue = hexValue;
    solidObj.rgb = rgbObj;
    return solidObj;
}
function showForegroundColor(hexValue){
    try{
        selectRGBChannel();
    }catch(err){};
    app.foregroundColor = rgbColor(hexValue.replace("#",""));
};
function createColorLayer(rgbPosition){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    var nameLayer = "C";
    var boxNewLayer = new Window("dialog", "New Solid Color", undefined, {closeButton: true});
    var grInfor = boxNewLayer.add("group");
        grInfor.orientation = "row";
        var blockColor = grInfor.add("group{size:[50,50]}");
        blockColor.graphics.backgroundColor = blockColor.graphics.newBrush(blockColor.graphics.BrushType.SOLID_COLOR, [rgbPosition[0]/255, rgbPosition[1]/255, rgbPosition[2]/255], 1 );
    var grName = grInfor.add("group{spacing: 0}");
    grName.orientation = "column";
        var nameIpn = grName.add("edittext{text:'"+nameLayer+"', characters: 10,maximumSize:[100,20], active: true}");
        var checkboxCreateSw = grName.add("checkbox{text:'Create Swatch'}");
    var grBtn = boxNewLayer.add("group");
    var btnOK = grBtn.add("button{text: 'OK', size: [100,20], properties:{name: 'ok'}}");
    var btnReplaceColor = grBtn.add("button{text: 'Replace', size: [100,20], properties:{name: 'cancel'}}");
    //---------------
    nameIpn.onChange = function(){
        nameLayer = this.text;
    }
    ///- handle OK btn
    btnOK.addEventListener ("click", function(){
        if(app.documents.length ==0){
            alert("No documents were opened", "Error");
        }
        else{
            if(checkboxCreateSw.value){
                var obj = {
                    rgbPosition: rgbPosition,
                    nameSwatch: nameLayer
                }
                sendLog(JSON.stringify(obj));
            }
            else{
                makeSolidColor(nameLayer, rgbPosition[0], rgbPosition[1], rgbPosition[2],undefined, true);
            }
        }
        boxNewLayer.close();
    });
    // handle checkbox
    checkboxCreateSw.onClick = function(){
        if(checkboxCreateSw.value){
            btnOK.dispatchEvent(new Event("click"));
        }
    }
    // handle replace color
    btnReplaceColor.onClick = function(){
        var objRgb = {
            red: rgbPosition[0],
            green: rgbPosition[1],
            blue: rgbPosition[2]
        }
        changeColorFill(objRgb);
        boxNewLayer.close();
    }
    boxNewLayer.show();
};
function sendLog(msg){
    var messageLog = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/messageLog.log");
    messageLog.open("w");
    messageLog.write(msg);
    messageLog.close();
};
function boxMessage(data){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    var response = {}, submit = true;
    var boxMsg = new Window("dialog", data.titleMsg, undefined, {closeButton: true});
    if(data.mode=="notify" || data.mode=="both"){
        var msg = boxMsg.add("statictext{text: '"+data.message+"'}");
    }
    if(data.mode=="form" || data.mode=="both"){
        var tabInp = boxMsg.add("edittext{characters: 20}");
        tabInp.text = (data.inputText==undefined)? "" : data.inputText;
        tabInp.active = true;
    }
    // panel profile-------------
    if(data.listObj !=undefined||data.inputObj !=undefined){
        var panelProfile = boxMsg.add("panel{text: 'Properties', orientation: 'column', alignment: 'center'}");
        panelProfile.alignChildren = "left";
    }
    if(data.listObj !=undefined){
        var grList = panelProfile.add("group")
        var labelList= grList.add("statictext{text: '"+data.listObj.label+"'}");
        var listItem = grList.add("dropdownlist");
        for(var i=0; i<data.listObj.arrItems.length; i++){
            listItem.add("item", data.listObj.arrItems[i]);
        }
        var activeItem=(data.listObj.selectedItem==undefined)? data.listObj.arrItems[0] : data.listObj.selectedItem;
        listItem.find (activeItem).selected = true;
        response.selectedItem = activeItem;
        listItem.onChange = function(){
            response.selectedItem = this.selection.toString();
        }
    }
    if(data.inputObj !=undefined){
        for(var i=0; i<data.inputObj.length; i++){
            if(data.inputObj[i].value == "noID"){
                continue;
            }
            var grInp = panelProfile.add("group");
            var labelInp = grInp.add("statictext{text:'"+data.inputObj[i].name+"'}");
            data.inputObj[i].value=(data.inputObj[i].value==undefined)? "" : data.inputObj[i].value;
            var inpTemp = grInp.add("edittext{characters: 3, text:'"+data.inputObj[i].value+"', index:'"+i+"', maximumSize: [200,20]}");
            if(data.inputObj[i].btnName != undefined){
                var btnInp = grInp.add("button{text:'"+data.inputObj[i].btnName+"', size:[60,20],  index:'"+i+"', properties:{name: 'cancel'}}");
                btnInp.onClick = function(){
                    data.inputObj[this.index].responseBtn = processImgUpload();
                    panelProfile.enabled = false;
                    /*processImgUpload(function(res){
                        data.inputObj[this.index].responseBtn = res;
                        panelProfile.enabled = false;
                    });*/
                }
            }
            //
            inpTemp.onChanging = function(){
                //if(isNaN(this.text) || parseInt(this.text) >100){
                    //alert("The value must be a number type", "Error");
                    //this.text = data.inputObj[this.index].value;
                //}
                //else{
                    data.inputObj[this.index].value = this.text;
                    //submit = true;
                //}
            }
            //
        }
        response.inputObj = data.inputObj;
    }
    // checkbox group----
    if(data.checkBoxObjs != undefined){
        var grCheckbox = panelProfile.add("group");
        for(var i=0; i< data.checkBoxObjs.length; i++){
            data.checkBoxObjs[i].value=(data.checkBoxObjs[i].value==undefined)? false : data.checkBoxObjs[i].value;
            var checkboxTemp = grCheckbox.add("checkbox{value: "+data.checkBoxObjs[i].value+", text: '"+data.checkBoxObjs[i].name+"', index:'"+i+"'}");
            checkboxTemp.onClick = function(){
                data.checkBoxObjs[this.index].value = this.value;
            }
        }
        response.checkBoxObjs = data.checkBoxObjs;
    }
    //----------------------------------
    var grBtn = boxMsg.add("group");
    var btnLeft = grBtn.add("button", [0,0,100,20],  data.btnLabel1, {name: "ok"});
    var btnRight = grBtn.add("button", [0,0,100,20],  data.btnLabel2, {name: "cancel"});
    for(var i=0; i<grBtn.children.length; i++){
        grBtn.children[i].onClick = function(){
            if(data.mode=="form" || data.mode=="both"){
                if(this.text =="Cancel"){
                    boxMsg.close();
                }
                if(tabInp.text == ""){
                    alert("Field name can't empty!");
                }
                else if(tabInp.text.search ("/") != (- 1) ){
                    alert("Field name cannot contain character as '/' ");
                }
                else if(submit){
                    response.action = this.text;
                    response.tabInp = tabInp.text;
                    boxMsg.close();
                }
            }
            else{
                response.action = this.text;
                boxMsg.close();
            }
        }
    }
    if(data.statusData =="NoData"){
        btnLeft.enabled = false;
    }
    boxMsg.show();
    return JSON.stringify(response);
};
function DownloadImage(url, fileSize, fileType, nameFile){
    var nameFileExtend = nameFile +"."+ fileType;
    var fileLog = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/DownImg.log");
    fileLog.open("w");
    fileLog.write(url+"|"+nameFileExtend);
    fileLog.close();
    fileType = (fileType=="zip")? "psd" : fileType;
    var psdDir = (fileType=="psd")?  (nameFile+"/") : "";
    var fileRun = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/Image Download_Toolbox.exe");
    fileRun.execute();
    var hasDownloaded = false;
    while(!hasDownloaded){
        var dirStr =(fileType=="jpg")?  "~/AppData/Roaming/Adobe/Toolbox Cache/Temp" : ("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/" + nameFile);
        var folderImg = new Folder(dirStr);
        var arrFiles = folderImg.getFiles();
        for(var i=0; i<arrFiles.length; i++){
            if(arrFiles[i].name == (nameFile+"."+fileType) && arrFiles[i].length == fileSize){
                hasDownloaded = true;
                break;
            }
        }
    }
    var img = new File("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/" +psdDir+nameFile+"."+fileType);
    return img.fsName;
};
function RemoveZipFile(nameFile){
    var zipFile = new File("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/" + nameFile +"/"+ nameFile+".zip");
    if(zipFile.exists){
        zipFile.remove();
    }
}
function GetTempImage(imageName, fileType){
    var linkImg = "";
    var dirStr = "~/AppData/Roaming/Adobe/Toolbox Cache/Temp";
    var dirPsd = (fileType=="psd")? (imageName+"/") : "";
    var folderCache = new Folder(dirStr);
    if(folderCache.exists){
        var fileImg = new File(dirStr + "/" +dirPsd+ imageName + "." + fileType);
        if(fileImg.exists){
            linkImg = fileImg.fsName;
        }
    }
    return linkImg;
};
// Upload PSD
function UploadPSDfile(nameFile){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    var res = "";
    if(app.documents.length==0){
        alert("No document opened", "Error");
    }
    else{
        var dirStr = "~/AppData/Roaming/Adobe/Toolbox Cache/Temp";
        var folderPsd = new Folder(dirStr+"/" +nameFile);
        if(!folderPsd.exists){
            folderPsd.create();
        }
        var targetFile = new File(dirStr+ "/" +nameFile+"/"+nameFile+".psd");
        //---------
        var mydoc = app.activeDocument;
        mydoc.save();
        //var hisback = mydoc.activeHistoryState;
        var docOrg = new File( File.decode (mydoc.fullName));
        try{
            var boundsSelc = mydoc.selection.bounds;
            mydoc.crop(boundsSelc);
            DelLayersEmpty(mydoc.layers);
        }catch(err){}
        finally{
            var myPsd = new PhotoshopSaveOptions();
            myPsd.alphaChannels = true;
            myPsd.embedColorProfile = true;
            mydoc.saveAs(targetFile, myPsd, false, Extension.LOWERCASE);
            //mydoc.activeHistoryState = hisback;
            mydoc.close(SaveOptions.DONOTSAVECHANGES);
            app.open(docOrg);
        }
       
        res = {
            fileSize: targetFile.length
        };
    
            var fileLog = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/DownImg.log");
            fileLog.open("w");
            fileLog.write(nameFile);
            fileLog.close();
            var fileRun = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/Zipfile_Toolbox.exe");
            fileRun.execute();
            var hasZip = false;
            var fileZip = new File(dirStr +"/"+ nameFile +"/"+ nameFile+".zip");
            while(!hasZip){
                if(fileZip.exists){ hasZip = true;}
            }
            res.uri = fileZip.fsName;

    }
    //---
    function DelLayersEmpty(arrLayers){
       var hasDel = false;
        for(var i= (arrLayers.length - 1); i>=0 ; i--){
            if(arrLayers[i].typename == "ArtLayer" &&  SumBounds(app.activeDocument, arrLayers[i]) ){
                var layerInfor = new LayerExtend(arrLayers[i]);
                if(!layerInfor.clippingMask || hasDel){
                    arrLayers[i].remove();
                    hasDel = true;
                }
            }
            else if(arrLayers[i].typename == "LayerSet"){
                DelLayersEmpty(arrLayers[i].layers);
                if(arrLayers[i].layers.length == 0){
                    arrLayers[i].remove();
                }
            }
            else{
                hasDel = false;
            }
        }
    }
    function SumBounds(doc, layer){
        var arrBounds = layer.bounds;
        var sum = 0;
        for(var i=0;i<arrBounds.length; i++){
            sum += arrBounds[i];
        }
        if(sum > 0){
            var wdLayer = arrBounds[2] - arrBounds[0];
            var htLayer = arrBounds[3] - arrBounds[1];
        }
        var checkName = (layer.name == "線画" || layer.name == "Stroke" || layer.name=="Nét vẽ");
        return (sum==0 || (wdLayer==doc.width && htLayer==doc.height && !checkName));
    }
    //---------------------------------
    return (res!="")? JSON.stringify(res) : res;
}
function DeletePSDFile(nameFile){
    var folderDel = new Folder("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/"+nameFile);
    var arrFiles = folderDel.getFiles();
    for(var i=0; i<arrFiles.length; i++){
        arrFiles[i].remove();
    }
    folderDel.remove();
};
function viewLayers(dirFile, dataPSDlayers, dataTranslate){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/es5-shim.js'
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/unorm.js'
    app.preferences.rulerUnits = Units.PIXELS;
    app.displayDialogs = DialogModes.NO;
    // get directory folder PSD
    var strDirPar = dirFile.split("/").reverse();
    strDirPar.splice (0, 1);
    var nameFile = strDirPar[0];
    strDirPar =  strDirPar.reverse().join("/");
    var logElement = new File(strDirPar +"/logElement.log");
    logElement.encoding = "utf-8";
    var arrElements = null;
    if(logElement.exists){
        logElement.open("r");
        arrElements = logElement.read();
        arrElements  = arrElements.split("|");
        logElement.close();
    }
    // open file PSD
    var filePSD = new File(dirFile);
    app.open(filePSD);
    SaveJPG (new File(strDirPar+ ".jpg"), 6);
    //------------------------------
    var doc = app.activeDocument;
    var arrLayers = doc.layers, logRes = [], elementCount=0;
    try{ doc.colorSamplers.removeAll(); }catch(err){}
    //--------create color sampler-------------
    var mySample = doc.colorSamplers.add([20,20]);
    ///////----------///////////////
    function createData(arrLayers, subName, oldDataPsd, objArtLyrSend) {
        var dataLayers = { artLayers: [], layerSets: []};
        var countLyrSet = 0, countArtLyr=0;
        for(var i=0; i<arrLayers.length; i++){
            var inforLyr = new LayerExtend(arrLayers[i]);
            // disable fx mode
            inforLyr.fxModeEnabled (false);
            if(arrLayers[i].typename == "ArtLayer"){
                //----save elements layer
                var elementDir = null;
                if(!logElement.exists){
                    var hisState = doc.activeHistoryState;
                    if(inforLyr.clippingMask){ inforLyr.releaseClippingMask (); }
                    inforLyr.showOnly();
                    arrLayers[i].allLocked = false;
                    arrLayers[i].opacity = 50;
                    var strFile = strDirPar +"/" + subName.replace(/\*/gi, "") + i;
                    elementDir = strFile;
                    var fileGIF = new File(strFile);
                    try{ inforLyr.loadSelectionMask();}catch(err){ inforLyr.loadSelectionRGB ();}
                    doc.artLayers.add();
                    try{
                        doc.selection.stroke(createSolidColor ("ff0000"), 2); 
                        SavePNG (fileGIF, 9);
                    }catch(err){}
                    doc.activeHistoryState = hisState;
                }
                logRes.push(elementDir);
                var blendModeType = arrLayers[i].blendMode.toString().replace("BlendMode.","");
                // create object artLayer ---------
                var obj = {};                                  
                // check data PSD if exists
                if(dataPSDlayers != undefined && arrLayers[i].parent.typename != "Document"){
                    try{var nameTemp = objArtLyrSend[countArtLyr].name;}catch(err){alert(objArtLyrSend.length)}
                    nameTemp = (typeof nameTemp =="string")? nameTemp : nameTemp.en;
                    dataReplace.arrNameSw.push( translateNameLayer({name: nameTemp}));
                    dataReplace.arrImgDir.push( (arrElements==null)?  (elementDir+".png") : (arrElements[elementCount]+".png"));
                    dataReplace.arrColorSw.push(objArtLyrSend[countArtLyr].color);
                }
                else{
                    obj.name = translateNameLayer(arrLayers[i]),
                    obj.type= "ArtLayer",
                    obj.blendMode= blendModeType[0] + blendModeType.substr (1).toLowerCase(),
                    obj.opacity= arrLayers[i].opacity,
                    obj.clippingMask= inforLyr.clippingMask,
                    obj.imgDir = (arrElements==null)?  (elementDir+".png") : (arrElements[elementCount]+".png")
                    dataLayers.artLayers.push(obj);
                    // get RGB color from file PSD
                    if(arrLayers[i].kind.toString()=="LayerKind.SOLIDFILL"){
                        obj.color = getColorFillValue(arrLayers[i]);
                    }
                    else{
                        obj.color = GetColorLayer(arrLayers[i], mySample);
                    }   
                }
                countArtLyr++;                                  
                elementCount++;
                //-------------------------------
            }
            else if(arrLayers[i].typename == "LayerSet" && arrLayers[i].layers.length>0){
                if(inforLyr.layerMask){ 
                    inforLyr.activeLayerMask(false); 
                }
                //alert(JSON.stringify(oldDataPsd))
                var objLyrSetSend = (oldDataPsd==undefined)? undefined : oldDataPsd[countLyrSet].layerSets;
                var objArtLyrTemp = (oldDataPsd==undefined)? undefined: oldDataPsd[countLyrSet].artLayers;
                var dataChild = createData(arrLayers[i].layers, (subName +"-"+arrLayers[i].parent.name+"-"+arrLayers[i].name), objLyrSetSend, objArtLyrTemp);
                var objSet = {
                    name: translateNameLayer(arrLayers[i]),
                    type: "LayerSet",
                    artLayers: dataChild.artLayers,
                    layerSets: dataChild.layerSets
                }
                dataLayers.layerSets.push(objSet);
                countLyrSet++;
            }
        }
        //if(dataTranslate != undefined) {doc.save();}
        return dataLayers;
    }
    //translate
    function translateNameLayer(layer){
        var newName = layer.name;
        var arrName = (newName.split("・").length > 1)?newName.split("・") : (newName.split("_").length > 1)? newName.split("_") : newName.split("/");
        var endName = {en:"", vn:"", jp: ""}, hasFound=false;
        for(var j=0; j<arrName.length; j++){
            if(arrName[j].search(/[ｧ-ﾝﾞﾟ]/) >= 0){ 
                arrName[j] = arrName[j].normalize("NFKC");
            }
        	var tempName = {en:arrName[j], vn:arrName[j], jp: arrName[j]};
        	var nameLayer = arrName[j].toLowerCase().split("(")[0];
        	var nameLayer2 = nameLayer + "s";
            var nameLayer3 = nameLayer.replace(/\d|\_base|\*/gi, "");
            for(var i=0; i< dataTranslate.length; i++){
                var en = dataTranslate[i].en.toLowerCase().split("(")[0];
                var vn = dataTranslate[i].vn.toLowerCase().split("(")[0];
                var jp = dataTranslate[i].jp.toLowerCase().split("(")[0];
                if( jp.search(/[ｧ-ﾝﾞﾟ]/) >= 0){ jp = jp.normalize("NFKC");}
                if(nameLayer==en|| nameLayer==vn||nameLayer==jp || nameLayer2==en|| nameLayer2==vn||nameLayer2==jp
                    || nameLayer3==en|| nameLayer3==vn||nameLayer3==jp
                ){
                	tempName = dataTranslate[i];
                	hasFound = true;
                    break;
                }
            }
            for(var key in endName){
            	endName[key] =(endName[key]=="")?tempName[key] : (endName[key] + "_"+ tempName[key]);
            }
        }
        return (hasFound)? endName : newName;
    }
    //  process call------------
    var dataReplace ={arrImgDir: [], arrNameSw: [], arrColorSw: []},  count=0;
    var res = createData(arrLayers, "",(dataPSDlayers==undefined)?dataPSDlayers : dataPSDlayers.layerSets);
    // edit imgDir for psdData available from server
    if(dataPSDlayers != undefined){
        editImgDir(dataPSDlayers.layerSets);
        function editImgDir(arrData){
            for(var i=0; i<arrData.length; i++){
                for(var j=0; j< arrData[i].artLayers.length; j++){
                    arrData[i].artLayers[j].imgDir = dataReplace.arrImgDir[count];
                    arrData[i].artLayers[j].name = dataReplace.arrNameSw[count];
                    arrData[i].artLayers[j].color = dataReplace.arrColorSw[count];
                    count++;
                }
                if(arrData[i].layerSets.length>0){
                    editImgDir(arrData[i].layerSets);
                }
            }
        }
    }
    // write file Element log---------
    if(!logElement.exists){
        logElement.open("w");
        logElement.write(logRes.join("|") );
        logElement.close();
    }
    doc.close(SaveOptions.DONOTSAVECHANGES);
    //close infor panel
    app.runMenuItem(stringIDToTypeID ("closeInfoPanel"));
    //------------------
    return (dataPSDlayers==undefined)? JSON.stringify(res) : JSON.stringify(dataPSDlayers);
}
function OpenInPS(dirFile){
    var fileOpen = new File(dirFile);
    var psdStr = dirFile.split(".jpg")[0];
    var psdDir = new Folder(psdStr);
    if(psdDir.exists){
        var arrTemp = psdStr.split("/");
        var nameFile = arrTemp.reverse()[0];
        fileOpen = new File(psdStr +"/"+  nameFile + ".psd")
    }
    app.open(fileOpen);
};
//
function CacheClr(objImg){
    var fileLog = new File("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/" + objImg.idName +"/logElement.log");
    fileLog.remove();
}
function boxCloneSwatches(objThrow, dirChild, dataTranslate){
     var boxMsg = new Window("dialog", "Palette Uri", undefined, {closeButton: true});
     var mainGr = boxMsg.add("group");
     mainGr.alignChildren= "left";
     var labelGr = mainGr.add("group");
     labelGr.add("statictext{text:'Uri:'}");
     labelGr.add("edittext{text:'"+objThrow.uri+"', enabled:false}");
     var inpGrChild = mainGr.add("group");
     inpGrChild.add("statictext{text:'Child:'}");
     var inpText = inpGrChild.add("edittext{characters:6}");
     var btnOk = boxMsg.add("button{text:'OK',size:[80,20], properties:{name:'ok'}}");
     //handle input name
     inpText.onChange = function(){
     }
     //handle btn Ok --------
     var res = null;
     btnOk.onClick = function(){
        res = inpText.text
        boxMsg.close();
     }
     boxMsg.show();
     return res;
}
//--------//Function Listener
function createGroup(name){
    var currentLayer = app.activeDocument.activeLayer;
    var myGroup = app.activeDocument.layerSets.add();
    myGroup.name = name;
    myGroup.move(currentLayer, ElementPlacement.PLACEBEFORE);
};
function convertUri(uriDir){
    uriDir = uriDir.split("/");
    if(uriDir[0]==""  && uriDir[1]==""){
        var newUri = uriDir.slice(2);
        newUri[0] = "//" + newUri[0];
        uriDir = newUri;
    }
    else if(uriDir[0]==""){
        uriDir.splice (0, 1);
        uriDir[0] = uriDir[0].toUpperCase() + ":";
    }
        else{
            var userName = $.getenv("USERNAME");
            uriDir[0] = "C:/Users/" + userName ;
         }
    uriDir = uriDir.join("/");
    uriDir  = uriDir.replace (/%20/gi, " ");
    return uriDir;
};
function addSwatches(dataBoxMsg, rgbOld, paletteActive, objNewSwSender){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    //var docImg = app.activeDocument;
    if(paletteActive != undefined){paletteActive = paletteActive.value;}
    if(paletteActive==null){
        alert("Choose palette to add swatches", "Warning");
        return;
    }
    // send name swatch-- get from preview panel
    dataBoxMsg.inputText = (objNewSwSender!= undefined)? objNewSwSender.nameSwatch : dataBoxMsg.inputText;
    var responseMsg = boxMessage(dataBoxMsg);
    responseMsg = JSON.parse(responseMsg);
    var myColor = "";
    if(responseMsg.action == "OK"){
        var mySolid = new SolidColor();
        if(rgbOld != undefined){
            mySolid.rgb.hexValue = rgbOld.hexValue;
            app.foregroundColor = mySolid;
        }
        //-----------
        if(objNewSwSender == null){
            var colorPicker = app.showColorPicker();
            if(colorPicker){
                myColor = app.foregroundColor.rgb;
                myColor.red = parseInt(myColor.red.toFixed());
                myColor.red = (myColor.red > 255) ? 255 : myColor.red;
                myColor.green = parseInt(myColor.green.toFixed());
                myColor.green = (myColor.green > 255) ? 255 : myColor.green;
                myColor.blue = parseInt(myColor.blue.toFixed());
                myColor.blue = (myColor.blue > 255) ? 255 : myColor.blue;
            }
        }
        else{
            myColor = new RGBColor();
            myColor.red = objNewSwSender.rgbPosition[0];
            myColor.green = objNewSwSender.rgbPosition[1];
            myColor.blue = objNewSwSender.rgbPosition[2];
        }
    }
    return (myColor=="")? "" : JSON.stringify({rgbObj: myColor, inforSw: responseMsg.tabInp, blendMode:responseMsg.selectedItem, opacity: responseMsg.inputObj[0].value, clippingMask: responseMsg.checkBoxObjs[0].value, invertMask: responseMsg.checkBoxObjs[1].value});
}
//-------
function PsdJsonData(data, idName){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    var fileLog = new File("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/" + idName + "/"+ idName+".json");
    fileLog.encoding = "utf-8";
    fileLog.open("w");
    fileLog.write(JSON.stringify(data));
    fileLog.close();
    return JSON.stringify({uri: fileLog.fsName, fileSize: fileLog.length});
};
function addDataTranslate(obj, language){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/client/json2.js'
    var response = null;
    var boxNewName = new Window("dialog{text:'New object', properties:{closeButton:true}}");
    var grEn = boxNewName.add("group{orientation: 'row'}");
    var labelEn = grEn.add("statictext{text:'English', preferredSize:[80,-1]}");
    var inpEn = grEn.add("edittext{characters: 10, name:'en'}");
    inpEn.active = true;
    var grJp = boxNewName.add("group{orientation:'row'}");
    var labelJp = grJp.add("statictext{text:'Japanese', preferredSize:[80,-1]}");
    var inpJp = grJp.add("edittext{characters: 10, name:'jp'}");
    var grVn = boxNewName.add("group{orientation:'row'}");
    var labelVn = grVn.add("statictext{text:'Vietnamese', preferredSize:[80,-1]}");
    var inpVn = grVn.add("edittext{characters: 10, name:'vn'}");
    var grBtn = boxNewName.add("group");
    var btnOk = grBtn.add("button{text:'OK',size:[100,20],properties:{name: 'ok'}}");
    
    var arrIpn = boxNewName.children;
    for(var i=0; i<arrIpn.length; i++){
        if(arrIpn[i].children[1] != undefined){
            arrIpn[i].children[1].text = obj[arrIpn[i].children[1].name];
            if(arrIpn[i].children[1].name == language){
                arrIpn[i].children[1].enabled = false;
                break;
            }
        }
    }
    inpEn.onChange = function(){
        obj.en = this.text;
    }
    inpJp.onChange = function(){
        obj.jp = this.text;
    }
    inpVn.onChange = function(){
        obj.vn = this.text;
    }
    
    btnOk.onClick = function(){
        if(inpEn.text=="" || inpJp.text=="" || inpVn.text==""){
            alert("Fields cannot be empty", "Error");
        }
        else{
            response = obj;
            boxNewName.close();
        }
    };
    boxNewName.onClose = function(){
    }
    boxNewName.show();
    return JSON.stringify(response);
};
//--------------------------------
function LayerExtend(layer){
    app.activeDocument.activeLayer = layer;
    var ref = new ActionReference();
    ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ornd"), charIDToTypeID("Trgt"));
    var desGet = executeActionGet(ref);
    this.clippingMask = (function(){
        return desGet.getBoolean(charIDToTypeID("Grup"));
    })();
    this.makeClippingMask = function(){
        var desMakeClipping = new ActionDescriptor();
        desMakeClipping.putReference(charIDToTypeID("null"), ref);
        executeAction( charIDToTypeID("GrpL"), desMakeClipping);
        return this;
    }
    this.releaseClippingMask = function(){
        var desMakeClipping = new ActionDescriptor();
        desMakeClipping.putReference(charIDToTypeID("null"), ref);
        executeAction( charIDToTypeID("Ungr"), desMakeClipping);
        return this;
    }
    this.layerMask = (function(){
        return desGet.getBoolean(stringIDToTypeID("hasUserMask"));
    })();
    // active Layer Mask
    this.activeLayerMask = function(value){
        var des = new ActionDescriptor();
        des.putReference(charIDToTypeID("null"), ref);
            var des2 = new ActionDescriptor();
            des2.putBoolean( charIDToTypeID("UsrM"), value)
        des.putObject(charIDToTypeID("T   "),charIDToTypeID("UsrM"), des2);
        executeAction( charIDToTypeID("setd"), des);
        return this;
    }
    // Active effect mode for layer
    this.fxModeEnabled = function(bool){
        //check fx mode
        if(desGet.getBoolean(charIDToTypeID("lfxv")) ){
            var mode = (bool)? "Shw " : "Hd  ";
            var ref = new ActionReference();
            var list = new ActionList();
            ref.putClass(charIDToTypeID("Lefx"));
            ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ornd"), charIDToTypeID("Trgt"));
            list.putReference(ref);
            var desSet = new ActionDescriptor();
            desSet.putList(charIDToTypeID("null"), list);
            executeAction(charIDToTypeID(mode), desSet, DialogModes.NO);
        }
    }
    //show only
    this.showOnly = function(){
        var listAc = new ActionList();
        listAc.putReference(ref);
            var desShowOnly = new ActionDescriptor();
            desShowOnly.putList(charIDToTypeID("null"), listAc);
            desShowOnly.putBoolean(charIDToTypeID( "TglO" ), true);
        executeAction( charIDToTypeID("Shw "), desShowOnly);
    }
    //loadSelection from mask
    this.loadSelectionMask = function(){
        var desSec = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putProperty( charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
        desSec.putReference(charIDToTypeID("null"), ref1);
        
        var ref2 = new ActionReference();
        ref2.putEnumerated( charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Msk "));
        desSec.putReference(charIDToTypeID("T   "), ref2);
        executeAction( charIDToTypeID("setd"), desSec, DialogModes.NO);
        return this;
    }
    //-----RGB selection
    this.loadSelectionRGB = function(){
        var desSec = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putProperty( charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
        desSec.putReference(charIDToTypeID("null"), ref1);
        
        var ref2 = new ActionReference();
        ref2.putEnumerated( charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Trsp"));
        desSec.putReference(charIDToTypeID("T   "), ref2);
        executeAction( charIDToTypeID("setd"), desSec, DialogModes.NO);
        return this;
    }
}
function makeSolidColor(name, red, green, blue, rgbObj, maskInvert, blendMode, opacity, clipping){
    changeBackground ("#000000");
    changeForeground ("#ffffff");
    if(rgbObj !=undefined){
        red = rgbObj.red;
        green = rgbObj.green;
        blue = rgbObj.blue;
    }
    try{
        app.activeDocument.selection.bounds;
        maskInvert = false;
    }
    catch(err){}
    var idMk = charIDToTypeID( "Mk  " );
    var desc6 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        ref1.putClass( idcontentLayer );
    desc6.putReference( idnull, ref1 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc7 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc7.putString( idNm, name );
        var idType = charIDToTypeID( "Type" );
            var desc8 = new ActionDescriptor();
            var idClr = charIDToTypeID( "Clr " );
                var desc9 = new ActionDescriptor();
                var idRd = charIDToTypeID( "Rd  " );
                desc9.putDouble( idRd, red );
                var idGrn = charIDToTypeID( "Grn " );
                desc9.putDouble( idGrn, green );
                var idBl = charIDToTypeID( "Bl  " );
                desc9.putDouble( idBl, blue );
            var idRGBC = charIDToTypeID( "RGBC" );
            desc8.putObject( idClr, idRGBC, desc9 );
        var idsolidColorLayer = stringIDToTypeID( "solidColorLayer" );
        desc7.putObject( idType, idsolidColorLayer, desc8 );
    var idcontentLayer = stringIDToTypeID( "contentLayer" );
    desc6.putObject( idUsng, idcontentLayer, desc7 );
    executeAction( idMk, desc6, DialogModes.NO );
    //------------
    if(maskInvert || maskInvert==undefined){
        selectMaskChannel();
        var idInvr = charIDToTypeID( "Invr" );
        executeAction( idInvr, undefined, DialogModes.NO);
    }
    if(blendMode != undefined && blendMode!="undefined"){
        app.activeDocument.activeLayer.blendMode = BlendMode[blendMode.replace(" ", "").toUpperCase()];
    }
    if(opacity !=undefined && opacity !="undefined"){
        app.activeDocument.activeLayer.opacity = parseInt(opacity);
    }
    if(clipping){
        var extendLayer =  new LayerExtend(app.activeDocument.activeLayer);
        extendLayer.makeClippingMask();
    }
};
function createSnapshot(name){
    var idMk = charIDToTypeID( "Mk  " );
    var desc8 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idSnpS = charIDToTypeID( "SnpS" );
        ref1.putClass( idSnpS );
    desc8.putReference( idnull, ref1 );
    var idFrom = charIDToTypeID( "From" );
        var ref2 = new ActionReference();
        var idHstS = charIDToTypeID( "HstS" );
        var idCrnH = charIDToTypeID( "CrnH" );
        ref2.putProperty( idHstS, idCrnH );
    desc8.putReference( idFrom, ref2 );
    var idNm = charIDToTypeID( "Nm  " );
    desc8.putString( idNm, name );
    var idUsng = charIDToTypeID( "Usng" );
    var idHstS = charIDToTypeID( "HstS" );
    var idFllD = charIDToTypeID( "FllD" );
    desc8.putEnumerated( idUsng, idHstS, idFllD );
    executeAction( idMk, desc8, DialogModes.NO );
};
function deleteSnapShot(name){
    var idDlt = charIDToTypeID( "Dlt " );
    var desc381 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref21 = new ActionReference();
        var idSnpS = charIDToTypeID( "SnpS" );
        ref21.putName( idSnpS, name );
    desc381.putReference( idnull, ref21 );
    executeAction( idDlt, desc381, DialogModes.NO );
};
function changeForeground(data){
    var newSolid = new SolidColor;
    var newRgb = new RGBColor;
    newRgb.hexValue = data.replace("#","");
    newSolid.rgb = newRgb;
    //alert(newSolid.rgb.hexValue);
    app.foregroundColor =newSolid;
};
function changeBackground(data){
    var newSolid = new SolidColor;
    var newRgb = new RGBColor;
    newRgb.hexValue = data.replace("#","");
    newSolid.rgb = newRgb;
    //alert(newSolid.rgb.hexValue);
    app.backgroundColor =newSolid;
};
function selectMaskChannel(){
    var idslct = charIDToTypeID( "slct" );
    var desc189 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref4 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref4.putEnumerated( idChnl, idChnl, idMsk );
    desc189.putReference( idnull, ref4 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc189.putBoolean( idMkVs, false );
    executeAction( idslct, desc189, DialogModes.NO );
};
function selectRGBChannel(){
    var idslct = charIDToTypeID( "slct" );
    var desc1018 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref422 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idRGB = charIDToTypeID( "RGB " );
        ref422.putEnumerated( idChnl, idChnl, idRGB );
    desc1018.putReference( idnull, ref422 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc1018.putBoolean( idMkVs, false );
    executeAction( idslct, desc1018, DialogModes.NO );
};
function changeColorFill(objRGB){
    var doc = app.activeDocument;
    var ref = new ActionReference();
    ref.putEnumerated( stringIDToTypeID("contentLayer"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    var descColor = new ActionDescriptor();
        var descRGB = new ActionDescriptor();
        descRGB.putDouble( charIDToTypeID( "Rd  "), objRGB.red);
        descRGB.putDouble( charIDToTypeID( "Grn "), objRGB.green);
        descRGB.putDouble( charIDToTypeID( "Bl  "), objRGB.blue);
    descColor.putObject( charIDToTypeID("Clr "), charIDToTypeID( "RGBC" ), descRGB);
    desc.putObject( charIDToTypeID("T   "), stringIDToTypeID("solidColorLayer"), descColor);
    executeAction(charIDToTypeID("setd"),  desc, DialogModes.NO);
}
function getColorFillValue(layerColor){
    app.activeDocument.activeLayer = layerColor;
    var ref = new ActionReference();
    //ref.putName( stringIDToTypeID("contentLayer"), layerColor.name);
    ref.putEnumerated(stringIDToTypeID("contentLayer"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
    var desGet = executeActionGet(ref);
    var desAdjs = desGet.getList(charIDToTypeID("Adjs"));
    var colorFill = desAdjs.getObjectValue(0) ;
    var rgbColor =  colorFill.getObjectValue(colorFill.getKey(0) ) ;
    //---------
    var solidColor = new SolidColor();
        var myRGB = new RGBColor();
        myRGB.red = parseInt(rgbColor.getDouble( rgbColor.getKey(0)).toFixed());
        myRGB.green = parseInt(rgbColor.getDouble( rgbColor.getKey(1)).toFixed());
        myRGB.blue = parseInt(rgbColor.getDouble( rgbColor.getKey(2)).toFixed());
    solidColor.rgb = myRGB;
    var myColor = {rgb : {red: myRGB.red, green: myRGB.green, blue: myRGB.blue, hexValue: solidColor.rgb.hexValue}};
    return myColor;
}
 function GetColorLayer(myLayer, colorSample){
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    //---------------
    var doc = app.activeDocument;
    doc.activeLayer = myLayer;
    var state1 = doc.activeHistoryState;
    var myColor = null;
    try{createSnapshot ("base");}catch(err){ 
        if(state1.name!="base"){ 
            deleteSnapShot("base"); 
            doc.activeHistoryState = state1;
            createSnapshot ("base");
        }
    }
    var ref = new ActionReference();
    ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
    var desGet = executeActionGet(ref);
    var hasMask = desGet.getBoolean( stringIDToTypeID("hasUserMask"));
    //check clipping
    var hasClipping = desGet.getBoolean( charIDToTypeID("Grup"));
    if(hasClipping){
        var desSet = new ActionDescriptor();
        desSet.putReference(charIDToTypeID("null"), ref);
        executeAction( charIDToTypeID("Ungr"), desSet);
    }
    // Show Only
    var listAc = new ActionList();
    listAc.putReference(ref);
    var desShowOnly = new ActionDescriptor();
    desShowOnly.putList(charIDToTypeID("null"), listAc);
    desShowOnly.putBoolean(charIDToTypeID( "TglO" ), true);
    executeAction( charIDToTypeID("Shw "), desShowOnly);
    //---------------
    if(hasMask ){
        var desSet = new ActionDescriptor();
        desSet.putReference(charIDToTypeID("null"), ref);
            var desMask = new ActionDescriptor();
            desMask.putBoolean(charIDToTypeID("UsrM"), false);
        desSet.putObject(charIDToTypeID("T   "), charIDToTypeID("UsrM"), desMask);
        executeAction( charIDToTypeID("setd"), desSet);
        // reveal All if x-pos <0
        if(myLayer.bounds[0].value< 0 || myLayer.bounds[1].value<0){ doc.revealAll();}
        colorSample.move([myLayer.bounds[0].value + 5,  myLayer.bounds[1].value + 5 ]);
        try{
            myColor = colorSample.color;
        }catch(err){
        }
    }
    else{
        // trace RGB color use colorsampler
        var layerSize = {width: (myLayer.bounds[2] - myLayer.bounds[0]).value, height: (myLayer.bounds[3] - myLayer.bounds[1]).value}
        var pos = [myLayer.bounds[0].value,  myLayer.bounds[1].value ];
        pos[0] = (pos[0] < 0)? 0 : pos[0];
        pos[1] = (pos[1] < 0)? 0 : pos[1];
        colorSample.move(pos);
        try{myColor = colorSample.color;}catch(err){
            var count = 0;
            while(myColor==null){
                pos[0] = pos[0] + 10;
                var progressiveVal = (10* layerSize.height/layerSize.width);
                pos[1] = pos[1] + progressiveVal;
                count++;
                var invertX = myLayer.bounds[2].value - (count*10);  
                var invertY = myLayer.bounds[3].value - (count*progressiveVal);
                if(pos[0]  >= myLayer.bounds[2].value || pos[1]  >= myLayer.bounds[3].value || invertX <=myLayer.bounds[0].value || invertY <=myLayer.bounds[1].value){ break;}
                colorSample.move(pos);
                try{myColor = colorSample.color;}catch(err){
                    colorSample.move([invertX, pos[1] ]);
                    try{myColor = colorSample.color;}catch(err){
                        colorSample.move([invertX, invertY ]);
                        try{ myColor = colorSample.color;}catch(err){
                            colorSample.move([pos[0], invertY ]);
                            try{ myColor = colorSample.color;}catch(err){}
                        }
                    }
                }
            }
        }
    }
    if(myColor!=null){
        var rgbObj = {red: parseInt(myColor.rgb.red.toFixed()), green: parseInt(myColor.rgb.green.toFixed()), blue: parseInt(myColor.rgb.blue.toFixed()), hexValue: myColor.rgb.hexValue };
        myColor = {rgb : rgbObj};
    }
    else{
        myColor = {rgb: {red: 255, green: 255, blue: 255, hexValue: "FFFFFF"} };
    }
    doc.activeHistoryState = doc.historyStates.getByName("base");
    return myColor;
}
function changeForeground(data){
    var newSolid = new SolidColor;
    var newRgb = new RGBColor;
    newRgb.hexValue = data.replace("#","");
    newSolid.rgb = newRgb;
    //alert(newSolid.rgb.hexValue);
    app.foregroundColor =newSolid;
};
function SaveJPG(file, quality){
    var jpgRef = new JPEGSaveOptions();
    jpgRef.formatOptions = FormatOptions.OPTIMIZEDBASELINE;
    jpgRef.quality = quality;
    jpgRef.embedColorProfile = false;
    app.activeDocument.saveAs(file, jpgRef,true);
}
function SavePNG(file, compression){
    var pngRef= new PNGSaveOptions();
    pngRef.compression = compression;
    app.activeDocument.saveAs(file, pngRef,true);
}
function SaveGIF(file){
    var gifRef= new ExportOptionsSaveForWeb();
    gifRef.colors = 32;
    gifRef.dither = Dither.DIFFUSION;
    gifRef.format = SaveDocumentType.COMPUSERVEGIF;
    gifRef.ditherAmount = 100;
    gifRef.transparency = true;
    app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, gifRef);
}
function createSolidColor(hexValue){
    var newSolid = new SolidColor();
    var newRgb = new RGBColor();
    newRgb.hexValue = hexValue;
    newSolid.rgb = newRgb;
    return newSolid;
}