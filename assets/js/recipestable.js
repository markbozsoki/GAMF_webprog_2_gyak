document.addEventListener("DOMContentLoaded", function () {
    fetch("/database")
        .then(response => response.text())
        .then(html => {
            document.getElementById("recipe-table").innerHTML = html;
        })
        .catch(err => {
            console.error("Hiba a lekérés közben:", err);
            document.getElementById("recipe-table").innerHTML = "Nem sikerült betölteni az adatokat.";
        });
});
