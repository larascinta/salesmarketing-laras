import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function POST(req: Request) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const { user_id, customer_id, total_amount, payment_method, items } = await req.json();

        // Create transaction
        const dbUserId = user_id || null;
        const txResult = await client.query(
            'INSERT INTO transactions (user_id, customer_id, total_amount, payment_method) VALUES ($1, $2, $3, $4) RETURNING id',
            [dbUserId, customer_id, total_amount, payment_method]
        );
        const transactionId = txResult.rows[0].id;

        // Create items & deduct stock
        for (let item of items) {
            await client.query(
                'INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [transactionId, item.product_id, item.quantity, item.unit_price, item.subtotal]
            );
            
            // Deduct stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('COMMIT');
        return NextResponse.json({ success: true, transactionId });
    } catch (err: any) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        client.release();
    }
}
