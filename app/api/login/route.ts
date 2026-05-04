import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        // Use parameterized queries for PostgreSQL ($1, $2)
        const res = await query('SELECT id, username, role FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (res.rows.length > 0) {
            return NextResponse.json({ success: true, user: res.rows[0] });
        } else {
            return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
