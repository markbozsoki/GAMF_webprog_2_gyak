import mysql from "mysql2";

export function getRecipes(databaseName, callback) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root", //studb150 
        password: "", //undecided
        database: "recipe_database"
    });

    con.ping(function (err) {
        if (err) {
            console.error(`No DB connection`);
            callback(`<tr><td colspan='2'>Nem sikerült kapcsolódni az adatbázishoz.</td></tr>`);
            return;
        }
    });

    con.connect(function (err) {
        if (err) throw err;
        var sql =
            `SELECT e.nev AS etel_nev, GROUP_CONCAT(CONCAT(hs.mennyiseg, ' ', hs.egyseg, ' ', h.nev)
            SEPARATOR ', ') AS hozzavalok
            FROM etel e JOIN hasznalt hs ON e.id = hs.etelid JOIN hozzavalo h ON hs.hozzavaloid = h.id
            GROUP BY e.id, e.nev
            ORDER BY e.nev;`;

        con.query(sql, function (err, result, fields) {
            if (err) throw err;

            var html = `<table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Étel neve</th>
                                    <th>Hozzávalók</th>
                                </tr>
                            </thead>
                        <tbody>`;

            result.forEach(row => {
                html += `<tr>
            <td>${row.etel_nev}</td>
            <td>${row.hozzavalok || ''}</td>
          </tr> `;
            });

            html += "</table>";

            callback(html);
            con.end();
        });
    });
};
