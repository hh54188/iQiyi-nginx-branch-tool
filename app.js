var express = require("express");
var path = require("path");
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require("path");
 
var app = express();
app.use(express.static(path.join(__dirname, "public")));

var iswindows = /^win/.test(process.platform);
var user = "liguangyi";
var uid = 1000;
var gid = 1000;

// 配置文件
var CFG = {
	WIN: {
		WORK_DIR: "E:\\Work\\qiyi",
		NGINX_CFG_URL: "C:\\nginx-1.5.8\\conf\\nginx.conf",
		REG_V2: /(#qiyiV2\s*[\r\n]+\s*root\s*E:\/\/Work\/qiyi\/)([\u4e00-\u9fa5a-zA-Z0-9]+)(;\r\n\s)*/,
		RELOAD_CMD: "nginx -s reload"
	},	
	LIN: {
		WORK_DIR: "/home/" + user + "/Work/",
		NGINX_CFG_URL: "/etc/nginx/sites-available/default",
		REG_V2: /(#qiyiV2\s*[\r\n]+\s*root\s*\/home\/\w+\/Work\/)([\u4e00-\u9fa5a-zA-Z0-9]+)(;)/,
		RELOAD_CMD: "sudo nginx -s reload"
	}
}

var cfg = (function () {
	if (iswindows) {
		return CFG.WIN;
	} else {
		return CFG.LIN;
	}
})();


// 创建分支
app.get("/createBranch", function (req, res) {

	var branchName = req.query.name;
	var svnUrl = req.query.svn;

	var checkout = function (path) {

		var checkout;
		if (iswindows) {
			checkout = spawn('svn', ['checkout', svnUrl, path]);
		} else {
			checkout = spawn('svn', ['checkout', svnUrl, path],{
				uid: uid,
				gid: gid
			});
		}

		checkout.stdout.on('data', function (data) {
		  console.log('stdout: ' + data);
		});

		checkout.stderr.on('data', function (data) {
		  console.log('stderr: ' + data);
		});

		checkout.on('close', function (code) {
		  console.log('child process exited with code ' + code);
		});
	}

	fs.exists(path.join(cfg.WORK_DIR, branchName), function (exist) {
		// 如果文件夹已经存在
		console.log("If the branch exist:", exist);

		if (exist) {
			res.send({
				status: "exist"
			});
			return;
		}

		var dir_branch = path.join(cfg.WORK_DIR, branchName);
		var dir_branch_js = path.join(cfg.WORK_DIR, branchName, "js");
		var dir_branch_js_qiyiV2 = path.join(cfg.WORK_DIR, branchName, "js", "qiyiV2");

		// 创建分支目录
		fs.mkdirSync(dir_branch, function () {});
		fs.mkdirSync(dir_branch_js, function () {});
		fs.mkdirSync(dir_branch_js_qiyiV2, function () {});

		// 如果是Linux平台，则需要修改文件夹权限
		// 因为app.js是以root权限运行，为了能够在etc目录下创建文件夹
		if (!iswindows) {			
			exec("sudo chmod 777 " + dir_branch, function (error, stdout, stderr) {
				if (error) return;
				exec("sudo chmod 777 " + dir_branch_js, function (error, stdout, stderr) {
					if (error) return;
					exec("sudo chmod 777 " + dir_branch_js_qiyiV2, function (error, stdout, stderr) {
						if (error) return;
						checkout(dir_branch_js_qiyiV2);
					});					
				});
			});
		} else {
			checkout(dir_branch_js_qiyiV2);
		}



		res.send({
			status: "ok"
		});
	})
})

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


// 切换分支
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
			exec(cfg.RELOAD_CMD,
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





