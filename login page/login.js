const form = document.querySelector("#loginForm");
const username = document.querySelector("#loginUsername");
const password = document.querySelector("#loginPassword");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const uservalue = username.value;
  const pswdvalue = password.value;
  const savedUserName = localStorage.getItem("username");
  const savedPswd = localStorage.getItem("password");

  if (savedUserName === null && savedPswd === null) {
    alert("If not registered, then register first");
  } else if (uservalue === savedUserName && pswdvalue === savedPswd) {
    window.location.href = "dashboard.html"
  } else {
    alert("Invalid username or password");
  }
});
