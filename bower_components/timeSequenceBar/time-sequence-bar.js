/**
 * @author Guozheng Li
 * @version 1.1
 */
d3.timesequencebar = function () {
  //	sequencebar的模式。主要分为align和unaligned
  var TITLE_BAR_MODE = 'TitleBar'
  // var sequenceBarColor = ['#5a5a5a','#818181']
  var sequenceBarColor = '#999'
  var timeSequenceBarDefaultHeight = 60
  var timeSequenceBarDefaultGap = 20
  var sequenceBarHeight = 60
  var basicEventBarHeight = 60
  var addedEventBarHeight = 60
  var basicEventsBarWidth = 2 // setted by users
  var addedEventsBarWidth = 5 // setted by users
  var tooltip = null // setted by user
  var setSequenceBarMode = null // setted by users
  var minmumGap = basicEventsBarWidth / 5 // the width between basicEventBar
  var basicEventBarWithGap = basicEventsBarWidth + minmumGap
  var basicEventsColor = '#618ea9'
  var lowerTriangle = 'lower-triangle'
  var upperTriangle = 'upper-triangle'
  var timeDomainStart = 0 // 默认是0，计算的是相对的时间，一般情况下不需要重新设定
  //	necessary
  var basicEventNameList = []
  var basicEventMaxRangeArray = [] // 当绘制多个event list，需要将event list进行对齐。对齐的方式是传入event list的每一步的最大值
  var basicEventMaxStackRangeArray = []
  var delayTimeMax = 0
  var addedEventNameList = []
  var addedEventListArray = []
  var sequenceBarMaxWidth = 0
  var fontSize = 10
  var timeDomainEnd = 0	// 要进行绘制的所有event list的最大值
  var flightNameList = []
  var flightNameDivWidth = 0
  var highlightAmount = 0
  var timeSequenceBarNameArray = []
  var eventBarNameArray = []
  var selectedBarHeight = 0
  // var delaySlider = 0
  var margin = {
    top: 0,
    right: 5,
    bottom: 0,
    left: 5
  }
  var selector = null
  var height = sequenceBarHeight + margin.top + margin.bottom
  var width = sequenceBarMaxWidth + margin.left + margin.right
  var clickEvent = null
  var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, sequenceBarMaxWidth ]).clamp(true)
  var xFullRange = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, sequenceBarMaxWidth ]).clamp(true)
  var xDelay
  var keyFunction = function (d, i) {
    return basicEventNameList[ i ]
  }

  function initXScale () {
    // var totalRange = max1+max2+max3+max4
    // var widthRange = sequenceBarMaxWidth*0.85 - basicEventBarWithGap * (basicEventNameList.length) - (flightNameDivWidth * 1.5)
    // var widthMin = widthRange / 15
    // var xTotal = (widthRange-4*widthMin) / totalRange
    // var xDelay = (timeSequenceBarDivWidth*0.15-widthMin) / max5
    if (SEQUENCE_MODE === 'aligned') {
      // x = (widthRange-4*widthMin)/(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ])
      x = d3.time.scale()
        .domain([ timeDomainStart, (basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) ])
        .range([ 0, sequenceBarMaxWidth*0.85 - (basicEventNameList.length) * basicEventBarWithGap - flightNameDivWidth*1.5 ])
        .clamp(true);
      xFullRange = d3.time.scale()
        .domain([ timeDomainStart, (basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]+delayTimeMax) ])
        .range([ 0, sequenceBarMaxWidth - basicEventNameList.length * basicEventBarWithGap - flightNameDivWidth*1.5 ])
        .clamp(true);
      xDelay = d3.time.scale()
        .domain([0, delayTimeMax])
        .range([0, sequenceBarMaxWidth * 0.15])
        .clamp(true)
    } else if (SEQUENCE_MODE === 'unaligned') {
      x = d3.time.scale()
        .domain([ timeDomainStart, (timeDomainEnd) ])
        .range([ 0, sequenceBarMaxWidth*0.85 - (basicEventNameList.length) * basicEventBarWithGap - flightNameDivWidth*1.5 ])
        .clamp(true);
      xFullRange = d3.time.scale()
        .domain([ timeDomainStart, (basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]+delayTimeMax) ])
        .range([ 0, sequenceBarMaxWidth - basicEventNameList.length * basicEventBarWithGap - flightNameDivWidth*1.5 ])
        .clamp(true);
      xDelay = d3.time.scale()
        .domain([0, delayTimeMax])
        .range([0, sequenceBarMaxWidth * 0.15])
        .clamp(true);
    }
  }

  function initXRange () {
    for (var bI = 0; bI <= basicEventMaxRangeArray.length; bI++) {
      var aggreNum = 0
      for (var iBI = 0; iBI < bI; iBI++) {
        aggreNum = aggreNum + basicEventMaxRangeArray[ iBI ]
      }
      basicEventMaxStackRangeArray[ bI ] = aggreNum
    }

  }

  function initBarHeightAndGap () {
    sequenceBarHeight = timeSequenceBarDefaultHeight
    basicEventBarHeight = timeSequenceBarDefaultHeight
    addedEventBarHeight = timeSequenceBarDefaultHeight
  }

  function initFontSize () {
    var maxTextNum = 0
    for (var fI = 0; fI < flightNameList.length; fI++) {
      var textNum = flightNameList[ fI ].length
      if (maxTextNum < textNum) {
        maxTextNum = textNum
      }
    }
    var perTextPixelSize = (flightNameDivWidth *3) / maxTextNum
    perTextPixelSize = perTextPixelSize > sequenceBarHeight ? sequenceBarHeight : perTextPixelSize
    var fontSizeNumFloat = new Number(perTextPixelSize / 16)
    fontSize = fontSizeNumFloat.toFixed(2)*1.4
    return fontSize
  }

  function mouseoverShowLabel (sequenceLabel) {
    tooltip.show(sequenceLabel)
  }

  function mouseoutHideLabel () {
    tooltip.hide()
  }

  function getdate(date) {
    var y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
  }

  /**
   *
   * @param originalSelector
   */
  function appendTimeSequenceBarTitle (originalSelector) {
    if (selector !== 'body') {
      selector = '#' + originalSelector
    }
    var svg = d3.select(selector)
    var stackedBasicEventMaxRangeArray = [ 0 ]
    for (var bI = 0; bI < basicEventMaxRangeArray.length; bI++) {
      stackedBasicEventMaxRangeArray.push(stackedBasicEventMaxRangeArray[ bI ] + basicEventMaxRangeArray[ bI ])
    }
    var timeSequenceTitleGroup = svg.selectAll('.time-sequencebar-title')
      .data(basicEventMaxRangeArray)
    timeSequenceTitleGroup.enter()
      .append('rect')
      .attr('class', 'timesequence-whole time-sequencebar-title')
      .attr('x', function (d, i) {
        return xFullRange(stackedBasicEventMaxRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap
      })
      .attr('y', 0)
      .attr('width', function (d, i) {
        return xFullRange(d)
      })
      .attr('height', function (d, i) {
        return sequenceBarHeight
      })
    timeSequenceTitleGroup.enter()
      .append('text')
      .attr('class', 'time-sequencebar-title-icon sorting-icon')
      .attr('x', function (d, i) {
        return xFullRange(stackedBasicEventMaxRangeArray[ i ]) + (i + 1) * basicEventBarWithGap
      })
      .attr('y', function(d, i){
        return sequenceBarHeight / 2
      })
      .attr('text-anchor', 'start')
      .attr('cursor', 'pointer')
      .attr('alignment-baseline', 'middle')//hanging
      .attr('font-family', 'FontAwesome')
      .attr('font-size', function (d) { return fontSize * 2 + 'em' })
      .text(function (d) { return '\uf021' })
    timeSequenceTitleGroup.enter()
      .append('text')
      .attr('class', 'time-sequencebar-title-label')
      .attr('x', function (d, i) {
        return xFullRange(stackedBasicEventMaxRangeArray[ i ]) + (i + 1) * basicEventBarWithGap
      })
      .attr('y', function(d, i){
        return sequenceBarHeight / 2
      })
      .attr('text-anchor', 'start')
      .attr('cursor', 'pointer')
      .attr('alignment-baseline', 'middle')//hanging
      .attr('font-family', 'FontAwesome')
      .attr('font-size', function (d) { return fontSize * 2 + 'em' })
      .text(function (d, i) {
        return timeSequenceBarNameArray[i]
      })
    //
    // d3.selectAll('.time-sequencebar-title').each(function(d,i){
    //   d3.select(this).append('text')
    //     .attr('class', 'time-sequencebar-title sorting-icon')
    //     .attr('x', function (d, i) {
    //       return xFullRange(stackedBasicEventMaxRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap
    //     })
    //     .attr('y', sequenceBarHeight / 2)
    //     .attr('font-family', 'FontAwesome')
    //     .attr('font-size', function (d) { return fontSize * 2 + 'em' })
    //     .text(function (d) { return '\uf021' })
    // })
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'pointer')
      .attr('id', 'sequence-bar-changemode-icon')
      .attr('class', 'time-sequencebar-title-icon')
      .attr('x', -fontSize * 16)
      .attr('y', sequenceBarHeight / 2)
      .attr('font-family', 'FontAwesome')
      .attr('font-size', function (d) { return fontSize * 2 + 'em' })
      .text(function (d) { return '\uf021' })

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'pointer')
      .attr('id', 'sequence-bar-sorting-icon')
      .attr('class', 'time-sequencebar-title-icon')
      .attr('x', -fontSize * 48)
      .attr('y', sequenceBarHeight / 2)
      .attr('font-family', 'FontAwesome')
      .attr('font-size', function (d) { return fontSize * 2 + 'em' })
      .text(function (d) { return '\uf022' })
  }

  /**
   * [timesequencebar description]
   * @param  {[type]} basicEventRelativeTimeObjList        [description]
   * @param  {[type]} addedEventRelativeListObjectArray [description]
   * @param  {[type]} selector                  [description]
   * @param  {[type]} sequenceBarObjectArray    [description]
   * @param  {[type]} clickSorting              [description]
   * @return {[type]}                           [description]
   */
  function timesequencebar (basicEventRelativeTimeObjList, addedEventRelativeListObjectArray, originalSelector, timeSequenceBarName, sequenceBarObjectArray, clickSorting, addClickHightlight, removeClickHighlight, timeSequenceDelayTime) {
    // console.log(timeSequenceDelayTime)
    var flightNumberMode = true
    initXRange()
    initBarHeightAndGap()
    initFontSize()
    // initBasicAndAddedEventWidth()
    initXScale()
    // if (basicEventRelativeTimeObjList === TITLE_BAR_MODE) {
    //   console.log('basicEventRelativeTimeObjList', basicEventRelativeTimeObjList)
    //   var titleBarSelector = addedEventRelativeListObjectArray
    //   console.log('addedEventRelativeListObjectArray', addedEventRelativeListObjectArray)
    //   appendTimeSequenceBarTitle(titleBarSelector)
    // }

    if (selector !== 'body') {
      selector = '#' + originalSelector
    }
    var svg = d3.select(selector)
    /**
     * append text of sequence bar
     */

    svg.selectAll('.timesequence-label').remove()
    var timeSequenceBarLoc = Math.floor(sequenceBarHeight / 2)
    if (sequenceBarHeight < selectedBarHeight) flightNumberMode = false
    // if (flightNumberMode === true) {
      svg.append('text')
        .attr('class', function (d, i) {
          return 'timesequence-whole timesequence-label ' + originalSelector
        })
        .attr('x', basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 - fontSize * 14)
        .attr('y', sequenceBarHeight / 2)//
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('cursor', 'pointer')
        .text(function (d, i) {
          return timeSequenceBarName
        })
        .style('font-size', fontSize + 'em')
        .style('display', function (d) {
          if (flightNumberMode === false) return 'none'
        })
        .on('mouseover', function (d, i) {
          var flightNum = d3.select(this).text()
          var thisNodeClassName = d3.select(this).attr('class')
          var thisNodeClassNameArray = thisNodeClassName.split(' ')
          var thisNodeClass = thisNodeClassNameArray[ 2 ]// mouseoverShowLabel(flightNum)
          hoveringSequenceBar(thisNodeClass)
        })
        .on('mouseout', function (d, i) {
          var thisNodeClassName = d3.select(this).attr('class')
          var thisNodeClassNameArray = thisNodeClassName.split(' ')
          var thisNodeClass = thisNodeClassNameArray[ 2 ]
          // mouseoutHideLabel()
          unHoveringSequenceBar(thisNodeClass)
        })
        // .on('click', function (d, i) {
        //   var thisNodeClassName = d3.select(this).attr('class')
        //   var thisNodeClassNameArray = thisNodeClassName.split(' ')
        //   var thisNodeClass = thisNodeClassNameArray[ 2 ]
        //   click_handler(this, thisNodeClass)
        // })
    // }

    d3.selectAll('.timesequence-whole')
      .on('click', function (d, i) {
        var thisNodeClassName = d3.select(this).attr('class')
        var thisNodeClassNameArray = thisNodeClassName.split(' ')
        var thisNodeClass = thisNodeClassNameArray[ 2 ]
        console.log(thisNodeClass)
        click_handler(this, thisNodeClass)
      })

    function click_handler (thisNode, originalSelector) {
      if (d3.select('#CDM_Gantta_content').selectAll('.click-unhighlight')[ 0 ][ 0 ] == null) {
        d3.select('#CDM_Gantta_content').selectAll('.timesequence-whole').classed('click-unhighlight', true)
      }
      if (d3.select(thisNode).classed('click-unhighlight')) {
        d3.select('#CDM_Gantta_content').selectAll('.' + originalSelector).classed('click-unhighlight', false)
        highlightAmount = highlightAmount + 1
      } else if (!d3.select(thisNode).classed('click-unhighlight')) {
        d3.select('#CDM_Gantta_content').selectAll('.' + originalSelector).classed('click-unhighlight', true)
        // var index = selectedTrajIDArray.indexOf(originalSelector)
        highlightAmount = highlightAmount - 1
      }
      clickEvent()
      if (highlightAmount === 0) {
        d3.select('#CDM_Gantta_content').selectAll('.timesequence-whole').classed('unhighlight', false)
      }
    }

    /**
     * sequenceBar的基元操作,选择
     */
    function selectSequenceBar (thisNode) {
      d3.select(thisNode).classed('click-unhighlight', false)
    }

    /**
     * sequenceBar的基元操作,取消选择
     */
    function unSelectSequenceBar (thisNode) {
      d3.select(thisNode).classed('click-unhighlight', true)
    }

    /**
     * sequenceBar的基元操作,Hovering节点
     */
    function hoveringSequenceBar (originalSelector) {
      if (d3.selectAll('.click-unhighlight')[ 0 ][ 0 ] == null) {
        d3.selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
      }
      // d3.selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
      d3.selectAll('.' + originalSelector).classed('mouseover-unhighlight', false)
      d3.selectAll('.' + originalSelector).classed('mouseover-highlight', true)
    }

    /**
     * sequenceBar的基元操作,unhovering节点
     */
    function unHoveringSequenceBar (originalSelector) {
      if (d3.selectAll('.click-unhighlight')[ 0 ][ 0 ] == null) {
        d3.selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
      }
      // d3.selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
      d3.selectAll('.' + originalSelector).classed('mouseover-highlight', false)
    }

    /**
     * render sequence bar
     */
    // svg.selectAll('.timesequence').remove()
    var count = 0
    var timeSequenceGroup = svg.selectAll('.timesequence')
      .data(basicEventRelativeTimeObjList, keyFunction)
    // enter
    timeSequenceGroup.enter()
      .append('rect')
      .attr('x', function (d, i) {
        if (SEQUENCE_MODE === 'aligned') {
          return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
        } else if (SEQUENCE_MODE === 'unaligned') {
          return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
        }
      })
      .attr('y', 0)
      .attr("class", function (d, i) {
        return 'timesequence-whole timesequence ' + originalSelector + ' ' + basicEventNameList[ i ] + '-' + basicEventNameList[ i + 1 ]
      })
      .attr('cursor', 'pointer')
      .attr('width', function (d, i) {
        if (i === (basicEventRelativeTimeObjList.length - 1)) {
          return 0
        }
        if (basicEventRelativeTimeObjList[i].color === 'abnormal') {
          var timeRange = basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime
          return x(timeRange) - (2*sequenceBarHeight)
        }
        else {
        var timeRange = basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime
        return x(timeRange)
        }
      })
      .attr('height', function (d, i) {
        if (i === (basicEventRelativeTimeObjList.length - 1)) {
          return 0
        }
        return sequenceBarHeight
      })
      .attr('fill', function(d,i) {
        // if (i%2==0) {
        //   // if (basicEventRelativeTimeObjList[i].color === 'abnormal') {return '#fa0d24'}
        //   return sequenceBarColor[0]
        // }
        // else {
        //   // if (basicEventRelativeTimeObjList[i].color === 'abnormal') {return '#fa0d24'}
        //   return sequenceBarColor[1]
        // }
        return sequenceBarColor
      })
      .on('mouseover', function (d, i) {
        d3.select(this).classed('mouseover-highlight', true)
        // d3.select(this).style('opacity', 0.5)
        var thisClassName = d3.select(this).attr('class')
        var thisClassNameArray = thisClassName.split(' ')
        var flightId = thisClassNameArray[ 2 ]
        var timeSequenceName = thisClassNameArray[ 3 ]
        var sequenceLabel = timeSequenceName
        var timeRange = basicEventRelativeTimeObjList[ i + 1 ].tipTime - basicEventRelativeTimeObjList[ i ].tipTime
        var timeDiffMinute = timeRange / (1000 * 60)
        var timeSequenceBarName = timeSequenceBarNameArray[ i ]
        var timeDiffMinuteText = timeSequenceBarName + ': ' + timeDiffMinute + '&acute;'
        mouseoverShowLabel(timeDiffMinuteText)
        // if (sequenceBarHeight < 3) {
        //   d3.selectAll('.' + originalSelector)
        //     .transition()
        //     .attr('height', function (d, i) {
        //       if (i === (basicEventRelativeTimeObjList.length - 1)) {
        //         return 0
        //       }
        //       return 5
        //     })
        // }
        // d3.selectAll('.' + timeSequenceName).classed('mouseover-highlight', true)
      })
      .on('mouseout', function () {
        // d3.select(this).style('opacity', 1)
        d3.select(this).classed('mouseover-highlight', false)
        mouseoutHideLabel()
        var thisClassName = d3.select(this).attr('class')
        var thisClassNameArray = thisClassName.split(' ')
        var timeSequenceName = thisClassNameArray[ 3 ]
        // d3.selectAll('.' + timeSequenceName).classed('mouseover-highlight', false)
        // if (sequenceBarHeight < 3) {
        //   d3.selectAll('.' + originalSelector)
        //     .transition()
        //     .attr('height', function (d, i) {
        //       return sequenceBarHeight
        //     })
        // }
      })
    // .on('click', function(d, i){
    // 	if(d3.select(this).classed('click-highlight')){
    // 		d3.select(this).classed('click-highlight', false)
    // 		if(svg.selectAll('.click-highlight')[0][0] == null){
    // 			removeClickHighlight(originalSelector)
    // 		}
    // 	}else{
    // 		d3.select(this).classed('click-highlight', true)
    // 		// clickSorting(sequenceBarObjectArray, i)
    // 		addClickHightlight(originalSelector)
    // 	}
    // })
    // update
    timeSequenceGroup.transition()
      .duration(1000)
      .attr('x', function (d, i) {
      if (SEQUENCE_MODE === 'aligned') {
        return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
      } else if (SEQUENCE_MODE === 'unaligned') {
        return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
      }
    })
      .attr('width', function (d, i) {
        if (i === (basicEventRelativeTimeObjList.length - 1)) {
          return 0
        }
        if (basicEventRelativeTimeObjList[i].color === 'abnormal') {
          var timeRange = basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime
          return x(timeRange) - (2*sequenceBarHeight)
        }
        else {
          var timeRange = basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime
          return x(timeRange)
        }
      })
      .attr('height', function (d, i) {
        if (i === (basicEventRelativeTimeObjList.length - 1)) {
          return 0
        }
        return sequenceBarHeight
      })
    // remove
    timeSequenceGroup.exit().remove()

    var timeSequenceLine = svg.selectAll('line1.timesequence')
      .data(basicEventRelativeTimeObjList, keyFunction)
    timeSequenceLine.enter()
      .append('line')
      .attr('x1', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (2 * sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (2 * sequenceBarHeight)
            }
          }
        }
      })
      .attr('y1', sequenceBarHeight/2)
      .attr('x2', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            }
          }
        }
      })
      .attr('y2', sequenceBarHeight/2)
      .attr("class", function (d, i) {
        return 'timesequence-whole timesequence ' + originalSelector + ' ' + basicEventNameList[ i ] + '-' + basicEventNameList[ i + 1 ]
      })
      .style('stroke-dasharray', '3,3')
      .style('stroke-width', 0.05 + 'em')
      .style('stroke', '#999999')
    timeSequenceLine.transition()
      .duration(1000)
      .attr('x1', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (2 * sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (2 * sequenceBarHeight)
            }
          }
        }
      })
      .attr('x2', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              if (i !== (basicEventRelativeTimeObjList.length - 1)) return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            }
          }
        }
      })
    timeSequenceLine.exit().remove()

    var timeSequenceSquare = svg.selectAll('rect1.timesequence')
      .data(basicEventRelativeTimeObjList, keyFunction)
    timeSequenceSquare.enter()
      .append('rect')
      .attr('x', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            }
          }
        }
      })
      .attr('y', 0)
      .attr("class", function (d, i) {
        return 'timesequence-whole timesequence ' + originalSelector + ' ' + basicEventNameList[ i ] + '-' + basicEventNameList[ i + 1 ]
      })
      .attr('width', function(d,i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') return sequenceBarHeight
          else return 0
        }
      })
      .attr('height', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') return sequenceBarHeight
          else return 0
        }
      })
      .attr('fill', function (d,i) {
        // if (i%2==0) {
        //   return sequenceBarColor[0]
        // }
        // else {
        //   return sequenceBarColor[1]
        // }
        return sequenceBarColor
      })
    timeSequenceSquare.transition()
      .duration(1000)
      .attr('x', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') {
            if (SEQUENCE_MODE === 'aligned') {
              return x(basicEventMaxStackRangeArray[ i ]) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            } else if (SEQUENCE_MODE === 'unaligned') {
              return x(d.eventTime) + (i + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + x(basicEventRelativeTimeObjList[ i + 1 ].eventTime - basicEventRelativeTimeObjList[ i ].eventTime) - (sequenceBarHeight)
            }
          }
        }
      })
      .attr('width', function(d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') return sequenceBarHeight
          else return 0
        }
      })
      .attr('height', function (d, i) {
        if (i !== (basicEventRelativeTimeObjList.length - 1)) {
          if (basicEventRelativeTimeObjList[ i ].color === 'abnormal') return sequenceBarHeight
          else return 0
        }
      })
    timeSequenceSquare.exit().remove()

    svg.selectAll('line.delay').remove()
    var delayTimeBar = svg.selectAll('rect.delay')
      .data([timeSequenceDelayTime], keyFunction)
    delayTimeBar.enter()
      .append('rect')
      .attr('x', function(d,i) {
        if (SEQUENCE_MODE === 'aligned') {
          return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
        } else if (SEQUENCE_MODE === 'unaligned') {
          return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth*1.5
        }
      })
      .attr('y', 0)
      .attr("class", 'timesequence-whole delay ' + originalSelector)
      .attr('cursor', 'pointer')
      .attr('width', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return xDelay(timeSequenceDelayTime.timeDuration)
        }
        else {
          return xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
        }
      })
      .attr('height', sequenceBarHeight)
      .attr('fill', function (d) {
        // if (timeSequenceDelayTime.delayTip <= delaySlider) {
        //   return '#FCBBA1'
        // }
        // else {
        //   return '#a40f15'
        // }
        return '#999'
      })
      .on('mouseover', function (d, i) {
        d3.select(this).classed('mouseover-highlight', true)
        // var thisClassName = d3.select(this).attr('class')
        // var thisClassNameArray = thisClassName.split(' ')
        // var timeSequenceName = thisClassNameArray[ 3 ]
        mouseoverShowLabel('Delay Time: ' + (timeSequenceDelayTime.delayTip/ (1000 * 60)) + '&acute;')
        // d3.selectAll('.' + timeSequenceName).classed('mouseover-highlight', true)
      })
      .on('mouseout', function () {
        d3.select(this).classed('mouseover-highlight', false)
        mouseoutHideLabel()
        // var thisClassName = d3.select(this).attr('class')
        // var thisClassNameArray = thisClassName.split(' ')
        // var timeSequenceName = thisClassNameArray[ 3 ]
        // d3.selectAll('.' + timeSequenceName).classed('mouseover-highlight', false)
      })
    delayTimeBar.transition()
      .duration(1000)
      .attr('x', function(d,i) {
        if (SEQUENCE_MODE === 'aligned') {
          return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
        } else if (SEQUENCE_MODE === 'unaligned') {
          return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth*1.5
        }
      })
      .attr('width', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return xDelay(timeSequenceDelayTime.timeDuration)
        }
        else {
          return xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
        }
      })
      .attr('height', sequenceBarHeight)
    // remove
    delayTimeBar.exit().remove()

    var delayTimeLine = svg.selectAll('line1.delay')
      .data([timeSequenceDelayTime], keyFunction)

    delayTimeLine.enter()
      .append('line')
      .attr('x1', function (d, i) {
        if (timeSequenceDelayTime.condition === 'long') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
          }
        }
      })
      .attr('y1', sequenceBarHeight/2)
      .attr('x2', function (d, i) {
        if (timeSequenceDelayTime.condition === 'long') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          }
        }
      })
      .attr('y2', sequenceBarHeight/2)
      .attr("class", 'timesequence-whole delay ' + originalSelector)
      .style('stroke-dasharray', '3,3')
      .style('stroke-width', 0.05 + 'em')
      .style('stroke', '#999')

    delayTimeLine.transition()
      .duration(1000)
      .attr('x1', function (d, i) {
        if (timeSequenceDelayTime.condition === 'long') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (2 * sequenceBarHeight)
          }
        }
      })
      .attr('x2', function (d, i) {
        if (timeSequenceDelayTime.condition === 'long') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          }
        }
      })

    delayTimeLine.exit().remove()

    var delayTimeSquare = svg.selectAll('rect1.delay')
      .data([timeSequenceDelayTime], keyFunction)

    delayTimeSquare.enter()
      .append('rect')
      .attr('x', function (d, i) {
        if (timeSequenceDelayTime.condition !== 'normal') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          }
        }
      })
      .attr('y', 0)
      .attr("class", 'timesequence-whole delay ' + originalSelector)
      .attr('width', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return 0
        }
        else {
          return sequenceBarHeight
        }
      })
      .attr('height', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return 0
        }
        else {
          return sequenceBarHeight
        }
      })
      .attr('fill', function (d) {
        // if (timeSequenceDelayTime.delayTip <= delaySlider) {
        //   return '#FCBBA1'
        // }
        // else {
        //   return '#a40f15'
        // }
        return '#999'
      })

    delayTimeSquare.transition()
      .duration(1000)
      .attr('x', function (d, i) {
        if (timeSequenceDelayTime.condition !== 'normal') {
          if (SEQUENCE_MODE === 'aligned') {
            return x(basicEventMaxStackRangeArray[ basicEventMaxStackRangeArray.length - 1 ]) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          } else if (SEQUENCE_MODE === 'unaligned') {
            return x(timeDomainEnd) + (basicEventMaxStackRangeArray.length) * basicEventBarWithGap + basicEventsBarWidth - minmumGap + flightNameDivWidth * 1.5 + xDelay(timeSequenceDelayTime.timeDuration) - (sequenceBarHeight)
          }
        }
      })
      .attr('width', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return 0
        }
        else {
          return sequenceBarHeight
        }
      })
      .attr('height', function (d) {
        if (timeSequenceDelayTime.condition === 'normal') {
          return 0
        }
        else {
          return sequenceBarHeight
        }
      })

    delayTimeSquare.exit().remove()


    /*
     * draw basic event bar
     */

    var basicEventsGroup = svg.selectAll('.basic-events')
      .data(basicEventRelativeTimeObjList, keyFunction)
    // enter add
    basicEventsGroup.enter()
      .append('rect')
      .attr('x', function (d, i) {
        if (SEQUENCE_MODE === 'aligned') {
          return x(basicEventMaxStackRangeArray[ i ]) + i * basicEventBarWithGap + minmumGap + flightNameDivWidth*1.5
        } else if (SEQUENCE_MODE === 'unaligned') {
          return x(d.eventTime) + i * basicEventBarWithGap + flightNameDivWidth*1.5
        }
      })
      .attr('y', 0)
      .attr("class", function (d, i) {
        if (basicEventRelativeTimeObjList[ i ].type === 'exist') {
          return 'timesequence-whole basic-events ' + originalSelector + ' ' + basicEventNameList[ i ]
        } else if (basicEventRelativeTimeObjList[ i ].type === 'missing') {
          return 'timesequence-whole basic-events ' + originalSelector + ' ' + basicEventNameList[ i ] + ' ' + 'missing'
        }
      })
      .attr('cursor', 'pointer')
      .attr('width', function (d, i) {
        if (SEQUENCE_MODE === 'aligned') {
          return 0
        }
        return basicEventsBarWidth
      })
      .attr('height', function (d, i) {
        return basicEventBarHeight
      })
      .attr('fill', basicEventsColor)
      .on('mouseover', function (d, i) {
        d3.select(this).classed('mouseover-highlight', true)
        var thisClassName = d3.select(this).attr('class')
        var thisClassNameArray = thisClassName.split(' ')
        var flightId = thisClassNameArray[ 2 ]
        var eventName = thisClassNameArray[ 3 ]
        var sequenceLabel = eventBarNameArray[ i ]
        if (basicEventRelativeTimeObjList[ i ].type === 'missing') {var actualTime = 'null'}
        else {var actualTime = getdate(basicEventRelativeTimeObjList[i].actualTime)}
        var sequenceLabelAndTime = sequenceLabel + ': ' + actualTime
        mouseoverShowLabel(sequenceLabelAndTime)
        d3.selectAll('.' + eventName).classed('mouseover-highlight', true)
      })
      .on('mouseout', function () {
        d3.select(this).classed('mouseover-highlight', false)
        mouseoutHideLabel()
        var thisClassName = d3.select(this).attr('class')
        var thisClassNameArray = thisClassName.split(' ')
        var eventName = thisClassNameArray[ 3 ]
        d3.selectAll('.' + eventName).classed('mouseover-highlight', false)
      })
    // .on('click', function(){
    // 	if(d3.select(this).classed('click-highlight')){
    // 		d3.select(this).classed('click-highlight', false)
    // 	}else{
    // 		d3.select(this).classed('click-highlight', true)
    // 	}
    // })
    // update
    basicEventsGroup.transition()
      .duration(1000)
      .attr('x', function (d, i) {
      if (SEQUENCE_MODE === 'aligned') {
        return x(basicEventMaxStackRangeArray[ i ]) + i * basicEventBarWithGap + minmumGap + flightNameDivWidth*1.5
      } else if (SEQUENCE_MODE === 'unaligned') {
        return x(d.eventTime) + i * basicEventBarWithGap + flightNameDivWidth*1.5
      }
    })
      .attr('width', function (d, i) {
        if (SEQUENCE_MODE === 'aligned') {
          return 0
        }
        return basicEventsBarWidth
      })
      .attr('height', function (d, i) {
        return basicEventBarHeight
      })
    // delete
    basicEventsGroup.exit().remove()
    /**
     * draw added event bar
     */
    for (var aI = 0; aI < addedEventRelativeListObjectArray.length; aI++) {
      var addedEventListObject = addedEventRelativeListObjectArray[ aI ]
      var addedEventListArray = addedEventListObject.addedEventListArray
      var location = addedEventListObject.location
      var marks = addedEventListObject.marks
      var length = addedEventListObject.length
      var addedEventClass = 'timesequence-whole added-events ' + originalSelector
      /**
       * draw added event list
       */
      var addedEventGroup = svg.selectAll('.added-events')
        .data(addedEventListArray, function (d, i) {
          // console.log('addedEventListArray',addedEventListArray)
          return addedEventNameList[ i ]
        })
      //	enter append addedEventList

      // addedEventGroup.enter()
      //   .append('rect')
      //   .attr('class', addedEventClass)
      //   .attr('id', 'added-events-' + aI)
      //   .attr('x', function (d, i) {
      //     // TODO aligned need change
      //     var eventIndex = d.addedTimeIndexInSequenceBar
      //     var addedEventDis = d.addedTimeDistancefromSequenceBar
      //     var addedTimeBasedX = 0
      //     if (SEQUENCE_MODE === 'aligned') {
      //       addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap
      //     } else if (SEQUENCE_MODE === 'unaligned') {
      //       addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap
      //     }
      //     var addedTimeX = addedTimeBasedX + x(addedEventDis)
      //     return addedTimeX
      //   })
      //   .attr('y', 0)
      //   .attr('height', addedEventBarHeight)
      //   .attr('width', addedEventsBarWidth)
      //   .attr('fill', 'gray')
      //   .attr('cursor', 'pointer')
      //   .on('mouseover', function () {
      //     d3.select(this).classed('mouseover-highlight', true)
      //   })
      //   .on('mouseout', function () {
      //     d3.select(this).classed('mouseover-highlight', false)
      //   })


      // .on('click', function(){
      // 	if(d3.select(this).classed('click-highlight')){
      // 		d3.select(this).classed('click-highlight', false)
      // 	}else{
      // 		d3.select(this).classed('click-highlight', true)
      // 	}
      // })
      // update addedEventList

      // addedEventGroup.transition()
      //   .duration(1000)
      //   .attr('x', function (d, i) {
      //     // TODO aligned need change
      //     var eventIndex = d.addedTimeIndexInSequenceBar
      //     var addedEventDis = d.addedTimeDistancefromSequenceBar
      //     var addedTimeBasedX = 0
      //     if (SEQUENCE_MODE === 'aligned') {
      //       addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap
      //     } else if (SEQUENCE_MODE === 'unaligned') {
      //       addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap
      //     }
      //     var addedTimeX = addedTimeBasedX + x(addedEventDis)
      //     return addedTimeX
      //   })
      //   .attr('height', addedEventBarHeight)

      // remove addedEventList

      // addedEventGroup.exit().remove()

      /**
       * draw triangle of added list
       */
      if (marks === lowerTriangle) {
        svg.selectAll('.symbol-lower-triangle').remove()
        var lowerTriangleGroup = svg.selectAll('.symbol-lower-triangle')
          .data(addedEventListArray, function (d, i) {
            return addedEventNameList[ i ]
          })
        // enter append
        lowerTriangleGroup.enter()
          .append('path')
          .attr('class', 'timesequence-whole symbol-lower-triangle ' + originalSelector)
          .attr('cursor', 'pointer')
          .attr('d', d3.svg.symbol().type('triangle-down').size(function(d,i) {
            if (SEQUENCE_MODE === 'aligned') {
              return 0
            } else if (SEQUENCE_MODE === 'unaligned') {
              return basicEventBarHeight/2
            }
          }))
          .attr('transform', function (d) {
            var eventIndex = d.addedTimeIndexInSequenceBar
            var addedEventDis = d.addedTimeDistancefromSequenceBar
            var addedTimeBasedX = 0
            var addedTimeX = 0
            var transformX = 0
            if (SEQUENCE_MODE === 'aligned') {
              addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            } else if (SEQUENCE_MODE === 'unaligned') {
              addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            }
            var addedTimeX = addedTimeBasedX + x(addedEventDis)
            var transformX = addedTimeX
            return 'translate(' + (transformX + addedEventsBarWidth / 2) + ',' + 1 + ')'
          })
          .on('mouseover', function (d, i) {
            d3.select(this).classed('mouseover-highlight', true)
            var sequenceLabel = d.addedTimeEventKey
            var actualTime = getdate(d.actualTime)
            var sequenceLabelAndTime = sequenceLabel + ': ' + actualTime
            mouseoverShowLabel(sequenceLabelAndTime)
          })
          .on('mouseout', function () {
            d3.select(this).classed('mouseover-highlight', false)
            mouseoutHideLabel()
          })

        // update
        lowerTriangleGroup.transition()
          .duration(1000)
          .attr('d', d3.svg.symbol().type('triangle-down').size(function (d,i)  {
            if (SEQUENCE_MODE === 'aligned') {
              return 0
            } else if (SEQUENCE_MODE === 'unaligned') {
              return basicEventBarHeight/2
            }
          }))
          .attr('transform', function (d) {
            var eventIndex = d.addedTimeIndexInSequenceBar
            var addedEventDis = d.addedTimeDistancefromSequenceBar
            var addedTimeBasedX = 0
            if (SEQUENCE_MODE === 'aligned') {
              addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            } else if (SEQUENCE_MODE === 'unaligned') {
              addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            }
            var addedTimeX = addedTimeBasedX + x(addedEventDis)
            var transformX = addedTimeX
            return 'translate(' + (transformX + addedEventsBarWidth / 2) + ',' + 1 + ')'
          })
        // exit remove
        lowerTriangleGroup.exit().remove()
      }
      else if (marks === upperTriangle) {
        svg.selectAll('.symbol-upper-triangle').remove()
        var upperTriangleGroup = svg.selectAll('.symbol-upper-triangle')
          .data(addedEventListArray, function (d, i) {
            return addedEventNameList[ i ]
          })
        // enter append
        upperTriangleGroup.enter()
          .append('path')
          .attr('class', 'timesequence-whole symbol-upper-triangle ' + originalSelector)
          .attr('cursor', 'pointer')
          .style('d', d3.svg.symbol().type('triangle-up').size(function (d,i) {
            if (SEQUENCE_MODE === 'aligned') {
              return 0
            } else if (SEQUENCE_MODE === 'unaligned') {
              return basicEventBarHeight/2
            }
          }))
          .attr('transform', function (d) {
            var eventIndex = d.addedTimeIndexInSequenceBar
            var addedEventDis = d.addedTimeDistancefromSequenceBar
            var addedTimeBasedX = 0
            if (SEQUENCE_MODE === 'aligned') {
              addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            } else if (SEQUENCE_MODE === 'unaligned') {
              addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            }
            var addedTimeX = addedTimeBasedX + x(addedEventDis)
            var transformX = addedTimeX
            return 'translate(' + (transformX + addedEventsBarWidth / 2) + ',' + (basicEventBarHeight-1) + ')'
          })
          .on('mouseover', function (d, i) {
            d3.select(this).classed('mouseover-highlight', true)
            var sequenceLabel = d.addedTimeEventKey
            var actualTime = getdate(d.actualTime)
            var sequenceLabelAndTime = sequenceLabel + ': ' + actualTime
            mouseoverShowLabel(sequenceLabelAndTime)
          })
          .on('mouseout', function () {
            d3.select(this).classed('mouseover-highlight', false)
            mouseoutHideLabel()
          })
        // update
        upperTriangleGroup.transition()
          .duration(1000)
          .attr('d', d3.svg.symbol().type('triangle-up').size(function (d,i) {
            if (SEQUENCE_MODE === 'aligned') {
              return 0
            } else if (SEQUENCE_MODE === 'unaligned') {
              return basicEventBarHeight/2
            }
          }))
          .attr('transform', function (d) {
            var eventIndex = d.addedTimeIndexInSequenceBar
            var addedEventDis = d.addedTimeDistancefromSequenceBar
            var addedTimeBasedX = 0
            if (SEQUENCE_MODE === 'aligned') {
              addedTimeBasedX = x(basicEventMaxStackRangeArray[ eventIndex ]) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            } else if (SEQUENCE_MODE === 'unaligned') {
              addedTimeBasedX = x(basicEventRelativeTimeObjList[ eventIndex ].eventTime) + (eventIndex + 1) * basicEventBarWithGap - minmumGap + flightNameDivWidth*1.5
            }
            var addedTimeX = addedTimeBasedX + x(addedEventDis)
            var transformX = addedTimeX
            return 'translate(' + (transformX + addedEventsBarWidth / 2) + ',' + (basicEventBarHeight-1) + ')'
          })
        // exit remove
        upperTriangleGroup.exit().remove()
      }
    }
    // draw the triangle of added event bar
    return timesequencebar
  }

  timesequencebar.margin = function (value) {
    if (!arguments.length)
      return margin
    margin = value
    return timesequencebar
  }

  timesequencebar.timeDomain = function (value) {
    if (!arguments.length)
      return [ timeDomainStart, timeDomainEnd ]
    timeDomainStart = +value[ 0 ], timeDomainEnd = +value[ 1 ]
    return timesequencebar
  }

  /**
   * @param {string}
   *                vale The value can be "fit" - the domain fits the data or
   *                "fixed" - fixed domain.
   */
  timesequencebar.selector = function (value) {
    if (!arguments.length)
      return selector
    selector = value
    return timesequencebar
  }

  timesequencebar.sequenceMode = function (value) {
    if (!arguments.length) {
      return SEQUENCE_MODE
    }
    SEQUENCE_MODE = value
    return timesequencebar
  }

  timesequencebar.sequenceBarColor = function (value) {
    if (!arguments.length) {
      return sequenceBarColor
    }
    sequenceBarColor = value
    return timesequencebar
  }

  timesequencebar.sequenceBarHeight = function (value) {
    if (!arguments.length) {
      return sequenceBarHeight
    }
    sequenceBarHeight = value
    return timesequencebar
  }

  timesequencebar.basicEventsBarWidth = function (value) {
    if (!arguments.length) {
      return basicEventsBarWidth
    }
    basicEventsBarWidth = value
    return timesequencebar
  }

  timesequencebar.basicEventsColor = function (value) {
    if (!arguments.length) {
      return basicEventsColor
    }
    basicEventsColor = value
    return timesequencebar
  }

  timesequencebar.basicEventNameList = function (value) {
    if (!arguments.length)
      return basicEventNameList
    basicEventNameList = value
    return timesequencebar
  }

  timesequencebar.addedEventNameList = function (value) {
    if (!arguments.length)
      return addedEventNameList
    addedEventNameList = value
    return timesequencebar
  }

  timesequencebar.basicEventMaxRangeArray = function (value) {
    if (!arguments.length)
      return basicEventMaxRangeArray
    basicEventMaxRangeArray = value
    return timesequencebar
  }

  timesequencebar.timeDomainEnd = function (value) {
    if (!arguments.length) {
      return timeDomainEnd
    }
    timeDomainEnd = +value
    return timesequencebar
  }

  timesequencebar.timeDomainMode = function (value) {
    if (!arguments.length)
      return timeDomainMode
    timeDomainMode = value;
    return timesequencebar;
  }

  timesequencebar.taskTypes = function (value) {
    if (!arguments.length)
      return taskTypes
    taskTypes = value
    return timesequencebar
  }

  timesequencebar.sequenceBarMaxWidth = function (value) {
    if (!arguments.length)
      return sequenceBarMaxWidth
    sequenceBarMaxWidth = +value
    return timesequencebar
  }

  timesequencebar.height = function (value) {
    if (!arguments.length)
      return height
    height = +value
    return timesequencebar
  }

  timesequencebar.timeDomainStart = function (value) {
    if (!arguments.length) {
      return timeDomainStart
    }
    timeDomainStart = +value
    return timesequencebar
  }
  //	basicEventTimeList在调用方法basicEventTimeList的时候传入
  timesequencebar.basicEventTimeList = function (value) {
    if (!arguments.length)
      return basicEventTimeList
    basicEventTimeList = value
    return timesequencebar
  }
  timesequencebar.addedEventListArray = function (value) {
    if (!arguments.length)
      return addedEventListArray
    addedEventListArray = value
    return timesequencebar
  }
  timesequencebar.timeSequenceBarDefaultHeight = function (value) {
    if (!arguments.length)
      return timeSequenceBarDefaultHeight
    timeSequenceBarDefaultHeight = value
    return timesequencebar
  }
  timesequencebar.timeSequenceBarDefaultGap = function (value) {
    if (!arguments.length)
      return timeSequenceBarDefaultGap
    timeSequenceBarDefaultGap = value
    return timesequencebar
  }
  timesequencebar.flightNameList = function (value) {
    if (!arguments.length)
      return flightNameList
    flightNameList = value
    return timesequencebar
  }
  timesequencebar.flightNameDivWidth = function (value) {
    if (!arguments.length)
      return flightNameDivWidth
    flightNameDivWidth = value
    return timesequencebar
  }
  timesequencebar.setTooltip = function (value) {
    if (!arguments.length)
      return tooltip
    tooltip = value
    return timesequencebar
  }
  timesequencebar.setSequenceBarModeFunc = function (value) {
    if (!arguments.length)
      return setSequenceBarMode
    setSequenceBarMode = value
    return timesequencebar
  }
  timesequencebar.timeSequenceBarNameArray = function (value) {
    if (!arguments.length)
      return timeSequenceBarNameArray
    timeSequenceBarNameArray = value
    return timesequencebar
  }
  timesequencebar.eventBarNameArray = function (value) {
    if (!arguments.length)
      return eventBarNameArray
    eventBarNameArray = value
    return timesequencebar
  }
  timesequencebar.delayTimeMax = function (value) {
    if (!arguments.length)
      return delayTimeMax
    delayTimeMax = value
    return timesequencebar
  }

  timesequencebar.clickEvent = function (value) {
    if (!arguments.length)
      return clickEvent
    clickEvent = value
    return timesequencebar
  }
  timesequencebar.selectedBarHeight = function (value) {
    if (!arguments.length)
      return selectedBarHeight
    selectedBarHeight = value
    return timesequencebar
  }
  // timesequencebar.delaySlider = function (value) {
  //   if (!arguments.length)
  //     return delaySlider
  //   delaySlider = value
  //   return timesequencebar
  // }
  return timesequencebar;
};
