import { NextRequest } from "next/server";
import connectDB from "@/components/api/connectDB";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const pool = connectDB();

    const idToCheck = params.id;
    try {
        const [convict] = await pool.query("SELECT * FROM constraints WHERE id = ?", [idToCheck]);

        return new Response(JSON.stringify(convict), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("Error executing query:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } finally {
        await pool.end();
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const pool = connectDB();

    const idToDelete = params.id;
    try {
        const [convict] = await pool.query("DELETE FROM constraints WHERE id = ?", [idToDelete]);

        return new Response(JSON.stringify(convict), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("Error executing query:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } finally {
        await pool.end();
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const pool = connectDB();

    const idToUpdate = params.id;
    const body = await request.json();

    const { nazwa } = body;

    const updates = [];
    const values = [];

    if (nazwa) {
        updates.push("nazwa = ?");
        values.push(nazwa);
    }

    if (updates.length === 0) {
        return new Response(JSON.stringify({ error: "No fields to update" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    values.push(idToUpdate);

    try {
        const sql = `UPDATE constraints SET ${updates.join(", ")} WHERE id = ?`;

        await pool.query(sql, values);

        return new Response(JSON.stringify({ message: "Convict updated successfully" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("Error executing query:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } finally {
        await pool.end();
    }
}
