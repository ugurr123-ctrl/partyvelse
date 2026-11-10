import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PARTYVERSE ErrorBoundary Catch]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070510] text-[#e6dff9] flex items-center justify-center p-4 font-manrope">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#141123] border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col items-center text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sistem Anomalisi Saptandı</span>
            </div>

            <h1 className="font-sora text-xl font-black text-white uppercase tracking-tight">
              Konsol Koruması Devreye Girdi
            </h1>

            <p className="font-manrope text-xs text-[#a59db8] mt-2 leading-relaxed">
              İletişim akışında veya konsol durumunda beklenmeyen bir arıza oluştu. Görev verileriniz korunuyor.
            </p>

            {this.state.error && (
              <div className="w-full mt-4 p-3 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
                <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1">
                  <Terminal className="w-3 h-3" />
                  <span>KONSOL HATA RAPORU:</span>
                </div>
                <code>{this.state.error.message || String(this.state.error)}</code>
              </div>
            )}

            <div className="w-full grid grid-cols-1 gap-2 mt-6">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-sora font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Konsolu Yeniden Bağla</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#a59db8] hover:text-white font-mono text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verileri Sıfırla & Lobiye Dön</span>
              </button>
            </div>

            <span className="mt-4 text-[10px] font-mono text-white/30">
              PARTYVERSE SEC-PROTO • OTOMATİK VERİ KURTARMA AKTİF
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
