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
		REG_V2: /(#qiyiV2\s*\r\n\s*root\s*E:\/\/Work\/qiyi\/)([\u4e00-\u9fa5a-zA-Z0-9]+)(;\r\n\s)*/,
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


// 获取当前分支：
app.get("/getCurBranch", function (req, res) {
	fs.readFile(cfg.NGINX_CFG_URL, {
		encoding: "utf-8"
	}, function (err, data) {
		if (err) {
			console.log(err);
			return;
		}

		var result = data.match(cfg.REG_V2);

		console.log("Current Branch------>", result? result[2]: result);

		res.send({
			"status": "ok",
			name: result? result[2]: result
		})
	});
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

		console.log("All Branch------>", dirNames);

		res.send({
			status: "ok",
			names: dirNames
		});
	});
});

app.get("/switch", function (req, res) {

	var branchName = req.query.name;

	console.log("Switch To------>", branchName);

	// 读取分支文件
	fs.readFile(cfg.NGINX_CFG_URL, {
		encoding: "utf-8"
	}, function (err, data) {
		if (err) {
			console.log(err);
			return;
		}

		var newData = data.replace(cfg.REG_V2, "$1" + branchName + "$3");

		// 写回文件
		fs.writeFile(cfg.NGINX_CFG_URL, newData, function (err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log("Switch Branch Success");
			// 执行nginx reload命令
			child = exec(cfg.RELOAD_CMD,
		  		function (error, stdout, stderr) {
		    		if (error) {
			      		console.log('exec error: ' + error);
			    	}
			    	console.log("Nginx Reload Success");
			    	res.send({
			    		status: "ok"
			    	})
				}
			);
		});
	})	
})

app.listen(8000);





