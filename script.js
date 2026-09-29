// Welcome message
window.addEventListener("load", function () {
    console.log("Welcome to SASA Glow Collection ✨");
});


// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();

        const section = document.querySelector(this.getAttribute("href"));

        if (section) {
            section.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});


// Contact button
const contactButton = document.querySelector("button");

if (contactButton) {
    contactButton.addEventListener("click", function () {
        alert("Thank you for contacting SASA Glow Collection! ✨");
    });
}


// Scroll to top button
const topButton = document.createElement("button");

topButton.innerHTML = "↑";
topButton.className = "top-button";

document.body.appendChild(topButton);

window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
        topButton.style.display = "block";
    } else {
        topButton.style.display = "none";
    }
});

topButton.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// 🌙 DARK / LIGHT MODE
const modeButton = document.createElement("button");

modeButton.innerHTML = "🌙";
modeButton.className = "mode-button";

document.body.appendChild(modeButton);

modeButton.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        modeButton.innerHTML = "☀️";
    } else {
        modeButton.innerHTML = "🌙";
    }

});
