import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  roomCode: string;
  size?: number;
}

export const InviteQRCode: React.FC<Props> = ({ roomCode, size = 152 }) => {
  const getInviteUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomCode);
      return url.toString();
    }
    return `https://partyverse.app/?room=${encodeURIComponent(roomCode)}`;
  };

  const inviteUrl = getInviteUrl();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-[#00eefc]/40 flex items-center justify-center">
        <QRCodeSVG
          value={inviteUrl}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0b081a"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-mono font-black text-base text-[#ffb703] tracking-widest">
          {roomCode}
        </span>
        <span className="text-[10px] font-mono text-[#9e8f78]">
          Kamerayla okutunca doğrudan bu odaya bağlanır
        </span>
      </div>
    </div>
  );
};
