document.addEventListener("DOMContentLoaded", function () {
    var tbody = document.querySelector("#ingredients-table tbody");
    var form = document.querySelector("#addIngredientForm");
    var allIngredients = [];

    function fetchIngredients() {
        var basePath = document.getElementById("base_path").innerHTML
        fetch(`/${basePath}/ingredients`)
            .then(function (res) { return res.json(); })
            .then(function (ingredients) {
                allIngredients = ingredients;
                renderTable(ingredients);
            })
            .catch(function (err) {
                console.error("Hiba a hozzávalók lekérésekor:", err);
                tbody.innerHTML = "<tr><td colspan='3'>Nem sikerült betölteni az adatokat.</td></tr>";
            });
    }

    function renderTable(ingredients) {
        tbody.innerHTML = "";
        ingredients.forEach(function (i) {
            var row = document.createElement("tr");
            row.innerHTML = `
                <td>${i.id}</td>
                <td>${i.nev}</td>
                <td>
                    <button data-id="${i.id}" class="edit-btn">Módosítás</button>
                    <button data-id="${i.id}" class="delete-btn">Törlés</button>
                </td>`;
            tbody.appendChild(row);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nev = form.nev.value.trim();
        if (!nev) return;

        if (!confirm("Biztosan hozzá szeretné adni ezt a hozzávalót?")) return;

        var basePath = document.getElementById("base_path").innerHTML
            fetch(`/${basePath}/ingredients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nev: nev })
        })
            .then(function () {
                form.reset();
                fetchIngredients();
            })
            .catch(function (err) {
                console.error("Hiba a hozzáadás közben:", err);
            });
    });

    tbody.addEventListener("click", function (e) {
        var id = e.target.dataset.id;

        if (e.target.classList.contains("delete-btn")) {
            if (!confirm("Biztosan törölni szeretnéd ezt a hozzávalót?")) return;

            var basePath = document.getElementById("base_path").innerHTML
            fetch(`/${basePath}/ingredients?id=` + id, { method: "DELETE" })
                .then(function () { fetchIngredients(); })
                .catch(function (err) { console.error("Hiba a törlés közben:", err); });

            return;
        }

        if (e.target.classList.contains("edit-btn")) {
            var row = e.target.closest("tr");
            var nameCell = row.children[1];
            var currentName = nameCell.textContent;

            nameCell.innerHTML = '<input type="text" value="' + currentName + '" class="edit-input">';
            e.target.textContent = "Mentés";
            e.target.classList.remove("edit-btn");
            e.target.classList.add("save-btn");
            return;
        }

        if (e.target.classList.contains("save-btn")) {
            var row = e.target.closest("tr");
            var input = row.querySelector(".edit-input");
            var newName = input.value.trim();
            if (!newName) return;

            var basePath = document.getElementById("base_path").innerHTML
            fetch(`/${basePath}/ingredients`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id, nev: newName })
            })
                .then(function () { fetchIngredients(); })
                .catch(function (err) { console.error("Hiba a mentés közben:", err); });
        }
    });

    fetchIngredients();
});
