
$(function () {
	var list = $("#branch-contianer-list");

	function createBranch(name) {
		$.get("/createBranch?name=" + name, function (data, textStatus) {
			if (!data) {
				alert("Create Branch Failed!");
				return;
			}

			if (data.status == "exist") {
				alert("Branch Already Exist!");
				return;				
			}
		})
	}	

	function renderBranch(names) {

		var _renderTpl = function (name) {
			return '<li><button data-name="' + name + '" class="btn margin-bottom-10">' + name + '</button></li>';
		}

		names.forEach(function (name) {
			list.append(_renderTpl(name));
		})
		
	}

	(function Bootstrap () {
		
		$.get("/getdirs", function (data, textStatus) {

			if (data.status != "ok") alert("Get Branch Information faild");
			renderBranch(data.names);

			$.get("/getCurBranch", function (data, textStatus) {
				if (data.status != "ok") alert("Get Current Branch Information faild");
				list.find("[data-name=" + data.name +"]").addClass("btn-primary");
			}, "json");

		}, "json")

	})()

	function switchBranchByName (name) {

		$.get("/switch?name=" + name, function (data, textStatus) {
			var btns = list.find(".btn");
			btns.removeClass("btn-primary");

			if (!data.status || data.status != "ok")  {
				alert("Switch Branch Error!");
				return;
			}
			
			list.find("[data-name=" + name +"]").addClass("btn-primary");
		});
	}

	list.delegate(".btn", "click", function (e) {

		var btn = $(this);
		if (btn.hasClass("btn-primary")) return;

		var name = btn.attr("data-name");
		switchBranchByName(name);
	});
})