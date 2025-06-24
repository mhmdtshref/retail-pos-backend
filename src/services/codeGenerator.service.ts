import { Op } from 'sequelize';
import Item from '../models/Item';
import { Store } from '../models/Item';

export class CodeGeneratorService {
  /**
   * Generate the next available code for an item based on store and year
   * Format: SSS-YY-XXXX where:
   * - SSS = MQN (Mini Queen) or LCH (Lariche)
   * - YY = 2-digit year (e.g., 24 for 2024)
   * - XXXX = 4-digit sequential number starting from 0001
   */
  static async generateItemCode(store: Store): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits
    
    // Map store to prefix
    const storePrefix = store === Store.MINI_QUEEN ? 'MQN' : 'LCH';
    
    // Create the pattern for this year and store
    const pattern = `${storePrefix}-${yearSuffix}-%`;
    
    // Find the highest existing code for this year and store
    const existingCodes = await Item.findAll({
      where: {
        code: {
          [Op.like]: pattern,
        },
      },
      attributes: ['code'],
      order: [['code', 'DESC']],
      limit: 1,
    });
    
    let nextNumber = 1; // Start from 0001
    
    if (existingCodes.length > 0) {
      const lastCode = existingCodes[0].code;
      // Extract the number part (last 4 digits)
      const numberPart = lastCode.split('-')[2];
      if (numberPart && /^\d{4}$/.test(numberPart)) {
        nextNumber = parseInt(numberPart, 10) + 1;
      }
    }
    
    // Format the number with leading zeros
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `${storePrefix}-${yearSuffix}-${formattedNumber}`;
  }

  /**
   * Generate variant codes based on item code and variant attributes
   * Format: ITEMCODE-VARIANT where VARIANT is the combination of attributes
   */
  static generateVariantCode(itemCode: string, attributes: Record<string, any>): string {
    // Create variant suffix from attributes
    const attributeValues = Object.values(attributes).filter(value => value !== null && value !== undefined);
    const variantSuffix = attributeValues.join('/');
    
    return `${itemCode}-${variantSuffix}`;
  }

  /**
   * Generate all possible variant combinations from variant groups
   */
  static generateVariantCombinations(variantGroups: Record<string, string[]>): Array<Record<string, string>> {
    const groupNames = Object.keys(variantGroups);
    const groupValues = Object.values(variantGroups);
    
    if (groupNames.length === 0) {
      return [];
    }
    
    // Generate all combinations using cartesian product
    const combinations: Array<Record<string, string>> = [];
    
    const generateCombinations = (current: Record<string, string>, index: number) => {
      if (index === groupNames.length) {
        combinations.push({ ...current });
        return;
      }
      
      const groupName = groupNames[index];
      const values = groupValues[index];
      
      for (const value of values) {
        current[groupName] = value;
        generateCombinations(current, index + 1);
      }
    };
    
    generateCombinations({}, 0);
    return combinations;
  }
  
  /**
   * Validate if a code follows the expected format
   */
  static validateCodeFormat(code: string): boolean {
    const pattern = /^(MQN|LCH)-\d{2}-\d{4}$/;
    return pattern.test(code);
  }
  
  /**
   * Extract store from a code
   */
  static getStoreFromCode(code: string): Store | null {
    if (code.startsWith('MQN-')) {
      return Store.MINI_QUEEN;
    } else if (code.startsWith('LCH-')) {
      return Store.LARICHE;
    }
    return null;
  }
  
  /**
   * Extract year from a code
   */
  static getYearFromCode(code: string): number | null {
    const match = code.match(/^(MQN|LCH)-(\d{2})-\d{4}$/);
    if (match) {
      const yearSuffix = parseInt(match[2], 10);
      // Assume 20xx for years 00-99
      return 2000 + yearSuffix;
    }
    return null;
  }
} 