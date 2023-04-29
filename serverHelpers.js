function createMessage(name, message, buttonFunction, type, timer = 4000) {
  let alertsCont = document.getElementById("alerts");

  //   if (alertsCont.childElementCount > 3) {
  //     // let thisAlert = new bootstrap.Alert(alertsCont.firstChild);
  //     // thisAlert.close();
  //     alertsCont.se.remove();
  //   }

  let wrapper = document.createElement("div");

  wrapper.classList.add("alert", type, "alert-dismissible", "fade", "show");

  wrapper.innerHTML = "<strong>" + name + "</strong> " + message + '<button type="button" class="btn-close"data-bs-dismiss="alert"></button>';

  console.log("BUTTON TEXT", buttonFunction);
  if (buttonFunction !== "") {
    wrapper.innerHTML += '<hr><button onclick="' + buttonFunction + '">ACCEPT</button>';
  }

  alertsCont.appendChild(wrapper);

  if (timer) {
    setTimeout(() => {
      let thisAlert = new bootstrap.Alert(wrapper);
      thisAlert.close();
      // if (wrapper.isConnected) {
      //     alertsCont.removeChild(wrapper);
      // }
    }, timer);
  }
  return wrapper;
}

function nonDismissible(name, message, type, buttonMessage, buttonFunction) {
  let alertsCont = document.getElementById("alerts");
  let wrapper = document.createElement("div");

  wrapper.classList.add("shortMessage", type, "fade", "show", "alert");

  wrapper.innerHTML = "<strong>" + name + "</strong> " + message;

  wrapper.innerHTML += '<hr><button onclick="' + buttonFunction + '">' + buttonMessage + "</button>";

  alertsCont.appendChild(wrapper);

  return wrapper;
}
