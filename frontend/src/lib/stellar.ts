import { Server, Networks, TransactionBuilder, Asset, Operation } from '@stellar/stellar-sdk';
import { PaymentDetails, TransactionResult, WalletInfo } from '@/types/enrollment';

export class StellarService {
  private server: Server;
  private network: Networks.Network;

  constructor(network: 'testnet' | 'mainnet' | 'futurenet' = 'testnet') {
    this.server = new Server(
      network === 'mainnet' 
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );
    this.network = network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
  }

  async connectWallet(): Promise<WalletInfo> {
    try {
      if (typeof window === 'undefined' || !window.freighter) {
        throw new Error('Freighter wallet is not installed');
      }

      const publicKey = await window.freighter.getPublicKey();
      const network = await window.freighter.getNetwork();

      let balance = 0;
      try {
        const account = await this.server.loadAccount(publicKey);
        balance = parseFloat(account.balances[0]?.balance || '0');
      } catch (error) {
        console.warn('Could not fetch balance:', error);
      }

      return {
        publicKey,
        isConnected: true,
        network: network === 'PUBLIC' ? 'mainnet' : 'testnet',
        balance
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        publicKey: '',
        isConnected: false,
        network: 'testnet',
        balance: 0
      };
    }
  }

  async disconnectWallet(): Promise<void> {
    // Freighter doesn't have a programmatic disconnect
    // This is mainly for UI state management
    return Promise.resolve();
  }

  async sendPayment(paymentDetails: PaymentDetails): Promise<TransactionResult> {
    try {
      if (!window.freighter) {
        throw new Error('Freighter wallet is not connected');
      }

      const sourceAccount = await this.server.loadAccount(paymentDetails.recipientAddress);
      
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: this.network.passphrase
      })
        .addOperation(Operation.payment({
          destination: paymentDetails.recipientAddress,
          asset: Asset.native(),
          amount: paymentDetails.amount.toString()
        }))
        .addMemo(Operation.memoText(paymentDetails.memo || 'Course Enrollment'))
        .setTimeout(30)
        .build();

      const signedTransaction = await window.freighter.signTransaction(transaction.toXDR());
      const transactionResult = await this.server.submitTransaction(signedTransaction);

      return {
        success: true,
        transactionHash: transactionResult.hash,
        message: 'Payment sent successfully'
      };
    } catch (error) {
      console.error('Payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getTransactionStatus(transactionHash: string): Promise<TransactionResult> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();
      
      return {
        success: transaction.successful,
        transactionHash: transaction.hash,
        message: transaction.successful ? 'Transaction successful' : 'Transaction failed'
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction status'
      };
    }
  }

  async getAccountBalance(publicKey: string): Promise<number> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const nativeBalance = account.balances.find(balance => balance.asset_type === 'native');
      return parseFloat(nativeBalance?.balance || '0');
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const account = await this.server.loadAccount(address);
      return !!account.account_id();
    } catch (error) {
      return false;
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    }).format(amount);
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  }
}

// Global Stellar service instance
export const stellarService = new StellarService();

// Extend Window interface for Freighter
declare global {
  interface Window {
    freighter: {
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string) => Promise<string>;
      getNetwork: () => Promise<string>;
      isConnected: () => Promise<boolean>;
    };
  }
}
