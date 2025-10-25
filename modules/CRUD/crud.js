import mysql from "mysql2";

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.ping(function (err) {
    if (err) {
        console.error(`Cannot connect to: ${databaseName}`);
        callback(`<tr><td colspan='2'>Nem sikerült kapcsolódni az adatbázishoz.</td></tr>`);
        return;
    }
});

export function crudIngredients(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method === "GET") {
        connection.query("SELECT * FROM hozzavalo", (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results);
        });
    }

    else if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const { nev } = data;

                if (!nev || nev.trim() === "") {
                    res.status(400).json({ error: "A név megadása kötelező." });
                    return;
                }

                connection.query(
                    "INSERT INTO hozzavalo (nev) VALUES (?)",
                    [nev],
                    (err, result) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id: result.insertId, nev });
                    }
                );
            } catch (err) {
                res.status(400).json({ error: "Érvénytelen formátum" });
            }
        });
    }

    else if (req.method === "PUT") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const { id, nev } = data;

                if (!nev) {
                    res.status(400).json({ error: "Név megadása kötelező!" });
                    return;
                }

                connection.query(
                    "UPDATE hozzavalo SET nev=? WHERE id=?",
                    [nev, id],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ id, nev });
                    }
                );
            } catch (err) {
                res.status(400).json({ error: "Érvénytelen formátum" });
            }
        });
    }

    else if (req.method === "DELETE") {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get("id");

        if (!id) {
            res.status(400).json({ error: "id paraméter nem található" });
            return;
        }

        connection.query("DELETE FROM hozzavalo WHERE id=?", [id], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
    }

    else {
        res.status(405).json({ error: "Hibás művelet" });
    }
}
