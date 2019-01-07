<div id='mapBackground'>
    <div class="parameterPanel">
        <p> map center: </p>
        <p class="infoText" id="info1"></p>
        <p> zoom level: </p>
        <p class="infoText" id="info2">12</p>
        <p> pixel per latitude:</p>
        <p class="infoText" id="info3"></p>
        <p> pixel per longitude:</p>
        <p class="infoText" id="info4"></p>
    </div>
</div>
<div id='map3d' class='hidden'>
    <div id='container3d'>
    </div>
    <div class="parameterPanel">
        <p> camera position: </p>
        <p class="infoText" id="info5"></p>
        <p> control center: </p>
        <p class="infoText" id="info6"></p>
        <p> camera rotation:</p>
        <p class="infoText" id="info7"></p>
        <p> zoom:</p>
        <p class="infoText" id="info8"></p>
    </div>
</div>
<div id="ProjectTitle">
    GeoTime
</div>
<!--
<div id="AirportPanel" style="text-align: center;">
    <div id="CenterAirport">ZBAA</div>
    <div class="small-font">Beijing Capital International Airport</div>
    <div id="timeRangeText" style="color:#999999;"></div>
    <div id="slider-range"></div>
    <div id="flightNum"></div>
    <div id="gateTotalNum"></div>
    <span>Speed Legend</span>
    <div id="speedLegend"></div>
</div> -->
<div id='timelineControl'>
    <div id='controlBtn' class="btn-group btn-group-xs" role="group">
        <div id="timePlay">
            <button type="button" class="btn-default btn-xs" id="btn-play">
                <span class="glyphicon glyphicon-play" id="playIcon"></span>
            </button>
        </div>
        <div class="dropdown" id='playSpeedDropdown'>
            <button class="btn btn-default dropdown-toggle btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                x 20
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                <li><a value="10">x 10</a></li>
                <li><a value="20">x 20</a></li>
                <li><a value="50">x 50</a></li>
            </ul>
        </div>
        <div class="dropdown" id='winSizeDropdown'>
            <button class="btn btn-default dropdown-toggle btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                10 min
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                <li><a value="1">1 min</a></li>
                <li><a value="2">2 min</a></li>
                <li><a value="5">5 min</a></li>
                <li><a value="10">10 min</a></li>
            </ul>
        </div>
        <div id='curTimeText'></div>
        <!--<div class="dropdown " display="none" id="slidingWindowSizeDropdown">-->
        <!--&lt;!&ndash; <div id = "winSizeLabel">winSize:</div>-->
        <!--<div id="sliderWinSize"></div>-->
        <!--<div id = "winText">30 min</div> &ndash;&gt;-->
        <!--<button class="btn btn-default dropdown-toggle btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">-->
        <!--30Min-->
        <!--<span class="caret"></span>-->
        <!--</button>-->
        <!--<ul class="dropdown-menu col-xs-12" aria-labelledby="dropdownMenu1">-->
        <!--<li><a value="0.0001">0Min</a></li>-->
        <!--<li><a value="10">10Min</a></li>-->
        <!--<li><a value="20">20Min</a></li>-->
        <!--<li><a value="30">30Min</a></li>-->
        <!--&lt;!&ndash; <li ><a  value = "1440">全部</a></li> &ndash;&gt;-->
        <!--</ul>-->
        <!--</div>-->
    </div>
    <!--     <div id='legend'>
    </div> -->
    <!--<div id='fontBtn'>-->
    <!--<button type="button" id="button_week_backward" class="btn btn-xs">-->
    <!--<i class="glyphicon glyphicon-fast-backward"></i>-->
    <!--</button>-->
    <!--<button type="button" id="button_day_backward" class="btn btn-xs">-->
    <!--<i class="glyphicon glyphicon-step-backward"></i>-->
    <!--</button>-->
    <!--<button type="button" id="button_day_forward" class="btn btn-xs">-->
    <!--<i class="glyphicon glyphicon-step-forward"></i>-->
    <!--</button>-->
    <!--<button type="button" id="button_week_forward" class="btn btn-xs">-->
    <!--<i class="glyphicon glyphicon-fast-forward"></i>-->
    <!--</button>-->
    <!--</div>-->
