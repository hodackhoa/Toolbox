//-----------------------------------------------------------------
function marginAuto(templateActive, variantObj, additBotMar, idRun, hasCloseDoc, directoryData){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    app.displayDialogs = DialogModes.NO;
    //---------------------
    var wd = variantObj.width, ht = variantObj.height;
    var mt= (variantObj.marginTop==undefined)? 0 : variantObj.marginTop;
    var mb= (variantObj.marginBot==undefined)? 0 : variantObj.marginBot;
    var ml= (variantObj.marginLeft==undefined)? 0 : variantObj.marginLeft;
    var mr= (variantObj.marginRight==undefined)? 0 : variantObj.marginRight;
    
    var canvasObj = {
        arrBound: null,
        docImg: app.activeDocument,
        left: function(){this.docImg.resizeCanvas( this.arrBound[2], this.docImg.height, AnchorPosition.MIDDLELEFT); return this;},
        right: function(){this.docImg.resizeCanvas(this.arrBound[0], this.docImg.height, AnchorPosition.MIDDLERIGHT); return this;},
        top: function(){this.docImg.resizeCanvas(this.docImg.width, this.arrBound[3], AnchorPosition.TOPCENTER); return this;},
        bottom: function(){ this.docImg.resizeCanvas(this.docImg.width, this.arrBound[1],  AnchorPosition.BOTTOMCENTER); return this;}
    };
    //------------------
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    var docImg = app.activeDocument;
    var layerCrop = app.activeDocument.activeLayer;
    //-------------------------------------------------------------------------------
    // create layerMask if posible
    if(variantObj.createMask || variantObj.canvasType != "None" || (mt+mb+ml+mr) != 0){
        createLayerMask(templateActive);
    }
    //-----------------------------------------------------------
    if(variantObj.canvasType != "None" || (mt+mb+ml+mr) != 0 ){
        if(variantObj.canvasType == "Ratio" || variantObj.canvasType  == "None"){
            var ratioW = wd;
            var ratioH = ht;
            var productWd = parseInt( (layerCrop.bounds[2] - layerCrop.bounds[0]).toString().replace(" px","") );
            var productHt =parseInt( (layerCrop.bounds[3] - layerCrop.bounds[1]).toString().replace(" px","") );
            if(variantObj.unitMargin=="Percent"){
                wd = parseInt( (10000/(100-(ml+mr))) * productWd/100 );
                wd = parseInt( wd.toFixed(0));
                ht = parseInt( (10000/(100-(mt+mb))) *  productHt/100  );
                ht = parseInt( ht.toFixed(0));
            }
            else{
              wd = productWd + ml + mr;
              ht = productHt + mt+ mb;
            }
        }
        if(variantObj.unitMargin=="Percent"){
            var mlOrg = ml, mrOrg = mr, mtOrg=mt, mbOrg=mb;
            ml = parseInt((ml*wd/100).toFixed (0));
            mr = parseInt((mr*wd/100).toFixed (0));
            mt = parseInt((mt*ht/100).toFixed (0));
            mb = parseInt((mb*ht/100).toFixed (0));
        }
        var resMargin =  calculatorMargin(wd, ht, mt, mb, ml, mr, additBotMar, variantObj.canvasType);
        var arrbound = getBounds(docImg, layerCrop);
        for(var i=0; i<arrbound.length;i++){
            arrbound [i] = parseInt(arrbound[i].toString().replace(" px",""));
        }
      
        arrbound = readGuide(arrbound);
        arrbound[0] = arrbound[2]-arrbound[0];
        arrbound[1] = arrbound[3]-arrbound[1];
        //arrbound[3] = readGuide(arrbound[3]);
        canvasObj.arrBound = arrbound;
        canvasObj.left().right().top().bottom();
        //---------------------------------
        var k = 0;
        for(var key in resMargin.marAfter){
        	if(key == 0){
        		k++;
        	}
        }
        // check image Crop detail or full
        if( (k > 2 && (resMargin.marAfter.mt + resMargin.marAfter.mb==0) && (resMargin.marAfter.ml + resMargin.marAfter.mr==0))
          || ( (resMargin.marAfter.ml + resMargin.marAfter.mr)==0 && checkWH(wd,ht) && resMargin.arrSideHasCut[2] && resMargin.arrSideHasCut[3])
        ){
            cropImage(wd,ht);
        }
        else{
            var cutLR = false;
            if(resMargin.marAfter.ml + resMargin.marAfter.mr==0 &&  resMargin.arrSideHasCut[2] && resMargin.arrSideHasCut[3]){cutLR = true;}
            imageSize(resMargin.wd, resMargin.ht , docImg);
            canvasObj.arrBound = resMargin.arrbound;
            canvasObj.left().right().top().bottom();
            arrbound = getBounds(docImg, layerCrop).toString().replace(/ px/gi, "").split(",");
            for(var i=0;i<arrbound.length;i++){
                arrbound[i] = parseInt(arrbound[i]);
            }
            arrbound = readGuide(arrbound);
            // RATIO Process-------------
            if(variantObj.canvasType == "Ratio"){
                var tempWd = parseInt ( (ratioW*docImg.height/ratioH).toString().replace(" px","") );
                var tempHt = parseInt ( (ratioH*docImg.width/ratioW).toString().replace(" px","") );
                if(tempWd > docImg.width){
                    docImg.resizeCanvas(tempWd, null, AnchorPosition.MIDDLELEFT);
                }
                else{
                    docImg.resizeCanvas(null, tempHt, AnchorPosition.TOPCENTER);
                }
                if(variantObj.unitMargin=="Percent"){
                    var arrMarOrg = [mtOrg, mbOrg, mlOrg, mrOrg];
                    var sidePre = null;
                    for(var i=0; i< arrMarOrg.length; i++){
                        if(resMargin.marAfter[i] != 0){
                            sidePre = (i>1)? docImg.width : docImg.height;
                            resMargin.marAfter[i] = parseInt ( (arrMarOrg[i]*sidePre/100).toString().replace(" px","") );
                        }
                    }
                }
            }
            // Run after ----------
            if(variantObj.position == "Bottom"){
                afterCanvasBot(arrbound, resMargin.marAfter.mt, resMargin.marAfter.mb, resMargin.marAfter.ml, resMargin.marAfter.mr, resMargin.arrSideHasCut);
            }
            else{
                afterCanvasCen(arrbound, resMargin.marAfter.mt, resMargin.marAfter.mb, resMargin.marAfter.ml, resMargin.marAfter.mr, variantObj.position, resMargin.arrSideHasCut);
            }
            //scale image fit to canvas
            if(cutLR){
                if(layerCrop.bounds[0] != 0){
                    var perCut = (layerCrop.bounds[0]/ (docImg.width  - layerCrop.bounds[0]) )*100;
                    perCut = perCut + 100;
                    layerCrop.resize(perCut, perCut, AnchorPosition.MIDDLERIGHT);
                }
            }
            //add guide ------------------------------
            if(app.activeDocument.guides.length > 0){runMenuItem(app.charIDToTypeID("ClrG"));}
            //alert(resMargin.marAfter[0]);
            docImg.guides.add(Direction.HORIZONTAL, resMargin.marAfter.mt);
            docImg.guides.add(Direction.HORIZONTAL, docImg.height- resMargin.marAfter.mb);
            docImg.guides.add(Direction.VERTICAL, resMargin.marAfter.ml);
            docImg.guides.add(Direction.VERTICAL, docImg.width - resMargin.marAfter.mr);
        }
        ////------------
        if(onOffLayerMask(null, true) ) {selectMaskChannel();}
        if(!variantObj.createMask){onOffLayerMask(null, false);}
    }
    //---------------
    try{
        docImg.artLayers.getByName("Fake-278651").remove();
        docImg.selection.deselect();
    }catch(err){}
    
    for(var i=0; i< app.activeDocument.artLayers.length; i++){
        if(app.activeDocument.artLayers[i].kind.toString() == "LayerKind.LEVELS"){
            app.activeDocument.artLayers[i].visible = false;
        }
    }
    /////////////// Run Save At Time---------
    if(templateActive.saveAtTime){
        progressBox.setValue(70, "Complete process canvas");
        savePSD(directoryData, templateActive, variantObj, idRun, hasCloseDoc);
        //saveImage(null, idRun, templateActive, variantObj, hasCloseDoc, orgDirData);
    }
    else{
        progressBox.setValue(100, "Complete process canvas");
    }
}
//----------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------
function readGuide(arrbound){
    var docGuide = app.activeDocument;
    if(docGuide.guides.length < 4){
        var valueGuide = "";
        var k = 0;
        for(var i=0; i<docGuide.guides.length; i++){
            valueGuide = docGuide.guides[i].coordinate.toString().replace(" px","");
            valueGuide = parseInt (parseInt(valueGuide).toFixed (0)) + 1;
            if(docGuide.guides[i].direction.toString() == "Direction.VERTICAL"){
                if(k==0){
                    arrbound[0] = valueGuide;
                    k = 1;
                }
                else{
                    arrbound[2] = valueGuide;
                }
            }
            else{
                if(valueGuide > (docGuide.height/2 - (docGuide.height * 5)/100)){
                    arrbound[3] = valueGuide;
                }
                else{
                    arrbound[1] = valueGuide;
                }
            }
        }
    }
    else if(docGuide.guides.length > 3){
        runMenuItem(app.charIDToTypeID("ClrG"));
    }
    if(arrbound[0] > arrbound[2]){
        var tempBound = arrbound[0];
        arrbound[0] = arrbound[2];
        arrbound[2] = tempBound;
    }
    progressBox.setValue(15, "Read guides");
    return arrbound;
};
function checkWH(wd, ht){
    var docImg = app.activeDocument;
    var docImgW = parseInt(docImg.width.toString().replace(" px",""));
    var docImgH = parseInt(docImg.height.toString().replace(" px",""));
    //alert(docImgH/docImgW  +"   "+ ht/wd);
   progressBox.setValue(15);
   return ( docImgH/docImgW> ht/wd)? true : false;
};
function calculatorMargin(wd,ht, mt,mb,ml,mr, additBotMar, canvasType){
    var resCheckMargins = checkBounds(mt,mb,ml,mr);
    var marAfter = resCheckMargins.marginAfter; 
    var arrSideHasCut = resCheckMargins.arrSideHasCut;
    marAfter.mb = (additBotMar)? marAfter.mb : 0;
    afterWd = wd - (marAfter.ml + marAfter.mr);
    afterHt = ht - (marAfter.mt + marAfter.mb);
    var arrbound = [((afterWd+marAfter.mr)+marAfter.ml), ((afterHt+marAfter.mb)+ marAfter.mt),(afterWd+marAfter.mr),(afterHt+marAfter.mb)];
    progressBox.setValue(20, "Calculating margin");
    return {wd : afterWd, ht : afterHt, arrbound: arrbound, marAfter : marAfter, arrSideHasCut: arrSideHasCut};
}

function getBounds(docImg, layerCrop){
    /*app.displayDialogs = DialogModes.NO;
    var parentLayer = layerCrop.parent;
    var firstBounds=true, arrInvisible=[];
    var hisback = docImg.activeHistoryState;
    if(firstBounds){
        firstBounds =false;
        for(var i=0; i<parentLayer.artLayers.length;i++){  
            if(parentLayer.artLayers[i].bounds[2]==docImg.width&&parentLayer.artLayers[i].bounds[3]==docImg.height
                && parentLayer.artLayers[i].bounds[0] ==0 && parentLayer.artLayers[i].bounds[1] == 0
            ){   
                    arrInvisible.push(parentLayer.artLayers[i]);
                }
           }
       }
   for(var i=0; i<arrInvisible.length;i++){
       arrInvisible[i].visible = false;
       }
    if(parentLayer.typename=="Document"){
        docImg.artLayers.add();
        try{
            parentLayer.mergeVisibleLayers();
        }
        catch(err){
            app.activeDocument.activeLayer = app.activeDocument.artLayers[1];
            app.activeDocument.activeLayer.visible = true;
        }
    }
    else{layerCrop.parent.merge();}
    arrbound = docImg.activeLayer.bounds;
    docImg.activeHistoryState = hisback;
    for(var i=0; i<arrInvisible.length;i++){
       arrInvisible[i].visible = true;
    }*/
    var arrbound = app.activeDocument.activeLayer.bounds;
    return arrbound;
};

function imageSize(wd, ht, docImg){
    var min, max ;
    if(wd>ht){
            max = ht;  min = null; 
           	if(docImg.width>docImg.height){
               	checkside = docImg.width*max/docImg.height;
               	if(checkside > wd){
                	min = wd;  max = null;
                }
            }
    }
    if(wd<ht){
        min = wd;  max = null;
        if(docImg.width<docImg.height){
            checkside = docImg.height*min/docImg.width;
            if(checkside > ht){
                max = ht;  min = null;
            }
          }
    }
	if(wd==ht){
        max = wd; min=null;
        if(docImg.width>docImg.height){
            max = null ; min=wd;
        }
    }
    docImg.resizeImage(min, max);
    progressBox.setValue(40, "Image size");
 };
// aftercanvas CENTER ---------------
function afterCanvasCen(arrbound, mt,mb, ml, mr, position, arrSideHasCut){
    var docImg = app.activeDocument;
    var wd = parseInt(docImg.width.toString().replace(" px",""));
    var ht = parseInt(docImg.height.toString().replace(" px",""));
    var hasCenterVertical = false, hasCenterHorizon=false;
    if(mb == 0 && !hasCenterHorizon && arrSideHasCut[1]){
        if(ht - (arrbound[3] -1) != mb){
            if(ht - arrbound[3] != mb){
                fixCanvas = (arrbound[3]-1)+mb;
                docImg.resizeCanvas( wd, fixCanvas, AnchorPosition.TOPCENTER);
                docImg.resizeCanvas(wd, ht, AnchorPosition.BOTTOMCENTER);
            }
        }
        if(!arrSideHasCut[2] && !arrSideHasCut[3]){
            centerHorizon(wd, ht, arrbound, mt,mb, ml, mr);
            hasCenterHorizon = true;
        }
    }      
    
    if(mr==0 && !hasCenterVertical && arrSideHasCut[3]){
        if(wd - (arrbound[2] -1) != mr){
            if(wd - arrbound[2] != mr){
                fixCanvas = (arrbound[2]-1)+mr;
                docImg.resizeCanvas(fixCanvas, ht, AnchorPosition.MIDDLELEFT);
                docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLERIGHT);
            }
        }
        if(!arrSideHasCut[0] && !arrSideHasCut[1] && position == "Center"){
            centerVertical(wd, ht, arrbound, mt,mb, ml, mr);
            hasCenterVertical = true;
        }
     }
    if(ml == 0 && !hasCenterVertical && arrSideHasCut[2]){
        if(arrbound[0] +1 != ml){
            if(arrbound[0] !=ml){
                fixCanvas = wd - ((arrbound[0]+1)-ml);
                docImg.resizeCanvas(fixCanvas, ht, AnchorPosition.MIDDLERIGHT);
                docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLELEFT);
            }
        }
        if(!arrSideHasCut[0] && !arrSideHasCut[1] && position == "Center"){
            centerVertical(wd, ht, arrbound, mt,mb, ml, mr);
            hasCenterVertical = true;
        }
    }
    if(mt == 0 && !hasCenterHorizon && arrSideHasCut[0]){
        if(arrbound[1] +1 != mt){
            if(arrbound[1] != mt){
                fixCanvas = ht - ((arrbound[1]+1)-mt);
                docImg.resizeCanvas(wd, fixCanvas, AnchorPosition.BOTTOMCENTER);
                docImg.resizeCanvas(wd, ht, AnchorPosition.TOPCENTER);
           	}
        }
        if(!arrSideHasCut[2] && !arrSideHasCut[3]){
            centerHorizon(wd, ht, arrbound, mt,mb, ml, mr);
            hasCenterHorizon=true;
        }
    }
    if(!arrSideHasCut[0] && !arrSideHasCut[1]&& !arrSideHasCut[2] && !arrSideHasCut[3] && position == "Center"){
    	centerHorizon(wd, ht, arrbound, mt,mb, ml, mr);
    	centerVertical(wd, ht, arrbound, mt,mb, ml, mr);
    }
    progressBox.setValue(60, "Canvas again(center)");
};

