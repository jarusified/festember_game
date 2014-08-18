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
