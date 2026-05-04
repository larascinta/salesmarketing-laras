import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Total Sales Current Month
        const salesRows = await query(
            `SELECT SUM(total_amount) as total_sales, COUNT(id) as total_transactions 
             FROM transactions 
             WHERE EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE) 
             AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );
        
        // Top Selling Products
        const topProducts = await query(
            `SELECT p.name, SUM(ti.quantity) as total_sold
             FROM transaction_items ti 
             JOIN products p ON ti.product_id = p.id
             GROUP BY p.id, p.name
             ORDER BY total_sold DESC
             LIMIT 5`
        );

        return NextResponse.json({
            summary: salesRows.rows[0],
            topProducts: topProducts.rows
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
