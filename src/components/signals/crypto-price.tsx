"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface CryptoPriceProps {
    price: string | number;
    className?: string;
}

function formatPrice(price: string | number): { zeros: number; significantDigits: string } {
    // Convert to number and handle invalid inputs
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === null) {
        return { zeros: 0, significantDigits: "-" };
    }

    // If the number is very small (less than 0.001)
    if (numPrice < 0.001) {
        // Convert to string to handle scientific notation
        const priceStr = numPrice.toString();
        let zerosCount = 0;

        if (priceStr.includes('e-')) {
            // Handle scientific notation
            zerosCount = Number(priceStr.split('e-')[1]) - 1;
        } else {
            // Handle decimal notation
            const decimalPart = priceStr.split('.')[1];
            for (let i = 0; i < decimalPart.length; i++) {
                if (decimalPart[i] === '0') {
                    zerosCount++;
                } else {
                    break;
                }
            }
        }

        // Get significant digits after removing leading zeros
        const cleanSignificantDigits = Number((numPrice * Math.pow(10, zerosCount + 1)).toFixed(2).replace('.', '')).toString();

        return {
            zeros: zerosCount,
            significantDigits: cleanSignificantDigits
        };
    }

    // For regular numbers
    const formattedPrice = numPrice.toFixed(4).replace(/\.?0+$/, '');
    return {
        zeros: 0,
        significantDigits: formattedPrice
    };
}

function CryptoPrice({ price, className }: CryptoPriceProps) {
    const { zeros, significantDigits } = formatPrice(price);

    if (zeros > 0) {
        return (
            <span className={cn("font-mono whitespace-nowrap", className)}>
                0.<sub className="text-[0.8em]">{zeros}</sub>{significantDigits}
            </span>
        );
    }

    return (
        <span className={cn("font-mono whitespace-nowrap", className)}>
            {significantDigits}
        </span>
    );
}

export default memo(CryptoPrice);