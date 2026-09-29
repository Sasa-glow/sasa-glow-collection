
// 🌙 DARK / LIGHT MODE
const modeButton = document.createElement("button");

modeButton.innerHTML = "🌙";
modeButton.className = "mode-button";
modeButton.setAttribute("aria-label", "Toggle dark mode");

document.body.appendChild(modeButton);

modeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        modeButton.innerHTML = "☀️";
    } else {
        modeButton.innerHTML = "🌙";
    }
});
// Welcome
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


// Scroll to top
const topButton = document.createElement("button");

topButton.innerHTML = "↑";
topButton.className = "top-button";
topButton.setAttribute("aria-label", "Scroll to top");

document.body.appendChild(topButton);

window.addEventListener("scroll", function () {
    topButton.style.display = window.scrollY > 300 ? "block" : "none";
});

topButton.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