//after canvas Bottom--------
function afterCanvasBot(arrbound, mt,mb, ml, mr, arrSideHasCut){
    var docImg = app.activeDocument;
    var wd = parseInt(docImg.width.toString().replace(" px",""));
    var ht = parseInt(docImg.height.toString().replace(" px",""));
    if(!arrSideHasCut[0]){
        if(ht - (arrbound[3] -1) != mb){
            if(ht - arrbound[3] != mb){
                 fixCanvas = (arrbound[3]-1)+mb;
                 docImg.resizeCanvas( wd, fixCanvas, AnchorPosition.TOPCENTER);
                 docImg.resizeCanvas(wd, ht, AnchorPosition.BOTTOMCENTER);
            }
        }
        if(ml !=0 && mr !=0){
            centerHorizon(wd, ht, arrbound, mt,mb, ml, mr);
        }
    }      
    
    if(arrSideHasCut[3]){
        if(wd - (arrbound[2] -1) != mr){
            if(wd - arrbound[2] != mr){
                fixCanvas = (arrbound[2]-1)+mr;
                docImg.resizeCanvas(fixCanvas, ht, AnchorPosition.MIDDLELEFT);
                docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLERIGHT);
                }
            }
        //centerVertical(wd, ht);
     }
    if(arrSideHasCut[2]){
        if(arrbound[0] +1 != ml){
            if(arrbound[0] !=ml){
                fixCanvas = wd - ((arrbound[0]+1)-ml);
                docImg.resizeCanvas(fixCanvas, ht, AnchorPosition.MIDDLERIGHT);
                docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLELEFT);
                }
            }
        //centerVertical(wd, ht);
     }
     // if(arrSideHasCut[0]){
     //     if(arrbound[1] +1 != mt){
     //         if(arrbound[1] != mt){
     //            fixCanvas = ht - ((arrbound[1]+1)-mt);
     //            docImg.resizeCanvas(wd, fixCanvas, AnchorPosition.BOTTOMCENTER);
     //            docImg.resizeCanvas(wd, ht, AnchorPosition.TOPCENTER);
     //            }
     //        }
     //     if(ml !=0 && mr !=0){
     //        centerHorizon(wd, ht, arrbound, mt,mb, ml, mr);
     //    }
     // }
    progressBox.setValue(60, "Canvas again");
}
function centerHorizon(wd,ht, arrbound, mt,mb, ml, mr){
   var docImg = app.activeDocument;
   if(((arrbound[0]+1) !=ml || (wd - (arrbound[2]-1))!=mr)&&(arrbound[0] !=ml || (wd - arrbound[2])!=mr)){
      fixCanvas = ((arrbound[2]+ arrbound[0]) + (wd- (arrbound[2]+ arrbound[0]))/2).toFixed(0);
      fixCanvas = parseInt(fixCanvas); 
      docImg.resizeCanvas(fixCanvas, ht, AnchorPosition.MIDDLELEFT);
      docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLERIGHT);
   }
};
function centerVertical(wd, ht, arrbound, mt,mb, ml, mr){
    var docImg = app.activeDocument;
	if(((arrbound[1]+1) !=mt || (ht - (arrbound[3]-1))!=mb)&&(arrbound[1] !=mt || (ht - arrbound[3])!=mb)){
	    fixCanvas = ((arrbound[3]+arrbound[1]) + (ht- (arrbound[3]+arrbound[1]))/2).toFixed(0);
	    fixCanvas = parseInt(fixCanvas); 
	    docImg.resizeCanvas(wd, fixCanvas, AnchorPosition.TOPCENTER);
	    docImg.resizeCanvas(wd, ht, AnchorPosition.BOTTOMCENTER);
    }
};
function checkBounds(mt, mb, ml, mr){
    var bounds = app.activeDocument.activeLayer.bounds;
    var docSize = app.activeDocument;
    var arrSideHasCut =[false, false, false, false];
    var marginAfter = {mt: mt, mb: mb, ml: ml, mr: mr};
    if(bounds[0] == 0){ marginAfter.ml = 0; arrSideHasCut[2]=true;}
    if(bounds[1] == 0){marginAfter.mt = 0; arrSideHasCut[0]=true;}
    if(bounds[2].toString() == docSize.width.toString()){marginAfter.mr = 0; arrSideHasCut[3]=true;}
    if(bounds[3].toString() == docSize.height.toString()){marginAfter.mb = 0; arrSideHasCut[1]=true;}
    return {marginAfter: marginAfter,  arrSideHasCut :arrSideHasCut };
 };
function cropImage(wd, ht){
    var docImg = app.activeDocument;
    var resDoc = [docImg.width, docImg.height];
    try{
            var bgLayer  = docImg.backgroundLayer;
            bgLayer.isBackgroundLayer = false;
        }
    catch(err){
        }
    finally{
        var max = ht , min = null ;
        if(docImg.width<docImg.height){
            min = wd;
            max = null;
            docImg.resizeImage(min, max);
            if(docImg.height<ht){
                docImg.resizeImage(null, ht);
                }
            }
        if(docImg.width==docImg.height){
            if(wd>ht){
                min = wd;
                max = null;
                }
            docImg.resizeImage(min, max);
            }
        if(docImg.width>docImg.height){
            docImg.resizeImage(min, max);
            }
        docImg.resizeCanvas(wd, ht, AnchorPosition.MIDDLECENTER);
    }
};
//------------------------------
function adjustFeather(){
    var docImg = app.activeDocument;
    var arrBoundsSec = docImg.selection.bounds;
    var widthPro = (docImg.width - arrBoundsSec[0]) - (docImg.width- arrBoundsSec[2]);
    var heightPro = (docImg.height - arrBoundsSec[1]) - (docImg.height- arrBoundsSec[3]);
    var maxSide = (widthPro >heightPro)? widthPro : heightPro;
    var feather = parseFloat((maxSide/3000).toString().replace(" px", ""));
    feather = parseFloat(feather.toFixed (1));
    return feather;
}
function createLayerMask(templateActive){
    //----show Progressbar
    if(!templateActive.saveAtTime){
        progressBox(100,"",100);
    }
    progressBox.setValue(10, "Create mask...");
    //----------------------------
    var docSize = app.activeDocument;
    var hasStructor = false, hasBackSec=false;
    var arrLayersPosible = [], totalBounds=0;
    deselectAllPaths();
    for(var i=0; i< docSize.artLayers.length; i++){
        var boundWid = docSize.artLayers[i].bounds[2];
        var boundHeg = docSize.artLayers[i].bounds[3];
        for(var j=0; j<docSize.artLayers[i].bounds.length; j++){
            totalBounds += docSize.artLayers[i].bounds[j];
        }
        if(docSize.artLayers[i].kind.toString()=="LayerKind.NORMAL" && totalBounds!=0){
            //arrLayersPosible.push(docSize.artLayers[i]);
            docSize.activeLayer = docSize.artLayers[i];
            if(!onOffLayerMask(null,true)){
                try{
                    try{
                        docSize.selection.bounds;
                        //check refine edge--------
                        var histories = docSize.historyStates;
                        var runRefine = false;
                        for(var i=0; i< histories.length; i++){
                            if(histories[i].name=="Quick Selection"||histories[i].name=="Magic Wand"){
                                runRefine = true;
                                //break;
                            }
                            else if(histories[i].name== "Select and Mask"){
                                runRefine = false;
                            }
                        }
                        if(runRefine){refineSelection(3,15, 0,20, 0);}
                        //refineSelection(3,15, 0,20, 0);
                    }
                    catch(err){
                        try{
                            var myChannel = docSize.channels.getByName("backsec");
                            docSize.selection.load(myChannel);
                        }
                        catch(err){
                            var myPath = docSize.pathItems[0];
                            myPath.makeSelection(0, true);
                            myPath.deselect();
                        }
                    }
                }
                catch(err){
                    docSize.activeLayer.isBackgroundLayer = false;
                    loadSelectionLayer(null,null);
                }
            }
            else{
                try{
                    var myChannel = docSize.channels.getByName("backsec");
                    docSize.selection.load(myChannel);
                    var layerFake = docSize.artLayers.add();
                    layerFake.name = "Fake-278651";
                    docSize.selection.fill(objSolidColor("888888"));
                    hasBackSec = true;
                }
                catch(err){
                    loadSelectionLayer(null,"Mask");
                }
                hasStructor = true;
            }
            break;
        }
    }
    //-------store selection--------------
    selectRGBChannel();
    var channelsActive = app.activeDocument.activeChannels;
    try{
        var myChannel = docSize.channels.getByName("backsec");
    }
    catch(err){
        var myChannel = docSize.channels.add();
        myChannel.name = "backsec";
        myChannel.kind = ChannelType.MASKEDAREA;
    }
    if(!hasBackSec || !hasStructor){
        docSize.selection.store(myChannel, SelectionType.REPLACE);
        myChannel.visible = false;
        docSize.activeChannels = channelsActive;
        try{deleteSnapShot("stateNoMask");}catch(err){}
        createSnapshot("stateNoMask");
    }
    //-----------------
    if(!hasStructor){
        docSize.selection.feather(adjustFeather());
        var productLayer = docSize.activeLayer;
        docSize.artLayers[docSize.artLayers.length - 1].isBackgroundLayer = false;
        makeMask();
        productLayer.name = "Product";
        makeSolidColor("WhiteBG", 255,255,255, undefined,false);
        var bgWhite =  docSize.artLayers.getByName("WhiteBG");
        bgWhite.move(productLayer, ElementPlacement.PLACEAFTER);
        app.activeDocument.activeLayer = productLayer;
    } 
}
//--------------------------------
function savePSD(directoryData, templateActive, variantObj, idRun, hasCloseDoc){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var docSize = app.activeDocument;
    //-----------------------------&&&&------------------------------------------
    //directoryData = JSON.parse(directoryData);
    if(directoryData==null){ alert("Directory not set", "Message"); return false;}
    else{
        if(directoryData.psdDirectory != ""){
            var directoryPSD = directoryData.psdDirectory;
        }
        else{
            alert("Directory not set", "Message");
            return false;
        }
    }
    //--------------------
    var variantDefault= {
        formatImage : "JPG",
        saveForWeb : false,
        pathItem: {
            status : false
        },
        idVariant: 1,
        background: {type: "None"},
        savePSD: true
    }
    if(idRun == null){
        variantObj = variantDefault; 
        templateActive = {variants: {"Variant 1": variantObj} }
    }
  // declare PSD reference---
    var psdSaveOption = new PhotoshopSaveOptions();
    psdSaveOption.embedColorProfile = true;
    psdSaveOption.layers = true;
    var folderPsd = new Folder(directoryPSD);
    //----------------------
    if(!folderPsd.exists){folderPsd.create();}
    //------------------ 
    var orgURI = convertUri( (docSize.fullName).toString() );
    orgURI = orgURI.split("/").slice(0, orgURI.split("/").length - 1);
    
    var nameFile = docSize.name.split(".");
    nameFile = File.decode(nameFile[0].toString());
    var psdArrFiles = folderPsd.getFiles("*.psd");
    var psdExist = true;
    var filePSD = new File(convertUri(folderPsd.absoluteURI) +"/"+ nameFile + ".psd");
    
    var datePre = new Date();
    datePre = datePre.toString().match (/\d/g).join("");
    datePre = datePre.substring (0, datePre.length - 3);
    var userName = $.getenv("USERNAME");

    for(var i=0;i<psdArrFiles.length; i++){
        if(File.decode(psdArrFiles[i].name.split(".")[0].toString() )== nameFile){
            if(docSize.info.author != userName){
                filePSD = new File(convertUri(folderPsd.absoluteURI) +"/"+ nameFile+"_"+ datePre + ".psd");
                docSize.info.author = userName;
                psdExist = false;
                break;
            }
        }
    }
    if(psdExist){
        docSize.info.author = userName;
    }
    // store directory Original of image---------------------
    if(docSize.info.ownerUrl == ""){
        docSize.info.ownerUrl  = orgURI.join("/");
        orgURI =  docSize.info.ownerUrl;
    }
    else{
        var checkFolder = new Folder(docSize.info.ownerUrl);
        if(!checkFolder.exists){
            //orgURI =  directoryPSD;
            docSize.info.ownerUrl  = orgURI.join("/");
            orgURI =  docSize.info.ownerUrl;
        }
        else{orgURI = docSize.info.ownerUrl;}
    }
    //----------------------------------------------
    if(variantObj.savePSD){
        docSize.saveAs(filePSD, psdSaveOption, true);
    }
    //---------------------------------
    var orgDirData = {
        orgURI : orgURI,
        totalFiles: (Folder(orgURI).getFiles().length )
    }
    if(variantObj.idVariant == 1){
        try{ createSnapshot("stateV1"); }catch(err){}
    }
    //save Image
    if(templateActive.saveAtTime){
        progressBox.setValue(80, "Save PSD file");
    }
    else{
        progressBox(100,"", 100);
        progressBox.setValue(40, "PSD saving...");
    }
    saveImage(idRun, templateActive, variantObj, hasCloseDoc, orgDirData);
}
function saveImage(idRun, templateActive, variantObj, hasCloseDoc, orgDirData){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    app.displayDialogs = DialogModes.NO;
    var docSize = app.activeDocument;
    var msgError = "";
    var checkDimension = true;
    //app.activeDocument.colorProfileType = ColorProfile.WORKING;
    //invisible layer Level----
    var hasBG = false;
    for(var i=0; i< app.activeDocument.artLayers.length; i++){
        if(docSize.artLayers[i].kind.toString() == "LayerKind.LEVELS"){
            //docSize.artLayers[i].visible = false;
        }
        if(docSize.artLayers[i].kind.toString()=="LayerKind.SOLIDFILL"){
            if(variantObj.background.type != "None" && !hasBG){
                docSize.activeLayer = docSize.artLayers[i];
                makeSolidColor("BG-cache",0,0,0, variantObj.background.solidColor.rgb);
                hasBG = true;
            }
            else{
                //docSize.artLayers[i].visible = false;
            }
        }
    }
    //app.activeDocument.pathItems.removeAll();
    if(variantObj.canvasType =="Pixel"){
        if(docSize.width != variantObj.width || docSize.height != variantObj.height){
            checkDimension = false;
            msgError = "Dimension not match ("+variantObj.width+"px :  "+variantObj.height+"px)" ;
        }
    }
    else if(variantObj.canvasType == "Ratio"){
        if( parseInt((docSize.width/variantObj.width).toString().replace(" px","")) != parseInt((docSize.height/variantObj.height).toString().replace(" px","")) ){
            checkDimension = false;
            msgError = "Aspect ratio not match ("+variantObj.width+" : "+variantObj.height+")" ;
        }
    }

    if(!checkDimension){
        //alert("Dimension not match ("+width+"px : "+height+"px)", "Error Dimension");
        var mybox = new Window("dialog", "Warning Dimension", undefined, {closeButton: true});
        var gr1 = mybox.add("group");
        gr1.orientation = "column";
        var panelWarning = gr1.add("panel{text: 'Message', orientation: 'row', alignment: ['left', 'center'], size:[300, 50]}");
        panelWarning.alignChildren = ['center', 'center'];
        var notifi = panelWarning.add("statictext{text: '"+msgError+"'}");
        notifi.graphics.foregroundColor = notifi.graphics.newPen (notifi.graphics.PenType.SOLID_COLOR, [0.93,0.62,0.00], 1 )
        var grBtn = gr1.add("group");
        var btnCancel = grBtn.add("button", [0,0,100,0],  "Cancel",{name: "cancel"});
        var btnOk = grBtn.add("button", [0,0,100,20],  "Continue",{name: "ok"});
        btnOk.onClick=function(){
            try{
                docSize.selection.feather(0.1);
                for(var i=0;i<docSize.artLayers.length;i++){
                    if(docSize.artLayers[i].kind.toString() == "LayerKind.NORMAL"){
                        docSize.activeLayer = docSize.artLayers[i];
                        docSize.artLayers[i].name = "Product";
                        refineSelection(3,15, 0, 20, 0);
                        makeMask ();
                        break;
                    }
                }
                makeSolidColor("WhiteBG", 255,255,255);
                var productLayer = docSize.artLayers.getByName("Product");
                var bgWhite =  app.activeDocument.artLayers.getByName("WhiteBG");
                bgWhite.move(productLayer, ElementPlacement.PLACEAFTER);
                docSize.activeLayer = productLayer;
            }
            catch(err){}
            checkDimension = true;
            mybox.close();
        }
        mybox.show();
    }
    if(checkDimension){
        var docName = convertUri( (app.activeDocument.fullName).toString() );
        var datePre = new Date(); //dclare Date
        //-----------------------------------//
        var nameFile = app.activeDocument.name.split(".");
        nameFile = File.decode(nameFile[0].toString());
        var nameImage = nameFile;
        var yearPresent = datePre.getFullYear();
        if(nameFile.split("_").length>2 && (nameFile.split("_")[nameFile.split("_").length -  1].search(yearPresent) >= 0) ){
            var orgnameFile = nameFile.split("_");
            nameImage = orgnameFile[0] + "_" + orgnameFile[1];
        }
        //---------
        //-----------------------------------
        var preferFormat = null;
        var extendFormat = "";
         //JPEG Format
         if(variantObj.formatImage == "JPG"){
             if(variantObj.saveForWeb){
                var preferJPG = new ExportOptionsSaveForWeb();
                preferJPG.includeProfile = true;
                preferJPG.format= SaveDocumentType.JPEG;
                preferJPG.quality = 100;
                preferJPG.optimized = true;
            }
            else{
                var preferJPG = new JPEGSaveOptions();
                preferJPG.embedColorProfile = true;
                preferJPG.quality = 12;
                preferJPG.formatOptions  = FormatOptions.OPTIMIZEDBASELINE;
            }
            preferFormat = preferJPG;
            extendFormat = ".jpg";
        }
        //-------------
        //PNG Format---------------------
        if(variantObj.formatImage == "PNG"){
            if(variantObj.saveForWeb){
                var preferPNG = new ExportOptionsSaveForWeb();
                preferPNG.includeProfile = true;
                preferPNG.format= SaveDocumentType.PNG;
                preferPNG.quality = 100;
                preferPNG.optimized = true;
            }
            else{
                var preferPNG = new PNGSaveOptions();
                preferPNG.compression = 4;
                preferPNG.interlaced = false;
            }
            preferFormat = preferPNG;
            extendFormat = ".png";
        }
        //------------SAVE PathItem--------------------
        if(variantObj.pathItem != undefined){
            if(variantObj.pathItem.status && docSize.pathItems.length >0){
                var myPath = docSize.pathItems[0];
                if(myPath.name != variantObj.pathItem.pathName){
                    myPath.name = variantObj.pathItem.pathName;
                }
                if(variantObj.pathItem.flatness >0){myPath.makeClippingPath(variantObj.pathItem.flatness); }
            }
        }
        //-----------------------------------------------
        //app.activeDocument.saveAs(new File(convertUri(folderParent.absoluteURI) +"/"+ nameFile + ".jpg"), jpgSaveOption, true);
        // Process SUB name--------------
        if(variantObj.subName != undefined){
            var subName = variantObj.subName.value;
            if(variantObj.subName.type == "Number"){
                subName = (variantObj.subName.value == "Sequence")? variantObj.idVariant : (parseInt(variantObj.subName.value) + (variantObj.idVariant-1));
                subName = (subName==1)? "" : ("_"+subName);
            }
        }
        else{subName = "";}
        //-----Check file in folder
        if(variantObj.idVariant == 1){
            var folderImg = new Folder(orgDirData.orgURI);
            var arrFiles = folderImg.getFiles();
            var nameDel= "";
            for(var i=0; i<arrFiles.length; i++){
                if( (File.decode(arrFiles[i].name)).split(".")[0] == nameImage){ nameDel = File.decode(arrFiles[i].name); break;}
            }
        }
        //----------------------------$$$$$$$$$$$----------
        progressBox.setValue(90, "Saving file...");
        if(variantObj.saveForWeb){
            app.activeDocument.exportDocument(new File(orgDirData.orgURI +"/"+ nameImage +subName+ extendFormat), ExportType.SAVEFORWEB, preferFormat);
        }
        else{
            app.activeDocument.saveAs(new File(orgDirData.orgURI + "/" + nameImage +subName+ extendFormat), preferFormat, true);
        }
        //app.activeDocument.activeLayer = app.activeDocument.artLayers.getByName("Product");
        //active solid Color layer
        for(var i=0; i< app.activeDocument.artLayers.length; i++){
            if(docSize.artLayers[i].kind.toString()=="LayerKind.SOLIDFILL"){
                docSize.artLayers[i].visible = true;
            }
        }
        ///
        if(hasCloseDoc){
            var countVariant =0;
            try{
                for(var key in templateActive.variants){
                    countVariant++;
                }
                removeOrgFile(orgDirData, nameImage, countVariant, nameDel);
            }catch(err){}
   
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        }
    }  
    progressBox.setValue(100, "Complete");
};
function removeOrgFile(orgDirData, nameImage, countVariant, nameDel){
    var folderImg = new Folder(orgDirData.orgURI);
    var arrFiles = folderImg.getFiles();
    if( (arrFiles.length > (orgDirData.totalFiles + (countVariant-1) ))&& nameDel != "" ){ File(orgDirData.orgURI+"/"+ nameDel).remove();}
}

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
function hisBack(nameState){
    /*var histories = app.activeDocument.historyStates;
    var totalHis = histories.length;
    for(var i=0; i< totalHis; i++){
        if(!histories[histories.length -1].snapshot){
            deleteHistory();
        }
    }*/
    clearHistoryStates();
    var hisState = app.activeDocument.historyStates.getByName(nameState);
    app.activeDocument.activeHistoryState = hisState;
    selectRGBChannel();
}

