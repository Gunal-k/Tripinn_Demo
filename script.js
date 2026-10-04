lucide.createIcons();


/* ================= MOBILE MENU ================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", function () {

    mainNav.classList.toggle("active");

});


document.querySelectorAll("#mainNav a").forEach(link => {

    link.addEventListener("click", function () {

        mainNav.classList.remove("active");

    });

});


/* ================= DARK MODE ================= */

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("tripinn-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}


function updateThemeIcon() {

    const icon = document.body.classList.contains("dark-mode")
        ? "sun"
        : "moon";

    themeToggle.innerHTML = `<i data-lucide="${icon}"></i>`;

    lucide.createIcons();

}


updateThemeIcon();


themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "tripinn-theme",
        isDark ? "dark" : "light"
    );

    updateThemeIcon();

});