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
chrome.extension.onMessage.addListener(function(request, _, sendResponse){
	var dicReturn;
	
	if(request.action == 'list'){
		var strList = localStorage['list'];
		if(strList){
			var objList = JSON.parse(strList);
			dicReturn = {'status': 200, 'data': objList};
		}else{
			dicReturn = {'status': 404}
		}
		sendResponse(dicReturn);
	}

	if(request.action == 'save'){
		var strMessage = request.data.message;
		
		var objMessage = JSON.parse(strMessage);
		var strList = localStorage['list'];
		var objList = new Object();
		if(strList){
			objList = JSON.parse(strList)
		}
		objList[objMessage["site"]+objMessage["CODE"]] = objMessage;
		localStorage['list'] = JSON.stringify(objList);

		dicReturn = {'status': 200, 'data': objList};
		sendResponse(dicReturn);
	}

	// 删除
	if(request.action == 'del'){
		// content_script传来的message
		var strCODE = request.data.message;
		// 从localstorage中读取数据
		var strList = localStorage['list'];
		if(strList){
			objList = JSON.parse(strList);
			delete objList[strCODE];

			localStorage['list'] = JSON.stringify(objList);
			sendResponse({'status': 200, 'data': objList});
		}else{
			sendResponse({'status': 501, 'msg': '删除失败，未有数据'});
		}
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

function save(site, CODE, amount){
	var objMessage = {"site":site, "CODE":CODE, "amount":amount};
	var strList = localStorage['list'];
	var objList = new Object();
	if(strList){
		objList = JSON.parse(strList)
	}
	objList[objMessage["site"]+objMessage["CODE"]] = 
		$.extend(objList[objMessage["site"]+objMessage["CODE"]], objMessage);
	localStorage['list'] = JSON.stringify(objList);
}

$(document).ready(function(){
	$("#result").html("");
	var objList = new Object();
	var strList = localStorage['list'];
	if(strList){
		objList = JSON.parse(strList);
	}
	
	var result = $(document.createElement("div"));
	result.attr("id","result");
	for(var i in objList){
		var item = $(document.createElement("div"));
		item.addClass('item');
		var _html = '<div>'+
			'<input type="checkbox" />'+
			'</div>'+
			'<div>'+
				'<a href="http://www.toranoana.jp'+objList[i]["U"]+'">'+
				'	<img src="'+objList[i]["imageurl"]+'" alt="同人">'+
				'</a>'+
			'</div>'+
			'<div class="spacing">'+
			'</div>'+
			'<div>'+
				'<div>'+
				'   <p class="site" style="display:none">'+objList[i]["site"]+'</p>'+
				'   <p class="CODE" style="display:none">'+objList[i]["CODE"]+'</p>'+
				'	<p class="id"><span>注文番号</span>'+objList[i]["CODE"]+'</p>'+
				'	<p class="title">'+objList[i]["GNAME"]+'</p>'+
				'</div>'+
				'<dl>'+
				'	<dt class="info">サークル</dt><dd>'+objList[i]["mak"]+'</dd>'+
				'	<dt class="info">ジャンル</dt><dd>'+objList[i]["gnr"]+'</dd>'+
				'	<dt class="info">メインキャラ</dt><dd>'+objList[i]["mch"]+'</dd>'+
				'	<dt class="attr"></dt><dd></dd>'+
				'	<dt class="price">価格:</dt><dd>'+objList[i]["TANKA"]+'</dd>'+
				'</dl>'+
			'</div>'+
			'<div class="operation">';
		_html += '<select class="amount">';
		for (var j = 0; j <= 5; j++){
			_html += '<option value="'+j+'"';
			try{
				if (j == parseInt(objList[i]['amount'])){
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
			'<div class="spacing">'+
			'</div>';

		item.html(_html);
		result.append(item);
	}
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
	$("#result").replaceWith(result);
	$(".ls_save").click(function(){
		var item = $(this.closest('.item'));
		save(item.find(".site").html(),
			item.find(".CODE").html(),
			item.find(".amount").val());
	});
})