function makeShadow(desaturation){
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    
    var docImg = app.activeDocument;
    var layerProduct = docImg.activeLayer;
    try{
        docImg.selection.bounds;
        onOffLayerMask(null,true);
        selectRGBChannel();
    }
    catch(err){
        loadSelectionLayer(null, null);
    }
    docImg.selection.copy();
    var shadowLayer = docImg.paste();
    shadowLayer.move(layerProduct, ElementPlacement.PLACEAFTER);
    shadowLayer.name = "Shadow";
    loadSelectionLayer(null,null);
    docImg.selection.contract(5);
    try{
        var currentWorkPath = docImg.pathItems.getByName("Work Path");
        currentWorkPath.name = "earlyPath";
    }catch(err){}
    docImg.selection.makeWorkPath(1);
    var pathShadow = docImg.pathItems.getByName("Work Path");
    pathShadow.deselect();
    //process brightness shadow
    var arrBoundsProduct = layerProduct.bounds;
    var arrboundShadow = shadowLayer.bounds;
    var arrPathPoints = pathShadow.subPathItems[0].pathPoints;
    var axisX =null, axisY = null, mySample=null;
    shadowLayer.visible = false;
    for(var i=0; i<arrPathPoints.length;i++){
        axisX = arrPathPoints[i].anchor[0];
        axisY = arrPathPoints[i].anchor[1];
        docImg.colorSamplers.removeAll();
        try{mySample = docImg.colorSamplers.add([axisX, axisY]);
            if(mySample.color.hsb.brightness == 100){
                break;
            }
        }
        catch(err){}
    }
    shadowLayer.visible = true;
    var brightnessSampler = mySample.color.hsb.brightness;
    var valueLevels = (brightnessSampler*255)/100;
    shadowLayer.adjustLevels(0,valueLevels,1,0,255);
    mySample.remove();
    try{
        copyPathItem(currentWorkPath.name, null);
        currentWorkPath.remove();
    }catch(err){}
    deselectAllPaths();
    docImg.activeLayer = shadowLayer;
    // desaturation-----------
    if(desaturation){
        shadowLayer.desaturate();
    }
    //close infor panel
    app.runMenuItem(stringIDToTypeID ("closeInfoPanel"));
};
function makePath(){
    var docImg = app.activeDocument;
    try{
        var selectionBounds = docImg.selection.bounds;
        var boxTolerance = new Window("dialog", "Make Work Path", undefined , {closeButton: true});
        boxTolerance.orientation = "row";
        var labelTole = boxTolerance.add("statictext{text:'Tolerance:'}");
        var InpTole = boxTolerance.add("edittext{characters: 5, text: '1'}");
        InpTole.active = true;
        var okBtn = boxTolerance.add("button{text:'OK'}");
        var tolerance = 1;
        okBtn.onClick = function(){
            tolerance = parseFloat(InpTole.text);
            boxTolerance.close();
        }
        boxTolerance.show();
        docImg.selection.makeWorkPath(tolerance);
    }
    catch(err){alert(err);}
}
function clearGuides(e){
    if(app.activeDocument.guides.length>0){
        if(e != undefined){
            runMenuItem(app.charIDToTypeID("ClrG"));
        }
        return app.activeDocument.guides.length;
    }
};
function logTime(timeStr){
    //alert (typeof timeStr +" " + timeStr);
    if(app.documents.length >0){
        var newLog = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/CSXS/logTime.txt");
        var oldStr = "00 : 00 : 00";
        if(timeStr != undefined){
            var newStrTime = "", hasChange = false;
            var nameImg = app.activeDocument.name;
            newLog.open("r");
            var arrTemp = newLog.read().split ("|");
            newLog.close();
            
            if(nameImg == arrTemp[1]){
                newStrTime = timeStr + "|" + arrTemp[1];
            }
            else{
                newStrTime = oldStr+ "|" + nameImg;
                hasChange = true;
            }
            newLog.open("w");
            newLog.write(newStrTime);
            newLog.close();
            return (hasChange)? oldStr : null;
         }
        if(newLog.exists && timeStr==undefined){
            newLog.open("r");
            oldStr = newLog.read().split ("|");
            oldStr = oldStr[0];
            newLog.close();
            return oldStr;
        }
    }
    else{
        return "nothing";
    }
 };

