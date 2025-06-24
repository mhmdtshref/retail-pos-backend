import { Op } from 'sequelize';
import PurchaseOrder from '../models/PurchaseOrder';

export class PurchaseOrderGeneratorService {
  /**
   * Generate the next available purchase order number
   * Format: PO-YY-XXXX where:
   * - PO = Purchase Order prefix
   * - YY = 2-digit year (e.g., 24 for 2024)
   * - XXXX = 4-digit sequential number starting from 0001
   */
  static async generateOrderNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits
    
    // Create the pattern for this year
    const pattern = `PO-${yearSuffix}-%`;
    
    // Find the highest existing order number for this year
    const existingOrders = await PurchaseOrder.findAll({
      where: {
        orderNumber: {
          [Op.like]: pattern,
        },
      },
      attributes: ['orderNumber'],
      order: [['orderNumber', 'DESC']],
      limit: 1,
    });
    
    let nextNumber = 1; // Start from 0001
    
    if (existingOrders.length > 0) {
      const lastOrderNumber = existingOrders[0].orderNumber;
      // Extract the number part (last 4 digits)
      const numberPart = lastOrderNumber.split('-')[2];
      if (numberPart && /^\d{4}$/.test(numberPart)) {
        nextNumber = parseInt(numberPart, 10) + 1;
      }
    }
    
    // Format the number with leading zeros
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `PO-${yearSuffix}-${formattedNumber}`;
  }
  
  /**
   * Validate if an order number follows the expected format
   */
  static validateOrderNumberFormat(orderNumber: string): boolean {
    const pattern = /^PO-\d{2}-\d{4}$/;
    return pattern.test(orderNumber);
  }
  
  /**
   * Extract year from an order number
   */
  static getYearFromOrderNumber(orderNumber: string): number | null {
    const match = orderNumber.match(/^PO-(\d{2})-\d{4}$/);
    if (match) {
      const yearSuffix = parseInt(match[1], 10);
      // Assume 20xx for years 00-99
      return 2000 + yearSuffix;
    }
    return null;
  }
} 