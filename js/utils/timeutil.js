(function(){
    window["timeuitl"] = {};

    var zeroPad = function (num, places) {
      var zero = places - num.toString().length + 1;
      return Array(+(zero > 0 && zero)).join("0") + num;
    };

    var formateDate = function  (timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear()+"-"
            + zeroPad((date.getMonth()+1),2)+"-"
            + zeroPad(date.getDate(),2);
    };
    var formateTime = function(timestamp) {
         var date = new Date(timestamp);
        return zeroPad(date.getHours(),2) +":"
            +zeroPad(date.getMinutes(),2) + ":"
            +zeroPad(date.getSeconds(),2);
    }
    var formateDatetime = function(timestamp) {
         var date = new Date(timestamp);
        return date.getFullYear()+"-"
            + zeroPad((date.getMonth()+1),2)+"-"
            + zeroPad(date.getDate(),2) + " "+
            + zeroPad(date.getHours(),2) +":"
            +zeroPad(date.getMinutes(),2) + ":"
            +zeroPad(date.getSeconds(),2)
    };

    var formateHour = function(timestamp) {
        var date = new Date(timestamp);
        return zeroPad(date.getHours(),2) +":"
            +zeroPad(date.getMinutes(),2);
    };
    window["timeuitl"]["formateDate"]=formateDate;
    window["timeuitl"]["formateDatetime"]=formateDatetime;
    window["timeuitl"]["formateTime"]=formateTime;
    window["timeuitl"]["zeroPad"]=zeroPad;
    window["timeuitl"]["formateHour"]=formateHour;
})();
