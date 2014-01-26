$(function () {
	var list = $("#branch-contianer-list");

	function render(names) {

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
			render(data.names);
		}, "json")
	})()

	function switchBranchByName (name) {

		$.get("/switch?name=" + name, function (data, textStatus) {
			var btns = list.find(".btn");
			btns.removeClass("btn-primary");

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