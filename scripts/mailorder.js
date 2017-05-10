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

	    if ($("form[action='/cgi-bin/R5/details.cgi']").length > 0){
	        data = $.extend(data,objectifyForm($("form[action='/cgi-bin/R5/details.cgi']")));
	    }
	}
	if (url.indexOf("c-queen") > 0){
    	data = new Object({'site':'kbooks'});
		data["CODE"] = $('.itemData form [name="o_no"]').val();
	}
	if (url.indexOf("alice-books") > 0){
    	data = new Object({'site':'alicebooks'});
    	var CODE = window.location.href;
    	CODE = CODE.substring(CODE.lastIndexOf('/')+1);
		data["CODE"] = CODE;
	}
    return data["site"]+data["CODE"];
}

//to limit the record size
function download(url){
    var _data = {"site":"","GNAME":"","CODE":"","TANKA":"","imageurl":"",
    		"act":"--","mak":"","mch":"","gnr":""};
    var data = new Object();
    
    if (url.indexOf("toranoana") > 0){
    	data = new Object({'site':'tora'});
    	
        data["GNAME"] = $("#id_detail_main>h4").contents().filter(function(){
		            return this.nodeType == 3;
		        }).text();
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
    if (url.indexOf("c-queen") > 0){
    	data = new Object({'site':'kbooks'});
    	
    	data["GNAME"] = $('#content>.tit').contents().filter(function(){
	            return this.nodeType == 3;
	        }).text();
    	data["CODE"] = $('.itemData form [name="o_no"]').val();

    	data["imageurl"] = $('.imageMain img').attr('src');

    	for (var i = 0; i < $('#content .cart .item th').size(); i++){
    		var datakey = $('#content .cart .item th').get(i).innerHTML.trim();

    		if (datakey.indexOf("サークル名")>=0)datakey = "mak";
    		else if (datakey.indexOf("作家名")>=0)datakey = "act";
    		else if (datakey.indexOf("ジャンル")>=0)datakey = "gnr";
    		else if (datakey.indexOf("カップリング")>=0)datakey = "mch";
    		else if (datakey.indexOf("販売価格")>=0)datakey = "TANKA";

    		if (datakey == "mak" || datakey == "mch"){
    			data[datakey]=$($('#content .cart .item td').get(i)).find('a').html();
    		}
    		if (datakey == "act"){
    			data[datakey]=$('#content .cart .item td').get(i).innerHTML;
    		}
    		if (datakey == "gnr"){
    			data[datakey]=$($('#content .cart .item td').get(2)).find('a:last').html();
    		}
    		if (datakey == "TANKA"){
    			data[datakey]=$($('#content .cart .item').find('td').get(i)).find('span').html().trim().replace("円＋税","").replace(",", "");
    		}
    	}
    }
    if (url.indexOf("alice-books") > 0){
    	data = new Object({'site':'alicebooks'});

    	var CODE = window.location.href;
    	CODE = CODE.substring(CODE.lastIndexOf('/')+1);

    	data["CODE"] = CODE;
//    	data["act"] = "--";
    	data["gnr"] = $('.item_genre a').html();
    	data["mch"] = $('.tag_name a').html();
    	data["imageurl"] = $('.item_detail .cover img').attr('src').replace('-h.','-n.');

//    	if (GA_self != undefined){
//    		data["GNAME"] = GA_self[CODE].name;
//    		data["mak"] = GA_self[CODE].brand;
//    		data["TANKA"] = GA_self[CODE].price;
//    	}
//    	else{
    		for (var i = 0; i < $('.item_comment .item_spec .title').size(); i++){
    			var datakey = $('.item_comment .item_spec .title').get(i).innerHTML.trim();

    			if (datakey.indexOf("タイトル")>=0)datakey = "GNAME";
    			else if (datakey.indexOf("サークル")>=0)datakey = "mak";
    			else if (datakey.indexOf("価格")>=0)datakey = "TANKA";

    			if (datakey == 'GNAME'){
    				data[datakey] = $('.item_comment .item_spec .spec').get(i).innerHTML.trim();
    			}
    			if (datakey == 'mak'){
    				data[datakey] = $($('.item_comment .item_spec .spec').get(1)).find('a').html();
    			}
    			if (datakey == 'TANKA'){
    				data[datakey] = $('.item_comment .item_spec .spec').get(i).innerHTML.trim().replace('円 (税抜)','');
    			}
    		}
//    	}
    }
    return ($.extend(_data, data));
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