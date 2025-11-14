
import React, { useState, useMemo } from 'react';
import { Product, Sale } from './types';
import { parseInventoryPrompt, parseSalePrompt } from './services/geminiService';
import { addInventoryItem, recordSale } from './services/sheetService';
import { Reports } from './components/Reports';
import { AIPromptBox } from './components/AIPromptBox';
import { Header } from './components/Header';
import { Toast } from './components/Toast';

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([
        { id: 'prod-1', name: 'Classic T-Shirt', cost: 7.50, price: 24.99, stock: 100, promotion: 0 },
        { id: 'prod-2', name: 'Denim Jeans', cost: 22.00, price: 79.99, stock: 50, promotion: 0.1 },
        { id: 'prod-3', name: 'Leather Belt', cost: 5.00, price: 19.99, stock: 75, promotion: 0 },
    ]);
    const [sales, setSales] = useState<Sale[]>([
      { id: 'sale-1', productId: 'prod-2', quantity: 2, saleDate: new Date(), pricePerUnit: 79.99, promotionApplied: 0.1 },
      { id: 'sale-2', productId: 'prod-1', quantity: 5, saleDate: new Date(), pricePerUnit: 24.99, promotionApplied: 0 },
    ]);
    const [loading, setLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    
    const handleInventoryPrompt = async (prompt: string) => {
        setLoading('inventory');
        try {
            const newProducts = await parseInventoryPrompt(prompt);
            for (const productData of newProducts) {
                // Simulate sheet update
                const success = await addInventoryItem(productData);
                if (success) {
                    setProducts(prev => {
                        const existingProductIndex = prev.findIndex(p => p.name.toLowerCase() === productData.name.toLowerCase());
                        if (existingProductIndex > -1) {
                            const updatedProducts = [...prev];
                            const existingProduct = updatedProducts[existingProductIndex];
                            existingProduct.stock += productData.stock;
                            existingProduct.cost = productData.cost;
                            existingProduct.price = productData.price;
                            existingProduct.promotion = productData.promotion;
                            return updatedProducts;
                        } else {
                            return [...prev, { ...productData, id: `prod-${Date.now()}` }];
                        }
                    });
                } else {
                    throw new Error(`Failed to add ${productData.name} to sheet.`);
                }
            }
            showToast('Inventory updated successfully!', 'success');
        } catch (error) {
            console.error('Error processing inventory prompt:', error);
            showToast(error instanceof Error ? error.message : 'Failed to update inventory.', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleSalePrompt = async (prompt: string) => {
        setLoading('sale');
        try {
            const saleData = await parseSalePrompt(prompt, products);
            const product = products.find(p => p.name.toLowerCase() === saleData.productName.toLowerCase());

            if (!product) {
                throw new Error(`Product "${saleData.productName}" not found in inventory.`);
            }
            if (product.stock < saleData.quantity) {
                throw new Error(`Not enough stock for "${product.name}". Only ${product.stock} available.`);
            }
            
            // Simulate sheet update
            const success = await recordSale(saleData);
            if(success) {
              const newSale: Sale = {
                  id: `sale-${Date.now()}`,
                  productId: product.id,
                  quantity: saleData.quantity,
                  saleDate: new Date(),
                  pricePerUnit: product.price,
                  promotionApplied: product.promotion,
              };
              setSales(prev => [...prev, newSale]);
              setProducts(prev => prev.map(p => 
                  p.id === product.id ? { ...p, stock: p.stock - saleData.quantity } : p
              ));
              showToast('Sale recorded successfully!', 'success');
            } else {
              throw new Error('Failed to record sale to sheet.');
            }

        } catch (error) {
            console.error('Error processing sale prompt:', error);
            showToast(error instanceof Error ? error.message : 'Failed to record sale.', 'error');
        } finally {
            setLoading(null);
        }
    };
    
    const productMap = useMemo(() => {
        return products.reduce((acc, product) => {
            acc[product.id] = product;
            return acc;
        }, {} as Record<string, Product>);
    }, [products]);

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AIPromptBox
                        title="Inventory AI"
                        description="Add or update inventory using natural language."
                        placeholder="e.g., Add 100 'Red Hoodies', cost $15, price $35. 50 'Blue Caps', cost $5, price $15 with 10% off."
                        isLoading={loading === 'inventory'}
                        onSubmit={handleInventoryPrompt}
                    />
                    <AIPromptBox
                        title="Sales AI"
                        description="Record sales using natural language."
                        placeholder="e.g., Sold 3 'Red Hoodies' and 1 'Blue Cap'."
                        isLoading={loading === 'sale'}
                        onSubmit={handleSalePrompt}
                    />
                </div>

                <div className="mt-12">
                   <Reports products={products} sales={sales} productMap={productMap} />
                </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;
