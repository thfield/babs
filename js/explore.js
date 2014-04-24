function caseCity(){
   var city=$('input[name=city]:checked').val();
  switch (city) {
        case "all":
            $('#focuschart').empty();
            $.getScript("js/exploreAll.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        case "sj":
            $('#focuschart').empty();
            $.getScript("js/exploreSJ.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        case "rc":
            $('#focuschart').empty();
            $.getScript("js/exploreRC.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        case "mv":
            $('#focuschart').empty();
            $.getScript("js/exploreMV.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        case "pa":
            $('#focuschart').empty();
            $.getScript("js/explorePA.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        case "sf":
            $('#focuschart').empty();
            $.getScript("js/exploreSF.js");
            $('input[type=checkbox]').prop('checked', false);
            break;
        default:
            break;
        }
}

$(document).on('click', 'input[name=city]', function () { 
  caseCity();
});

$.getScript("js/exploreAll.js")