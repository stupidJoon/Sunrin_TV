$(document).ready(() => {
  let createSessionButton = $("#create_session");
  createSessionButton.click(() => {
    window.location.href = "session";
  });

  $("#joinByCode").click(() => {
    let sessionCode = $("#session").val().trim();
    location.href = 'session/' + sessionCode;
  });

  $(".card").hover(function() {
      $(this).addClass('shadow-lg').css('cursor', 'pointer'); 
    }, function() {
      $(this).removeClass('shadow-lg');
    });
});