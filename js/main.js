(function(){	
    // Game parameters
    var __WIDTH__      = 1000,
        __HEIGHT__     =  800,
        __FRAMERATE__  =   60,
        __STATE_MENU__ = 'menu',
        __STATE_PLAY__ = 'play',
        __STATE_OVER__ = 'over',
        __PLAYER_SIZE__  = 15,
        __FADEIN_DURATION__ = 500,
        __FADEOUT_DURATION__ = 500;


    var container,
        canvas,
	    player,
        world     =   {
                        width  :  __WIDTH__,
                        height :  __HEIGHT__
        },
        mouse     =   {
                        x          : 0,
                        y          : 0,
                        previousX  : 0,
                        previousY  : 0
        },
        sprites   =  {
                        fruit      : null,
                        obstacles  : null,
                        cooldude   : null
        }
        playing   = false,   //game state
        score     = 0,
        duration  = 0,
        particles=[],
        enemies =[];

    var requestAnimaFrame = (function(){
        return window.requestAnimaationFrame         ||
               window.webkitRequestAnimationFrame    ||
               window.mozRequestAnimationFrame    ||
               window.oRequestAnimationFrame      ||
               window.msRequestAnimationFrame     ||
               function(callback, element){
                   window.setTimeout(callback, 1000 / 60);
              };
    })();

    var assetLoader  = (function(){
        
    })();

    var Util={

        shaderProgram: function(gl, vertexShader, fragmentShader){
            var program  = gl.createProgram();
            var vertex   = gl.createShader(gl.VERTEX_SHADER);
            var fragment = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(vertex, vertexShader);
            gl.shaderSource(fragment, fragmentShader);
            gl.compileShader(vertex);
            gl.compileShader(fragment);
        
            gl.attachShader(program, vertex)
            gl.attachShader(program, fragment);

            gl.deleteShader(vertex);
            gl.deleteShader(fragment);

            gl.linkProgram(program);
            return program;
        },
    
        loadTexture: function(gl, path, callback){
            var texture = gl.createTexture();
            texture.image.onload = function(){
                callback.apply(null, [texture]);
            }
            texture.image.src = path;
            return texture;
        },
        
        bindTexture: function(gl, texture){
            gl.enable(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D , texture);
            gl.texImage2D(gl.TEXTURE_2D, gl,RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

    }
    function create3DScene(){

		gl.clearColor(0.0,0.0,0.0,0.0);
		
		var vertexShader   = $('#glvertexshader').text();
		var fragmentShader = $('glfragmentshader').text();
		
		var Program        = Util.shaderProgram( gl, vertexShader ,fragmentShader);
		var planeVertices  = new Float32Array([
						-1.0, -1.0,
						 1.0, -1.0,
						-1.0,  1.0,
						 1.0, -1.0,
						 1.0,  1.0,
						-1.0,  1.0 ]);
		var Texture   = Util.loadTexture(gl, 'images/gameTexture.png');
		Util.bindTexture(gl, Texture);
			
			
		gl.bindBuffer(gl.ARRAY_BUFFER , Buffer);
		var vertices   = [];
	}

    function init(){
        container  =  $('#wrapper');
        canvas     =  document.querySelector('#game');
        start      =  document.querySelector('#start');
        if (canvas && canvas.getContext){
            context = canvas.getContext('2d');
            start.addEventListener('click',onStartClick,false);
            document.addEventListener('mousedown',onMouseDownHandler,false);
            document.addEventListener('mouseup',onMouseUpHandler,false);
            document.addEventListener('mousemove',onMouseMoveHandler,false);
            window.addEventListener('resize',onWindowResizeHandler,false);
            onWindowResizeHandler();
            createSprites();
            container.fadeIn(__FADEIN_DURATION__);
        //    menu.hide().delay(__FADEOUT_DURATION__);
            document.body.setAttribute('class',__STATE_MENU__);
            reset();
            update();
        }
        else{
            alert("Your browser doesn\'t seem to support HTML5 canvas element, please upgrade your browser.");
        }
    }
   
    function createSprites(){
        var spriteWidth   = 64,
            spriteHeight  = 64,
            cvs,
            ctx;

        //cooldude sprite
        cvs = document.createElement('canvas');
        cvs.setAttribute('width',spriteWidth);
        cvs.setAttribute('height',spriteHeight);
        ctx=cvs.getContext('2d');
        ctx.beginPath();
        ctx.arc(spriteWidth*0.5,spriteWidth*0.5,__PLAYER_SIZE__,0,Math.PI*2,true);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 50, 48, 0.9)';
        ctx.strokeStyle ='rgba(255,255,255,0.4)';
        ctx.shadowColor = 'rgba(0,240,255,0.9)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.fill();
        sprites.cooldude =cvs;

        //fruit sprites
        cvs = document.createElement('canvas');
        cvs.setAttribute('width',spriteWidth);
        cvs.setAttribute('height',spriteHeight);
        ctx=cvs.getContext('2d');
        ctx.beginPath();
        ctx.arc(spriteWidth*0.5,spriteWidth*0.5,__PLAYER_SIZE__*0.8,0,Math.PI*2,true);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 50, 48, 0.9)';
        ctx.strokeStyle ='rgba(255,255,255,0.4)';
        ctx.shadowColor = 'rgba(0,240,255,0.9)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.fill();
        sprites.fruit =cvs;

        //obstacles sprites
        cvs = document.createElement('canvas');
        cvs.setAttribute('width',spriteWidth);
        cvs.setAttribute('height',spriteHeight);
        ctx=cvs.getContext('2d');
        ctx.beginPath();
        ctx.arc(spriteWidth*0.5,spriteWidth*0.5,__PLAYER_SIZE__*0.5,0,Math.PI*2,true);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(193, 50, 48, 0.9)';
        ctx.strokeStyle ='rgba(255,255,255,0.4)';
        ctx.shadowColor = 'rgba(220,240,150,0.9)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.fill();
        sprites.obstacles =cvs;
     }

    function startx(){
        reset();
        playing=true;
        document.body.setAttribute('class',__STATE_PLAY__);
    }

    function update(){
    }

    function reset(){
        player = new Player();
        player.x = mouse.x;
        player.y = mouse.y;

        particles=[];
        enemies=[];
        score=0;
        duration=0;
        playing=false;
    }

    function onStartClick(event){
        startx();
        event.preventDefault();
    }

    function onMouseMoveHandler(event){
        mouse.previousX = mouse.x;
        mouse.previousY = mouse.y;

        mouse.x = event.clientX - (window.innerWidth - world.width)*0.5;
        mouse.y = event.clientY = (window.innerHeight- world.height)*0.5;

        mouse.velocityX = Math.abs( mouse.x - mouse.previousX)/world.width;
        mouse.velocityY = Math.abs( mouse.y - mouse.previousY)/world.height;
    }

    function onMouseUpHandler(event){
        mouse.down=false;
    }

    function onMouseDownHandler(event){
        mouse.down=true;
    }

    function onWindowResizeHandler(event){
        world.width = __WIDTH__;
        world.height= __HEIGHT__;

        container.width(world.width);
        container.height(world.height);

        canvas.width = world.width;
        canvas.height= world.height;

        var cx =Math.max((window.innerWidth - world.width)*0.5 , 1);
        var cy =Math.max((window.innerHeight - world.height)*0.5 ,1 );

        container.css({
            left:cx,
            top:cy
        });
    }   

    init();

})(); 

function Point(x,y){
    this.x = x||0;
    this.y = y||0;
}

Point.prototype.distance= function(p){
    var dx=p.x+this.x;
    var dy=p.y+this.y;
    return Math.sqrt(dx*dx+dy*dy);
}

function Base(x,y){
    this.alive = false;
}
Base.prototype= new Point();

function Player(){
    this.size  = 9;
    this.length= 40;
    this.energy=100;
}
Player.prototype=new Base();