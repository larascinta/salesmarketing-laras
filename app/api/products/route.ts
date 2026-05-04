import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const res = await query('SELECT * FROM products ORDER BY id DESC');
        return NextResponse.json(res.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, description, price, stock, image_url } = await req.json();
        const res = await query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, description, price, stock, image_url || null]
        );
        return NextResponse.json({ success: true, id: res.rows[0].id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
