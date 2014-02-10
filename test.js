var exec = require('child_process').exec;
var fs = require('fs');

var user = "liguangyi";
var branch = "trunk";


var rmCurV2 = "rm -rf /home/" + user + "/Work/master/js/qiyiV2";
var cpToV2 = "cp -r /home/" + user + "/Work/" + branch + "/ /home/" + user + "/Work/master/js/qiyiV2/";
var branchNameFile = "/home/" + user + "/Work/branch.name";

var handlerError = function (err) {
	if (err) {
		console.log("ERROR------>", err);
		return true;
	}
}

// 存储当前分支
fs.writeFile(branchNameFile, branch, function (err) {
	if (err) {
		console.log(err);
		return;
	}
});

return;


// 读取分支
fs.exists(branchNameFile, function (exist) {
	if (!exist) return;

	fs.readFile(branchNameFile, {
		encoding: "utf-8"
	}, function (err, data) {
		console.log(data);
	});
});

return;

// 改变分支
exec(rmCurV2, function (error, stdout, stderr) {
	if (handlerError(error)) return;
	console.log("Delete current qiyiV2 successfully");
	exec(cpToV2, function (error, stdout, stderr) {
		if (handlerError(error)) return;
		console.log("Copy branch to qiyiV2 successfully");
	})
})