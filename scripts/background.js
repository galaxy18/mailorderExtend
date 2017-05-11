// +----------------------------------------------------------------------
// | background.js 
// +----------------------------------------------------------------------
// | Author:  onlyfu <fuwy@foxmail.com>
// +----------------------------------------------------------------------
// | 2015-01-04
// +---------------------------------------------------------------------

/**
 * 监听content_script发送的消息
 */
var _List = new Object();

function initList(){
	var strList = localStorage['list'];
	if(strList){
		_List = JSON.parse(strList);
	}
}

initList();

chrome.extension.onMessage.addListener(function(request, _, sendResponse){
	var dicReturn;
	
	if(request.action == 'list'){
//		dicReturn = {'status': 404};
		sendResponse({'status': 200, 'data': JSON.stringify(_List)});
	}

	if(request.action == 'save'){
		var strMessage = request.data.message;
		
		var objMessage = JSON.parse(strMessage);
		_List[objMessage["site"]+objMessage["CODE"]] = objMessage;
		localStorage['list'] = JSON.stringify(_List);

		dicReturn = {'status': 200, 'data': JSON.stringify(_List)};
		sendResponse(dicReturn);
	}

	// 删除
	if(request.action == 'del'){
		// content_script传来的message
		var strCODE = request.data.message;
		sendResponse(remove(strCODE));
//		// 从localstorage中读取数据
//		var strList = localStorage['list'];
//		if(strList){
//			objList = JSON.parse(strList);
//			delete objList[strCODE];
//
//			localStorage['list'] = JSON.stringify(objList);
//			sendResponse({'status': 200, 'data': objList});
//		}else{
//			sendResponse({'status': 501, 'msg': '删除失败，未有数据'});
//		}
	}
	
	if(request.action == 'view'){
		chrome.tabs.create({
            url: chrome.extension.getURL('popup.html'),
            active: false
        }, function(tab) {
            // After the tab has been created, open a window to inject the tab
            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                focused: true
                // incognito, top, left, ...
            });
        });
	}
});

function save(item){
	var site = item.find(".site").html();
	var CODE = item.find(".CODE").html();
	var amount = item.find(".amount").val();
	
	var objMessage = {"site":site, "CODE":CODE, "amount":amount};
	_List[objMessage["site"]+objMessage["CODE"]] = 
		$.extend(_List[objMessage["site"]+objMessage["CODE"]], objMessage);
	localStorage['list'] = JSON.stringify(_List);
	
	item.removeClass("changed");
	item.addClass('update').delay(1000).queue(function() {
		$(this).removeClass('update');
		$(this).dequeue();
	});
}

function remove(CODE){
	delete _List[CODE];
	localStorage['list'] = JSON.stringify(_List);
	return({'status': 200, 'data': _List});
//		return({'status': 501, 'msg': '删除失败，未有数据'});
}

function calcPrice(){
	var _price = 0;
	$(".item").each(function(){
		_price += ($(this).find(".checkitem").is(":checked") ? 1:0) *
			parseInt($(this).find(".amount").val())*
			parseInt($(this).find("dd.price").html());
	});
	$('#totalprice').html(_price);
}

function formURL(site, CODE){
	if (site === 'tora'){
		if (CODE.length > 10){
			var url = CODE.substring(0,2)+"/"+CODE.substring(2,6)+"/"+CODE.substring(6,8)+"/"+CODE.substring(8,10)+"/"+CODE;
			return ("http://www.toranoana.jp/mailorder/article/"+url+".html");
		}
	}
	if (site === 'kbooks'){
		return ('https://www.c-queen.net/i/'+CODE+'/');
	}
	if (site === 'alicebooks'){
		return ('http://alice-books.com/item/show/'+CODE);
	}
	return "";
}

function getFileContent(fileInput, callback) {
    if (fileInput.files && fileInput.files.length > 0 && fileInput.files[0].size > 0) {
        var file = fileInput.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    callback(evt.target.result);
                }
            };
            // 包含中文内容用gbk编码
            reader.readAsText(file, 'UTF-8');
        }
    }
};

