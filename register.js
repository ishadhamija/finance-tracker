const form = document.querySelector("#registerForm")
const username = document.querySelector("#regUsername")
const password = document.querySelector("#regPassword")

form.addEventListener("submit" , (event) => {

    event.preventDefault()

    const uservalue = username.value
    const pswdvalue = password.value

    localStorage.setItem("username", uservalue)
    localStorage.setItem("password", pswdvalue)



})