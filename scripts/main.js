// +----------------------------------------------------------------------
// | main.js 
// +----------------------------------------------------------------------
// | Author:  onlyfu <fuwy@foxmail.com>
// +----------------------------------------------------------------------
// | 2015-01-04
// +---------------------------------------------------------------------

var main = {

	// 初始化
	init: function(){
		// 创建界面
		//this.create();
		// 加载已有数据
		this.loadLocalStorage();
	},

	// 创建界面
	create: function(){
	},

	/**
	 * 加载已有数据
	 */
	loadLocalStorage: function(){
		_this = this;
		/*
		// 发送消息给background，请求已有数据
		this.sendMessageBack('list', {}, function(response){
			if(response.status == 404){
				_this.showList();
				return false;
			}

			_this.showList(response.data);
			
			// 监听删除
			_this.listenDel();
		});
		*/

		this.sendMessageBack('list', {}, function(response){
			_this.checkStorage(response);

			// 监听保存
			_this.listenSave();
			_this.listenView();
			_this.listenDel();
		});
	},
	
	checkStorage: function(response){
		//var _html = '<button id="ls_save">收藏</button>';
		if ($('#checkStorage').length == 0){
			$('#content>h2').append('<div style="display:inline-block;" id="checkStorage"></div>');
		}
			
		var _html = '';
		var keyexist = false;
		if(response.status == 404){
		}
		else{
			var objData = JSON.parse(response.data);
			var CODE = getCode(window.location.href);
			if (objData.hasOwnProperty(CODE)){
				keyexist = true;
				if (objData[CODE]['amount'] > 0){
					_html += '<span style="color:red;">已选定：'+objData[CODE]['amount']+'</span>';
				}else{
					_html += '<span style="color:red;">已收藏</span>';
				}
			}
		}
		
		_html += '&nbsp;<select id="amount">';
		for (var i = 0; i <= 5; i++){
			_html += '<option value="'+i+'"';
			try{
				if (i == parseInt(objData[CODE]['amount'])){
					_html += ' selected ';
				}
			}catch(err){console.log("record not exist");}
			_html += '>'+i+'</option>'
		}
		_html += '</select>';
		_html += '&nbsp;<button id="ls_save">更新</button>';
		
		_html += '&nbsp;<button id="ls_view">检视</button>';
		
//		_html += '&nbsp;&nbsp;<button id="ls_blst">黑名单</button>';
//		_html += '&nbsp;&nbsp;<button id="ls_blst_a">作者黑名单</button>';
		
		if (keyexist){
			_html += '&nbsp;<button class="ls_del">移除</button>';
		}
		
		_html += '</div>';
		
		$('#checkStorage').html(_html);
	},

	showList: function(objData){
		if(!objData || objData.length == 0){
			$("#ls_list").html('<p>没有找到数据</p>');
			return;
		}
		
		$("#ls_list").html("");
		var contents = document.createElement("div");
		for(var i in objData){
			var content = document.createElement("pre");
			content.append(JSON.stringify(objData[i], null, '\t'));
			contents.append(content);
		}
		$("#ls_list").append(contents);
		_this.listenDel();
	},
	
	listenSave: function(){
		_this = this;

		$("#ls_save").click(function(){			
			var objMessage = download(window.location.href);
			if (!objMessage){
				return false;
			}
			objMessage = $.extend(objMessage, {"amount":$("#amount").val()});
			var strMessage = JSON.stringify(objMessage, null, '\t');
			if(!strMessage){
				return false;
			}
			_this.sendMessageBack('save', {'message': strMessage}, function(response){
				if(response.status == 200){
					_this.checkStorage(response);
					$('#ls_message').val('');
					// 监听保存
					_this.listenSave();
					_this.listenView();
					_this.listenDel();
				}
			});
		});
	},
	
	listenView: function(){
		_this = this;

		$("#ls_view").click(function(){
			_this.sendMessageBack('view');
		});
	},

	/**
	 * 监听删除事件
	 */
	listenDel: function(){
		_this = this;

		$(".ls_del").unbind('click').click(function(){
			var $this = $(this);
			var CODE = getCode(window.location.href);
			if(confirm('确定要删除该条记录吗？')){
				// 向background发消息，请求删除该值
				_this.sendMessageBack('del', {'message': CODE}, function(response){
					if(response.status == 200){
						_this.checkStorage(response);
						$('#ls_message').val('');
						// 监听保存
						_this.listenSave();
						_this.listenView();
						_this.listenDel();
					}else{
					}
				});
			}
		});
	},

	/**
	 * 向background发送消息
	 * @params strAction string 执行方法
	 * @params dicData dict 数据字典
	 * @params callback function 回调函数
	 */
	sendMessageBack: function(strAction, dicData, callback){
		chrome.extension.sendMessage({'action': strAction, 'data': dicData},callback);
	},
}

main.init();
