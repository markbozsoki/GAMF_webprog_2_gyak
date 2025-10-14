document.addEventListener("DOMContentLoaded", function () {
    var tbody = document.getElementById("recipe-table-body");
    var alphabetDiv = document.getElementById("alphabet-filter");
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var allRows = [];

    letters.forEach(function (letter) {
        var btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-primary me-1 mb-1";
        btn.textContent = letter;
        btn.addEventListener("click", function () {
            filterByLetter(letter);
        });
        alphabetDiv.appendChild(btn);
    });

    fetch("/database")
        .then(function (res) { return res.text(); })
        .then(function (html) {

            var temp = document.createElement("table");
            temp.innerHTML = html;

            allRows = Array.from(temp.querySelectorAll("tr")).slice(0);

            tbody.innerHTML = "";
            allRows.forEach(function (row) {
                tbody.appendChild(row);
            });

            letters.forEach(function (letter, idx) {
                var hasMatch = allRows.some(function (row) {
                    return row.cells[0].textContent.toUpperCase().startsWith(letter);
                });
                alphabetDiv.children[idx].disabled = !hasMatch;
            });
        })
        .catch(function (err) {
            console.error("Hiba a lekérés közben:", err);
            tbody.innerHTML = "<tr><td colspan='2'>Nem sikerült betölteni az adatokat.</td></tr>";
        });

    function filterByLetter(letter) {
        tbody.innerHTML = "";

        var visibleRows = allRows.filter(function (row) {
            return row.cells[0].textContent.toUpperCase().startsWith(letter);
        });

        if (visibleRows.length === 0) {
            var emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="2">Nincs találat erre a betűre.</td>`;
            tbody.appendChild(emptyRow);
        } else {
            visibleRows.forEach(function (row) {
                tbody.appendChild(row);
            });
        }
    }
});
