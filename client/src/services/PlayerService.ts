
// export interface CalculationHistory {
//   id: string;
//   timestamp: number;
//   data: MortgageData;
//   result: {
//     monthlyPayment: number;
//     totalInterest: number;
//     totalPayment: number;
//   };
// }

export class PlayerService {
    // static async getPlayer(playerId: string) {
    //     const result = await graphqlClient.query(QUERIES.GET_PLAYER, {
    //         id: playerId
    //     });
    //     return result.data?.player;
    // }

//   private static readonly STORAGE_KEY = 'mortgage_calculation_history';

//   /**
//    * 保存计算历史
//    */
//   static async saveCalculationHistory(data: MortgageData, result: any): Promise<void> {
//     try {
//       const history: CalculationHistory = {
//         id: Date.now().toString(),
//         timestamp: Date.now(),
//         data,
//         result: {
//           monthlyPayment: result.monthlyPayment,
//           totalInterest: result.totalInterest,
//           totalPayment: result.totalPayment
//         }
//       };

//       const existingHistory = await this.getCalculationHistory();
//       existingHistory.unshift(history);
      
//       // 只保留最近10条记录
//       const limitedHistory = existingHistory.slice(0, 10);
      
//       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
//     } catch (error) {
//       console.error('保存计算历史失败:', error);
//     }
//   }

//   /**
//    * 获取计算历史
//    */
//   static async getCalculationHistory(): Promise<CalculationHistory[]> {
//     try {
//       const history = localStorage.getItem(this.STORAGE_KEY);
//       return history ? JSON.parse(history) : [];
//     } catch (error) {
//       console.error('获取计算历史失败:', error);
//       return [];
//     }
//   }

//   /**
//    * 清除计算历史
//    */
//   static async clearCalculationHistory(): Promise<void> {
//     try {
//       localStorage.removeItem(this.STORAGE_KEY);
//     } catch (error) {
//       console.error('清除计算历史失败:', error);
//     }
//   }

//   /**
//    * 导出还款计划为CSV
//    */
//   static exportScheduleToCSV(schedule: PaymentSchedule[], filename: string = 'mortgage_schedule.csv'): void {
//     try {
//       const headers = ['期数', '月供', '本金', '利息', '剩余本金'];
//       const csvContent = [
//         headers.join(','),
//         ...schedule.map(item => [
//           item.month,
//           item.payment,
//           item.principal,
//           item.interest,
//           item.remainingBalance
//         ].join(','))
//       ].join('\n');

//       const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
//       const link = document.createElement('a');
//       const url = URL.createObjectURL(blob);
      
//       link.setAttribute('href', url);
//       link.setAttribute('download', filename);
//       link.style.visibility = 'hidden';
      
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       console.error('导出CSV失败:', error);
//     }
//   }

//   /**
//    * 验证输入数据
//    */
//   static validateInput(data: Partial<MortgageData>): { isValid: boolean; errors: string[] } {
//     const errors: string[] = [];

//     if (!data.loanAmount || data.loanAmount <= 0) {
//       errors.push('贷款金额必须大于0');
//     }

//     if (!data.loanTerm || data.loanTerm <= 0 || data.loanTerm > 50) {
//       errors.push('贷款年限必须在1-50年之间');
//     }

//     if (!data.interestRate || data.interestRate < 0 || data.interestRate > 20) {
//       errors.push('年利率必须在0-20%之间');
//     }

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }

//   /**
//    * 获取预设的利率方案
//    */
//   static getPresetRates(): Array<{ name: string; rate: number; description: string }> {
//     return [
//       { name: '公积金贷款', rate: 3.25, description: '首套住房公积金贷款利率' },
//       { name: '商业贷款', rate: 4.9, description: '首套住房商业贷款利率' },
//       { name: '二套房', rate: 5.4, description: '二套住房贷款利率' },
//       { name: 'LPR基准', rate: 4.2, description: '当前LPR基准利率' }
//     ];
//   }
} 