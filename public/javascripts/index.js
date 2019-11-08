$(document).ready(() => {
  let createSessionButton = $("#create_session");
  
  createSessionButton.click(() => {
    window.location.href = "session";
  });

  $("#joinByCode").click(() => {
    let sessionCode = $("#session").val().trim();
    location.href = sessionCode;
  });
});