</div>
<!-- <div id="fixptsHistogram">
    <div style="background-color: #000000;">FixPts Passing <i class="fa fa-caret-down" id="FixptsHistogramShow" style="cursor:pointer;"></i></div>
    <div id="fixptsHistogram_real"></div>
</div> -->
<div id="mapControl">
    <div id="displayControlTitle" class="controlTitle">
        <span>Display <i class="fa fa-caret-down"></i></span>
    </div>
    <div id="displayControl" class="controlSetting" style="width:100%;">
        <!--         Airport
                <div class="dropdown" id = 'airportDropdown'>
                  <button class="btn btn-default dropdown-toggle btn-xs" type="button"  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    ZBAA
                    <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a value = "ZBAA">ZBAA</a></li>
                    <li><a value = "ZBNY">ZBNY</a></li>
                    <li><a value = "ZBSJ">ZBSJ</a></li>
                    <li><a value = "ZBTJ">ZBTJ</a></li>
                  </ul>
                </div> -->
        <!--
        <span>Filter</span>
        <div class="btn-group" data-toggle="buttons" id="filterBtnGroup">
            <label class="btn btn-default btn-xs" value="filterCircle">
                <input type="radio" name="options" id="option"><i class="icon iconfont icon-yuan" aria-hidden="true" value="filterCircle"></i>
            </label>
            <label class="btn btn-default btn-xs" value="filterForbid">
                <input type="radio" name="options" id="option"><i class="icon iconfont icon-hand" aria-hidden="true" value="filterForbid"></i>
            </label>
            <label class="btn btn-default btn-xs" value="filterRemove">
                <input type="radio" name="options" id="option"><i class="icon iconfont icon-attentionforbid" aria-hidden="true" value="filterRemove"></i>
            </label>
            <label class="btn btn-default btn-xs" value="filterDeleteAll">
                <input type="radio" name="options" id="option"><i class="fa fa-remove" aria-hidden="true" value="filterDeleteAll"></i>
            </label>
        </div>
