$(document).ready(() => {
  $('#fullpage').fullpage({
		autoScrolling:true,
		scrollHorizontally: true
	});
	$.fn.fullpage.setAllowScrolling(false);

  let createSessionButton = $("#create_session");
  createSessionButton.click(() => {
    window.location.href = "session";
  });

  $("#joinByCode").click(() => {
    let sessionCode = $("#session").val().trim();
    location.href = 'session/' + sessionCode;
  });
});