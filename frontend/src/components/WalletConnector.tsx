'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Wallet2, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { WalletInfo } from '@/types/enrollment';
import { stellarService } from '@/lib/stellar';

interface WalletConnectorProps {
  onWalletConnect: (walletInfo: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onWalletConnect,
  onWalletDisconnect,
  className = ''
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.freighter) {
        const isConnected = await window.freighter.isConnected();
        if (isConnected) {
          const info = await stellarService.connectWallet();
          if (info.isConnected) {
            setWalletInfo(info);
            onWalletConnect(info);
          }
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.freighter) {
        throw new Error('Freighter wallet is not installed. Please install it first.');
      }

      const info = await stellarService.connectWallet();
      
      if (info.isConnected) {
        setWalletInfo(info);
        onWalletConnect(info);
      } else {
        throw new Error('Failed to connect to wallet');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await stellarService.disconnectWallet();
      setWalletInfo(null);
      onWalletDisconnect();
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.publicKey) {
      try {
        await navigator.clipboard.writeText(walletInfo.publicKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const refreshBalance = async () => {
    if (walletInfo?.publicKey) {
      try {
        const balance = await stellarService.getAccountBalance(walletInfo.publicKey);
        setWalletInfo(prev => prev ? { ...prev, balance } : null);
        onWalletConnect({ ...walletInfo, balance });
      } catch (err) {
        console.error('Failed to refresh balance:', err);
      }
    }
  };

  if (!walletInfo) {
    return (
      <div className={`wallet-connector ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <Wallet2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Stellar wallet to enroll in courses
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </button>

            <div className="mt-4 text-xs text-gray-500">
              <p>Don't have a wallet? Install</p>
              <a 
                href="https://www.freighter.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Freighter Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wallet-connector ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Wallet Connected
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            walletInfo.network === 'mainnet' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {walletInfo.network.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={stellarService.formatAddress(walletInfo.publicKey)}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyAddress}
                className="ml-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy full address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Balance</label>
              <button
                onClick={refreshBalance}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Refresh
              </button>
            </div>
            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-sm font-medium">
                {stellarService.formatAmount(walletInfo.balance || 0)} XLM
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};
