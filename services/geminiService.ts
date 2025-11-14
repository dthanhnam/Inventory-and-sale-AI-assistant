
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work without a valid key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'YOUR_API_KEY_HERE' });

const inventorySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The name of the product.',
      },
      cost: {
        type: Type.NUMBER,
        description: 'The cost price of a single unit of the product.',
      },
      price: {
        type: Type.NUMBER,
        description: 'The selling price of a single unit of the product.',
      },
      stock: {
        type: Type.INTEGER,
        description: 'The number of units to add to the stock.',
      },
      promotion: {
        type: Type.NUMBER,
        description: 'The promotional discount as a decimal (e.g., 0.1 for 10% off). Default to 0 if not mentioned.',
      },
    },
    required: ['name', 'cost', 'price', 'stock'],
  },
};

const saleSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            productName: {
                type: Type.STRING,
                description: 'The name of the product sold. This must exactly match one of the product names provided in the inventory list.'
            },
            quantity: {
                type: Type.INTEGER,
                description: 'The number of units sold.'
            }
        },
        required: ['productName', 'quantity']
    }
}

export const parseInventoryPrompt = async (prompt: string): Promise<Omit<Product, 'id'>[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following inventory update and provide a JSON output. If a promotion is mentioned as a percentage, convert it to a decimal (e.g., 10% becomes 0.1). If no promotion is mentioned, it should be 0. Prompt: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: inventorySchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!Array.isArray(parsedData)) {
            throw new Error("Invalid response format from AI. Expected an array of products.");
        }
        
        return parsedData.map(item => ({
            name: item.name,
            cost: item.cost,
            price: item.price,
            stock: item.stock,
            promotion: item.promotion || 0,
        }));

    } catch (error) {
        console.error("Gemini API error (Inventory):", error);
        throw new Error("Could not understand the inventory prompt. Please try phrasing it differently.");
    }
};


export const parseSalePrompt = async (prompt: string, currentProducts: Product[]): Promise<{productName: string, quantity: number}> => {
    const productNames = currentProducts.map(p => p.name).join(', ');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following sales update. Identify the product name and quantity sold for each item. The product name must be one of the following: [${productNames}]. Prompt: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: saleSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            throw new Error("Invalid response format from AI. Expected an array of sales.");
        }

        // For this simplified app, we'll process the first sale item found.
        // A more complex app could handle multiple sales from one prompt.
        const sale = parsedData[0];
        
        if (!sale.productName || !sale.quantity) {
             throw new Error("AI response is missing product name or quantity.");
        }

        return {
            productName: sale.productName,
            quantity: sale.quantity
        };

    } catch (error) {
        console.error("Gemini API error (Sale):", error);
        throw new Error("Could not understand the sale prompt. Please ensure product names match the inventory.");
    }
};
