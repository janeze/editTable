(function(root,$,name,factory){
	if(!root){
		root=window;
	}
	var Func=factory();
	if(!$){
		root[name]=Func;
	}else{

		var jqName="ui"+name.toLowerCase();
		$.fn[jqName]=function(option){
	 		var args = Array.apply(null, arguments);
			args.shift();
			var internal_return;
			this.each(function () {
				var $this = $(this),
					data = $this.data(jqName),
					options = typeof option == 'object' && option;
					if (!data) {//还没有初始化时，初始化控件
						$this.data(jqName, (data = new Func(this,  options)));
					}
				if (typeof option == 'string' && typeof data[option] == 'function') {//执行某功能
					internal_return = data[option].apply(data, args);
					if (internal_return !== undefined) {
						return false;
					}
				}
			});
			if (internal_return !== undefined)
				return internal_return;
			else
				return this;
	 	};
	 }
})(window,window.$,"EditTable",function(){
    "use strict";
    // JS 浮点数四则运算精度丢失解决方案
    function CountFunc(expression,valObj){
    	//console.log(expression);
    }
    CountFunc.prototype={
    	constructor:CountFunc,
    	do:function(expression,valObj){
	    	var expression=expression.replace(/(\s|\r\n|\n)+/g,"");
	    	var rpnQuery=this.transToRpn(expression);
	    	var val=this.countRpn(rpnQuery,valObj);
	    	//console.log(val);
	    	return val;
    	},
	    // 加法
	    add : function(a,b) {
	      var m, m1, m2;

	      try {
	        m1 = a.toString().split('.')[1].length;
	      } catch (e) {
	        m1 = 0;
	      }

	      try {
	        m2 = b.toString().split('.')[1].length;
	      } catch (e) {
	        m2 = 0;
	      }

	      m = Math.pow(10, Math.max(m1, m2));
	      return (this.mul(a,m) + this.mul(b,m)) / m;
	    },
	    // 减法
	    sub : function(a,b) {
	      return this.add(a,-b);
	    },
	    // 乘法
	    mul : function(a,b) {
	      var m = 0;
	      var s1 = a.toString();
	      var s2 = b.toString();

	      try {
	        m += s1.split('.')[1].length;
	      } catch (e) {}

	      try {
	        m += s2.split('.')[1].length;
	      } catch (e) {}

	      return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
	    },
	    // 除法
	    div : function(a,b) {
	      var m1 = 0;
	      var m2 = 0;
	      var n1, n2;

	      try {
	        m1 = a.toString().split('.')[1].length;
	      } catch (e) {}

	      try {
	        m2 = b.toString().split('.')[1].length;
	      } catch (e) {}

	      n1 = Number(a.toString().replace('.', ''));
	      n2 = Number(b.toString().replace('.', ''));
	      // return (n1 / n2) * Math.pow(10, m2 - m1);
	      return this.mul((n1 / n2),Math.pow(10, m2 - m1));
	    },
	    //判断是否是操作符
	    isOperate:function(value){
	    	var operatorString = "+-*/";
    		return operatorString.indexOf(value) > -1
	    },
	    //获取运算符优先级
	    getPrioraty:function(value){
	    	 switch(value){
		        case '+':
		        case '-':
		            return 1;
		        case '*':
		        case '/':
		            return 2;
		        default:
		            return 0;
		    }
	    },
	    //判断运算符优先级
	    prioraty:function(o1,o2){
	    	return this.getPrioraty(o1) <= this.getPrioraty(o2);
	    },
	    //将表达式转为后缀(逆波兰)表达式队列
	    transToRpn:function(express){
	    	var s1=[],s2=[],str="";
	    	function popS2Operate(s1,s2){
	    		//将栈S2中的运算符一次出栈加入到栈S1中，
	    		//直到遇到左括号，但是该左括号出栈S2并不加入到栈S1中
	    		for(var i=s2.length;i>0;i--){
	    			var cur=s2.pop();
	    			if(cur==="("){
	    				return;
	    			}
	    			s1.push(cur);
	    		}
	    	}
	    	for(var i=0;i<express.length;i++){
	    		var cur=String(express[i]);
	    		if(this.isOperate(cur)){//遇到操作符
	    			if(str){
	    				s1.push(str);
	    				str="";
	    			}
	    			
	    			if(s2.length===0){//如果此时栈S2为空，则直接将运算符加入到栈S2中
	    				s2.push(cur);
	    			}else if(!this.prioraty(cur,s2[s2.length-1])){//此时栈S2不为空
	    				//当前遍历的运算符的优先级大于等于栈顶运算符的优先级，那么直接入栈S2；
	    				s2.push(cur);
	    			}else{
	    				//当前遍历的运算符的优先级小于栈顶运算符的优先级，
	    				//则将栈顶运算符一直出栈加入到栈S1中，
	    				//直到栈为空或者遇到一个运算符的优先级小于等于当前遍历的运算符的优先级，
	    				//此时将该运算符加入到栈S2中
	    				while(this.prioraty(cur, s2[s2.length - 1]) && s2.length > 0){
		                    s1.push(s2.pop());
		                }
		                s2.push(cur);
	    			}
	    		}else if(cur==="("){//如果遇到的是左括号，则直接将该左括号加入到栈S2中
	    			if(str){
	    				s1.push(str);
	    				str="";
	    			}
	    			s2.push(cur);
	    		}else if(cur===")"){//遇到右括号
	    			if(str){
	    				s1.push(str);
	    				str="";
	    			}
	    			popS2Operate(s1,s2);
	    		}else{//遇到数字，先连接数字字符串直到遇到下一个操作符或者结束才放入s1
	    			str+=cur;
	    		}
	    	}
	    	if(str){
				s1.push(str);
				str="";
			}
			//直到遍历完整个中序表达式之后，栈S2中仍然存在运算符，那么将这些运算符依次出栈加入到栈S1中，直到栈为空。
			for(var j=s2.length;j>0;j--){
				s1.push(s2.pop());
			}
	    	return s1;
	    },
	    //逆波兰表达式队列求值
	    countRpn:function(s1,valObj){
	    	var s3=[],cur,val;
	    	for(var i=0;i<s1.length;i++){
	    		cur=s1[i];
	    		//console.log(cur);
	    		if(this.isOperate(cur)){//操作符(双目运算)
	    			//如果遇到的是双目运算符，
	    			//那么取S3栈顶的两个元素进行，
	    			//首先出栈的在左，
	    			//后出栈的在右
	    			//进行双目运算符的计算，将结果再次压入到S3中
	    			var right=s3.pop();
	    			var left=s3.pop();
	    			val=this.transGetValue(left,right,cur);
	    			//console.log(val);
	    			s3.push(val);
	    		}else{//变量
	    			//如果遇到的是数字，那么直接将数字压入到S3中；
	    			val=Number(valObj[cur]);
	    			//console.log(val);
	    			s3.push(val);
	    		}
	    	}
	    	
	    	return s3[0];
	    },
	    //将加减乘除转为add sub mul div的方式求值
	    transGetValue:function(a,b,o){
	    	var val=0;
	    	a=new Number(a);
	    	b=new Number(b);
	    	switch(o){
	    		case "+":
	    			val=this.add(a,b);
	    			break;
	    		case "-":
	    			val=this.sub(a,b);
	    			break;
	    		case "*":
	    			val=this.mul(a,b);
	    			break;
	    		case "/":
	    			val=this.div(a,b);
	    			break;
	    		default:
	    			val=0;
	    			break;
	    	}
	    	return val;
	    }
	}
    function doCount(express,decimalplace,dataObj,tempDataObj){
        if(!express){
            return 0;
        }
        var reg=/\+|\-|\*|\/|\%|\(|\)/g;
        var argsName=express.replace(/\(|\)/g,"").split(reg);
        var argsVal={},args=[],valObj={};
        for(var i=0,l=argsName.length;i<l;i++){
            var name=argsName[i],val;
            if(tempDataObj.hasOwnProperty(name)){
              val =tempDataObj[name];
            }else if(dataObj.hasOwnProperty(name)){
               val=dataObj[name];
            }else{
                val=0;
            }
            if(!argsVal.hasOwnProperty(name)){
                args.push(name);
                valObj[name]=val;
            }
            argsVal[name]=val;
        }
        var result=new CountFunc().do(express,valObj);
        if(decimalplace){
        	//var t=Math.pow(10,Number(decimalplace));
        	//result=Math.round(result*t)/t;
        	console.log(result);
        	result=Number(result).toFixed(Number(decimalplace));
        }
        
        return result;
    }
    //将计算结果填入行
    function setCountResult(rowEle,data){
        for(var i in data){
            var ele=rowEle.querySelector("[name='"+i+"']");
            if(!ele){
                continue;
            }
            var className=ele.getAttribute("class");
            var classList=className.split(/\s+/g);
            if(classList.indexOf("ui-type-string")!==-1){//字符串类型
                ele.textContent=data[i];
            }
        }
    }


	 //检验值是否为空（""或者null或者undefined）
    function isBlank(val) {
        if (val === undefined || val === null || typeof val === "string" && val.trim() === "" || val === "null" || val === "undefined") {
            return true;
        }
        return false;
    }
	function getEleById(id){
		var ele= document.querySelector("#"+id)
		return ele;
	}
	function getColWidth(totalW,data){
		var len=0,wStr,reg=/[^\d]+$/g,widthNum;
		for(var i=0;i<data.length;i++){
			if(data[i].type!=="hide"&&data[i].type!=="hidden"){
				len+=1;
			}
		}
		wStr=totalW.match(reg)[0];
		if(wStr==="%"){
			widthNum=100;
		}else{
			widthNum=totalW.replace(reg,"");
		}
		return widthNum/len+wStr;
	}
	function initEle(that){
		var ele=that.element,
			cls=that.element.getAttribute("class")||"",
			style=that.element.getAttribute("style")||"",
			width=that.width;
		cls += that.cls||"";
		style += that.style||"";
		if(width){
			style='width:'+width+";"+style;
		}
		that.element.setAttribute("class",cls);
		that.element.setAttribute("style",style);
	}
	function createEles(pEle,option){
		option=option||[];
		if(!pEle){
			console.log("缺少父元素");
			return;
		}
		for(var i=0;i<option.length;i++){
			var childNode=createEle.call(this,option[i]);
			pEle.appendChild(childNode);
		}
		return pEle;
	}
	function createEle(option){
		option=option||{};
		var ele;
		var tagName=option.tagName,
			attrs=option.attrs||[],
			textContent=option.textContent,
            children=option.children||[];
		if(!tagName){
			console.log("缺少tagName");
		}else{
			ele=document.createElement(tagName);
			var width="",style="";
			for(var i=0;i<attrs.length;i++){
				var k=attrs[i][0],t=attrs[i][1];
				if(k==="width"){
					width=t;
					continue;
				}
				if(k==="style"){
					style=t;
					continue;
				}
				if(isBlank(t)){
					ele.setAttribute(k,"");
				}else{
					ele.setAttribute(k,t);
				}
			}
			if(width){
				style="width:"+width+";"+style;
			}
			if(style){
				ele.setAttribute("style",style);
			}
            //子元素
            createEles.call(this,ele,children);
		}
		if(!isBlank(textContent)){
			ele.textContent=textContent;
		}
         //绑定事件
        if(tagName==="input"||tagName==="textarea"){
            addEvent(ele,"input",this.onchange.apply(this));
        }
		return ele;
	}
    function addEvent(ele,fnname,fn){
        if(window.attachEvent){
            ele.attachEvent(fnname,fn);
        }else{
            ele.addEventListener(fnname,fn,false);
        }
    }
	function clearChildren(pEle){
		var children=pEle.children;
		for(var i=children.length-1;i>=0;i--){
			pEle.removeChild(children[i]);
		}
		return pEle;
	}
	function getCol(that,isHead,obj,unsureData,i){
		var type=obj.type||"",
			text=obj.text||"",
			name=obj.name||"",
			otherName=obj.otherName||name,
			width=obj.width||"";
		var v="";
		var dObj;
        if(obj.isHide){
            type="hide";
        }
		if(isHead){
			width=width||unsureData;
			type=type||"string";
			obj.width=unsureData;
			obj.type=type;
		}else{//非表头使用
			var dObj=unsureData;
			//v=isBlank(dObj[name])?"":dObj[name];
			v=isBlank(dObj[otherName])?"":dObj[otherName];
			if(isBlank(v)){
				v=isBlank(dObj[name])?"":dObj[name];
			}
		}
		if(type==="hide"||type==="hidden"){
			width=0;
		}
		var attrs=[
				["class","ui-type-"+type],
				["name",name],
				["ui-index",i]
			];
		if(isHead){
			attrs.push(["width",width]);
		}
		var ele=createEle.call(this,{
			tagName:"td",
			attrs:attrs
		});
		if(isHead){//表头
			ele.textContent=text;
		}else if(type==="hidden"||type==="hide"||type==="string"){//隐藏字段类型，string类型
			ele.textContent=v;
		}else if(type==="text"){//text类型
			that.getTextCol(ele,obj,name,text,dObj,v);
		}else if(type==="number"){//number类型
			that.getNumberCol(ele,obj,name,text,dObj,v);
		}else if(type==="interger"){//interger类型
			that.getIntergerCol(ele,obj,name,text,dObj,v);
		}else if(type==="select"){//select类型
			that.getSelectCol(ele,obj,name,text,dObj,v);
		}else if(type==="price"){//价格单位类型
			that.getPriceCol(ele,obj,name,text,dObj,v);
		}else if(type==="num"){//数量单位类型
			that.getNumCol(ele,obj,name,text,dObj,v);
		}else if(type==="multinum"){//多数量单位类型
			that.getMultinumCol(ele,obj,name,text,dObj,v);
		}else{
			var UpperType=type.charAt(0).toUpperCase() +type.slice(1);//首字母大写
			var fn=that["get"+type+"Col"];
			if(typeof fn==="function"){
				fn.call(fn,ele,obj,name,text,dObj,v);
			}else{
				
			}
		}

		return ele;
	}
	function Func(element,option){

		this.id=option.id||"";
		this.width=option.width||"100%";
		this.cls=(option.cls||"")+" ui-edit-table";
		this.style=option.style;
		this.decimalplace=isBlank(option.decimalplace)?2:option.decimalplace,//保留小数位，仅对小数类型数据起作用，当不输入的时候默认是2
        this.outPutParam=option.outPutParam;//输出参数
        this.amountName=option.amountName;//提交合计数据的列
        this.rowCount=option.rowCount;//行小计公式
        this.colCount=option.colCount;//合计列
		this.data=option.data||[];//表头数组
		//this.list=option.list||[];//数据数组
		
		this.element=element;//getEleById(this.id);
		initEle(this);
		
		this.create(option.list||[]);
		//添加单击事件
		addEvent(this.element.querySelector(".ui-list"),"click",this.doCheckRow.apply(this));
	}
	Func.prototype={
		 constructor: Func,
        _events: [],
        _attachEvents: function() {
            this._detachEvents();
            this._events = [
                
            ];
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.on(ev);
            }
            if(!this.events){
            	this.events=[];
            }
        },
        _detachEvents: function() {
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.off(ev);
            }
            this._events = [];
        },
        onchange:function(){
            var that=this;
            return function(e){
                var name=this.getAttribute("name"),
                    value=this.value;
                var cango=that.checkValue(this,name,value);
                if(that.rowCount){
                    that.doRowCount(cango,this);
                }
                if(that.colCount){
                    that.doColCount();
                }
            }
        },
        getCurrRow:function(ele){
            var rowClass="ui-row";
            var rowTagName="tr";
            var rowEle;
            var pEle=ele.parentElement;

            if(pEle.tagName.toLowerCase()!==rowTagName){
                return this.getCurrRow(pEle);
            }else{
                var className=pEle.getAttribute("class");
                var classList=className.split(/\s+/g);
                if(classList.indexOf(rowClass)!==-1){
                    return pEle;
                }else{
                    return this.getCurrRow(pEle);
                }
            }
        },
        getCurrCol:function(ele){
        	//var colClass="ui-row";
            var colTagName="td";
            var rowEle;
            var pEle=ele.parentElement;

            if(pEle.tagName.toLowerCase()!==colTagName){
                return this.getCurrCol(pEle);
            }else{
                return pEle
            }
        },
        doRowCount:function(cango,ele){//行小计
            var expression=(this.rowCount||"").replace(/(\s|\n|\r\n)+/g,"");//去空
            if(!expression){    return;     }
           
            //获取当前行数据
            var rowEle=this.getCurrRow(ele);
            var rowData=this.getData(rowEle);
            //解析小计公式，
            var expArr=expression.split(";");
            var outPutName,outPut,tempObj={};
            for(var i=0,l=expArr.length;i<l;i++){
                var exp=expArr[i];
                if(!exp){
                    continue;
                }
                exp=exp.split("=");
                outPutName=exp[0];
                outPut=doCount(exp[1],this.decimalplace,rowData,tempObj);
                tempObj[outPutName]=outPut;
            }
            //将结果填入行内
            setCountResult(rowEle,tempObj);
        },
        doColCount:function(){//列合计
            var expression=this.colCount;
            if(!expression){    return;     }
            //如果表格没数据则不统计
            if(!this.element.querySelector(".ui-list").querySelector(".ui-row")){
            	var tfoot=this.element.querySelector("tfoot");
            	if(tfoot){
            		tfoot.remove();
            	}
            	return;
            }
            expression=expression.split(",");
            var data=this.data;
            var container=this.element.querySelector(".ui-table-container");
            var pEle=createEle.call(this,{
            	tagName:"tfoot",
            	attrs:[
            		["class","ui-count ui-row"]
            	]
            });
            var li,name,type,width,tw=0,col=0,wStr,hasBlank,attrs;
            var getWidth=function(tw,w){
            	var reg=/[^\d]+$/;
            	wStr=w.match(reg)[0];
            	w=w.replace(reg,"");
            	return tw+Number(w);
            }
            //构造行
            for(var i=0,l=data.length;i<l;i++){
            	name=data[i].name;
            	type=data[i].type;
            	width=data[i].width;
            	tw=getWidth(tw,width);
            	if(type!=="hide"&&type!=="hidden"){
            		col+=1;
            	}
            	
            	if(expression.indexOf(name)===-1){
            		hasBlank=true;
            		continue;
            	}
            	if(hasBlank){
            		//空白
            		tw=getWidth(tw,"-"+width);
            		col-=1;
	           		li=createEle.call(this,{
		            	tagName:"td",
		            	attrs:[
		            		["class","ui-blank"],
		            		["colspan",col],
	            			//["width",tw+wStr]
	        			],
	        			textContent:li?"":"合计："
		            });
		            pEle.appendChild(li);
            	}
            	
	            //非空白
	            li=createEle.call(this,{
	            	tagName:"td",
	            	attrs:[
            			["class","ui-type-"+type],
            			//["width",width],
	            		["name",name]
            		]
	            });
	            pEle.appendChild(li);

	            tw=0;
	            col=0;
	            hasBlank=false;
            }
            if(hasBlank){
            		//空白
            		tw=getWidth(tw,"-"+width);
            		col-=1;
	           		li=createEle.call(this,{
		            	tagName:"td",
		            	attrs:[
		            		["class","ui-blank"],
		            		["colspan",col],
	            			//["width",tw+wStr]
	        			],
	        			textContent:li?"":"合计："
		            });
		            pEle.appendChild(li);
            	}
            var oldCount=container.querySelector(".ui-count");
            if(oldCount){
            	container.removeChild(oldCount);
            }
            container.appendChild(pEle);

            //获取合计数据
            var listPele=this.element.querySelector(".ui-list"),eles,querySelector,isInput,val;
            var getColCount=function(that,eles){
            	var cls=eles[0].getAttribute("class");
            	var classList=cls.split(/\s+/g);
            	var uiIndex=eles[0].getAttribute("ui-index");
            	var obj=that.data[uiIndex];
            	var val;
            	var isMulti=classList.indexOf("ui-type-multinum")===-1?false:true,
            		isString=classList.indexOf("ui-type-string")===-1?false:true;
            	if(isMulti){
            		val=[0,0];
            	}else{
            		val=0;
            	}
            	for(var i=0;i<eles.length;i++){
            		if(isMulti){//是双数量
            			val[0]+=Number(eles[i].querySelector("[name="+obj.name+"]").value);
            			val[1]+=Number(eles[i].querySelector("[name="+obj.singleName+"]").value);
	            	}else if(isString){//字符串
	            		val+=Number(eles[i].textContent);
	            	}else{//表单内
            			val+=Number(eles[i].querySelector("[name="+obj.name+"]").value);
	            	}
            	}
            	if(isMulti){
            		val="<span>"+val[0]+"</span>"+"<span>"+val[1]+"</span>";
            	}
            	return val;
            };
            for(var j=0;j<expression.length;j++){
            	querySelector='[name='+expression[j]+']';
            	eles=listPele.querySelectorAll("td"+querySelector);
            	if(!eles.length){
            		continue;
            	}
            	val=getColCount(this,eles);
            	/*if(typeof val==="object"){
            		pEle.querySelector(querySelector).textContent=val[0];
            	}else{*/
            		pEle.querySelector(querySelector).innerHTML=val;
            	//}
            	
            }
        },
        create:function(list){
        	var data=this.data;
            var parentEle=createEle.call(this,{
                tagName:"table",
                attrs:[["class","ui-table-container"]]
            });
        	var ele=createEle.call(this,{
        		tagName:"thead",
        		attrs:[["class","ui-row ui-head"]]
        	});
            this.element.appendChild(parentEle);
        	var l=data.length;
        	var w=getColWidth(this.width,data);
        	for(var i=0;i<l;i++){
        		//设置别名otherName,当原先没有设置，在此处补充设置，默认跟name一样，
        		//otherName用于setData时，读取数据源的数据到对应的name所在列中
        		if(isBlank(data[i].otherName)){
        			data[i].otherName=data[i].name;
        		}
        		ele.appendChild(getCol(this,true,data[i],w,i));
        	}
        	this.data=data;
        	this.element.querySelector(".ui-table-container").appendChild(ele);
        	this.element.querySelector(".ui-table-container").appendChild(createEle.call(this,{
        		tagName:"tbody",
        		attrs:[["class","ui-list"]]
        	}));
        	this.setDatas(list);
        },
        getTextCol:function(ele,obj,name,text,dObj,v){
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="">';
        	return createEles.call(this,ele,[{
        		tagName:"input",
        		attrs:[
        			["type","text"],
        			["name",name],
        			["value",v],
        			["placeholder",""],
        			["ui-type",obj.type],
        			["ui-minlen",obj.minlen||""],
        			["ui-maxlen",obj.maxlen||""],
        			["ui-reg",obj.reg||""],
        			["ui-required",obj.required||""]
        		]
        	},{
                tagName:"p",
                attrs:[
                    ["class","ui-msg"]
                ]
            }]);
        },
        getNumberCol:function(ele,obj,name,text,dObj,v){
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="" ui-reg="/^\\d+(\\.\\d{1,2})?$/g">';
        	return createEles.call(this,ele,[{
        		tagName:"input",
        		attrs:[
        			["type","number"],
        			["name",name],
        			["value",v],
        			["placeholder",""],
        			["ui-reg","/^\\d+(\\.\\d{1,2})?$/g"],
        			["ui-type",obj.type],
        			["ui-min",obj.min||""],
        			["ui-max",obj.max||""],
        			["ui-required",obj.required||""]
        		]
        	},{
                tagName:"p",
                attrs:[
                    ["class","ui-msg"]
                ]
            }]);
        },
        getIntergerCol:function(ele,obj,name,text,dObj,v){
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="" ui-reg="/^\\d+$/g">';
        	return createEles.call(this,ele,[{
        		tagName:"input",
        		attrs:[
        			["type","number"],
        			["name",name],
        			["value",v],
        			["placeholder",""],
        			["ui-reg","/^\\d+$/g"],
        			["ui-type",obj.type],
        			["ui-min",obj.min||""],
        			["ui-max",obj.max||""],
        			["ui-required",obj.required||""]
        		]
        	},{
                tagName:"p",
                attrs:[
                    ["class","ui-msg"]
                ]
            }]);
        },
        getSelectCol:function(ele,obj,name,text,dObj,v){
        	var dropdown=obj.dropdown||[];
			var selectEle=createEle.call(this,{
				tagName:"select",
				attrs:[
					["name",name]
				]
			});
			selectEle.appendChild(createEle.call(this,{
				tagName:"option",
				attrs:[
					["value",""],
        			["ui-type",obj.type],
        			["ui-required",obj.required||""]
				]
			}))
        	for(var i=0;i<dropdown.length;i++){
        		var k=dropdown[i].key;
        		var t=dropdown[i].text;
        		if(String(v)===String(k)){
        			selectEle.appendChild(createEle.call(this,{
						tagName:"option",
						attrs:[
							["value",k],
							["selected"]
						],
						textContent:t
					}))
        		}else{
        			selectEle.appendChild(createEle.call(this,{
						tagName:"option",
						attrs:[
							["value",k]
						],
						textContent:t
					}))
        		}
        		
        	}
        	ele.appendChild(selectEle);
        	return ele;
        },
        getPriceCol:function(ele,obj,name,text,dObj,v){
        	var unit=obj.unit
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="" ui-reg="/^\\d+(\\.\\d{1,2})?$/g"><span> '+unit+'</span>';
        	return createEles.call(this,ele,[{
        		tagName:"input",
        		attrs:[
        			["type","number"],
        			["name",name],
        			["value",v],
        			["placeholder",""],
        			["ui-reg","/^\\d+(\\.\\d{1,2})?$/g"],
        			["ui-type",obj.type],
        			["ui-min",obj.min||""],
        			["ui-max",obj.max||""],
        			["ui-required",obj.required||""]
        		]
        	},{
                tagName:"p",
                attrs:[
                    ["class","ui-msg"]
                ]
            },{
        		tagName:"span",
                attrs:[["class","ui-unit"]],
        		textContent:unit
        	}]);
        },
        getNumCol:function(ele,obj,name,text,dObj,v){
        	var unit=obj.unit;
        	var unitText=dObj[unit]||unit||"";
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="" ui-reg="/^\\d+$/g"><span> '+unitText+' </span>';
        	return createEles.call(this,ele,[{
        		tagName:"input",
        		attrs:[
        			["type","number"],
        			["name",name],
        			["value",v],
        			["placeholder",""],
        			["ui-reg","/^\\d+$/g"],
        			["ui-type",obj.type],
        			["ui-min",obj.min||""],
        			["ui-max",obj.max||""],
        			["ui-required",obj.required||""]
        		]
        	},{
                tagName:"p",
                attrs:[
                    ["class","ui-msg"]
                ]
            },{
        		tagName:"span",
                attrs:[["class","ui-unit"]],
        		textContent:unitText
        	}]);
        },
        getMultinumCol:function(ele,obj,name,text,dObj,v){
        	var unit=obj.unit;
        	var unitText=dObj[unit]||"";
        	var singleUnit=obj.singleUnit;
        	var singleUnitText=dObj[singleUnit];
        	var singleName=obj.singleName;
        	var singleV=dObj[singleName];
        	singleV=isBlank(singleV)?"":singleV;
        	//return '<input type="text" name="'+name+'" value="'+v+'" placeholder="" ui-reg="/^\\d+$/g"><span> '+unitText+' </span>\
        	//		<input type="text" name="'+singleName+'" value="'+singleV+'" placeholder="" ui-reg="/^\\d+$/g" class="ui-single-num"><span> '+singleUnitText+' </span>';
        	return createEles.call(this,ele,[{
                tagName:"div",
                attrs:[["class","ui-group"]],
                children:[{
            		tagName:"input",
            		attrs:[
            			["type","number"],
            			["name",name],
            			["value",v],
            			["placeholder",""],
            			["ui-reg","/^\\d+$/g"],
            			["ui-type",obj.type],
            			["ui-min",obj.min||""],
            			["ui-max",obj.max||""],
            			["ui-required",obj.required||""]
            		]
            	},{
                    tagName:"p",
                    attrs:[
                        ["class","ui-msg"]
                    ]
                },{
            		tagName:"span",
                    attrs:[["class","ui-unit"]],
            		textContent:unitText
        	}]},{
                tagName:"div",
                attrs:[["class","ui-group"]],
                children:[{
            		tagName:"input",
            		attrs:[
            			["type","number"],
            			["name",singleName],
            			["value",singleV],
            			["placeholder",""],
            			["ui-reg","/^\\d+$/g"],
            			["class","ui-single-num"],
            			["ui-type",obj.type],
            			["ui-min",obj.min||""],
            			["ui-max",obj.max||""],
            			["ui-required",obj.required||""]
            		]
            	},{
                    tagName:"p",
                    attrs:[
                        ["class","ui-msg"]
                    ]
                },{
            		tagName:"span",
                    attrs:[["class","ui-unit"]],
            		textContent:singleUnitText
            	}]
            }]);
        },
        clear:function(){
        	clearChildren(listEle);
        },
        getNewRowData:function(){//获取新增一行的数据
        	var head=this.data;
        	var obj={};
        	//var list=this.list||[];
    		for(var i=0;i<head.length;i++){
    			var name=head[i].name,
    				value="";
    			obj[name]=value;
    			var unit=head[i].unit,
    				singleUnit=head[i].singleUnit;
    			if(unit&&list.length){
    				obj[unit]="";//list[0][unit];
    			}
    			if(singleUnit&&list.length){
    				obj[singleUnit]="";//list[0][singleUnit];
    			}
    		}
        	return obj;
        },
        setDatas:function(arr){
        	arr=arr||[];
        	//this.list=arr;
            //this._detachEvents();
        	var listEle=this.element.querySelector(".ui-list");
        	for(var i=0;i<arr.length;i++){
        		var ele=createEle.call(this,{
	        		tagName:"tr",
	        		attrs:[
	        			["class","ui-row"],
	        			["ui-index",i]
	        		]
	        	});
        		this.setData(arr[i],ele);
        		listEle.appendChild(ele);
        	}
        	//绘制合计行
        	if(this.colCount){
        		this.doColCount();
        	}
            //this._attachEvents();
        },
        setData:function(obj,pEle){
        	var l=this.data.length;
        	for(var i=0;i<l;i++){
        		var o=this.data[i];
        		var ele=getCol(this,false,o,obj,i);
        		if(ele){
        			pEle.appendChild(ele);
        		}
        	}
        	return pEle;
        },
        getDatas:function(isCheck){
        	var arr=[];
        	var listEle=this.element.querySelector(".ui-list");
        	var list=listEle.children;
            var outPutParam=this.outPutParam;
            var amountName=this.amountName,amountVal;
            var outPutData;
            if(isCheck&&list.length===0){
            	return false;
            }
        	for(var i=0;i<list.length;i++){
        		var obj=this.getData(list[i],isCheck);
        		if(obj===false){//当getData返回false时，不将数据放入数组中
        			if(isCheck){//提交表格数据时，传入isCheck，会校验合法性，如果不合法则不提交，直接返回false
        				return false;
        			}else{
        				continue;
        			}
        		}
        		arr.push(obj);
        	}
        	if(amountName){//需要提交合计的列
        		var tfoot=this.element.querySelector("tfoot");
        		if(tfoot){
        			amountVal=tfoot.querySelector('[name="'+amountName+'"]').textContent;
        		}
        	}
            if(outPutParam){
                outPutData={};
                outPutData[outPutParam]=arr;
                amountName&&(outPutData[amountName]=amountVal);
            }else{
                outPutData=arr;
            }
        	return outPutData;
        },
        getInputEleData:function(ele,isCheck){
            var data={};
            //input类型
            var inputEles=ele.querySelectorAll("input");
            for(var i=0;i<inputEles.length;i++){
                var oneEle=inputEles[i];
                var name=oneEle.getAttribute("name"),
                    value=oneEle.value;
                var cango=this.checkValue(oneEle,name,value);
                if(isCheck&&!cango){
                	return false;
                }else{
                    data[name]=value;
                }
            }
            //textarea类型
            var textareaEles=ele.querySelectorAll("textarea");
            for(var j=0;j<textareaEles.length;j++){
                var oneEle=textareaEles[j];
                var name=oneEle.getAttribute("name"),
                    value=oneEle.textContent;
                var cango=this.checkValue(oneEle,name,value);
                 if(isCheck&&!cango){
                	return false;
                }else{
                    data[name]=value;
                }
            }
            //select类型
            var selectEles=ele.querySelectorAll("select");
            for(var k=0;k<selectEles.length;k++){
                var oneEle=selectEles[k];
                var name=oneEle.getAttribute("name"),
                    value=oneEle.value;
                var cango=this.checkValue(oneEle,name,value);
                 if(isCheck&&!cango){
                	return false;
                }else{
                    data[name]=value;
                }
            }
            return data;
        },
        getData:function(ele,isCheck){
            //获取输入框中的数据
        	var data=this.getInputEleData(ele,isCheck);
            if(data===false){
                return false;
            }
            //获取其他需要提交的数据,
            var headDatas=this.data||[],obj,name,val,tdEle;
            for(var i=0,l=headDatas.length;i<l;i++){
            	obj=headDatas[i];
            	if(!obj||obj.notCommit){
            		continue;
            	}
            	name=obj.name;
            	if(!data.hasOwnProperty(name)){
            		tdEle=ele.querySelector("[name="+name+"]");
            		if(tdEle){
            			val=tdEle.textContent;
            		}else{
            			val="";
            		}
            		data[name]=val;
            	}
            }

        	/*//将需要的其他数据填入data,默认读取全部数据
        	var index=ele.getAttribute("ui-index");
        	var list=this.list||[];
        	if(list[index]){
        		for(var a in list[index]){
        			if(!data.hasOwnProperty(a)){
        				data[a]=list[index][a];
        			}
        		}
        	}*/
        	
        	return data;
        },
        checkValue:function(ele,name,value){
        	var pEle=this.getCurrCol(ele);
        	var index=pEle.getAttribute("ui-index");
        	var obj=this.data[index];
        	var type,min,max,minlen,maxlen,reg,required;
        	type=ele.getAttribute("ui-type");
        	required=ele.getAttribute("ui-required");
        	min=ele.getAttribute("ui-min");
        	max=ele.getAttribute("ui-max");
        	minlen=ele.getAttribute("ui-minlen");
        	maxlen=ele.getAttribute("ui-maxlen");
        	reg=ele.getAttribute("ui-reg");
        	/*var type=obj.type,
        		min=obj.min,
        		max=obj.max,
        		minlen=obj.minlen,
        		maxlen=obj.maxlen,
        		reg=obj.reg,
        		required=String(obj.required);*/
        	var otherEle,otherVal;//用于multinum类型
        	//非空验证
        	if(isBlank(value)&&required==="true"){
        		if(type==="multinum"){//双数量时，两者填其一即可
        			if(name===obj.name){//当前是分销数量，则检验单品数量
        				otherEle=pEle.querySelector('[name="'+obj.singleName+'"]');
        			}else if(name===obj.singleName){//当前是单品数量则检验分销数量
        				otherEle=pEle.querySelector('[name="'+obj.name+'"]');
        			}
        			otherVal=otherEle.value;
        			if(isBlank(otherVal)){
        				if(name===obj.name){
	        				this.showError(ele,"required");
	        			}else{
	        				this.showError(otherEle,"required");
	        			}
        				return false;
        			}else{
        				this.releaseError(ele);
        				this.releaseError(otherEle);
        				return true;
        			}
        		}else{
        			this.showError(ele,"required");
        			return false;
        		}
        		
        	}
        	if(isBlank(value)){
        		this.releaseError(ele);
        		return true;
        	}
        	//最小值，一般是数值型验证
        	if(!isBlank(min)){
        		//如果min不是个具体数值，先取其值
        		if(!/^\d+$/.test(min)){
        			min=(pEle.parentElement.querySelector('[name="'+min+'"]')||{}).textContent;
        		}
        		if(!isBlank(min)&&Number(min)>Number(value)){
	        		this.showError(ele,"min");
	        		return false;
	        	}
        	}
        	//最大值，一般是数值型验证
        	if(!isBlank(max)){
        		//如果min不是个具体数值，先取其值
        		if(!/^\d+$/.test(max)){
        			max=(pEle.parentElement.querySelector('[name="'+max+'"]')||{}).textContent;
        		}
		    	if(!isBlank(max)&&Number(max)<Number(value)){
		    		this.showError(ele,"max");
		    		return false;
		    	}
		    }
        	//最小长度，一般是text类型验证
        	if(!isBlank(minlen)&&Number(minlen)>value.length){
        		this.showError(ele,"minlen");
        		return false;
        	}
        	//最大长度，一般是text类型验证
        	if(!isBlank(maxlen)&&Number(maxlen)<value.length){
        		this.showError(ele,"maxlen");
        		return false;
        	}
        	//正则验证
        	if(!isBlank(reg)){
        		reg=eval(reg);
        		if(!reg.test(value)){
        			this.showError(ele,"reg");
        			return false;
        		}
        	}
    		this.releaseError(ele);
        	return true;
        },
        showError:function(ele,type){
        	var className=ele.getAttribute("class")||"";
        	className=className.replace("ui-error","");
        	className=className+" ui-error";
        	className=className.replace(/\s+/g," ");
        	ele.setAttribute("class",className);
            var msg="";
            if(type==="required"){
                msg="必填项不能为空";
            }else if(type==="minlen"){
                msg="输入内容不能小于最小长度";
            }else if(type==="maxlen"){
                msg="输入内容不能大于最大长度";
            }else if(type==="min"){
                msg="输入数值不能小于最小值";
            }else if(type==="max"){
                msg="输入数值不能大于最大值";
            }else if(type==="reg"){
                msg="输入内容格式不正确";
            }
            ele.nextElementSibling.textContent=msg;
        },
        releaseError:function(ele){
        	var className=ele.getAttribute("class")||"";
        	className=className.replace("ui-error","");
        	className=className.replace(/\s+/g," ");
        	ele.setAttribute("class",className);
            if(ele.nextElementSibling){
            	ele.nextElementSibling.textContent="";
            }
        },
        addRow:function(){
        	var data=this.getNewRowData();
        	this.setDatas([data]);
        },
        doCheckRow:function(){
        	var that=this;
        	return function(e){
	        	var target=e.target;
	        	var tagName=target.tagName.toLowerCase();
	        	var noCheckTag=["input","select","textarea"];//不响应单击事件
	        	if(noCheckTag.indexOf(tagName)!==-1){
	        		return;
	        	}
	        	var tr=that.getCurrRow(target);
	        	var className=tr.getAttribute("class");
	        	var classList=className.split(/\s+/g);
	        	var activeClass="active";
	        	var index=classList.indexOf(activeClass);
	        	if(index===-1){
	        		classList.push(activeClass);
	        	}else{	
	        		classList.splice(index,1);
	        	}
	    		tr.setAttribute("class",classList.join(" "));
	    	}
        },
        delRows:function(){
        	var checkRow=this.getCheckRow();
        	var checkRowData=this.getCheckRowData();
        	var listEle=this.element.querySelector(".ui-list");
        	for(var i=0;i<checkRow.length;i++){
        		listEle.removeChild(checkRow[i]);
        	}
        	 if(this.colCount){
                this.doColCount();
            }
        	return checkRowData;
        },
        getCheckRow:function(){
        	var listEle=this.element.querySelector(".ui-list");
        	var checkRow=listEle.querySelectorAll(".active.ui-row");
        	return checkRow;
        },
        getCheckRowData:function(){
        	var checkRow=this.getCheckRow();
        	var arr=[];
        	for(var i=0;i<checkRow.length;i++){
        		var obj=this.getData(checkRow[i]);
        		if(obj===false){
        			continue;
        		}else{
        			arr.push(obj);
        		}
        	}
        	return arr;
        }
	};
	return Func;
});