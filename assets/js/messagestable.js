document.addEventListener("DOMContentLoaded", function () {
    var tbody = document.getElementById("messages-table-body");
    var rows = [];

    var basePath = document.getElementById("base_path").innerHTML
        fetch(`/${basePath}/messages`)
        .then(function (response) {
            return response.text();
        })
        .then(function (html) {
            tbody.innerHTML = "";
            var table = document.createElement("table");
            table.innerHTML = html;
            rows = Array.from(table.querySelectorAll("tr")).slice(0);
            rows.forEach(function (row) {
                tbody.appendChild(row);
            })
        })
        .catch(function (err) {
            console.error("Hiba a lekérés közben:", err);
            tbody.innerHTML = "<tr><td colspan='4'>Nem sikerült betölteni az adatokat.</td></tr>";
        });
});
