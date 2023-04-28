function createMessage(name, message, type, timed = true) {
  let alertsCont = document.getElementById("alerts");

  if (alertsCont.childElementCount > 0) {
    // let thisAlert = new bootstrap.Alert(alertsCont.firstChild);
    // thisAlert.close();
    alertsCont.firstChild.remove();
  }

  let wrapper = document.createElement("div");

  wrapper.classList.add("alert", type, "alert-dismissible", "fade", "show");

  wrapper.innerHTML = "<strong>" + name + "</strong> " + message + '<button type="button" class="btn-close"data-bs-dismiss="alert"></button>';

  alertsCont.appendChild(wrapper);

  if (timed) {
    setTimeout(() => {
      let thisAlert = new bootstrap.Alert(wrapper);
      thisAlert.close();
      // if (wrapper.isConnected) {
      //     alertsCont.removeChild(wrapper);
      // }
    }, 4000);
  }
}
