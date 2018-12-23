

//盤面の作画
(function(){
	
	//ボード
	const board_width = size*8 + size/2 + 1*7;
	const board_height = board_width;
	
	const svg = d3.select("#board");
	
	//デバイスの判定
	const getDevice = function() {
		const userAgent = navigator.userAgent;
		if(userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPod') > 0 || userAgent.indexOf('Android') > 0 && userAgent.indexOf('Mobile') > 0){
			return 'sp';
		}else if(userAgent.indexOf('iPad') > 0 || userAgent.indexOf('Android') > 0){
			return 'tab';
		}else{
			return 'pc';
		}
	};
	const device = getDevice();
	
	//クリックイベントの追加
	svg.on(device==='pc'?'click':'touchend',function(){
		d3.event.preventDefault();
		let [x,y] = d3.mouse(this);
		let a, b;
		for(let i=0;i<8;i++){
			if(Math.abs(size/4+size*i+i+size/2-x)<size/2.2){
				a = i;
			}
			if(Math.abs(size/4+size*i+i+size/2-y)<size/2.2){
				b = i;
			}
		}
		if(a===undefined || b===undefined){
			return;
		}
		if(master.mode==='setup'){
			master.now.setupBoard(b*8+a+1);
			master.render();
		}else if(master.mode==='analysis'){
			master.analysis(b*8+a+1);
		}else{
			const e = b*8+a+1;
			const hand1 = e<33? 1<<(32-e) : 0;
			const hand2 = e<33? 0 : 1<<(64-e);
			master.play(hand1, hand2);
		}
		
	});



	svg	.attr("width" , board_width)
		.attr("height" , board_height)
		.append("rect")
		.attr({
			x:		0,
			y:		0,
			width:	board_width,
			height:	board_height,
			fill:	"#f9f9f9",
			id:		"bgrect"
			
		});
		
	canvas.green = svg.append("rect").attr({
			x:		size/4-1,
			y:		size/4-1,
			width:	size*8+9,
			height:	size*8+9,
			fill:	"#000000"
		});
	
	canvas.squares = new Array();
	for(let i=0;i<8;i++){
		for(let j=0;j<8;j++){
			canvas.squares.unshift(svg.append("rect"));
			canvas.squares[0].attr({
				x:size/4+size*j+j,
				y:size/4+size*i+i,
				width:size,
				height:size,
				fill:"#cccccc"
			});
		}
	}
	
	canvas.circles = new Array();
	for(let i=0;i<8;i++){
		for(let j=0;j<8;j++){
			canvas.circles[i*8+j+1] = svg.append("circle");
			canvas.circles[i*8+j+1].attr({
				cx:size/4+size*j+j+size/2,
				cy:size/4+size*i+i+size/2,
				r:0,
				id:"disc"+(i*8+j+1),
				fill:"none"
			});
		}
	}
	
	//4つのくろい点を書く
	canvas.dot = new Array(4);
	canvas.dot[0] = svg.append('circle').attr({
		cx:size/4+size*2+2-0.5,cy:size/4+size*2+2-0.5,
		r:size/15,fill:'black'
	});
	canvas.dot[1] = svg.append('circle').attr({
		cx:size/4+size*2+2-0.5,	cy:size/4+size*6+6-0.5,
		r:size/15,fill:'black'
	});
	canvas.dot[2] = svg.append('circle').attr({
		cx:size/4+size*6+6-0.5,cy:size/4+size*2+2-0.5,
		r:size/15,fill:'black'
	});
	canvas.dot[3] = svg.append('circle').attr({
		cx:size/4+size*6+6-0.5,cy:size/4+size*6+6-0.5,
		r:size/15,fill:'black'
	});
	
	canvas.cpuput = svg.append("circle");
	canvas.cpuput.attr({
		cx:0,cy:0,r:0,fill:"#f44250"
	});
	
	
	
	////////////////////////////////////ヘッダー
	const header = d3.select("#header");
	
	//クリックイベントの追加
	header.on(device==='pc'?'click':'touchend',function(){
		d3.event.preventDefault();
	});
	
	header.attr("width" , board_width)
		.attr("height" , board_width/5);
		
	header.append("rect").attr({
		x:		0,
		y:		0,
		width:	board_width,
		height:	board_width/5,
		fill:	"#f9f9f9"
	})
	.on(device==='pc'?'click':'touchend',()=>{
		d3.event.preventDefault();
	});
		
	
	//枚数表示の部分
	canvas.bscorerect = header.append('g').attr('transform',()=>{
		return 'translate(' + size*0 + ',' + size*0 + ')';
	});
	canvas.bscorerect.append('rect').attr({
		x:size/5,
		y:size/5,
		width:size*2,
		height:size*3/4,
		rx:5,
		fill:"#dfdfdf"
	});
	canvas.bscorerect.append("circle").attr({
		cx:size*(1/2+1/5),
		cy:size*(1/2+0.07),
		r:size*3/12,
		fill:"#292929",
		stroke:"#292929",
		"stroke-width":size/40
	});
	canvas.bscore = canvas.bscorerect.append("text").attr({
		x:size*(1.3),
		y:size*(0.72)
	}).text("2");
	
	canvas.wscorerect = header.append('g').attr('transform',()=>{
		return 'translate(' + size*2.5 + ',' + size*0 + ')';
	});
	canvas.wscorerect.append('rect').attr({
		x:size/5,
		y:size/5,
		width:size*2,
		height:size*3/4,
		rx:5,
		fill:"#dfdfdf"
	});
	canvas.wscorerect.append("circle").attr({
		cx:size*(1/2+1/5),
		cy:size*(1/2+0.07),
		r:size*3/12,
		fill:"#ffffff",
		stroke:"#a0a0a0",
		"stroke-width":size/40
	});
	canvas.wscore = canvas.wscorerect.append("text").attr({
		x:size*(1.3),
		y:size*(0.72)
	}).text("2");
	
	
	
	
	
	canvas.thinking = header.append("text").attr({
		x: size*(5.1),
		y: size*(0.72)
	}).text("GAME MODE");
	
	
	
	
	//newgameぼたｎ
	canvas.newgame = header.append('g').attr('transform',()=>{
		return 'translate(' + size*0.4 + ',' + size*1.2 + ')';
	});
	canvas.newgame.append('rect').attr({
		x:0,y:0,width:size/2,height:size/2,
		fill:"#ffffff",stroke:'#000000'
	});
	canvas.newgame.append('line').attr({x1:size/4,x2:size/4,y1:0,y2:size/2,stroke:'#000000'});
	canvas.newgame.append('line').attr({y1:size/4,y2:size/4,x1:0,x2:size/2,stroke:'#000000'});
	canvas.newgame.append('circle').attr({cx:size/8,cy:size/8,r:size*0.4/6,fill:'#ffffff',stroke:'#000000'});
	canvas.newgame.append('circle').attr({cx:size/8*3,cy:size/8*3,r:size*0.4/6,fill:'#ffffff',stroke:'#000000'});
	canvas.newgame.append('circle').attr({cx:size/8*3,cy:size/8,r:size*0.4/6,fill:'#000000'});
	canvas.newgame.append('circle').attr({cx:size/8,cy:size/8*3,r:size*0.4/6,fill:'#000000'});
	canvas.newgame.on(device==='pc'?'mouseup':'touchend', function(){
		function newgame(){
			master.resetGame();
			canvas.thinking.text('GAME MODE');
			canvas.bscorerect.attr('transform',()=>{
				return 'translate(' + size*0 + ',' + size*0 + ')';
			});
			canvas.wscorerect.attr('transform',()=>{
				return 'translate(' + size*2.5 + ',' + size*0 + ')';
			});
			master.render();
			master.visualizeLastPut(0);
			master.visualizeMove();
		}
		function cancel(){
			return;
		}
		
		confirmwindow(newgame,cancel,'start new game?');
		
		d3.event.preventDefault();
	});
	
	//ロード
	canvas.loadfile = header.append('g').attr('transform',()=>{
		return 'translate(' + size*1.4 + ',' + size*1.2 + ')';
	});
	canvas.loadfile.append('rect').attr({
		x:0,y:0,width:size/2,height:size/2,
		fill:"#ffffff",stroke:'#000000'
	});
	canvas.loadfile.append('line').attr({x1:size*0.25,x2:size*0.25,y1:size*0.1,y2:size*0.4,stroke:'#000000'});
	canvas.loadfile.append('line').attr({y1:size*0.25,y2:size*0.4,x1:size*0.1,x2:size*0.25,stroke:'#000000'});
	canvas.loadfile.append('line').attr({y1:size*0.25,y2:size*0.4,x1:size*0.4,x2:size*0.25,stroke:'#000000'});
	canvas.loadfile.on(device==='pc'?'mouseup':'touchend' , function(){
		canvas.comment.text('loading.. please wait');
		master.ai.ev.importWeights();
		d3.event.preventDefault();
	});
	
	//ファイルを選ぶ
	canvas.selectfile = header.append('g').attr('transform',()=>{
		return 'translate(' + size*2.4 + ',' + size*1.7 + ') rotate(' + -90 + ')' ;
	});
	canvas.selectfile.append('rect').attr({
		x:0,y:0,width:size/2,height:size/2,
		fill:"#ffffff",stroke:'#000000'
	});
	canvas.selectfile.append('line').attr({x1:size*0.25,x2:size*0.25,y1:size*0.1,y2:size*0.4,stroke:'#000000'});
	canvas.selectfile.append('line').attr({y1:size*0.25,y2:size*0.4,x1:size*0.1,x2:size*0.25,stroke:'#000000'});
	canvas.selectfile.append('line').attr({y1:size*0.25,y2:size*0.4,x1:size*0.4,x2:size*0.25,stroke:'#000000'});
	canvas.selectfile.on(device==='pc'?'mouseup':'touchend', function(){
		canvas.comment.text('loading.. please wait');
		master.ai.ev.importPng();
		d3.event.preventDefault();
	});
	
	
	//ヘルプ
	canvas.help = header.append('g').attr('transform',()=>{
		return 'translate(' + size*3.4 + ',' + size*1.2 + ') scale(' + 1 + ')' ;
	});
	canvas.help.append('rect').attr({x:0,y:0,width:size/2,height:size/2,fill:'none',stroke:'#000000'});
	canvas.help.append('path').attr('d'," M396.138,85.295c-13.172-25.037-33.795-45.898-59.342-61.03C311.26,9.2,280.435,0.001,246.98,0.001 c-41.238-0.102-75.5,10.642-101.359,25.521c-25.962,14.826-37.156,32.088-37.156,32.088c-4.363,3.786-6.824,9.294-6.721,15.056 c0.118,5.77,2.775,11.186,7.273,14.784l35.933,28.78c7.324,5.864,17.806,5.644,24.875-0.518c0,0,4.414-7.978,18.247-15.88 c13.91-7.85,31.945-14.173,58.908-14.258c23.517-0.051,44.022,8.725,58.016,20.717c6.952,5.941,12.145,12.594,15.328,18.68 c3.208,6.136,4.379,11.5,4.363,15.574c-0.068,13.766-2.742,22.77-6.603,30.442c-2.945,5.729-6.789,10.813-11.738,15.744 c-7.384,7.384-17.398,14.207-28.634,20.479c-11.245,6.348-23.365,11.932-35.612,18.68c-13.978,7.74-28.77,18.858-39.701,35.544 c-5.449,8.249-9.71,17.686-12.416,27.641c-2.742,9.964-3.98,20.412-3.98,31.071c0,11.372,0,20.708,0,20.708 c0,10.719,8.69,19.41,19.41,19.41h46.762c10.719,0,19.41-8.691,19.41-19.41c0,0,0-9.336,0-20.708c0-4.107,0.467-6.755,0.917-8.436 c0.773-2.512,1.206-3.14,2.47-4.668c1.29-1.452,3.895-3.674,8.698-6.331c7.019-3.946,18.298-9.276,31.07-16.176 c19.121-10.456,42.367-24.646,61.972-48.062c9.752-11.686,18.374-25.758,24.323-41.968c6.001-16.21,9.242-34.431,9.226-53.96 C410.243,120.761,404.879,101.971,396.138,85.295z")
	.attr('transform',()=>{
		return 'translate(' + size*0.09 + ',' + size*0.09 + ') scale(' + 0.025 + ')' ;
	});
	canvas.help.append('path').attr('d',"M228.809,406.44c-29.152,0-52.788,23.644-52.788,52.788c0,29.136,23.637,52.772,52.788,52.772 c29.136,0,52.763-23.636,52.763-52.772C281.572,430.084,257.945,406.44,228.809,406.44z")
	.attr('transform',()=>{
		return 'translate(' + size*0.09 + ',' + size*0.09 + ') scale(' + 0.025 + ')' ;
	});
	canvas.help.on(device==='pc'?'mouseup':'touchend', function(){
		d3.event.preventDefault();
		if(!showhelp){
			d3.select('#help').style('display','block');
			showhelp = true;
			return;
		}else{
			d3.select('#help').style('display','none');
			showhelp = false;
			return;
		}
	});
	
	//白黒入れ替え
	canvas.switchcolors = header.append('g').attr('transform',()=>{
		return 'translate(' + size*4.4 + ',' + size*1.2 + ') scale(' + 1 + ')' ;
	});
	canvas.switchcolors.append('rect').attr({x:0,y:0,width:size/2,height:size/2,fill:'#ffffff',stroke:'#000000'});
	canvas.switchcolors.append('polygon').attr({points:'1,1 19,19 1,19',stroke:'#000000'});
	canvas.switchcolors.on(device==='pc'?'mouseup':'touchend', function(){
		d3.event.preventDefault();
		if(master.state===3){
			return;
		}
		if(master.mode==='gameb'){
			master.mode = 'gamew';
			canvas.thinking.text('GAME MODE');
			canvas.bscorerect.attr('transform',()=>{
				return 'translate(' + size*2.5 + ',' + size*0 + ')';
			});
			canvas.wscorerect.attr('transform',()=>{
				return 'translate(' + size*0 + ',' + size*0 + ')';
			});
			master.ai.colorOfCpu = 1;
			master.play(0);
		}else if(master.mode==='gamew'){
			master.mode = 'gameb';
			canvas.thinking.text('GAME MODE');
			canvas.bscorerect.attr('transform',()=>{
				return 'translate(' + size*0 + ',' + size*0 + ')';
			});
			canvas.wscorerect.attr('transform',()=>{
				return 'translate(' + size*2.5 + ',' + size*0 + ')';
			});
			master.ai.colorOfCpu = -1;
			master.play(0);
		}
	});
	
	//解析モード
	canvas.analysis = header.append('g').attr('transform',()=>{
		return 'translate(' + size*5.4 + ',' + size*1.2 + ') scale(' + 1.1 + ')' ;
	});
	canvas.analysis.append('rect').attr({
		x:0,y:0,width:size/2,height:size/2,fill:'#ffffff',stroke:'#000000',
		transform:()=>{
			return 'scale(' + 1/1.1 + ')';
		}
	});
	canvas.analysis.append('rect').attr({x:size*0.15,y:size*0.1,width:size*0.2,height:size*0.3,fill:'#000000',stroke:'#000000'});
	canvas.analysis.append('rect').attr({x:size*0.12,y:size*0.07,width:size*0.2,height:size*0.3,fill:'#ffffff',stroke:'#ffffff'});
	canvas.analysis.append('rect').attr({x:size*0.11,y:size*0.05,width:size*0.2,height:size*0.3,fill:'#000000',stroke:'#000000'});
	canvas.analysis.append('circle').attr({cx:size*0.26,cy:size*0.27,r:size*0.08,fill:'#000000',stroke:'#ffffff','stroke-width':0.6});
	canvas.analysis.append('circle').attr({cx:size*0.26,cy:size*0.27,r:size*0.03,fill:'#ffffff',stroke:'#ffffff'});
	canvas.analysis.append('line').attr({x1:size*0.3,y1:size*0.3,x2:size*0.4,y2:size*0.4,stroke:'#000'});
	canvas.analysis.on(device==='pc'?'mouseup':'touchend', function(){
		function newanalysis(){
			master.resetGame();
			master.mode = 'analysis';
			canvas.thinking.text('ANALYSIS MODE');
			master.render();
			master.visualizeLastPut(0);
			master.visualizeMove();
			master.visualizeEvaluation();
		}
		function cancel(){
			return;
		}
		
		confirmwindow(newanalysis,cancel,'start new analysis mode?');
		
		d3.event.preventDefault();
	});
	
	
	//セットアップモード
	canvas.setup = header.append('g').attr('transform',()=>{
		return 'translate(' + size*6.4 + ',' + size*1.2 + ') scale(' + 1.1 + ')' ;
	});
	canvas.setup.append('rect').attr({
		x:0,y:0,width:size/2,height:size/2,fill:'#ffffff',stroke:'#000000',
		transform:()=>{
			return 'scale(' + 1/1.1 + ')';
		}
	});
	canvas.setup.append('rect').attr({x:size*0.15,y:size*0.1,width:size*0.2,height:size*0.3,fill:'#000000',stroke:'#000000'});
	canvas.setup.append('rect').attr({x:size*0.12,y:size*0.07,width:size*0.2,height:size*0.3,fill:'#ffffff',stroke:'#ffffff'});
	canvas.setup.append('rect').attr({x:size*0.11,y:size*0.05,width:size*0.2,height:size*0.3,fill:'#000000',stroke:'#000000'});
	canvas.setup.on(device==='pc'?'mouseup':'touchend', ()=>{
		
		if(master.mode==='setup'){
			//既にsetupもーどだったら
			const now = master.now;
			master.resetGame();
			master.record = [new Board(now)]
			master.mode = 'analysis';
			if(window.confirm('black turn?')){
				master.currentTurn = 1;
			}else{
				master.currentTurn = -1;
			}
			
			canvas.thinking.text('ANALYSIS MODE');
			master.render();
			master.visualizeLastPut(0);
			master.visualizeMove();
			master.visualizeEvaluation();
			return;
		}
		if(!window.confirm('start setup mode?')){
			return;
		}
		master.render();
		master.mode = 'setup';
		canvas.thinking.text('SETUP MODE');
	});
	
	
	//undo
	canvas.undo = header.append('g').attr('transform',()=>{
		return  'translate(' + size*8.4 + ',' + size*1.7 + ') rotate(' + 180 + ')' ;
	});
	canvas.undo.append('rect').attr({x:0,y:0,width:40,height:20,fill:'#ffffff',stroke:'#000000'});
	canvas.undo.append('polygon').attr({points:'12,7 22,7 22,4 28,10 22,16 22,13 12,13',stroke:'#000000'});
	canvas.undo.on(device==='pc'?'mouseup':'touchend',()=>{
		d3.event.preventDefault();
		if(master.mode==='analysis'){
			if(master.record.length===1){return;}
			master.record.shift();
			master.render();
			//master.record[0].showEvaluation();
			return;
		}
		
		if(master.record.length<3){
			return;
		}
		master.record.shift();
		const a = master.now.currentTurn;
		while(true){
			if(master.now.currentTurn===a){
				master.record.shift();
			}else{
				break;
			}
		}
		master.render();
		master.visualizeMove();
		master.visualizeLastPut();
	});
	
	
	
	//ヘッダーのジェスチャー
	header.on(device==='pc'?'mousedown':'touchstart',function(){
		const x = d3.mouse(this)[0];
		if(x<board_width/8){
			location_h = true;
		}else{
			location_h = false;
		}
	});
	header.on(device==='pc'?'mouseup':'touchend',function(){
		const x = d3.mouse(this)[0];
		if(location_h && x>board_width*7/8){
			master.visualizeEvaluation();
		}
	});
	
	
	///////フッター
	const footer = d3.select("#footer");
	
	footer.attr("width" , board_width)
		.attr("height" , board_width/12)
		.append("rect")
		.attr({
			x:		0,
			y:		0,
			width:	board_width,
			height:	board_width/4,
			fill:	"#f9f9f9"
		});
		
	
	
	//状況
	canvas.comment = d3.select('#button').append('div');
	canvas.comment
	.style('display', 'block')
	.text('player turn')
	.on(device==='pc'?'mouseup':'touchend', function(){
		d3.event.preventDefault();
		//canvas.comment.text('perfect');
	});
	
	//buttonの幅を指定
	d3.select('#button')
	.style('display', 'inline-block')
	.style('width', ()=>{return board_width+'px';});
	
	//search depth
	canvas.searchdepth = d3.select('#button').append('div');
	canvas.searchdepth
	.style('width', ()=>{return size*(4.18)+4 + 'px';})
	.text('2 moves')
	.on(device==='pc'?'mouseup':'touchend', function(){
		d3.event.preventDefault();
		switch(master.depth[0]){
			case 1:master.depth[0]=2;break;
			case 2:master.depth[0]=3;break;
			case 3:master.depth[0]=4;break;
			case 4:master.depth[0]=6;break;
			case 6:master.depth[0]=8;break;
			case 8:master.depth[0]=1;break;
			default:console.error('mazui');
		}
		canvas.searchdepth.text(
		''+master.depth[0]+' moves'
		);
		d3.event.stopPropagation();
	});
	//search depth
	canvas.searchdepth1 = d3.select('#button').append('div');
	canvas.searchdepth1
	.style('width', ()=>{return size*(4.18)+4 + 'px';})
	.text('last 4 perfect')
	.on(device==='pc'?'mouseup':'touchend', function(){
		d3.event.preventDefault();
		switch(master.depth[1]){
			case 1:master.depth[1]=2;break;
			case 2:master.depth[1]=4;break;
			case 4:master.depth[1]=6;break;
			case 6:master.depth[1]=8;break;
			case 8:master.depth[1]=12;break;
			case 12:master.depth[1]=14;break;
			case 14:master.depth[1]=16;break;
			case 16:master.depth[1]=1;break;
			default:console.error('mazui');
		}
		canvas.searchdepth1.text(
		'last '+master.depth[1]+' perfect'
		);
	});
	
	
	//ローディングの文字
	canvas.comment.text('loading.. please wait');
	
	
})();

master.render();
master.visualizeMove();
//master.ai.ev.importWeights();

