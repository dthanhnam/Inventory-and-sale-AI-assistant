
import React, { useMemo } from 'react';
import { Product, Sale } from '../types';

interface ReportCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
        <div className="bg-slate-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const TrendingDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
);


interface ReportsProps {
    products: Product[];
    sales: Sale[];
    productMap: Record<string, Product>;
}

export const Reports: React.FC<ReportsProps> = ({ products, sales, productMap }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const { totalRevenue, totalCost, totalProfit } = useMemo(() => {
        let revenue = 0;
        let cost = 0;

        sales.forEach(sale => {
            const product = productMap[sale.productId];
            if (product) {
                const salePrice = sale.pricePerUnit * (1 - sale.promotionApplied);
                revenue += salePrice * sale.quantity;
                cost += product.cost * sale.quantity;
            }
        });

        return {
            totalRevenue: revenue,
            totalCost: cost,
            totalProfit: revenue - cost,
        };
    }, [sales, productMap]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Financial Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUpIcon />} />
                <ReportCard title="Total Cost" value={formatCurrency(totalCost)} icon={<TrendingDownIcon />} />
                <ReportCard title="Total Profit" value={formatCurrency(totalProfit)} icon={<DollarSignIcon />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="text-xl font-bold mb-4">Inventory Status</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 uppercase">
                                <tr>
                                    <th className="p-3">Product</th>
                                    <th className="p-3 text-right">Stock</th>
                                    <th className="p-3 text-right">Cost</th>
                                    <th className="p-3 text-right">Price</th>
                                    <th className="p-3 text-right">Promotion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3 text-right">{p.stock}</td>
                                        <td className="p-3 text-right">{formatCurrency(p.cost)}</td>
                                        <td className="p-3 text-right">{formatCurrency(p.price)}</td>
                                        <td className={`p-3 text-right font-semibold ${p.promotion > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {p.promotion > 0 ? `${p.promotion * 100}%` : 'None'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="text-xl font-bold mb-4">Recent Sales Log</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-100 text-slate-600 uppercase">
                                <tr>
                                    <th className="p-3">Product</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Total Sale</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.slice().reverse().map(s => {
                                     const product = productMap[s.productId];
                                     const total = s.quantity * s.pricePerUnit * (1 - s.promotionApplied);
                                     return (
                                        <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="p-3 font-medium">{product?.name || 'Unknown'}</td>
                                            <td className="p-3 text-right">{s.quantity}</td>
                                            <td className="p-3 text-right font-semibold text-green-700">{formatCurrency(total)}</td>
                                            <td className="p-3 text-slate-500">{s.saleDate.toLocaleDateString()}</td>
                                        </tr>
                                     )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
