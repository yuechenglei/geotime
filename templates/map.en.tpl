<div id = 'mapBackground'>
</div>
<div id = "mapParaMatrix">
    <i class="fa fa-times" id="closeBrushBtn"></i>
    <div id ="paraG">
        <div class= "paraRow">
            <div class ="paraPixel" windowsize="1" step="0.5" >
            </div>
            <div class ="paraPixel" windowsize="2" step="0.5">
            </div>
            <div class ="paraPixel" windowsize="5" step="0.5">
            </div>
            <div class ="paraPixel" windowsize="10" step="0.5">
            </div>
        </div>
        <div class= "paraRow">
            <div class ="paraPixel" windowsize="1" step="1">
            </div>
            <div class ="paraPixel" windowsize="2" step="1">
            </div>
            <div class ="paraPixel" windowsize="5" step="1">
            </div>
            <div class ="paraPixel" windowsize="10" step="1">
            </div>
        </div>
    </div>
</div>
<div id= "mapTimeText">
    <span id="mapDate"></span>
    <span id="mapTime"></span>
</div>


<div id="mapControl">
    <div id = "displayControlTitle" class = "controlTitle">
        <span >Display <i class="fa fa-caret-down"></i></span>
     </div>
    <div id = "displayControl"class="controlSetting" style="width:100%;">
        <input type="checkbox" id="bacgroundStation-check" checked="checked">
        <span >All Influenced Real Base Stations</span>
        </br>
        <div id = "bacgroundStationR" class= "slider">
            <div class = "sliderText">
                <span  >Size </span>
            </div>
            <div id = "bacgroundStationR-slider" class = "sliderBar" ></div>
        </div>

        <input type="checkbox" id="influenceStation-check" checked="checked">
        <span>Current Influenced Real Base Stations</span>
        </br>
        <div id = "influenceStationR" class= "slider">
                <div class = "sliderText">
                    <span  >Size </span>
                </div>
                <div id = "influenceStationR-slider" class = "sliderBar" ></div>
        </div>
<!--         <div>
            <input type="checkbox" id="rawtraj-check" checked="checked">
            <span  id="rawtraj-check-text">未经处理轨迹</span>
            <div id="rawtraj-check-cl" class= "color_lg"> </div>
            </br>
        </div> -->
        <div>
            <input type="checkbox" id="traj-check" checked="checked">
            <span id="traj-check-text">Trajectory</span>
            <!-- <div id="traj-check-cl" class= "color_lg"> </div> -->
        </div>
    </div>


    <div id = "parameterControlTitle"class = "controlTitle">
        <span >Modification <i class="fa fa-caret-down"></i></span>
    </div>
    <div id = "parameterControl">
     <div class="controlSetting" style="width:100%;">
        <div id= 'settingMsg'>
            <div id="settingMsgName">
             Message ID :
            </div>
             <div class="dropdown" id = 'settingMsgDrop'>
                  <button class="btn btn-default dropdown-toggle btn-xs" type="button"  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    无 <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenu1" id= "settingMsgDropValues">
                  </ul>
            </div>
            <div id = 'settingMsgBtns'>
            </div>
        </div>
        <div id = "settingControl" class="hidden">
            <div >
                <!-- Local Modification:  -->
                <i class="fa fa-border fa-scissors" id = 'localsettingBtn' tooltip = "Local Modification"></i>
            </div>

            <div>
                <span>Window Size: </span>
                <span id='sildingWinodwSizeText'>  5 Min</span>
                </br>
                <div id = "sildingWinodwSize-slider" class = "sliderBar2" ></div>
            </div>
            <div>
                <span>Window Step: </span>
                <span id='sildingWinodwStepText'> 1 Min</span>
                </br>
                <div id = "sildingWinodwStep-slider" class = "sliderBar2" ></div>
            </div>
            <div class = "submit">
                <input class="btn btn-default btn-xs" type="button" id="calcTrajBtn" value="Bind Road">
            </div>
        </div>


        <!-- <input type="button" class="btn btn-default btn-sm">计算轨迹</input> -->
    </div>

    </div>
</div>

