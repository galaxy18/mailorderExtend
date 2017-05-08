function objectifyForm(form) {//serialize data function
  var formArray = form.serializeArray();
  var returnArray = {};
    
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function getCode(url){
    var data = new Object();
	if (url.indexOf("toranoana") > 0){
    	data = new Object({'site':'tora'});
		data["CODE"] = $("#item_code").attr("value");
	}
    if ($("form[action='/cgi-bin/R5/details.cgi']").length > 0){
        data = $.extend(data,objectifyForm($("form[action='/cgi-bin/R5/details.cgi']")));
    }
    return data["site"]+data["CODE"];
}

//to limit the record size
function download(url){
    var data = new Object();
    
    if (url.indexOf("toranoana") > 0){
    	data = new Object({'site':'tora'});
    	
        data["GNAME"] = $("#id_detail_main>h4").html().replace("<span>商品名</span>","");
        data["CODE"] = $("#item_code").attr("value");
        data["TANKA"] = ($(".price>span").get(0).nextSibling).data.trim().replace("円（＋税）","").replace(",","");
        //data["U"] = window.location.href.replace("http://www.toranoana.jp","");
        //extend
        if ($("form[action='/cgi-bin/R5/details.cgi']").length > 0){
        	var formdata = objectifyForm($("form[action='/cgi-bin/R5/details.cgi']"));
        	data["GNAME"] = formdata["GNAME"];
        	data["CODE"] = formdata["CODE"];
        	data["TANKA"] = formdata["TANKA"];
        	//data["U"] = formdata["U"];
        }
        
        data["imageurl"] = $('.dimg').find("img").get(0).src;
        
        for (var i = 0; i < $('#id_detail_main dt').length; i++){
            var datakey = $('#id_detail_main dt').get(i).innerHTML;
            
            if (datakey.indexOf("サークル名")>=0)datakey = "mak";
            else if (datakey.indexOf("主な作家")>=0)datakey = "act";
            else if (datakey.indexOf("ジャンル")>=0)datakey = "gnr";
            else if (datakey.indexOf("メインキャラ")>=0)datakey = "mch";
            
            if (datakey == "mak" || datakey == "act" || datakey == "gnr"){
            	data[datakey]=$($('#id_detail_main dd').get(i)).find('a').get(0).innerHTML;
            }
            if (datakey == "mch"){
                data[datakey]=$('#id_detail_main dd').get(i).innerHTML;
            }
        }
    }
    return data;
}

function _download(url){
    var data = new Object();
    
    if (url.indexOf("toranoana") > 0){
    	data = new Object({'site':'tora'});
    	
        //default
        data["TAXRATE"] = "8";
        data["GNAME"] = $("#id_detail_main>h4").html().replace("<span>商品名</span>","");
        data["CODE"] = $("#item_code").attr("value");
        data["TANKA"] = ($(".price>span").get(0).nextSibling).data.trim().replace("円（＋税）","").replace(",","");
        data["REM1"] = "";
        data["REM2"] = "";
        data["REM3"] = "";
        data["ST"] = "";
        data["sk"] = "";
        data["mo"] = "";
        data["U"] = window.location.href.replace("http://www.toranoana.jp","");
        //extend
        if ($("form[action='/cgi-bin/R5/details.cgi']").length > 0){
          data = $.extend(data,objectifyForm($("form[action='/cgi-bin/R5/details.cgi']")));
        }
        
        data["imageurl"] = $('.dimg').find("img").get(0).src;
        data["coverimage"] = data["imageurl"].substring(data["imageurl"].indexOf(data["CODE"]));
        data["previewlink"] = $('.dimg').find("a").get(0).href;
        
        for (var i = 0; i < $('#id_detail_main dt').length; i++){
            var datakey = $('#id_detail_main dt').get(i).innerHTML;
            
            if (datakey.indexOf("サークル名")>=0)datakey = "mak";
            else if (datakey.indexOf("主な作家")>=0)datakey = "act";
            else if (datakey.indexOf("ジャンル")>=0)datakey = "gnr";
            else if (datakey.indexOf("メインキャラ")>=0)datakey = "mch";
            else if (datakey.indexOf("キーワード")>=0)datakey = "kyw";
            else if (datakey.indexOf("発行日")>=0)datakey = "date";
            else if (datakey.indexOf("種別")>=0)datakey = "type";
            else if (datakey.indexOf("指定")>=0)datakey = "obj_adl";
            
            if (datakey === "obj_adl"){
                data["adl"] = $("#id_detail_main img[alt='全年齢']").length === 1;
                data["obj"] = $("#id_detail_main img[alt='女性向け']").length === 1;
            }
            else{
                data[datakey]=$('#id_detail_main dd').get(i).innerHTML;
            }
        }
        
        data["cmt"]= $(".cmt").html();
    }
    /*
    console.log(JSON.stringify(data, null, '\t'));
    
    var blob = new Blob([JSON.stringify(data, null, '\t')]);
    
    var aLink = document.createElement('a');
    var evt = document.createEvent("MouseEvents");
    evt.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    aLink.download = data["CODE"] + ".json";
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
    */
    return data;
}

//download(window.location.href);