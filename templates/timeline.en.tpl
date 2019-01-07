
<div id = 'timelineSvg'>
</div>
<div id = 'timelineControl'>
    <div id ="timePlay">
        <button type="button" id="button_play" class="btn btn-xs" >
            <i class="fa fa-play fa-lg"></i>
        </button>
    </div>


<!--     <select id="slidingWindowSizeSel">
    　<option value="1">1分钟</option>
    　<option value="5">5分钟</option>
    　<option value="10">10分钟</option>
    　<option value="30">30分钟</option>
    </select> -->
    <div class="dropdown" id = 'playSpeedDropdown'>
      <button class="btn btn-default dropdown-toggle btn-xs" type="button"  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        x 1000
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
        <li><a value = "100">x 100</a></li>
        <li><a value = "500">x 500</a></li>
        <li><a value = "1000">x 1000</a></li>
        
      </ul>
    </div>

    <div class="dropdown " id = "slidingWindowSizeDropdown">
      <button class="btn btn-default dropdown-toggle btn-xs" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        10Min
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu col-xs-12" aria-labelledby="dropdownMenu1">
        <li ><a value = "1">1Min</a></li>
        <li ><a  value = "5">5Min</a></li>
        <li ><a  value = "10">10Min</a></li>
        <li ><a  value = "30">30Min</a></li>
      </ul>
    </div>

    <div id="bacgroundStationR" class="slider">
            <div class="sliderText">
                <span>大小 </span>
            </div>
            <div id="bacgroundStationR-slider" class="sliderBar ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"><span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0" style="left: 44.4444%;"></span></div>
    </div>

    
    <div id ="autoRepeat">
        <button type="button" id="button_autoRepeat" class="btn btn-xs" >
            <i class="fa fa-repeat fa-lg"></i>
        </button>
    </div>

</div>