-->
        <!--        <table width="100%">
                    <tbody>
                        <tr>
                            <td width="20%">Size</td>
                            <td width="65%"><div id="flight-size-slider"></div></td>
                            <td width="15%"><div id="flight-size-slider-value"></div></td>
                        </tr>
                        <tr>
                            <td width="20%">Width</td>
                            <td width="65%"><div id="flight-width-slider"></div></td>
                            <td width="15%"><div id="flight-width-slider-value"></div></td>
                        </tr>
                    </tbody>
                </table> -->
        <span>Swith:</span>
        <div>
            <label class="radio-inline" id="Swith3d">
                <input type="radio" name="optionsRadiosinline" id="To2d" value="option1" checked> 2D
            </label>
            <label class="radio-inline">
                <input type="radio" name="optionsRadiosinline" id="To3d" value="option2"> 3D
            </label>
        </div>


        <span>Type: </span>
        <div class="btn-group" data-toggle="buttons" id="flightTypeBtnGroup">
            <label class="btn btn-default btn-xs active" value="depFlight">
                <input type="checkbox" id="depShow-check"><i class="fa fa-plane" style="color: rgb(41, 170, 227);" aria-hidden="true" value="depFlight"></i>
            </label>
            <label class="btn btn-default btn-xs active" value="arrFlight">
                <input type="checkbox" id="arrShow-check"><i class="fa fa-plane" style="color: rgb(209, 71, 69);" aria-hidden="true" value="arrFlight"></i>
            </label>
        </div>

            <div id = 'camera-div' class = 'hidden'>
        <span>Camera:</span>
        <div>
            <label class="radio-inline" id="Swith3d">
                <input type="radio" name="cameraType" id="orthCamera" value="option11" checked> Orth
            </label>
            <label class="radio-inline">
                <input type="radio" name="cameraType" id="persCamera" value="option22"> Pers
            </label>
        </div>
        </div>
        
        <div id='viewDropdown-div' class="hidden">
            View:
            <div class="dropdown" id='viewDropdown'>
                <button class="btn btn-default dropdown-toggle btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    Top
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a value = "Top">Top</a></li>
                    <li><a value = "Middle">Middle</a></li>
                    <li><a value = "Bottom">Bottom</a></li>
                </ul>
            </div>
        </div>
        <div>
            <input type="checkbox" id="gate-check">
            <span>Gate Point</span>
            </br>
        </div>
        <div>
            <input type="checkbox" id="gateLabel-check">
            <span>Gate Point Label</span>
            </br>
        </div>
        <div class='hidden' id='keyPoint-div'>
            <input type="checkbox" id="keyPoint-check">
            <span>Key Point</span>
            </br>
        </div>
        <!--
        <div>
            <input type="checkbox" id="keyPointLabel-check">
            <span>Key Point Label</span>
            </br>
        </div>
        -->
        <div>
            <input type="checkbox" id="route-check">
            <span>Route</span>
            </br>
        </div>
        <div class='hidden' id='building-div'>
            <input type="checkbox" id="building-check">
            <span>Building</span>
            </br>
        </div>
        <!--
        <span id="searchFlight">Center Flight:</span>
            <div>
                <input type="text" class="btn btn-default btn-xs" placeholder="Callsign" id="callsignSelectedValue">
                <div class="btn-group" data-toggle="buttons" id="centerFlightBtnGroup">
                    <button type="button" class="btn btn-default btn-xs" id="callsignSelectedBtn">
                        <i class="glyphicon glyphicon-search"></i>
                    </button>
                    <button type="button" class="btn btn-default btn-xs" id="callsignSelectRemoveBtn">
                        <i class="glyphicon glyphicon-remove"></i>
                    </button>
                </div>
                <br>
            </div>
-->
        <!--    <span >Focus Location:</span>
            <br>
            <div class="btn-group" data-toggle="buttons" id="focusLocationBtnGroup">
                <label class="btn btn-default btn-xs" value="World">
                    <input type="radio" name="options" id="option1"><i class="icon iconfont icon-global" value="World"></i>
                </label>
                <label class="btn btn-default btn-xs" value="China">
                    <input type="radio" name="options" id="option2"><i class="icon iconfont icon-china" value="China"></i>
                </label>
                <label class="btn btn-default btn-xs" value="Beijing">
                    <input type="radio" name="options" id="option3"><i class="icon iconfont icon-beijing" value="Beijing"></i>
                </label>
                <label class="btn btn-default btn-xs" value="PEK">
                    <input type="radio" name="options" id="option4"><i class="icon iconfont icon-airport" value="PEK"></i>
                </label>
            </div>

            <div>
                <span id="currentDate"></span>
                <br>
                <span id="currentSTime"></span> - <span id="currentETime"></span>
                <br>
                <button type="button" class="btn btn-default btn-xs" id="cdmSelectedBtn">
                    <i class="glyphicon glyphicon-filter"></i>
                </button>
                </br>
            </div> -->
        <!--         <span >Selected Flight:</span>

                <div>
                    <input type="text" class="btn btn-default btn-xs" disabled="true" id="callsignCurrentSelectedValue">
                    </input>
                    <button type="button" class="btn btn-default btn-xs" id="callsignCurrentSelectedBtn">
                        <i class="glyphicon glyphicon-share-alt"></i>
                    </button>
                    <span><i id="callsignCurrentSelectedIcon" class="fa fa-plane" style="color: #000000;"></i></span>
                    <br>
                </div>
                <span id='selectedFlightSTime'></span>
                <br>
                <span id='selectedFlightETime'></span>
                <br> -->
    </div>
</div>
</div>
</div>