import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { username, password, name, email, phone } = await req.json();
        const res = await query(
            'INSERT INTO customers (username, password, name, email, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [username, password, name, email, phone, 'active']
        );
        return NextResponse.json({ success: true, id: res.rows[0].id });
    } catch (err: any) {
        if (err.code === '23505') { // Postgres unique violation error code
            return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 400 });
        } else {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }
}