function generalSetting(data, countVariant, directoryData){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    data = (data == null)? {templates: []} : data.data;
    directoryData = JSON.parse(directoryData);
    var dataOld = JSON.stringify(data);
    var newStatus = false;
    var bgColor = null, textColor=null;
    var variantsObj = {"Variant 1": {} };
    
    var mybox = new Window("dialog", "Setting", undefined , {closeButton: true});
    var group1 = mybox.add("group");
    group1.orientation = "row";
    
    var panelDimension = group1.add("panel{text: 'Dimensions', orientation: 'column', size: [205, 320]}");
    panelDimension.alignChildren = "left";
    
    var grCanvasType = panelDimension.add("group");
    grCanvasType.orientation = "row";
    var labelCanvas = grCanvasType.add("statictext{text: 'Canvas Type:'}");
    var listCanvas = grCanvasType.add("dropdownlist{size: [100, 20]}");
    listCanvas.add("item", "Pixel");
    listCanvas.add("item", "Ratio");
    listCanvas.add("item", "None");
    
    var grWidth = panelDimension.add("group");
    grWidth.orientation = "row";
    var widthLabel = grWidth.add("statictext{ text: 'Width:'}");
    var widthIpn = grWidth.add("edittext{characters: 6, text:''}");
    
    var grHeight = panelDimension.add("group");
    var heightLabel = grHeight.add("statictext{ text: 'Height:'}");
    var heightIpn = grHeight.add("edittext{characters: 6, text: ''}");
    
    var panelMargin = panelDimension.add("panel{text: 'Margin', orientation: 'column', alignment: ['center', 'center']}");
    
    var grMarTop = panelMargin.add("group");
    grMarTop.alignment = "right";
    var marTopLabel = grMarTop.add("statictext{ text: 'Top:', }");
    var topIpn = grMarTop.add("edittext{characters: 6, text: '', name:'marginTop'}");
    
    var grMarBot = panelMargin.add("group");
    grMarBot.alignment = "right";
    var marBotLabel = grMarBot.add("statictext{ text: 'Bottom:'}");
    var botIpn = grMarBot.add("edittext{characters: 6, text: '', name:'marginBot'}");
    
    var grMarLeft = panelMargin.add("group");
    grMarLeft.alignment = "right";
    var marLeftLabel = grMarLeft.add("statictext{ text: 'Left:'}");
    var leftIpn = grMarLeft.add("edittext{characters: 6, text: '', name:'marginLeft'}");
    
    var grMarRight = panelMargin.add("group");
    grMarRight.alignment = "right";
    var marRightLabel = grMarRight.add("statictext{ text: 'Right:'}");
    var rightIpn = grMarRight.add("edittext{characters: 6, text: '', name:'marginRight'}");
    
    var grPosition = panelDimension.add("group");
    var radTop = grPosition.add("radiobutton{value: false, text: 'Top'}");
    var radCenter = grPosition.add("radiobutton{value: false, text: 'Center'}");
    var radBot = grPosition.add("radiobutton{value: true, text: 'Bottom'}");
    
    //PANEL EXTEND
    var panelExtend= group1.add("panel{text: 'Extends', orientation: 'column', alignment: 'center', size: [240, 320]}");
    panelExtend.alignChildren = "left";
    var panelPathItem = panelExtend.add("panel{text: 'PathItem', orientation: 'column', alignment: ['center', 'top'], size: [210, 110]}");
    var checkSavePath = panelPathItem.add("checkbox{ value: false, text: 'Save Path'}");
    var grOptionPathitem = panelPathItem.add("group");
        grOptionPathitem.orientation = "column";
        grOptionPathitem.enabled = checkSavePath.value;
        var grPathName = grOptionPathitem.add("group{alignment: 'right'}");
        var labelPathitem = grPathName.add("statictext{text:'Path name:'}");
        var namePathInp = grPathName.add("edittext{characters:6}");
        var grClippingVal = grOptionPathitem.add("group{alignment: 'right'}");
        var clippingLabel = grClippingVal.add("statictext{text:'Flatness:'}");
        var clippingValue = grClippingVal.add("edittext{characters:6}");
    var panelSaveOption = panelExtend.add("panel{text: 'Save Option', orientation: 'column', alignment: ['center', 'top'], size: [210, 110]}");
        var checkSaveAtTime = panelSaveOption.add("checkbox{ value: false, text: 'Save with process canvas '}");
        var labelEditName = panelSaveOption.add("statictext{text: 'Modify file name:'}");
        var grEditName = panelSaveOption.add("group");
        var listSubtr = grEditName.add("dropdownlist{size: [90, 20]}");
        listSubtr.add("item", "None");
        listSubtr.add("item", "Number");
        listSubtr.add("item", "SubString");
        var subStrInp = grEditName.add("edittext{characters:7}");
        listSubtr.selection = "None";
        
    var panelVariant = panelExtend.add("panel{text: 'Variants', orientation: 'column', alignment: ['center', 'top'], size: [210, 50]}");
        var grVariant = panelVariant.add("group");
        var listVariant = grVariant.add("dropdownlist{size: [90, 20]}");
        var grBtnVariant = grVariant.add("group");
        var btnAddVariant = grBtnVariant.add("button", [0,0,30,15],  "Add");
        var btnDelVariant = grBtnVariant.add("button", [0,0,30,15],  "Del");
        listVariant.selection = "Variant 1";
    //PANEL OTHER
    var panelOther = group1.add("panel{text: 'Others', orientation: 'column', alignment: ['left', 'center'], size: [200, 320]}");    
    panelOther.alignChildren = "left";
    panelOther.margins = [5,5,5,5];
    //var checkShowOnly = panelOther.add("checkbox{ value: false, text: 'Show only Product layer'}");
    //var checkOpenFolder = panelOther.add("checkbox{ value: false, text: 'Open folder'}");
    var checkSavePSD = panelOther.add("checkbox{value:false, text:'Save PSD file'}");
    var checkCreateMask = panelOther.add("checkbox{value:true, text:'Create Layer mask'}");
    var checkSaveForWeb = panelOther.add("checkbox{ value: false, text: 'Save for Web'}");
    var checkDesaturShadow = panelOther.add("checkbox{ value: false, text: 'Desaturate shadow'}");
    
    var panelFormat = panelOther.add("panel{text: 'Image format', orientation: 'column', alignment: 'top', size: [180, 45]}");
    var grFormatImg = panelFormat.add("group");
    grFormatImg.orientation = "column";
    var listFormat = grFormatImg.add("dropdownlist{size: [100, 20]}");
    listFormat.add("item", "JPG");
    listFormat.add("item", "PNG");
    
    var panelUnit = panelOther.add("panel{text: 'Unit for margin', orientation: 'column', alignment: 'top', size: [180, 45]}");
    var grUnit = panelUnit.add("group");
    grUnit.orientation = "column";
    var listUnit = grUnit.add("dropdownlist{size: [100, 20]}");
    listUnit.add("item", "Pixel");
    listUnit.add("item", "Percent");
    
    var panelBackground = panelOther.add("panel{text: 'Background', orientation: 'column', alignment: 'top', size: [180, 45]}");
    panelBackground.orientation = "row";
    var listBackground = panelBackground.add("dropdownlist{size: [80, 20]}");
    var hexCodeIpn = panelBackground.add("edittext{characters: 6}");
    listBackground.add("item", "None");
    listBackground.add("item", "Solid Color");
    
    //var grTemplate = panelOther.add("group");
    // PANEL TEMPLATES
    var panelTemplate = group1.add("panel{text: 'Templates', orientation: 'column', alignment: ['left', 'center'], size: [160, 320]}");  
    panelTemplate.alignment = "top";
    var listTemplates = panelTemplate.add("dropdownlist{size: [100, 20]}");
    var grBtnTemplate = panelTemplate.add("group");
    var btnAddTemp = grBtnTemplate.add("button", [0,0,60,20],  "New", {name: "cancel"});
    var btnDelTemp = grBtnTemplate.add("button", [0,0,60,20],  "Delete", {name: "cancel"});
    var checkHiddenTemp = panelTemplate.add("checkbox{ value: false, text: 'Hidden template'}");
    
    var grBtn = mybox.add("group");
    var btnChange = grBtn.add("button", [0,0,120,20],  "Change Directory", {name: "cancel"});
    var btnSave = grBtn.add("button", [0,0,100,20],  "Save", {name: "ok"});
    
    //Listen change on BOX
    mybox.onClose = function(){
        if(dataOld.localeCompare (JSON.stringify(data)) != 0){
            var objConfirm = {
                titleMsg: 'Save confirm',
                message: 'Do you want to save change?',
                btnLabel1: 'Yes',
                btnLabel2: 'No',
                mode: 'notify'
            }
            var response = boxMessage(objConfirm);
            if(response == 'Yes'){
                dataOld = JSON.stringify(data);
                saveDatabase();
                return true;
            }
            else if(response=='No'){
                return true;
            }
                else{ return false; }
        }
    }

     //FISRT LOAD data for Box setting-------------------------
    var tempActive = null;
    for(var i=0; i< data.templates.length; i++){
        listTemplates.add("item", data.templates[i].nameTemplate);
        if(data.templates[i].nameTemplate == data.activeTemplate){
         tempActive = data.templates[i];
        }
    }
    if(tempActive != null){
        listTemplates.find(tempActive.nameTemplate).selected = true;
        variantsObj = tempActive.variants;
        loadDataBox(tempActive, "Variant 1"); 
    }
    //-----------Show new box-----------------
     function colorPicker(){
        var defaultColor = 0xff0000;
        var myHexColor = $.colorPicker();
        var r = myHexColor >> 16;
        var g = (myHexColor & 0x00ff00) >> 8;
        var b = myHexColor & 0xff;
        myRgbColor = [r,g,b];
        return myRgbColor;
     }
    function newTemplate(msg){
        var status = false;
        bgColor = [255,255,255];
        textColor = [0,0,0];
        var boxNewtemp = new Window("dialog", "New Template", undefined, {closeButton: true});
        var msgLabel = boxNewtemp.add("statictext{text:'"+msg+"'}");
        var grIpnNew = boxNewtemp.add("group");
        grIpnNew.orientation = "row";
        var nameNewTemp = grIpnNew.add("edittext{characters: 12}");
        nameNewTemp.active =true;
        var btnCreate = grIpnNew.add("button", [0,0,50,20],  "Create", {name: "ok"});
        
        var panelStyle = boxNewtemp.add("panel{text: 'Style color', orientation: 'row', alignment: ['left', 'center']}");  
        var bgStyle = panelStyle.add("group{size:[50,20], alignChildren: ['center','center']}");
        var labelBG = bgStyle.add("statictext{text:'BG'}");
        bgStyle.graphics.backgroundColor = bgStyle.graphics.newBrush(bgStyle.graphics.BrushType.SOLID_COLOR, [1, 1, 1], 1 );
        var textStyle = panelStyle.add("group{size:[50,20], alignChildren: ['center','center']}");
        var labelText = textStyle.add("statictext{text:'Text'}");
        textStyle.graphics.backgroundColor = textStyle.graphics.newBrush(textStyle.graphics.BrushType.SOLID_COLOR, [0, 0, 0], 1 );

        labelBG.addEventListener ("click", function(){
            bgColor = colorPicker();
            var rgbDot = [bgColor[0]/255, bgColor[1]/255, bgColor[2]/255];
            bgStyle.graphics.backgroundColor = bgStyle.graphics.newBrush(bgStyle.graphics.BrushType.SOLID_COLOR, rgbDot, 1 );
        })
        labelText.addEventListener ("click", function(){
            textColor = colorPicker();
            var rgbDot = [textColor[0]/255, textColor[1]/255, textColor[2]/255];
            textStyle.graphics.backgroundColor = textStyle.graphics.newBrush(textStyle.graphics.BrushType.SOLID_COLOR, rgbDot, 1 );
        })
        
        btnCreate.onClick = function(){
            var templateExist = true;
            for(var i=0; i<data.templates.length; i++){
                if(data.templates[i].nameTemplate == nameNewTemp.text){
                    templateExist = false;
                    break;
                }
            }
            if(nameNewTemp.text.length<14 && nameNewTemp.text.length>0 && templateExist){
                countVariant = 1;
                variantsObj = {"Variant 1": {} };
                tempActive = {
                    nameTemplate: nameNewTemp.text,
                    bgColor: bgColor,
                    textColor: textColor,
                    variants: variantsObj
                };
                data.templates.push(tempActive);
                listTemplates.add("item", nameNewTemp.text).selected = true;
                if(data.templates.length==1){mybox.show();}
                newStatus = true;
                status = true;
                boxNewtemp.close();
            }
            else{
                if(templateExist){
                    alert("Maximum characters not greater than 12 and must not be empty", "Message");
                }
                else{
                    alert("Template name has exist, try other name", "Message");
                }
            }
        }
        newStatus = true;
        boxNewtemp.show();
        return status;
    }
    //Active setting saved-----------------
    function loadDataBox(obj, idVar){
        widthIpn.text = (obj.variants[idVar].width == undefined)? "" : obj.variants[idVar].width;
        heightIpn.text = (obj.variants[idVar].height == undefined)? "" : obj.variants[idVar].height;
        topIpn.text = (obj.variants[idVar].marginTop == undefined)? "" : obj.variants[idVar].marginTop;
        botIpn.text = (obj.variants[idVar].marginBot == undefined)? "" : obj.variants[idVar].marginBot;
        leftIpn.text = (obj.variants[idVar].marginLeft == undefined)? "" : obj.variants[idVar].marginLeft;
        rightIpn.text = (obj.variants[idVar].marginRight == undefined)? "" : obj.variants[idVar].marginRight;
        //load status save for web
        checkSaveForWeb.value = (obj.variants[idVar].saveForWeb==undefined)? false : obj.variants[idVar].saveForWeb;
        obj.variants[idVar].saveForWeb = checkSaveForWeb.value;
        //------------------------
        checkHiddenTemp.value = obj.hidden;
         // load status createMask
        checkCreateMask.value = (obj.variants[idVar].createMask==undefined)?true : obj.variants[idVar].createMask; 
        obj.variants[idVar].createMask = checkCreateMask.value;
        //----load value pathItem
        if(obj.variants[idVar].pathItem==undefined){
            checkSavePath.value = false;
            namePathInp.text = "";
            clippingValue.text = "";
        }
        else{
            checkSavePath.value = obj.variants[idVar].pathItem.status;
            namePathInp.text = obj.variants[idVar].pathItem.pathName;
            clippingValue.text = obj.variants[idVar].pathItem.flatness;
        }
        grOptionPathitem.enabled = checkSavePath.value;
        checkSaveForWeb.enabled = !checkSavePath.value;
        listFormat.enabled = !checkSavePath.value;
        
        if(obj.variants[idVar].unitMargin == undefined){obj.variants[idVar].unitMargin = "Pixel";}
        listUnit.find(obj.variants[idVar].unitMargin).selected = true;
        
        if(obj.variants[idVar].canvasType == undefined){obj.variants[idVar].canvasType = "Pixel";}
        listCanvas.find(obj.variants[idVar].canvasType).selected = true;
        
        if(obj.variants[idVar].formatImage == undefined){obj.variants[idVar].formatImage = "JPG";}
        listFormat.find(obj.variants[idVar].formatImage).selected = true;
        //Load background data---------
        if(obj.variants[idVar].background == undefined){
            obj.variants[idVar].background = {
                type:  "None",
                solidColor:  null
            };
        }
        listBackground.find(obj.variants[idVar].background.type).selected = true;
        hexCodeIpn.enabled = (obj.variants[idVar].background.type=="None")? false : true;
        hexCodeIpn.text =(obj.variants[idVar].background.solidColor==null)? "" : obj.variants[idVar].background.solidColor.rgb.hexValue;
        
        for(var i=0; i<grPosition.children.length; i++){
            if(obj.variants[idVar].position == grPosition.children[i].text){grPosition.children[i].value = true; break;}
            else if(grPosition.children[i].value && obj.variants[idVar].position==undefined){variantsObj[idVar].position = grPosition.children[i].text;}
        }
        widthIpn.enabled = (obj.variants[idVar].canvasType == "None")? false : true;
        heightIpn.enabled = (obj.variants[idVar].canvasType == "None")? false : true;
        for(var i=0; i<countVariant && listVariant.children.length<countVariant; i++){
            listVariant.add("item", "Variant "+(i+1));
            if(listVariant.children.length == countVariant){ 
                listVariant.selection = idVar;
                break;
            }  
        }
        //lload Sub Name
        if(obj.variants[idVar].subName != undefined){
            subStrInp.text = obj.variants[idVar].subName.value;
            listSubtr.find(obj.variants[idVar].subName.type).selected = true;
        }
        else{
            listSubtr.selection = "None";
            subStrInp.text = "";
            subStrInp.enabled = false;
        }
        // create No.ID for variant
        obj.variants[idVar].idVariant = parseInt(idVar.replace("Variant ", ""));
        // load staus save PSD file
        checkSavePSD.value = (obj.variants[idVar].savePSD==undefined)?false : obj.variants[idVar].savePSD; 
        obj.variants[idVar].savePSD = checkSavePSD.value;
        //load check shadow desaturation-----------
        checkDesaturShadow.value = (obj.variants[idVar].desaturationShadow==undefined)?false : obj.variants[idVar].desaturationShadow;
        //reload profile For template //////////////////////////////////////
        checkSaveAtTime.value = obj.saveAtTime;
        /*if(countVariant >1){ 
            checkSaveAtTime.value = true; 
            //checkSaveAtTime.enabled = false; 
            obj.saveAtTime = true;
        }
        else{checkSaveAtTime.enabled = true; }*/

        if(obj.bgColor != undefined && !newStatus){
            bgColor = obj.bgColor;
            textColor = obj.textColor;
        }
    }
    //--------------HANDLE PART OF VARIANT-------------------------------------
    /// handle List Canvas Type
    listCanvas.onChange = function(){
        var hiddenIpn = (this.selection.toString() == "None")? false : true;
        widthIpn.enabled = hiddenIpn;
        heightIpn.enabled = hiddenIpn;
        variantsObj[listVariant.selection].canvasType = this.selection.toString();
        //alert(JSON.stringify(data));
    }
    //handle Input-------------
    widthIpn.onChange = function(){
        variantsObj[listVariant.selection].width = parseInt(this.text);
    }
    heightIpn.onChange = function(){
    	variantsObj[listVariant.selection].height = parseInt(this.text);
    }
    for(var i=0; i<panelMargin.children.length; i++){
    	panelMargin.children[i].children[1].onChange = function(){
    		variantsObj[listVariant.selection][this.name] = parseInt(this.text);
    	}
    }
    // handle position
    for(var i=0; i<grPosition.children.length; i++){
    	grPosition.children[i].onClick = function(){
    		variantsObj[listVariant.selection].position = this.text;
    	}
    }
    //handle pathItem-----------------
    checkSavePath.onClick = function(){
    	grOptionPathitem.enabled = this.value;
        listFormat.enabled = !this.value;
        checkSaveForWeb.enabled = !this.value;
        if(this.value){
            checkSaveForWeb.value =  false;
            listFormat.selection = "JPG";
            
        }
    	variantsObj[listVariant.selection].pathItem = {
    		status: this.value,
    		pathName: (namePathInp.text=="")? "Path 1" : namePathInp.text,
    		flatness: (clippingValue.text=="")? 0 : parseFloat(clippingValue.text)
    	}
    }
    // handle value clipping flatness
    clippingValue.onChange = function(){
        if( isNaN(parseFloat(this.text)) ){alert("Flatness value must be a number");}
        else{variantsObj[listVariant.selection].pathItem.flatness = parseFloat(this.text);}
    }
    //handle save for web
    checkSaveForWeb.onClick = function(){
    	variantsObj[listVariant.selection].saveForWeb = this.value;
    }
    //handle format File
    listFormat.onChange = function(){
    	variantsObj[listVariant.selection].formatImage = this.selection.toString();
    }
    //handle Unit for Margin
    listUnit.onChange = function(){
    	variantsObj[listVariant.selection].unitMargin = this.selection.toString();
    }
    //handle BackgroundColor
    listBackground.onChange = function(){
        variantsObj[listVariant.selection].background = {
            type: this.selection.toString(),
            solidColor: null
        }
        if(this.selection.toString() != "None"){
            var colorPicker = app.showColorPicker();
            hexCodeIpn.enabled = true;
            if(colorPicker){
                var foreGSL = app.foregroundColor;
                hexCodeIpn.text = foreGSL.rgb.hexValue;
                variantsObj[listVariant.selection].background.solidColor = foreGSL;
            }
        }
        else{
            hexCodeIpn.enabled = false;
        }
        //hexCodeIpn.enabled = (this.selection.toString() == "None")? false : true;
    }
    hexCodeIpn.onChange = function(){
        var rgbObj = new RGBColor();
        rgbObj.hexValue = this.text;
        var mySolidColor = new SolidColor();
        mySolidColor.rgb = rgbObj;
        variantsObj[listVariant.selection].background.solidColor = mySolidColor;
    }
    //handle save at time
    checkSaveAtTime.onClick = function(){
        tempActive.saveAtTime = checkSaveAtTime.value;
    }
    //handle Sub Name --------
    listSubtr.onChange = function(){
        if(variantsObj[listVariant.selection].subName == undefined){
            variantsObj[listVariant.selection].subName = {type: "None", value:""};
        }
        if(this.selection.toString() =="Number"){
            subStrInp.text = (subStrInp.text=="")? "Sequence" : subStrInp.text;
        }
        else{
            subStrInp.text =(this.selection.toString() !="None")? subStrInp.text : "";
        }
        subStrInp.enabled = (this.selection.toString() =="None")? false : true;
        variantsObj[listVariant.selection].subName = {
            type: this.selection.toString(),
            value: subStrInp.text
        }
        //alert(JSON.stringify(tempActive));
    }
    subStrInp.onChange = function(){
        variantsObj[listVariant.selection].subName.value = this.text;
    }
    //handel createMask
    checkCreateMask.onClick = function(){
        variantsObj[listVariant.selection].createMask = this.value;
    }
    // handle radio savePSD
    checkSavePSD.onClick = function(){
        variantsObj[listVariant.selection].savePSD = this.value;
    }
    // handle desaturation Shadow-
    checkDesaturShadow.onClick = function(){
        variantsObj[listVariant.selection].desaturationShadow = this.value;
    }
    // handle Change Templates;
    listTemplates.onChange = function(){
        for(var i=0; i< data.templates.length; i++){
            if(data.templates[i].nameTemplate == this.selection.toString() ){
                tempActive = data.templates[i];
                variantsObj = data.templates[i].variants;
                listVariant.removeAll();
                var count=0;
                for(var key in variantsObj){
                    count++;
                }
                countVariant = count;
                loadDataBox(tempActive, "Variant 1");
                break;
            }
        }
    }
    // handle Hide template
    checkHiddenTemp.onClick = function(){
        tempActive.hidden = checkHiddenTemp.value;
    }
    //-------------handle Add or Delete Templates
    btnAddTemp.onClick = function(){
        if(data.templates.length==0){
            alert("Please enter value for current template", "Warning");
        }
        else{
            newTemplate("Enter new template name");
        }
    }
    btnDelTemp.onClick = function(){
        for(var i=0; i< data.templates.length; i++){
            if(data.templates[i].nameTemplate == listTemplates.selection.toString() ){
                data.templates.splice (i, 1);
                listTemplates.remove(listTemplates.selection.toString());
                break;
            }
        }
        if(data.templates.length>0){
            loadDataBox(data.templates[0], "Variant 1"); 
            listTemplates.find(data.templates[0].nameTemplate).selected = true;
        }
        else{
            countVariant =0;
            listVariant.removeAll();
            variantsObj = {"Variant 1":{}};
            loadDataBox({variants: variantsObj}, "Variant 1"); 
            //alert(JSON.stringify(data));
        }
    }
    //------------Handle Variant---------------------
    btnAddVariant.onClick = function(){
        var keyObj = "Variant " + (listVariant.items.length + 1);
        tempActive.variants[keyObj] = {};
        countVariant++;
        listVariant.add("item", keyObj ).selected = true;
        //loadDataBox(tempActive, keyObj ); 
    }
    btnDelVariant.onClick = function(){
        if(listVariant.items.length >1){
            var keyObj = listVariant.selection.toString();
            listVariant.removeAll();
            delete tempActive.variants[keyObj];
            var count = 1, teObj = {};
            for(var key in tempActive.variants){
                teObj["Variant "+count] = tempActive.variants[key];
                teObj["Variant "+count].idVariant = count;
                listVariant.add("item", "Variant "+ count);
                count++;
            }
            tempActive.variants = teObj;
            countVariant--;
            listVariant.find("Variant " + listVariant.items.length).selected = true;
        }
    }
    listVariant.onChange = function(){
        loadDataBox(tempActive, this.selection.toString() ); 
    }
    ///////////////////handel  Action main BOx
    btnChange.onClick = function(){
        directoryData = settingDirectory(directoryData);
        data.directoryData = directoryData;
    };
    btnSave.addEventListener ("click", saveDatabase);
    function saveDatabase(){
        if(data.templates.length>0){
            data.activeTemplate = listTemplates.selection.toString();
            responseAction = JSON.stringify(data);
            var newlog = new File("~/Desktop/logTool.json");
            newlog.open("w");
            newlog.write(responseAction);
            newlog.close();
            dataOld = responseAction;
        }
        else{
            responseAction = "No Data";
        }
        mybox.close();
    }
    //-------------------------------------------------------
    var responseAction = "";
    if(data.templates.length ==0){
        if(!newTemplate("Templates not found!")){ responseAction ="No Data"; };
    }
    else{
        mybox.show();
    }
    return responseAction;
};
function boxMessage(data){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
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
    if(data.listObj !=undefined||data.inputObj !=undefined || data.checkBoxObjs != undefined){
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
            //-----
            if(data.inputObj[i].btnName != undefined){
                var btnInp = grInp.add("button{text:'"+data.inputObj[i].btnName+"', size:[60,20],  index:'"+i+"' , properties:{name: 'cancel'}}");
                btnInp.onClick = function(){
                    data.inputObj[this.index].responseBtn = processImgUpload(data.inputObj[this.index].value, data.inputObj[this.index].name);
                    panelProfile.enabled = false;
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
}
function openFolder(){
    var logDir = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/CSXS/logDir.txt");
    var psdDir = "~/Desktop/PSD Files";
    if(logDir.exists){
        logDir.open("r");
        var strLog = logDir.read();
        logDir.close();
        psdDir = (strLog == "")? psdDir : strLog;
    }
    var folderPSD = new Folder(psdDir);
    if(!folderPSD.exists){
        folderPSD.create();
     }
    folderPSD.execute();
};
function readFolder(data, folderTreeInfo){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var myParentFolder = null;
    var dataEx = folderTreeInfo;
    
    if(data == undefined){
        dataEx.subFolders = [];
    }
    else if(data !="back"){
        dataEx = folderTreeInfo;
        dataEx.subFolders = [];
        dataEx.currentDirectory = dataEx.currentDirectory + data +"/";
        dataEx.activeItem = data;
    }
        else{
            dataEx = folderTreeInfo;
            dataEx.subFolders = [];
            var backDir = dataEx.currentDirectory.split("/");
            var k = 0;
            for(var i=0; i<backDir.length; i++){
                if(backDir[i] != ""){ k++;}
            }
            if(k >1){ backDir.splice (backDir.length -2, 1); }
            dataEx.currentDirectory = backDir.join("/");
        }
    
    if(dataEx.currentDirectory =="root/"){
        dataEx.subFolders = declareRoot();
    }
    else{
        //alert(dataEx.currentDirectory);
        var encodeFolder = dataEx.currentDirectory.replace("root/", "");
        myParentFolder = new Folder(encodeFolder);
        var mySubFolders = myParentFolder.getFiles("*");
        for(var i=0; i<mySubFolders.length; i++){
            var userName = $.getenv("USERNAME");
            var nameSubFolder = Folder.decode (mySubFolders[i].name);
            nameSubFolder = (nameSubFolder=="~")? userName : nameSubFolder;
            dataEx.subFolders.push(nameSubFolder );
        }
    }
    function declareRoot(){
        var arrDrives = ["C:","D:","E:","F:","G:","H:"];
        var newArr = [];
        for(var i=0; i<arrDrives.length; i++){
            if( (new Folder(arrDrives[i])).exists ){
                newArr.push(arrDrives[i]);
            }
        }
        return newArr;
    }

    return JSON.stringify(dataEx);
};
function openFiles(nameObj, folderTreeInfo, hasOpenFolder){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var objType = nameObj.split(".");
    var currentDir = folderTreeInfo.currentDirectory.replace("root/","");
    var filesOpen = new File(currentDir+ "/" + nameObj) ;
    var arrTypeSupport = ["jpg", "png", "psd", "tif", "tiff", "gif","jsx"];
    var openedFile = false;
    for(var i=0; i<arrTypeSupport.length; i++){
        if( (objType[objType.length -1]).toLowerCase() == arrTypeSupport[i] ){
            app.open(filesOpen);
            openedFile = true;
            break;
        }
    }

    if(!openedFile){
        var folderOpen = new Folder(currentDir + "/" + nameObj);
        var arrFile = folderOpen.getFiles();
        if(arrFile.length==0){alert("Folder is empty", "Message");}
        for(var i = 0; i<arrFile.length; i++){
            try{app.open(arrFile[i]);}catch(err){}
        }
        //if(hasOpenFolder){folderOpen.execute();}
    }
    folderTreeInfo.activeItem = nameObj;
    return JSON.stringify(folderTreeInfo);
};
function statusHasImage(){
    return app.documents.length;
};
function backupWithOpen(codePanama, dataStore){
    var folderBackup = null, folderDes = null;
    if(dataStore != null){
        folderOrg = new Folder(dataStore.split("|")[0]);
        folderDes = new Folder(dataStore.split("|")[1]+ "/" + folderName);
    }
    else{
        folderOrg = new Folder("~/Desktop/Panama");
        folderDes = new Folder("D:/Panama Backup" + "/" + folderName);
    }
    if(!folderOrg.exists){folderOrg.create();}
    if(!folderDes.exists){folderDes.create();}
    var arrFiles = folderOrg.getFiles("*.jpg");
    for(var i=0; i<arrFiles.length; i++){
        var newFileDir = convertUri(folderDes.absoluteURI) + "/" + arrFiles[i].name;
        arrFiles[i].copy(newFileDir);
        app.open(arrFiles[i]);
    }
}
function settingDirectory(dataStore){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var objData = {
        panamaDirectory: "",
        panamaBackup: "",
        folderTreeDir: "",
        psdDirectory:  ""
    }
    dataStore = (dataStore==null)? objData :  dataStore;
    
    var mybox = new Window("dialog", "Setting", undefined, {closeButton: true});
    var panelOrg = mybox.add("panel{text: 'PANAMA Directory', orientation: 'row', alignment: ['left', 'center'], size: [300, 50]}");
    var orgInp = panelOrg.add("edittext{size:[200,20]}");
    orgInp.graphics.foregroundColor = orgInp.graphics.newPen (orgInp.graphics.PenType.SOLID_COLOR, [0.6,0.6,0.6], 1 );
    var btnOrg = panelOrg.add("button{text: 'Change', size: [50,5], data:'panamaDirectory'}");
    
    var panelPanamaBackup = mybox.add("panel{text: 'Backup Directory', orientation: 'row', alignment: ['left', 'center'], size: [300, 50]}");
    var panamaBackInp = panelPanamaBackup.add("edittext{size:[200,20]}");
    panamaBackInp.graphics.foregroundColor = panamaBackInp.graphics.newPen (panamaBackInp.graphics.PenType.SOLID_COLOR, [0.6,0.6,0.6], 1 );
    var btnPanaBackup = panelPanamaBackup.add("button{text: 'Change', size: [50,5], data:'panamaBackup'}");
    
    var panelFolderTree = mybox.add("panel{text: 'Folder Tree Directory', orientation: 'row', alignment: ['left', 'center'], size: [300, 50]}");
    var folderTreeInp = panelFolderTree.add("edittext{size:[200,20]}");
    folderTreeInp.graphics.foregroundColor = folderTreeInp.graphics.newPen (folderTreeInp.graphics.PenType.SOLID_COLOR, [0.6,0.6,0.6], 1 );
    var btnFolderTree = panelFolderTree.add("button{text: 'Change', size: [50,5], data:'folderTreeDir'}");
    
    var panelDirPSDfolder = mybox.add("panel{text: 'PSD Directory', orientation: 'row', alignment: ['left', 'center'], size: [300, 50]}");
    var psdFolderInp = panelDirPSDfolder.add("edittext{size:[200,20]}");
    psdFolderInp.graphics.foregroundColor = psdFolderInp.graphics.newPen (psdFolderInp.graphics.PenType.SOLID_COLOR, [0.6,0.6,0.6], 1 );
    var btnPSDfolder = panelDirPSDfolder.add("button{text: 'Change', size: [50,5], data:'psdDirectory'}");    
    // handle directory-------
    for(var i=0; i<mybox.children.length; i++){
        mybox.children[i].children[0].text = dataStore[mybox.children[i].children[1].data];
        
        mybox.children[i].children[1].onClick = function(){
            var folderChoose = Folder.selectDialog ("Choose Folder");
             if(folderChoose != null){
                 dataStore[this.data] = convertUri (folderChoose.absoluteURI);
                 this.parent.children[0].text = dataStore[this.data];
             }
        }
    }
    mybox.show();
    
    return dataStore;
}
function addSwatches(dataBoxMsg, rgbOld, paletteActive, objNewSwSender){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    //var docImg = app.activeDocument;
    if(paletteActive != undefined){paletteActive = paletteActive.value;}
    if(paletteActive===null){
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
function chooseFile(){
    var fileJSON = File.openDialog ("Choose file", "*.json", false);
    var res = "";
    if(fileJSON != null){
        fileJSON.open("r");
        res = fileJSON.read();
        fileJSON.close();
    }
    return res;
}
function exportFile(data, fileName){
    var folderDes = Folder.selectDialog ("Choose Folder");
    var folderStr = Folder.decode (folderDes);
    var logs = new File(folderStr +"/" + fileName);
    logs.open("w");
    logs.write(data);
    logs.close();
}
function createGroup(name){
    var currentLayer = app.activeDocument.activeLayer;
    var myGroup = app.activeDocument.layerSets.add();
    myGroup.name = name;
    myGroup.move(currentLayer, ElementPlacement.PLACEBEFORE);
}
function getMACAddress(){
    var fileExe = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/GetMacAddress.exe");
    var fileLog = new File("~/AppData/Roaming/Adobe/CEP/MACAddress.log");
   
    if(!fileLog.exists){
        fileExe.execute();
        fileLog.open("r");
        while(fileLog.read() == ""){
            fileLog.close();
            fileLog.open("r");
        }
        fileLog.close();
    }
    
    fileLog.open("r");
    var macAddr = fileLog.read();
    fileLog.close();
    return macAddr;
}
function messageOnly(msg,titleMsg){
    alert(msg, titleMsg);
}
function updateToolbox(url, version){
    var res = "";
    var logFile = new File("~/AppData/Roaming/Adobe/CEP/extensions/logUpdate.log");
    logFile.open("w");
    logFile.write(url);
    logFile.close();
    var logVer = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/version.log");
    logVer.open("r");
    var versionOld = logVer.read();
    logVer.close();
    if(versionOld != version){
        var boxInfUpdate = new Window("dialog", "Update Toolbox", undefined, {closeButton:true});
        boxInfUpdate.add("statictext{text: 'New version "+version+" available!' }");
        var grBtn = boxInfUpdate.add("group");
        var btnOk = grBtn.add("button{text:'Update', size:[100,20], properties:{name:'ok'}}");
        var btnCancel=grBtn.add("button{text:'Later', size:[100,20], properties:{name:'cancel'}}");
        //handle btn update
        btnOk.onClick = function(){
            boxInfUpdate.close();
            processUpdate();
        }
        boxInfUpdate.show();
        //------------------------------------------
    }
    //---
    function processUpdate(){    
        //processSave();
        //executeAction(charIDToTypeID('quit'), undefined, DialogModes.NO);
        var fileExe = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/UpdateToolbox.exe");
        var fileExeCopy = new File("~/AppData/Roaming/Adobe/CEP/extensions/UpdateToolbox.exe");
        fileExe.copy(fileExeCopy);
        fileExeCopy.execute();
        var k= 0;
        while(versionOld != version){
            if(k>30){
                break;
            }
            logVer.open("r");
            versionOld = logVer.read();
            logVer.close();
            $.sleep (1000);
            k++;
        }
        $.sleep(2000);
        // write logfile 
        var logImg = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/linkImg.log");
        logImg.open("w");
        logImg.write("Reload Toolbox");
        logImg.close();
        res = "Success";
    }
    function processSave(){
        var psdRef = new PhotoshopSaveOptions();
        psdRef.alphaChannel = true;
        psdRef.embedColorProfile = true;
        // save all documents
        var myDoc = app.activeDocument;
        if(!myDoc.saved){
            try{
                var sourceFile = myDoc.fullName.fullName;
                var dirSource = sourceFile.split("/");
                dirSource.pop();
                dirSource = dirSource.join("/");
                //
                var arrName = myDoc.name.split(".");
                var fileType = arrName.pop().toLowerCase();
                var fileName = arrName.join(".");
                if(fileType =="psd"){
                    myDoc.save();
                }
                else{
                    var filePsd = new File(dirSource +"/"+ fileName+".psd");
                    myDoc.saveAs(filePsd, psdRef, true);
                }
            }
            catch(err){
                var filePsd = new File("~/Documents/"+ myDoc.name+".psd");
                myDoc.saveAs(filePsd, psdRef, true);
            }
        }
        myDoc.close(SaveOptions.DONOTSAVECHANGES);
        if(app.documents.length>0){
            processSave();
        }
    }
    return res;
};
function getVersionInfo(){
    var logVer = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/version.log");
    logVer.open("r");
    var ver = logVer.read();
    logVer.close();
    // remove updatetoolbox.exe
    var fileExe = new File("~/AppData/Roaming/Adobe/CEP/extensions/UpdateToolbox.exe");
    if (fileExe.exists) fileExe.remove();
    var fileZip = new File("~/AppData/Roaming/Adobe/CEP/extensions/UpdateToolbox.zip");
    if (fileZip.exists) fileZip.remove();
    return ver;
}
//------Function updatePanel
function reloadPanel (Name, linkImg , dirChild, objThrow, language) {
    //send link to panel preview----
    var logImg = new File("~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/linkImg.log");
    logImg.encoding= "utf-8";
    logImg.open("w");
    dirChild = (dirChild==undefined)? "" :  ("*"+dirChild);
    language = (language==undefined)? "" :  ("*"+language);
    objThrow = (objThrow==undefined)? "" : ("*"+objThrow);
    logImg.write(linkImg + dirChild +objThrow+language);
    logImg.close();
    //////
    var Vis = false;
    var ref = new ActionReference();
    ref.putProperty( charIDToTypeID("Prpr"), stringIDToTypeID("panelList") );
    ref.putEnumerated( charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
    var desc = executeActionGet(ref).getList (stringIDToTypeID("panelList"));
    for(var a = 0;a<desc.count;a++){
        var listName = desc.getObjectValue(a).getString(stringIDToTypeID("name"));
        if (Name == listName) {
            Vis = desc.getObjectValue(a).getBoolean(stringIDToTypeID("visible"));
            var Ob = desc.getObjectValue(a).getBoolean(stringIDToTypeID("obscured"));
            var ID = desc.getObjectValue(a).getString(stringIDToTypeID("ID"));
            break;
        }
    }
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putName( stringIDToTypeID('menuItemClass'), Name);
    desc1.putReference( charIDToTypeID('null'), ref1 );
    if (Vis) {
        try {
            executeAction( charIDToTypeID('slct'), desc1, DialogModes.NO );

            executeAction( charIDToTypeID('slct'), desc1, DialogModes.NO );

        } catch(e) {}
    } else {

        try {
            executeAction( charIDToTypeID('slct'), desc1, DialogModes.NO );

        } catch(e) {}
    }
};
//--Reset DATA manual
function loadDataManual(){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var dataPaletteFile = new File("~/Desktop/paletteData.json");
    dataPaletteFile.encoding = "utf-8";
    dataPaletteFile.open("r");
    var dataPalette = dataPaletteFile.read();
    dataPaletteFile.encoding = "utf-8";
    dataPaletteFile.close();
    var dataTranslateFile = new File("~/Desktop/dataTranslate.json");
    dataTranslateFile.open("r");
    var dataTranslate = dataTranslateFile.read();
    dataTranslateFile.close();
    var obj = {dataPalette: dataPalette, dataTranslate: dataTranslate};
    return JSON.stringify(obj);
};
function addDataTranslate(obj, dataTranslate, language){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var response = {};
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
            	arrIpn[i].children[1].active = true;
                //arrIpn[i].children[1].enabled = false;
                //break;
            }
            //handle onchange
            var objTrans = {};
            objTrans[language] = obj[language];
            arrIpn[i].children[1].onChange = function(){
                obj = objTrans;
                if(objTrans[this.name]=="" || objTrans[this.name]==undefined){
                    obj[this.name] = this.text;
                    objTrans[this.name] = this.text;
                }
                else{
                    obj[this.name] = objTrans[this.name];
                }
            }
            arrIpn[i].children[1].onChanging = function(){
                if(this.name == language){
                    for(var j=0; j<dataTranslate.length; j++){
                        if( dataTranslate[j].en.toLowerCase()==this.text.toLowerCase()||
                             dataTranslate[j].vn.toLowerCase()==this.text.toLowerCase()||
                             dataTranslate[j].jp.toLowerCase()==this.text.toLowerCase()
                        ){               
                            objTrans = dataTranslate[j];
                            response.hasExists = true;
                            break;
                        }
                        else{
                            objTrans = {en:"",vn:"", jp:""};
                            response.hasExists = false;
                        }                                 
                    }
                    for(var k=0;k<arrIpn.length; k++){
                        if(arrIpn[k].children[1].name != this.name){
                            arrIpn[k].children[1].text = objTrans[arrIpn[k].children[1].name];
                            arrIpn[k].children[1].enabled=(objTrans[arrIpn[k].children[1].name] != "")? false:true;
                        }
                    }
                }
            }
        }
    }
    
    btnOk.onClick = function(){
        if(inpEn.text=="" || inpJp.text=="" || inpVn.text==""){
            alert("Fields cannot be empty", "Error");
        }
        else{
            response.data = obj;
            boxNewName.close();
        }
    };
    boxNewName.onClose = function(){
    }

    boxNewName.show();
    
    return JSON.stringify(response);
};
function renameLayes(dataTranslate, language){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var doc = app.activeDocument;
    var arrLayers = doc.layers;
    var totalProgress = arrLayers.length;
    var userName = $.getenv("USERNAME");
    var response = {};
    //declare mbox
    var mybox = new Window("dialog{text:'Rename Layers', properties:{closeButton: true}}");
    var grListTrans = mybox.add("group");
    var listTranslate = grListTrans.add("dropdownlist{size: [100,20]}");
    listTranslate.add("item", "EN to JP");
    listTranslate.add("item", "EN to VN");
    listTranslate.add("item", "JP to EN");
    listTranslate.add("item", "JP to VN");
    listTranslate.add("item", "VN to JP");
    listTranslate.add("item", "VN to EN");
    var grBtn = mybox.add("group");
    var btnRename = grBtn.add("button{size:[80,20],text:'Rename', properties: {name:'ok'}}");
    var btnViewData = grBtn.add("button{size:[80,20],text:'Data', properties: {name:'cancel'}}");
    //----check language
    if(language != "JP"){
        listTranslate.find (language + " to JP").selected = true;
    }
    else{
        listTranslate.find (language + " to EN").selected = true;
    }
    //handle Button Rename
    btnRename.onClick = function(){
        var listTransVal = listTranslate.selection.toString();
        listTransVal = listTransVal.replace(" to","").toLowerCase();
        listTransVal = listTransVal.split(" ");
        mybox.close();
        translateName(listTransVal[0], listTransVal[1], dataTranslate);
    };
    // handle btn view
    btnViewData.onClick = function(e){
        var logTrans = dataTranslate;
        var boxTransName = new Window("dialog{text:'Data', properties:{closeButton: true}}");
        var panelPageNum = boxTransName.add("panel{orientation:'stack', size:[354,30], margins: 0}");
        var btnPrev = panelPageNum.add("button{text:'Previous', size:[50,15], alignment: 'left'}");
        var labelPageNum = panelPageNum.add("statictext{text:'', alignment: 'center'}");
        labelPageNum.graphics.foregroundColor = labelPageNum.graphics.newPen (labelPageNum.graphics.PenType.SOLID_COLOR, [0.8, 0.6, 0], 1);
        var btnNext = panelPageNum.add("button{text:'Next', size:[50,15], alignment: 'right'}");
        
        var panelListTrans = boxTransName.add("panel{orientation: 'row', maximumSize:[500, 300]}");
        var grEn = panelListTrans.add("group{orientation: 'column'}");   
        var labelEn = grEn.add("statictext{text: 'English'}");
        var grJp = panelListTrans.add("group{orientation: 'column'}");
        var labelJp = grJp.add("statictext{text: 'Japanese'}");
        var grVn = panelListTrans.add("group{orientation: 'column'}");
        var labelVn = grVn.add("statictext{text: 'Vietnamese'}");
        
        var panelSearch = boxTransName.add("panel{orientation: 'row', maximumSize:[500, 300], text: 'Search'}");
        var inpSearch = panelSearch.add("edittext{characters: 20}");
        inpSearch.active = true;
        // create Input tabs--------------
        var pageStart = 0, pageEnd = 7;
        var totalPage = (logTrans.length%7==0)? logTrans.length/7 : parseInt(logTrans.length/7 +1);
        labelPageNum.text = 1+ "/"+totalPage;
        btnPrev.enabled = false;
        createInp(logTrans.slice(pageStart, pageEnd));
        //------------------
        var grBtnAction = boxTransName.add("group");
        var btnAdd = grBtnAction.add("button{text:'Add', size:[70,20], properties: {name:'cancel'} }");
        var btnSave = grBtnAction.add("button{text:'Save', size:[70,20], properties: {name:'ok'}}");
        //---------
        var arrTempLogTrans =[];
        function createInp(arrTransPage){
            for(var i=0; i< arrTransPage.length; i++){
                var inpTempEn = grEn.add("edittext{text: '"+arrTransPage[i].en+"', size:[100,20], index: '"+i+"', name:'en'}");
                var inpTempJp = grJp.add("edittext{text: '"+arrTransPage[i].jp+"', size:[100,20], index: '"+i+"', name: 'jp' }");
                var inpTempVn = grVn.add("edittext{text: '"+arrTransPage[i].vn+"', size:[100,20], index: '"+i+"', name: 'vn' }");
            }
            for(var i=0; i<panelListTrans.children.length; i++){
                for(var j=1; j< panelListTrans.children[i].children.length; j++){
                    panelListTrans.children[i].children[j].onChange = function(){
                        //alert(this.index);
                        logTrans[this.index][this.name] = this.text;
                        var hasObj = false;
                        for(var j=0; j<arrTempLogTrans.length; j++){
                            if(arrTempLogTrans[j] == logTrans[this.index]){hasObj = true;}
                        }
                        if(!hasObj){arrTempLogTrans.push(logTrans[this.index]);}
                    }
                }
            }
        }
        function jumpPageNum(arrListTrans, pageStart, pageEnd, arrIndex){
            for(var i=0; i<panelListTrans.children.length; i++){
                for(var j=1; j< panelListTrans.children[i].children.length; j++){
                    if(arrListTrans[j-1] != undefined){
                        panelListTrans.children[i].children[j].show();
                        panelListTrans.children[i].children[j].text = arrListTrans[j-1][panelListTrans.children[i].children[j].name];
                        var indexEdit = (arrIndex == undefined)? (j-1) : arrIndex[j-1];
                        panelListTrans.children[i].children[j].index = pageStart + indexEdit;
                    }
                    else{
                        panelListTrans.children[i].children[j].text = "";
                        panelListTrans.children[i].children[j].hide();
                    }
                }
            }
            btnPrev.enabled=(pageStart==0)? false : true;
            btnNext.enabled=(pageEnd==logTrans.length)? false : true;
            labelPageNum.text = (pageStart/7 + 1) + "/" + totalPage;
        }
        //-
        ////////////handle action
        btnNext.onClick = function(){
            var count = 7;
            var numTempE = pageEnd + count;
            var numTempS = pageStart +count;
            if(numTempE > logTrans.length){
                var lastEls = count - (numTempE - logTrans.length);
                pageEnd = pageEnd + lastEls;
                pageStart = (lastEls ==0)? pageStart : numTempS;
            }
            else{
                pageEnd = numTempE;
                pageStart = numTempS
            }
            //alert(pageStart + "  " + pageEnd);
            jumpPageNum( logTrans.slice(pageStart, pageEnd), pageStart, pageEnd);
        }
        btnPrev.onClick = function(){
            var count = 7;
            if(pageEnd == logTrans.length){
                pageEnd = pageEnd - ( pageEnd - pageStart);
                pageStart = pageStart - count;
            }
            else{
                var numTempE = pageEnd - count;
                var numTempS = pageStart - count;
                if(numTempS >= 0){
                    pageEnd = numTempE;
                    pageStart = numTempS;
                }
            }
            //alert(pageStart + "  " + pageEnd);
            jumpPageNum( logTrans.slice(pageStart, pageEnd), pageStart, pageEnd );
        }
        //---------------------
        btnSave.onClick = function(){
            response.dataTranslate = logTrans;
            boxTransName.close();
        }
        btnAdd.onClick = function(){
            var obj = {en: "", jp:"", vn: ""};
            var boxNewName = new Window("dialog{text:'New object', properties:{closeButton:true}}");
            var grEn = boxNewName.add("group{orientation: 'row'}");
            var labelEn = grEn.add("statictext{text:'English', preferredSize:[80,-1]}");
            var inpEn = grEn.add("edittext{characters: 10}");
            inpEn.active = true;
            var grJp = boxNewName.add("group{orientation:'row'}");
            var labelJp = grJp.add("statictext{text:'Japanese', preferredSize:[80,-1]}");
            var inpJp = grJp.add("edittext{characters: 10}");
            var grVn = boxNewName.add("group{orientation:'row'}");
            var labelVn = grVn.add("statictext{text:'Vietnamese', preferredSize:[80,-1]}");
            var inpVn = grVn.add("edittext{characters: 10}");
            var grBtn = boxNewName.add("group");
            var btnOk = grBtn.add("button{text:'OK',size:[100,20],properties:{name: 'ok'}}");
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
                logTrans.push(obj);
                arrTempLogTrans.push(obj);
                boxNewName.close();
                //--------
                totalPage = (logTrans.length%7==0)? logTrans.length/7 : parseInt(logTrans.length/7 +1);
                pageStart = 7 *(totalPage -1);
                pageEnd = logTrans.length;
                jumpPageNum( logTrans.slice(pageStart, pageEnd), pageStart, pageEnd);
            }
            boxNewName.show();
        }
        //---------Handle Search
        inpSearch.onChanging = function(){
            var arrResult = [], arrIndex= [], arrResultSub=[], arrIndexSub=[];
            if(this.text != ""){
                for(var i=0; i<logTrans.length; i++){
                    if(logTrans[i].en.toLowerCase().search(this.text.toLowerCase()) != -1 || logTrans[i].vn.toLowerCase().search(this.text.toLowerCase()) != -1){
                        arrResult.push(logTrans[i]);
                        arrIndex.push(i);
                    }
                    else if(removeSign(logTrans[i].vn.toLowerCase()).search(this.text.toLowerCase()) != -1 ){
                        arrResultSub.push(logTrans[i]);
                        arrIndexSub.push(i);
                    }
                }
                //alert(arrResult.length);
                if(arrIndex.length >0){
                    jumpPageNum(arrResult, 0, 7, arrIndex);
                }
                else{
                    jumpPageNum(arrResultSub, 0, 7, arrIndexSub);
                }
                btnPrev.enabled = false;
                btnNext.enabled = false;
            }
            else{
                btnPrev.enabled = true;
                btnNext.enabled = true;
            }
        }
        //---handle onclose
        boxTransName.onClose = function(){
            mybox.close();
            app.bringToFront();
        }
        boxTransName.show();
    };
    //---------
    mybox.show();
    //----Function process
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
    function progress(data, msg){
        var percentVal =0;
        var box = new Window("palette{text: 'Progress', properties: {closeButton: true}, spacing: 3}");
        box.graphics.backgroundColor = box.graphics.newBrush (box.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
        var grLabel = box.add("group{orientation: 'column', margins: 0, spacing: 0}");
        grLabel.graphics.backgroundColor = grLabel.graphics.newBrush (grLabel.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
        var label = grLabel.add("statictext{text: '"+msg+"', preferredSize : [500,-1], justify: 'left'}");
        label.graphics.foregroundColor = label.graphics.newPen (label.graphics.PenType.SOLID_COLOR, [0, 0, 0], 1);
        var labelPercent = grLabel.add("statictext{text: "+percentVal+" + '%', size: [30,15], justify: 'center', }");
        labelPercent.graphics.foregroundColor = labelPercent.graphics.newPen (labelPercent.graphics.PenType.SOLID_COLOR, [0, 0, 0], 1);
        var grPanelBar = box.add("group{orientation: 'row'}");
        grPanelBar.graphics.backgroundColor = grPanelBar.graphics.newBrush (grPanelBar.graphics.BrushType.SOLID_COLOR, [0.7, 0.7, 0.7]);
        var panelForBar = grPanelBar.add("panel{margins :0}");
        var bar = panelForBar.add("progressbar{value:0, maxvalue: "+data+", preferredSize: [500, 20], justify: 'left'}");
        
        progress.increaseBar = function(){
            bar.value++;
        }
        progress.message = function(msg){
            label.text = msg;
        }
        progress.percentIncrease= function(percentVal){
            labelPercent.text = percentVal;
            if(percentVal == "100%"){
                box.close();
            }
        }
        box.show();
    };
    //---
    function translateName(valFrom, valTo, arrTransName){
        progress(arrLayers.length, "Start");
        var firstLayer = arrLayers[0];
        loopLayer(arrLayers);
        function loopLayer(arr){
            for(var i=0; i<arr.length; i++){
                //------Show progress-------
                if(arr[i].isBackgroundLayer){
                    arr[i].isBackgroundLayer = false;
                    arr[i].name = (valFrom=="en")? "Background"  : (valFrom =="jp")? "背景" : "Phông nền" ;
                }
                progress.message(arr[i].name);
                if(arr[i].parent.layers[0] == firstLayer){
                    progress.increaseBar();
                    progress.percentIncrease( ( ( (i +1)/ totalProgress)*100).toFixed (0) + "%" );
                }
                if(arr[i].typename == "LayerSet"){
                    loopLayer(arr[i].layers);
                }
                //------------
                var multiname = arr[i].name.split("_");
                var endName = "";
                for(var k=0; k<multiname.length; k++){
                    var hasFound = false, subIndex = null;
                    var objV1 = multiname[k].toLowerCase();
                    var objV2 = objV1 + "s";
                    var objV3 = objV1.split(" ").reverse().join(" ");
                    var objV4 = objV1.replace(/\d/g, "");
                    objV4 = (objV4[objV4.length - 1] == " ")? objV4.substring(0, objV4.length - 1) : objV4;
                    var objV5 = removeSign(objV4);
                    
                    for(var j=0; j<arrTransName.length; j++){
                        var nameDes = arrTransName[j][valFrom].toLowerCase().split("(")[0];
                        if(objV1 == nameDes ||objV2 == nameDes || objV3 == nameDes ||objV4 == nameDes){
                            var newName = (arrTransName[j][valTo] == "")? objV4 : arrTransName[j][valTo].split("(")[0];
                            if(!isNaN(objV1[objV1.length - 1])){
                                var numberLayer = objV1.split(" ").reverse()[0];
                                endName += "_"+ newName + " " + numberLayer;
                            }
                            else{
                                endName += "_" + newName;
                            }
                            hasFound = true;
                            break;
                        }
                        else if(objV5 == removeSign(nameDes)){
                            subIndex = j;
                        }
                    }
                    if(!hasFound){
                        if(subIndex != null){
                            var numberLayer = (!isNaN(objV1[objV1.length - 1]))? (" "+objV1.split(" ").reverse()[0] ) : "";
                            endName = (arrTransName[subIndex][valTo] == "")? ("_"+multiname[k]) : ("_" + arrTransName[subIndex][valTo].split("(")[0] + numberLayer);
                        }
                        else{
                            endName += "_"+ multiname[k];  
                        }                    
                    }
                }
                //alert(arr[i].name);
                endName = endName[1].toUpperCase() + endName.substr(2);
                arr[i].name = endName;
            }
        }
    }
    return (response.dataTranslate!=undefined || response.punchEndPoints!=undefined)? JSON.stringify(response) : null;
};
//---Process Image Upload
function processImgUpload(quality, mode){
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    quality = (isNaN(quality) || quality > 12 || quality < 0)?  6 : parseInt(quality);
    //process selection
    var doc = app.activeDocument;
    var hisBack = doc.activeHistoryState;
    try{
        var bounds = doc.selection.bounds;
        doc.crop(bounds);
    }
    catch(err){}
    // resize Image
    if(mode == "Thumbnail"){
        var res = null, res2=150;
        if(doc.width<doc.height){res = 150; res2 = null;}
        doc.resizeImage(res, res2);
        doc.resizeCanvas(res2, res, AnchorPosition.MIDDLECENTER);
    }
    //----------------
    var date = new Date();
    var nameFile = date.toGMTString().match(/\d/g).join("");
    var strFolder = "~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/images/imgTemp";
    var folderUp = new Folder(strFolder);
    if(folderUp.exists){ 
        var arrFiles = folderUp.getFiles ("*.jpg")
        for(var i =0; i<arrFiles.length; i++){
            arrFiles[i].remove();
        }
    }
    else{
        folderUp.create();
    }
    var fileUp = new File(strFolder +"/" + nameFile + ".jpg");
    var refJPG = new JPEGSaveOptions();
    refJPG.formatOptions = FormatOptions.OPTIMIZEDBASELINE;
    refJPG.quality = quality;
    doc.saveAs(fileUp, refJPG, true, Extension.LOWERCASE);
    doc.activeHistoryState = hisBack;
    return nameFile;
};

function progressBox(data, msg, balanceValue){
    var percentVal =0, eachValue = 0;
    var mybox = new Window("palette{text: 'Progress', properties: {closeButton: true}, spacing: 3}");
    var grLabel = mybox.add("group{orientation: 'column', margins: 0, spacing: 0}");
    var label = grLabel.add("statictext{text: '"+msg+"', preferredSize : [500,-1], justify: 'left'}");
    var labelPercent = grLabel.add("statictext{text: "+percentVal+" + '%', size: [40,15], justify: 'center', }");
    var panelForBar = mybox.add("panel{margins :0}");
    var bar = panelForBar.add("progressbar{value:0, maxvalue: "+data+", preferredSize: [500, 20]}");
    
    progressBox.increaseBar = function(){
        bar.value++
    }
    progressBox.setValue = function(val, msg){
        bar.value = eachValue + (val * balanceValue)/100;
        labelPercent.text = bar.value.toFixed (1) + "%";
        label.text = msg;
        if(val == 100){
            if(bar.value==100){
                $.sleep (100);
                mybox.close();
            }
            else{
                eachValue = bar.value;
            }
        }
    }
    progressBox.message = function(msg){
        label.text = msg;
    }
    progressBox.percentIncrease= function(percentVal){
        labelPercent.text = percentVal;
    }
    progressBox.status = function(){
        return  (mybox.active)? true : false;
    }
    if(!mybox.active){
        mybox.show();
    }
};
function syncDataExtension(){
    var messageLog = new File('~/AppData/Roaming/Adobe/CEP/extensions/com.previewImage.panel/messageLog.log');
    messageLog.open('r');
    var res = messageLog.read();
    messageLog.close();
    messageLog.remove();
    return res;
};
// View Palettes Hide --------
function showPalettesHide(hidePalettesData, language){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
     var boxPalettesHide = new Window("dialog{text:'Palettes Hidden', properties:{closeButton:true}}");
     if(hidePalettesData.length == 0){
        boxPalettesHide.add("statictext{text:'No hidden palettes'}");
     }
     var panelListPalettes = boxPalettesHide.add("panel{orientation: 'column', spacing: 5}");
     panelListPalettes.alignChildren = "left";
     //call view----
     var hierachy = 0, arrRes = [];
     viewHide(hidePalettesData, panelListPalettes);
     function viewHide(arrData, element, arrUrl){
        for(var i = 0; i< arrData.length; i++){
            var newArr = (arrUrl== undefined)? [] : arrUrl;
            newArr.push(arrData[i].index);
            var url =  newArr.join("/data/");
            var group_1 = element.add("group{orientation: 'column', alignChildren: 'left', margins: ["+hierachy*10+",0,0,0], spacing: 0}");
            var myCheckbox = group_1 .add("checkbox{text: '"+arrData[i].name[language]+"', value: "+arrData[i].hasHidden+",  url: '"+url+"'}");
            if(arrData[i].data != undefined && arrData[i].data.length>0){
                hierachy++;
                viewHide(arrData[i].data, group_1, newArr);
            }
            if(i == (arrData.length - 1)){
                hierachy--;
            }
            myCheckbox.onClick = function(){
                hasFound = false;
                for(var j=0; j< arrRes.length; j++){
                    if(arrRes[j].url == this.url){
                        arrRes.splice (j, 1);
                        hasFound = true;
                        break;
                    }
                }
                if(!hasFound){
                    arrRes.push({url: this.url , hidden: this.value});
                }
            }
        }
    }
    //
    var btnSave = boxPalettesHide.add("button{text:'Save',size:[100,20],properties:{name: 'ok'}}");
    var hasSave = false;
    btnSave.onClick = function(){
        status = true;
        boxPalettesHide.close();
    }
    boxPalettesHide.onClose = function(){
        arrRes = (status)? arrRes  : [];
    }
    boxPalettesHide.show();
    return JSON.stringify(arrRes);
};
function ConfigSetSw(punchEndPoints){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var boxServer = new Window("dialog{text:'Server Config', properties:{closeButton: true}}");
    var panelTypeData = boxServer.add("panel{text:'Type', orientation:'row', size:[220,50]}");
    panelTypeData.add("radiobutton{text:'Database', value:true, flag:'databaseActive'}");
    panelTypeData.add("radiobutton{text:'Bucket storage', value:false, flag:'bucketStorageActive'}");
    var panelServer = boxServer.add("panel{text:'Endpoints', size: [220, 120], alignChildren:'left'}");
    var grRadioBtn = panelServer.add("group");
    grRadioBtn.orientation = "column";
    grRadioBtn.alignChildren="left";
    //handle type data
    var activeServer = JSON.parse(JSON.stringify(punchEndPoints.activeServer));
    createRadioServer("databaseActive");
    for(var i=0;i<panelTypeData.children.length;i++){
        panelTypeData.children[i].onClick = function(){
            createRadioServer(this.flag,"Reload");
        }
    }
    function createRadioServer(endpointType, mode){
        for(var i=0;i<punchEndPoints.data.length; i++){
            var radioBtn =(mode!="Reload")? grRadioBtn.add("radiobutton{text:'"+punchEndPoints.data[i].projectId+"', value: false, index:"+i+"}"): grRadioBtn.children[i];
            if(activeServer[endpointType] == i){
                radioBtn.value = true;
            }
            radioBtn.onClick = function(){
                activeServer[endpointType] = this.index;
            }
        }
    }
    var btnOk = boxServer.add("button{size:[80,20],text:'OK', properties: {name:'ok'}}");
    var response = null;
    btnOk.onClick = function(){
        if(JSON.stringify(punchEndPoints.activeServer).localeCompare(JSON.stringify(activeServer)) != 0){
            punchEndPoints.activeServer = activeServer;
            response = punchEndPoints;
        }
        boxServer.close();
    }
    boxServer.show();
    return JSON.stringify(response);
}
function DeletePSDFile(nameFile){
    var folderDel = new Folder("~/AppData/Roaming/Adobe/Toolbox Cache/Temp/"+nameFile);
    var arrFiles = folderDel.getFiles();
    for(var i=0; i<arrFiles.length; i++){
        arrFiles[i].remove();
    }
    folderDel.remove();
};
function SortPaletteManual(objEnd, language){
    #include '~/AppData/Roaming/Adobe/CEP/extensions/com.sam.toolbox.panel/client/json2.js'
    var moveInfo = {position: "Inside"};
    var boxPalette = new Window("dialog{text:'Current Palette("+objEnd.name[language]+")', properties:{closeButton: true}}");
    var controlPanel = boxPalette.add("panel{text:'Position'}");
    var radioGr = controlPanel.add("group");
        radioGr.add("radiobutton{text: 'Forward', value: false}");
        radioGr.add("radiobutton{text: 'Inside', value: true}");
        radioGr.add("radiobutton{text: 'Backward', value: false}");
    var btnGr = boxPalette.add("group");
        var btnOk = btnGr.add("button{size:[80,20],text:'OK', properties: {name:'ok'}}");
        var btnCancel = btnGr.add("button{size:[80,20],text:'Cancel', properties: {name:'cancel'}}");
    //handle radiobutton
    for(var i=0; i< radioGr.children.length;i++){
        radioGr.children[i].onClick = function(){
            moveInfo.position = this.text;
        }
    }
    //handle confirm
    var res = null;
    btnOk.onClick = function(){
        res = moveInfo.position;
        boxPalette.close();
    }
    boxPalette.show();
    return res;
}
function findPositionPalette(dataPalette, paletteActive,language ){
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
//------
//-------------------------------function LISTENER-----------------------------------
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
function deleteMask(){
    var idDlt = charIDToTypeID( "Dlt " );
    var desc105 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref39 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref39.putEnumerated( idChnl, idOrdn, idTrgt );
    desc105.putReference( idnull, ref39 );
    executeAction( idDlt, desc105, DialogModes.NO );
};
function addMask(){
    var idMk = charIDToTypeID( "Mk  " );
    var desc223 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    desc223.putClass( idNw, idChnl );
    var idAt = charIDToTypeID( "At  " );
        var ref42 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref42.putEnumerated( idChnl, idChnl, idMsk );
    desc223.putReference( idAt, ref42 );
    var idUsng = charIDToTypeID( "Usng" );
    var idUsrM = charIDToTypeID( "UsrM" );
    var idRvlS = charIDToTypeID( "RvlS" );
    desc223.putEnumerated( idUsng, idUsrM, idRvlS );
    executeAction( idMk, desc223, DialogModes.NO );
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
function refineSelection(radius, smooth, feather, contract, shiftEdge){
    var idrefineSelectionEdge = stringIDToTypeID( "refineSelectionEdge" );
    var desc3406 = new ActionDescriptor();
    var idrefineEdgeBorderRadius = stringIDToTypeID( "refineEdgeBorderRadius" );
    var idPxl = charIDToTypeID( "#Pxl" );
    desc3406.putUnitDouble( idrefineEdgeBorderRadius, idPxl, radius );
    var idrefineEdgeBorderContrast = stringIDToTypeID( "refineEdgeBorderContrast" );
    var idPrc = charIDToTypeID( "#Prc" );
    desc3406.putUnitDouble( idrefineEdgeBorderContrast, idPrc, contract );
    var idrefineEdgeSmooth = stringIDToTypeID( "refineEdgeSmooth" );
    desc3406.putInteger( idrefineEdgeSmooth, smooth );
    var idrefineEdgeFeatherRadius = stringIDToTypeID( "refineEdgeFeatherRadius" );
    var idPxl = charIDToTypeID( "#Pxl" );
    desc3406.putUnitDouble( idrefineEdgeFeatherRadius, idPxl, feather );
    var idrefineEdgeChoke = stringIDToTypeID( "refineEdgeChoke" );
    var idPrc = charIDToTypeID( "#Prc" );
    desc3406.putUnitDouble( idrefineEdgeChoke, idPrc, shiftEdge );
    var idrefineEdgeAutoRadius = stringIDToTypeID( "refineEdgeAutoRadius" );
    desc3406.putBoolean( idrefineEdgeAutoRadius, false );
    var idrefineEdgeDecontaminate = stringIDToTypeID( "refineEdgeDecontaminate" );
    desc3406.putBoolean( idrefineEdgeDecontaminate, false );
    var idrefineEdgeOutput = stringIDToTypeID( "refineEdgeOutput" );
    var idrefineEdgeOutput = stringIDToTypeID( "refineEdgeOutput" );
    var idselectionOutputToSelection = stringIDToTypeID( "selectionOutputToSelection" );
    desc3406.putEnumerated( idrefineEdgeOutput, idrefineEdgeOutput, idselectionOutputToSelection );
    executeAction( idrefineSelectionEdge, desc3406, DialogModes.NO );
};
function interestSelection(){
    var idIntr = charIDToTypeID( "Intr" );
    var desc121 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref23 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref23.putEnumerated( idChnl, idChnl, idMsk );
    desc121.putReference( idnull, ref23 );
    var idWith = charIDToTypeID( "With" );
        var ref24 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref24.putProperty( idChnl, idfsel );
    desc121.putReference( idWith, ref24 );
    executeAction( idIntr, desc121, DialogModes.NO );
};
function loadSelectionMask(){
    var idsetd = charIDToTypeID( "setd" );
    var desc2996 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1450 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1450.putProperty( idChnl, idfsel );
    desc2996.putReference( idnull, ref1450 );
    var idT = charIDToTypeID( "T   " );
        var ref1451 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref1451.putEnumerated( idChnl, idChnl, idMsk );
    desc2996.putReference( idT, ref1451 );
    executeAction( idsetd, desc2996, DialogModes.NO );
};
function fiillHistory(){
    var idFl = charIDToTypeID( "Fl  " );
    var desc3323 = new ActionDescriptor();
    var idUsng = charIDToTypeID( "Usng" );
    var idFlCn = charIDToTypeID( "FlCn" );
    var idSved = charIDToTypeID( "Sved" );
    desc3323.putEnumerated( idUsng, idFlCn, idSved );
    var idOpct = charIDToTypeID( "Opct" );
    var idPrc = charIDToTypeID( "#Prc" );
    desc3323.putUnitDouble( idOpct, idPrc, 100.000000 );
    var idMd = charIDToTypeID( "Md  " );
    var idBlnM = charIDToTypeID( "BlnM" );
    var idNrml = charIDToTypeID( "Nrml" );
    desc3323.putEnumerated( idMd, idBlnM, idNrml );
    executeAction( idFl, desc3323, DialogModes.NO );
};
function showOnlyLayer(){
    var idShw = charIDToTypeID( "Shw " );
    var desc13 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var list5 = new ActionList();
            var ref11 = new ActionReference();
            var idLyr = charIDToTypeID( "Lyr " );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref11.putEnumerated( idLyr, idOrdn, idTrgt );
        list5.putReference( ref11 );
    desc13.putList( idnull, list5 );
    var idTglO = charIDToTypeID( "TglO" );
    desc13.putBoolean( idTglO, true );
    executeAction( idShw, desc13, DialogModes.NO );
};
function makeSolidColor(name, red, green, blue, rgbObj, maskInvert, blendMode, opacity, clipping){
    //----------
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
        clippingMask(true);
    }
};
function makeMask(){
    var idMk = charIDToTypeID( "Mk  " );
    var desc524 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    desc524.putClass( idNw, idChnl );
    var idAt = charIDToTypeID( "At  " );
        var ref14 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idMsk = charIDToTypeID( "Msk " );
        ref14.putEnumerated( idChnl, idChnl, idMsk );
    desc524.putReference( idAt, ref14 );
    var idUsng = charIDToTypeID( "Usng" );
    var idUsrM = charIDToTypeID( "UsrM" );
    var idRvlS = charIDToTypeID( "RvlS" );
    desc524.putEnumerated( idUsng, idUsrM, idRvlS );
    executeAction( idMk, desc524, DialogModes.NO );
}
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
function onOffLayerMask(nameLayer, status){
    var idsetd = charIDToTypeID( "setd" );
    var desc219 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref19 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        if(nameLayer != null){
            ref19.putName( idLyr, nameLayer );
        }
        else{
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref19.putEnumerated( idLyr, idOrdn, idTrgt );
        }
    desc219.putReference( idnull, ref19 );
    var idT = charIDToTypeID( "T   " );
        var desc220 = new ActionDescriptor();
        var idUsrM = charIDToTypeID( "UsrM" );
        desc220.putBoolean( idUsrM, status );
    var idLyr = charIDToTypeID( "Lyr " );
    desc219.putObject( idT, idLyr, desc220 );
    try{executeAction( idsetd, desc219, DialogModes.NO ); return true;}
    catch(err){return false;}
}
function loadSelectionLayer(layerName, type){
    if(type =="Mask"){type = "Msk "}
    else{type = "Trsp"}
    var idsetd = charIDToTypeID( "setd" );
    var desc130 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref9 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref9.putProperty( idChnl, idfsel );
    desc130.putReference( idnull, ref9 );
    var idT = charIDToTypeID( "T   " );
        var ref10 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idTrsp = charIDToTypeID( type );
        ref10.putEnumerated( idChnl, idChnl, idTrsp );
        if(layerName !=null){
            var idLyr = charIDToTypeID( "Lyr " );
            ref10.putName( idLyr, layerName );
        }
    desc130.putReference( idT, ref10 );
    try{executeAction( idsetd, desc130, DialogModes.NO ); return true;}
    catch(err){return false;}
};
function objSolidColor(hexColor){
    var mySolidColor = new SolidColor;
    var rgbPref = new RGBColor;
    rgbPref.hexValue = hexColor;
    mySolidColor.rgb = rgbPref;
    return mySolidColor;
}
function copyPathItem(sourceName, destiName){
    var idslct = charIDToTypeID( "slct" );
    var desc16921 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1179 = new ActionReference();
        var idpathComponentSelectTool = stringIDToTypeID( "pathComponentSelectTool" );
        ref1179.putClass( idpathComponentSelectTool );
    desc16921.putReference( idnull, ref1179 );
    var iddontRecord = stringIDToTypeID( "dontRecord" );
    desc16921.putBoolean( iddontRecord, true );
    var idforceNotify = stringIDToTypeID( "forceNotify" );
    desc16921.putBoolean( idforceNotify, true );
    executeAction( idslct, desc16921, DialogModes.NO );

    var idslct = charIDToTypeID( "slct" );
        var desc16900 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref1160 = new ActionReference();
            var idPath = charIDToTypeID( "Path" );
            ref1160.putName( idPath, sourceName );
        desc16900.putReference( idnull, ref1160 );
    executeAction( idslct, desc16900, DialogModes.NO );

    var idcopy = charIDToTypeID( "copy" );
    executeAction( idcopy, undefined, DialogModes.NO );

    var idslct = charIDToTypeID( "slct" );
        var desc16902 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref1161 = new ActionReference();
            var idPath = charIDToTypeID( "Path" );
            if(destiName==null){
                var docImg = app.activeDocument;
                var layerText = docImg.artLayers.add();
                layerText.kind = LayerKind.TEXT;
                layerText.textItem.createPath();
                layerText.remove();
                var idWrPt = charIDToTypeID( "WrPt" );
                ref1161.putProperty( idPath, idWrPt );
            }
            else{
                ref1161.putName( idPath, destiName);
            }
        desc16902.putReference( idnull, ref1161 );
    executeAction( idslct, desc16902, DialogModes.NO );

    var idpast = charIDToTypeID( "past" );
    executeAction( idpast, undefined, DialogModes.NO );
}
function deselectAllPaths(){
    var idDslc = charIDToTypeID( "Dslc" );
    var desc17904 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1351 = new ActionReference();
        var idPath = charIDToTypeID( "Path" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1351.putEnumerated( idPath, idOrdn, idTrgt );
    desc17904.putReference( idnull, ref1351 );
    executeAction( idDslc, desc17904, DialogModes.NO );
}
function clearHistoryStates(){
    var idCler = charIDToTypeID( "Cler" );
    var desc15474 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref2181 = new ActionReference();
        var idPrpr = charIDToTypeID( "Prpr" );
        var idHsSt = charIDToTypeID( "HsSt" );
        ref2181.putProperty( idPrpr, idHsSt );
        var idDcmn = charIDToTypeID( "Dcmn" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref2181.putEnumerated( idDcmn, idOrdn, idTrgt );
    desc15474.putReference( idnull, ref2181 );
    executeAction( idCler, desc15474, DialogModes.NO );
}
function clippingMask(status){
    var actionClipping = (status)? "GrpL" : "Ungr";
    var idGrpL = charIDToTypeID( actionClipping );
    var desc18579 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1704 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1704.putEnumerated( idLyr, idOrdn, idTrgt );
    desc18579.putReference( idnull, ref1704 );
    executeAction( idGrpL, desc18579, DialogModes.NO );
}
function writeLog(data){
    var log = new File("~/Desktop/newLog.log");
    log.open("w");
    log.write(data);
    log.close();
}
function setZoomLevel(zoom){
    if(zoom < 1) zoom =1;
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var getScreenResolution = executeActionGet(ref).getObjectValue(stringIDToTypeID('unitsPrefs')).getUnitDoubleValue(stringIDToTypeID('newDocPresetScreenResolution'))/72;
    var docResolution = activeDocument.resolution;
    activeDocument.resizeImage(undefined, undefined, getScreenResolution/(zoom/100), ResampleMethod.NONE);
    //setZoom
    var desc = new ActionDescriptor();
    ref = null;
    ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Mn  "), charIDToTypeID("MnIt"), charIDToTypeID('PrnS'));
    desc.putReference(charIDToTypeID("null"), ref);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    activeDocument.resizeImage(undefined, undefined, docResolution, ResampleMethod.NONE);
};