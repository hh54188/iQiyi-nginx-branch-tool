var express = require("express");
var path = require("path");
var fs = require('fs');
var exec = require('child_process').exec;
 
var app = express();
app.use(express.static(path.join(__dirname, "public")));

// 配置文件
var CFG = {
	WIN: {
		WORK_DIR: "E://Work/qiyi/",
		NGINX_CFG_URL: "C://nginx-1.5.8/conf/nginx.conf",
		RELOAD_CMD: "nginx -s reload"
	},
	LIN: {

	}
}

var cfg = (function () {
	if (/^win/.test(process.platform)) {
		return CFG.WIN;
	} else {
		return CFG.LIN;
	}
})();


fs.readFile(cfg.NGINX_CFG_URL, {
	encoding: "utf-8"
}, function (err, data) {
	if (err) {
		console.log(err);
		return;
	}

	var result = data.match(/#qiyiV2/);
	console.log(result);
})	




// 读取所有分支
app.get("/getdirs", function (req, res) {

	// 读取路径下的所有分支文件夹
	fs.readdir(cfg.WORK_DIR, function (err, files) {
		if (err) {
			console.log(err);
			return;
		}

		var dirNames = [];

		files.forEach(function (name) {
			if (name.indexOf(".") <= -1 && name !== "js") {
				dirNames.push(name);
			}
		});

		res.send({
			status: "ok",
			names: dirNames
		});
	});
});

app.get("/switch", function (req, res) {

	var branchName = req.query.name;

	// 切换分支，覆盖conf文件夹
	fs.readFile(cfg.NGINX_CFG_URL, {
		encoding: "utf-8"
	}, function (err, data) {
		if (err) {
			console.log(err);
			return;
		}

		data = data.replace("master", "hello");

		fs.writeFile(cfg.NGINX_CFG_URL, data, function (err) {
			if (err) {
				console.log(err);
				return;
			}
		});

		// 执行nginx reload命令
		child = exec('nginx -s reload',
	  		function (error, stdout, stderr) {
	    		console.log('stdout: ' + stdout);
	    		console.log('stderr: ' + stderr);
	    		if (error !== null) {
	      		console.log('exec error: ' + error);
	    	}
		});
	})	
})

app.listen(8000);





