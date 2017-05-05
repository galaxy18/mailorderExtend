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
		});
	},
	
	checkStorage: function(response){
		var site = "tora";
		if(response.status == 404){
		}
		else{
			var objData = response.data;
			$(".id").each(function(){
				if (objData.hasOwnProperty(site + $(this).html())){
					var imgitem = $(this).closest("li");
					var operation = $(document.createElement('div'));
					operation.addClass('operation');
					if (imgitem.find('.operation').length > 0){
						operation = imgitem.find('.operation').get(0);
					}
					var amount = objData[site + $(this).html()]['amount'];
					var _html = '';
					
					if (amount > 0){
						_html += '已选定：'+amount;
					}else{
						_html += '已收藏';
					}
					/*
					_html += '&nbsp;<select class="amount">';
					for (var i = 0; i <= 5; i++){
						_html += '<option value="'+i+'"';
						try{
							if (i == amount){
								_html += ' selected ';
							}
						}catch(err){console.log("record not exist");}
						_html += '>'+i+'</option>'
					}
					_html += '</select>';
					_html += '&nbsp;<button class="ls_save">更新</button>';
					_html += '&nbsp;<button class="ls_view">检视</button>';
					*/
					operation.html(_html);
					imgitem.prepend(operation);
					
					if (amount > 0){
						imgitem.css("border","2px solid blue");
					}else{
						imgitem.css("border","2px solid red");
					}
				}
			});
		}
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

		$(".ls_save").click(function(){
			var imgitem = $(this.closest("li"));
			var CODE = imgitem.find(".id").html();
			var amount = imgitem.find(".amount").val();
			
			var objMessage = {"CODE":CODE, "amount":amount};
			var strMessage = JSON.stringify(objMessage, null, '\t');
			
			/*
			_this.sendMessageBack('save', {'message': strMessage}, function(response){
				if(response.status == 200){
					_this.checkStorage(response);
					$('#ls_message').val('');
					// 监听保存
					_this.listenSave();
					_this.listenView();
				}
			});
			*/
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

main.init();
