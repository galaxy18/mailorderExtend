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
		this.create();

		// 加载已有数据
		this.loadLocalStorage();

		// 监听保存
		this.listenSave();
		
		this.listenView();
	},

	// 创建界面
	create: function(){
		var _html = '<div id="ls_box">'+
			'<h3>'+
				'本地存储 local storage'+
			'</h3>'+
			'<div id="ls_list">'+
				'正在加载数据...'+
			'</div>'+
			'<div id="ls_form">'+
				'<label>'+
					'新增: '+
				'</label>'+
				'<input type="text" id="ls_message" />'+
				'<button id="ls_save">保存</button>'+
				'<button id="ls_view">检视</button>'+
			'</div>'+
		'</div>';
		$('body').append(_html);
	},

	/**
	 * 加载已有数据
	 */
	loadLocalStorage: function(){
		_this = this;
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
			var strMessage = JSON.stringify(download(window.location.href), null, '\t');
			if(!strMessage){
				return false;
			}
			_this.sendMessageBack('save', {'message': strMessage}, function(response){
				if(response.status == 200){
					_this.showList(response.data);
					$('#ls_message').val('');
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
			// 获取删除值
			var strMessage = $(this).attr('data-item');
			if(!strMessage){
				alert('未找到删除值，请重试');
				return false;
			}
			if(confirm('确定要删除该条记录吗？')){
				// 向background发消息，请求删除该值
				_this.sendMessageBack('del', {'message': strMessage}, function(response){
					if(response.status == 200){
						$this.parent().fadeOut(function(){
							$(this).remove();
						});
					}else{
						alert(response.msg);
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

$(document).ready(function(){
	main.init();
});