function loadList(){
	$("#result").html("");
	
	var result = $(document.createElement("div"));
	
	result.attr("id","result");
	for(var i in _List){
		var item = $(document.createElement("div"));
		item.addClass('item');
		var _html = '<div>'+
			'<input type="checkbox" class="checkitem" />'+
			'</div>'+
			'<div class="imagelink">'+
				'<a href="'+formURL(_List[i]["site"], _List[i]["CODE"])+'">';
		if (_List[i]["site"] === "tora"){
			_html += '	<img src="'+_List[i]["imageurl"]+'" alt="">';
		}
		if (_List[i]["site"] === "kbooks"){
			_html += '	<img src="'+"https://www.c-queen.net"+_List[i]["imageurl"]+'" alt="">';
		}
		if (_List[i]["site"] === "alicebooks"){
			_html += '	<img src="'+"http://alice-books.com"+_List[i]["imageurl"]+'" alt="">';
		}
		_html+=	'</a>'+
			'</div>'+
			'<div class="spacing">'+
			'</div>'+
			'<div class="info">'+
				'<div>'+
				'   <p class="site" style="display:none">'+_List[i]["site"]+'</p>'+
				'	<p class="CODE '+_List[i]["site"] +'">'+_List[i]["CODE"]+'</p>'+
				'	<p class="title">'+_List[i]["GNAME"]+'</p>'+
				'</div>'+
				'<dl>'+
				'	<dt class="">サークル</dt><dd>'+_List[i]["mak"]+'</dd>'+
				'	<dt class="">ジャンル</dt><dd>'+_List[i]["gnr"]+'</dd>'+
				'	<dt class="">メインキャラ</dt><dd>'+_List[i]["mch"]+'</dd>'+
				'	<dt class=""></dt><dd></dd>'+
				'	<dt class="price">価格:</dt><dd class="price">'+_List[i]["TANKA"]+'</dd>'+
				'</dl>'+
				'<div class="operation">';
			_html += '<select class="amount" data="'+_List[i]['amount']+'">';
			for (var j = 0; j <= 5; j++){
				_html += '<option value="'+j+'"';
				try{
					if (j == parseInt(_List[i]['amount'])){
						_html += ' selected ';
					}
				}catch(err){console.log("record not exist");}
				_html += '>'+j+'</option>'
			}
			_html += "</select>";
			_html +=
					'<button class="ls_save">更新</button>'+
					'<button class="ls_del">移除</button>'+
				'</div>'+
			'</div>'+
			'<div class="spacing">'+
			'</div>';

		item.html(_html);
		result.append(item);
	}
	
	$("#result").replaceWith(result);
	
	$('.amount').on('change', function() {
		var item = $(this.closest('.item'));
		if ($(this).val() == $(this).attr('data')){
			item.removeClass("changed");
		}
		else{
			item.addClass("changed");
		}
		
		calcPrice();
	});
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
	$(".ls_save").click(function(){
		var item = $(this.closest('.item'));
		save(item);
	});
	$(".ls_del").click(function(){
		var item = $(this.closest('.item'));
		if(confirm('确定要删除该条记录吗？')){
			remove(item.find(".site").html()+item.find(".CODE").html());
			loadList();
		}
	});
	$('.checkitem').change(function(){
		calcPrice();
	});
}

$(document).ready(function(){
	loadList();

	$(".ls_update_all").click(function(){
		if(confirm('确定要更新记录吗？')){
			$('.ls_save').trigger('click');
		};
	});
	$(".ls_view").click(function(){
		chrome.tabs.create({
            url: chrome.extension.getURL('popup.html'),
            active: false
        }, function(tab) {
            // After the tab has been created, open a window to inject the tab
            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                focused: true
                // incognito, top, left, ...
            });
        });
	});
	$(".ls_export").click(function(){
		var strList = localStorage['list'];
	    var blob = new Blob([strList]);
	    
	    var aLink = document.createElement('a');
	    var evt = document.createEvent("MouseEvents");
	    evt.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	    aLink.download = "localStorage.json";
	    aLink.href = URL.createObjectURL(blob);
	    aLink.dispatchEvent(evt);
	});
	document.getElementById('upload').onchange = function () {
		getFileContent(this, function (str) {
			localStorage['list'] = str;
			initList();
			loadList();
		});
	};
});